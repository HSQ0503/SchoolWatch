"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";
import { ANSWER_WORDS, VALID_GUESSES } from "@/lib/wordle-words";

type GameStatus = "playing" | "won" | "lost";
type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

type GameState = {
  date: string;
  guesses: string[];
  status: GameStatus;
  answer: string;
};

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDailyWord(): string {
  const today = getTodayStr();
  const index = simpleHash(today) % ANSWER_WORDS.length;
  return ANSWER_WORDS[index];
}

function isValidGuess(word: string): boolean {
  return VALID_GUESSES.includes(word);
}

function evaluateGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LENGTH).fill("absent");
  const answerChars = answer.split("");
  const guessChars = guess.split("");

  // First pass: mark correct (green)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === answerChars[i]) {
      result[i] = "correct";
      answerChars[i] = "#";
      guessChars[i] = "*";
    }
  }

  // Second pass: mark present (yellow)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === "*") continue;
    const idx = answerChars.indexOf(guessChars[i]);
    if (idx !== -1) {
      result[i] = "present";
      answerChars[idx] = "#";
    }
  }

  return result;
}

function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("lakerwatch-wordle");
    if (stored) {
      const state = JSON.parse(stored) as GameState;
      if (state.date === getTodayStr()) return state;
    }
  } catch { /* ignore */ }
  return null;
}

