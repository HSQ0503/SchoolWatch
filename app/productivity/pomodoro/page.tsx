"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";
import { storageKey } from "@/lib/storage";

type Mode = "focus" | "short" | "long" | "custom";

const PRESETS: { mode: Mode; label: string; minutes: number; color: string; ringColor: string }[] = [
  { mode: "focus", label: "Focus", minutes: 25, color: "text-red dark:text-red-light", ringColor: "#d43344" },
  { mode: "short", label: "Short Break", minutes: 5, color: "text-green-600 dark:text-green-400", ringColor: "#16a34a" },
  { mode: "long", label: "Long Break", minutes: 15, color: "text-yellow-600 dark:text-yellow-400", ringColor: "#ca8a04" },
  { mode: "custom", label: "Custom", minutes: 10, color: "text-navy-light dark:text-navy-light", ringColor: "#2d4a8e" },
];

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function readSessions(): { date: string; count: number } {
  if (typeof window === "undefined") return { date: "", count: 0 };
  try {
    const stored = localStorage.getItem(storageKey("pomodoro-sessions"));
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === getTodayKey()) return data;
    }
  } catch { /* ignore */ }
  return { date: getTodayKey(), count: 0 };
}

function saveSessions(count: number) {
  localStorage.setItem(
    storageKey("pomodoro-sessions"),
    JSON.stringify({ date: getTodayKey(), count }),
  );
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);

    // Second tone for a pleasant chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 1.8);
  } catch { /* audio not supported */ }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PomodoroPage() {
  const mounted = useHasMounted();
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);
  const [sessions, setSessions] = useState(() => readSessions().count);
  const [message, setMessage] = useState<string | null>(null);
  const [customMinutes, setCustomMinutes] = useState(10);

  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const preset = PRESETS.find((p) => p.mode === mode)!;
  const totalSeconds = mode === "custom" ? customMinutes * 60 : preset.minutes * 60;
  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
  }, []);

  const handleComplete = useCallback(() => {
    stopInterval();
    setRunning(false);
    setRemaining(0);
    playChime();

    if (mode === "focus") {
      const newCount = sessions + 1;
      setSessions(newCount);
      saveSessions(newCount);
      const suggestLong = newCount % 4 === 0;
      setMessage(
        suggestLong
          ? "Focus session complete! Time for a long break."
          : "Focus session complete! Take a short break.",
      );
    } else {
      setMessage("Break's over! Ready to focus?");
    }
  }, [mode, sessions, stopInterval]);

  // Tick effect using timestamp-based calculation
  useEffect(() => {
    if (!running) return;

    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + remaining * 1000;
    }

    intervalRef.current = setInterval(() => {
      const left = Math.round((endTimeRef.current! - Date.now()) / 1000);
      if (left <= 0) {
        handleComplete();
      } else {
        setRemaining(left);
      }
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, handleComplete, remaining]);

  const handleStart = () => {
    setMessage(null);
    if (remaining <= 0) {
      setRemaining(totalSeconds);
      endTimeRef.current = Date.now() + totalSeconds * 1000;
    }
    setRunning(true);
  };

  const handlePause = () => {
    stopInterval();
    setRunning(false);
  };

  const handleReset = () => {
    stopInterval();
    setRunning(false);
    setRemaining(totalSeconds);
    setMessage(null);
  };

  const switchMode = (newMode: Mode) => {
    stopInterval();
    setRunning(false);
    setMode(newMode);
    if (newMode === "custom") {
      setRemaining(customMinutes * 60);
    } else {
      const newPreset = PRESETS.find((p) => p.mode === newMode)!;
      setRemaining(newPreset.minutes * 60);
    }
    setMessage(null);
  };

  const applyCustomTime = (mins: number) => {
    const clamped = Math.max(1, Math.min(120, mins));
    setCustomMinutes(clamped);
    if (!running) {
      setRemaining(clamped * 60);
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="h-6 w-48 animate-pulse rounded bg-border dark:bg-white/10" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-border dark:bg-white/10" />
        <div className="h-72 w-72 animate-pulse rounded-full bg-border dark:bg-white/10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Link
        href="/productivity"
        className="mb-8 self-start text-sm text-muted transition-colors hover:text-red dark:text-dark-muted dark:hover:text-dark-text"
      >
        ← Back to Productivity
      </Link>

      <h1 className="mb-6 font-display text-3xl font-extrabold text-text dark:text-dark-text md:text-4xl">
        Pomodoro Timer
      </h1>

      {/* Mode presets */}
      <div className="mb-8 flex gap-1 rounded-lg border border-border bg-white p-1 dark:border-dark-border dark:bg-dark-surface">
        {PRESETS.map((p) => (
          <button
            key={p.mode}
            onClick={() => switchMode(p.mode)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === p.mode
                ? "bg-red text-white"
                : "text-muted hover:text-text dark:text-dark-muted dark:hover:text-dark-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom time input */}
      {mode === "custom" && !running && (
        <div className="mb-6 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={120}
            value={customMinutes}
            onChange={(e) => applyCustomTime(parseInt(e.target.value) || 1)}
            className="w-20 rounded-lg border border-border bg-white px-3 py-2 text-center font-mono text-lg text-text focus:border-navy/40 focus:outline-none dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          />
          <span className="text-sm text-muted dark:text-dark-muted">minutes</span>
        </div>
      )}

      {/* Timer ring */}
      <div className="relative flex h-72 w-72 items-center justify-center md:h-80 md:w-80">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            className="stroke-border dark:stroke-white/10"
            strokeWidth="5"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={preset.ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.3s linear" }}
          />
        </svg>
        <div className="text-center">
          <p className={`font-mono text-6xl font-bold tabular-nums ${preset.color} md:text-7xl`}>
            {formatTime(remaining)}
          </p>
          <p className="mt-1 text-sm text-muted dark:text-dark-muted">{preset.label}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-3">
        {running ? (
          <button
            onClick={handlePause}
            className="rounded-xl bg-red px-8 py-3 font-medium text-white transition-colors hover:bg-red-light"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="rounded-xl bg-red px-8 py-3 font-medium text-white transition-colors hover:bg-red-light"
          >
            {remaining < totalSeconds && remaining > 0 ? "Resume" : "Start"}
          </button>
        )}
        <button
          onClick={handleReset}
          className="rounded-xl border border-border bg-white px-6 py-3 font-medium text-muted transition-colors hover:text-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:text-dark-text"
        >
          Reset
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-6 rounded-xl border border-border bg-white px-6 py-3 text-center text-sm font-medium text-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          {message}
        </div>
      )}

      {/* Session dots */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted dark:text-dark-muted">
          Focus sessions today
        </p>
        <div className="flex gap-2">
          {sessions === 0 ? (
            <p className="text-sm text-muted dark:text-dark-muted">None yet</p>
          ) : (
            Array.from({ length: sessions }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full ${
                  (i + 1) % 4 === 0 ? "bg-yellow-500" : "bg-red dark:bg-red-light"
                }`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