function saveGameState(state: GameState) {
  localStorage.setItem("lakerwatch-wordle", JSON.stringify(state));
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

const WIN_MESSAGES = [
  "Genius!",
  "Magnificent!",
  "Impressive!",
  "Splendid!",
  "Great!",
  "Nice!",
];

function getStateBg(state: LetterState, isDark: boolean): string {
  switch (state) {
    case "correct":
      return "bg-[#6aaa64] border-[#6aaa64] text-white";
    case "present":
      return "bg-[#c9b458] border-[#c9b458] text-white";
    case "absent":
      return isDark
        ? "bg-[#3a3a3c] border-[#3a3a3c] text-white"
        : "bg-[#787c7e] border-[#787c7e] text-white";
    case "tbd":
      return isDark
        ? "border-[#565656] text-dark-text"
        : "border-[#d3d6da] text-text";
    case "empty":
    default:
      return isDark
        ? "border-[#3a3a3c] text-dark-text"
        : "border-[#d3d6da] text-text";
  }
}

function getKeyBg(state: LetterState | undefined, isDark: boolean): string {
  if (!state) {
    return isDark
      ? "bg-[#818384] text-white"
      : "bg-[#d3d6da] text-text";
  }
  switch (state) {
    case "correct":
      return "bg-[#6aaa64] text-white";
    case "present":
      return "bg-[#c9b458] text-white";
    case "absent":
      return isDark
        ? "bg-[#3a3a3c] text-white"
        : "bg-[#787c7e] text-white";
    default:
      return isDark
        ? "bg-[#818384] text-white"
        : "bg-[#d3d6da] text-text";
  }
}

export default function WordlePage() {
  const mounted = useHasMounted();
  const savedState = loadGameState();
  const [answer] = useState(() => savedState?.answer ?? getDailyWord());
  const [guesses, setGuesses] = useState<string[]>(savedState?.guesses ?? []);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<GameStatus>(savedState?.status ?? "playing");
  const [shakeRow, setShakeRow] = useState(-1);
  const [revealRow, setRevealRow] = useState(-1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isDark = useSyncExternalStore(
    (cb) => {
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  // Build keyboard state map (best state per letter)
  const keyboardState = useCallback((): Record<string, LetterState> => {
    const map: Record<string, LetterState> = {};
    const priority: Record<string, number> = { correct: 3, present: 2, absent: 1 };

    for (const guess of guesses) {
      const evaluation = evaluateGuess(guess, answer);
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        const state = evaluation[i];
        const currentPriority = priority[map[letter]] || 0;
        const newPriority = priority[state] || 0;
        if (newPriority > currentPriority) {
          map[letter] = state;
        }
      }
    }
    return map;
  }, [guesses, answer]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const submitGuess = useCallback(() => {
    if (status !== "playing" || currentGuess.length !== WORD_LENGTH) return;

    if (!isValidGuess(currentGuess)) {
      setShakeRow(guesses.length);
      showToast("Not in word list");
      setTimeout(() => setShakeRow(-1), 600);
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setRevealRow(guesses.length);

    // Delay status update until reveal animation finishes
    setTimeout(() => {
      setRevealRow(-1);
      setGuesses(newGuesses);
      setCurrentGuess("");

      let newStatus: GameStatus = "playing";
      if (currentGuess === answer) {
        newStatus = "won";
      } else if (newGuesses.length >= MAX_GUESSES) {
        newStatus = "lost";
      }
      setStatus(newStatus);
      saveGameState({ date: getTodayStr(), guesses: newGuesses, status: newStatus, answer });
    }, WORD_LENGTH * 150 + 300);
  }, [currentGuess, guesses, status, answer]);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing" || revealRow >= 0) return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACK" || key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [status, currentGuess, submitGuess, revealRow],
  );

  // Physical keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
        handleKey(key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  // Midnight countdown
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (status === "playing") return;
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const shareResult = () => {
    const today = getTodayStr();
    const [, mo, da] = today.split("-");
    const attemptStr = status === "won" ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    let text = `LakerWatch Wordle ${parseInt(mo)}/${parseInt(da)}/${today.slice(0, 4)} ${attemptStr}\n\n`;

    for (const guess of guesses) {
      const evaluation = evaluateGuess(guess, answer);
      const row = evaluation
        .map((s) => {
          if (s === "correct") return "\u{1F7E9}";
          if (s === "present") return "\u{1F7E8}";
          return "\u2B1C";
        })
        .join("");
      text += row + "\n";
    }

    navigator.clipboard.writeText(text.trim()).then(() => {
      showToast("Copied to clipboard!");
    });
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-6 w-48 animate-pulse rounded bg-border dark:bg-white/10" />
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="h-14 w-14 animate-pulse rounded bg-border dark:bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const kbState = keyboardState();

  // Build the grid rows
  const gridRows: { letter: string; state: LetterState }[][] = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row: { letter: string; state: LetterState }[] = [];
    if (r < guesses.length) {
      const evaluation = evaluateGuess(guesses[r], answer);
      for (let c = 0; c < WORD_LENGTH; c++) {
        row.push({ letter: guesses[r][c], state: evaluation[c] });
      }
    } else if (r === guesses.length) {
      // Current input row (or reveal row)
      for (let c = 0; c < WORD_LENGTH; c++) {
        const letter = currentGuess[c] || "";
        row.push({ letter, state: letter ? "tbd" : "empty" });
      }
    } else {
      for (let c = 0; c < WORD_LENGTH; c++) {
        row.push({ letter: "", state: "empty" });
      }
    }
    gridRows.push(row);
  }

  return (
    <div className="flex flex-col items-center">
      <Link
        href="/productivity"
        className="mb-6 self-start text-sm text-muted transition-colors hover:text-red dark:text-dark-muted dark:hover:text-dark-text"
      >
        ← Back to Productivity
      </Link>

      <h1 className="mb-6 font-display text-3xl font-extrabold text-text dark:text-dark-text md:text-4xl">
        Wordle
      </h1>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg bg-text px-4 py-2 text-sm font-bold text-white dark:bg-dark-text dark:text-dark-bg">
          {toastMessage}
        </div>
      )}

      {/* Grid */}
      <div className="mb-6 grid grid-rows-6 gap-1.5">
        {gridRows.map((row, r) => (
          <div
            key={r}
            className={`flex gap-1.5 ${shakeRow === r ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
          >
            {row.map((cell, c) => (
              <div
                key={c}
                className={`flex h-[58px] w-[58px] items-center justify-center border-2 text-2xl font-bold uppercase sm:h-[62px] sm:w-[62px] ${getStateBg(cell.state, isDark)} ${
                  revealRow === r
                    ? "animate-[flipIn_0.5s_ease-in-out_both]"
                    : ""
                } ${cell.letter && cell.state === "tbd" ? "animate-[pop_0.1s_ease-in-out]" : ""}`}
                style={
                  revealRow === r
                    ? { animationDelay: `${c * 150}ms` }
                    : undefined
                }
              >
                {cell.letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* End state */}
      {status !== "playing" && (
        <div className="mb-6 text-center">
          {status === "won" ? (
            <p className="mb-1 text-xl font-bold text-text dark:text-dark-text">
              {WIN_MESSAGES[Math.min(guesses.length - 1, WIN_MESSAGES.length - 1)]}
            </p>
          ) : (
            <p className="mb-1 text-xl font-bold text-text dark:text-dark-text">
              The word was: <span className="text-red">{answer}</span>
            </p>
          )}
          <p className="mb-3 text-sm text-muted dark:text-dark-muted">
            Next Wordle in{" "}
            <span className="font-mono tabular-nums">{countdown}</span>
          </p>
          <button
            onClick={shareResult}
            className="rounded-xl bg-red px-6 py-2.5 font-medium text-white transition-colors hover:bg-red-light"
          >
            Share
          </button>
        </div>
      )}

      {/* Keyboard */}
      <div className="flex flex-col items-center gap-1.5">
        {KEYBOARD_ROWS.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((key) => {
              const isWide = key === "ENTER" || key === "BACK";
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`flex h-14 items-center justify-center rounded font-bold transition-colors ${
                    isWide ? "px-3 text-xs" : "w-[35px] text-sm sm:w-[43px]"
                  } ${getKeyBg(kbState[key], isDark)}`}
                >
                  {key === "BACK" ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H21a1 1 0 011 1v12a1 1 0 01-1 1H10.828a2 2 0 01-1.414-.586L3 12z" />
                    </svg>
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
