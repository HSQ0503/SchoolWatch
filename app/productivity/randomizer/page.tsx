"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";
import { storageKey } from "@/lib/storage";

type TabMode = "pick" | "groups";

const COLORS = [
  "#b22234", "#d43344", "#16a34a", "#ca8a04", "#7c3aed",
  "#0891b2", "#e85d04", "#6d28d9", "#059669", "#dc2626",
];

function readNames(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(storageKey("randomizer-names"));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNames(names: string[]) {
  localStorage.setItem(storageKey("randomizer-names"), JSON.stringify(names));
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawWheel(
  canvas: HTMLCanvasElement,
  names: string[],
  rotation: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx || names.length === 0) return;

  const dpr = window.devicePixelRatio || 1;
  const size = canvas.clientWidth;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const sliceAngle = (2 * Math.PI) / names.length;

  ctx.clearRect(0, 0, size, size);

  names.forEach((name, i) => {
    const startAngle = rotation + i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text
    const textAngle = startAngle + sliceAngle / 2;
    const textR = r * 0.65;
    ctx.save();
    ctx.translate(
      cx + Math.cos(textAngle) * textR,
      cy + Math.sin(textAngle) * textR,
    );
    ctx.rotate(textAngle);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.min(14, 120 / names.length + 8)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const maxLen = 10;
    const display = name.length > maxLen ? name.slice(0, maxLen - 1) + "…" : name;
    ctx.fillText(display, 0, 0);
    ctx.restore();
  });

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#e2e5ea";
  ctx.lineWidth = 2;
  ctx.stroke();
}

export default function RandomizerPage() {
  const mounted = useHasMounted();
  const [tab, setTab] = useState<TabMode>("pick");
  const [names, setNames] = useState<string[]>(readNames);
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [numGroups, setNumGroups] = useState(2);
  const [groups, setGroups] = useState<string[][] | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animRef = useRef<number | null>(null);

  const updateNames = useCallback((newNames: string[]) => {
    setNames(newNames);
    saveNames(newNames);
  }, []);

  const addNames = () => {
    const parsed = input
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (parsed.length === 0) return;
    const newNames = [...names, ...parsed];
    updateNames(newNames);
    setInput("");
    setWinner(null);
    setGroups(null);
  };

  const removeName = (index: number) => {
    const newNames = names.filter((_, i) => i !== index);
    updateNames(newNames);
    setWinner(null);
    setGroups(null);
  };

  const clearAll = () => {
    updateNames([]);
    setWinner(null);
    setGroups(null);
  };

  // Draw wheel whenever names or rotation changes
  useEffect(() => {
    if (!canvasRef.current || !mounted) return;
    drawWheel(canvasRef.current, names, rotationRef.current);
  }, [names, mounted]);

  const spin = () => {
    if (names.length < 2 || spinning) return;
    setWinner(null);
    setSpinning(true);

    // Pick winner randomly
    const winnerIndex = Math.floor(Math.random() * names.length);
    const sliceAngle = (2 * Math.PI) / names.length;

    // The pointer is at the right (0 radians / 3 o'clock).
    // We want the winning segment to end up under the pointer.
    // Target: the center of the winning segment is at angle 0 (right side)
    // Center of segment i is at rotation + i * sliceAngle + sliceAngle/2
    // We want that = 2*PI*k (multiple of full turns) => rotation = -i*sliceAngle - sliceAngle/2 + 2*PI*k
    const minRotations = 3 + Math.random() * 3; // 3-6 full rotations
    const targetBase = -(winnerIndex * sliceAngle + sliceAngle / 2);
    const fullTurns = Math.ceil(minRotations) * 2 * Math.PI;
    const targetRotation = targetBase + fullTurns;

    const startRotation = rotationRef.current % (2 * Math.PI);
    const totalDelta = targetRotation - startRotation;

    const duration = 4000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      rotationRef.current = startRotation + totalDelta * eased;

      if (canvasRef.current) {
        drawWheel(canvasRef.current, names, rotationRef.current);
      }

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setWinner(names[winnerIndex]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const makeGroups = () => {
    if (names.length < 2) return;
    const clamped = Math.min(numGroups, names.length);
    const shuffled = shuffle(names);
    const result: string[][] = Array.from({ length: clamped }, () => []);
    shuffled.forEach((name, i) => {
      result[i % clamped].push(name);
    });
    setGroups(result);
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
    <div>
      <Link
        href="/productivity"
        className="mb-8 inline-block text-sm text-muted transition-colors hover:text-red dark:text-dark-muted dark:hover:text-dark-text"
      >
        ← Back to Productivity
      </Link>

      <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-text dark:text-dark-text md:text-4xl">
        Group Randomizer
      </h1>

      {/* Tabs */}
      <div className="mx-auto mb-8 flex max-w-sm gap-1 rounded-lg border border-border bg-white p-1 dark:border-dark-border dark:bg-dark-surface">
        {(["pick", "groups"] as TabMode[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-red text-white"
                : "text-muted hover:text-text dark:text-dark-muted dark:hover:text-dark-text"
            }`}
          >
            {t === "pick" ? "Pick a Name" : "Make Groups"}
          </button>
        ))}
      </div>

      {/* Name input */}
      <div className="mx-auto mb-6 max-w-md">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addNames();
              }
            }}
            placeholder="Enter names (one per line or comma-separated)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-text placeholder:text-muted/60 focus:border-red/40 focus:outline-none dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted/60"
          />
          <button
            onClick={addNames}
            className="self-end rounded-xl bg-red px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-light"
          >
            Add
          </button>
        </div>

        {/* Name chips */}
        {names.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {names.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-sm text-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              >
                {name}
                <button
                  onClick={() => removeName(i)}
                  className="ml-0.5 text-muted/60 hover:text-red"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="text-xs text-muted transition-colors hover:text-red dark:text-dark-muted"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Pick a Name mode */}
      {tab === "pick" && (
        <div className="flex flex-col items-center">
          {names.length >= 2 ? (
            <>
              {/* Pointer */}
              <div className="relative">
                <div className="absolute -right-2 top-1/2 z-10 -translate-y-1/2">
                  <div className="h-0 w-0 border-y-[10px] border-r-[18px] border-y-transparent border-r-red" />
                </div>
                <canvas
                  ref={canvasRef}
                  className="h-72 w-72 md:h-80 md:w-80 lg:h-96 lg:w-96"
                />
              </div>

              <button
                onClick={spin}
                disabled={spinning}
                className={`mt-6 rounded-xl px-10 py-3 text-lg font-bold text-white transition-colors ${
                  spinning
                    ? "cursor-not-allowed bg-muted"
                    : "bg-red hover:bg-red-light"
                }`}
              >
                {spinning ? "Spinning..." : "SPIN"}
              </button>

              {winner && (
                <div className="mt-6 animate-[scaleIn_0.3s_ease-out] text-center">
                  <p className="text-sm text-muted dark:text-dark-muted">Selected:</p>
                  <p className="font-display text-3xl font-extrabold text-text dark:text-dark-text md:text-4xl">
                    {winner}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="py-12 text-center text-muted dark:text-dark-muted">
              Add at least 2 names to spin the wheel
            </p>
          )}
        </div>
      )}

      {/* Make Groups mode */}
      {tab === "groups" && (
        <div className="mx-auto max-w-2xl">
          {names.length >= 2 ? (
            <>
              <div className="mb-6 flex items-center justify-center gap-3">
                <label className="text-sm text-muted dark:text-dark-muted">
                  Number of groups:
                </label>
                <input
                  type="number"
                  min={2}
                  max={Math.min(10, names.length)}
                  value={numGroups}
                  onChange={(e) => setNumGroups(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                  className="w-20 rounded-lg border border-border bg-white px-3 py-2 text-center text-text focus:border-red/40 focus:outline-none dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                />
                <button
                  onClick={makeGroups}
                  className="rounded-xl bg-red px-6 py-2 font-medium text-white transition-colors hover:bg-red-light"
                >
                  {groups ? "Re-shuffle" : "Randomize Groups"}
                </button>
              </div>

              {groups && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {groups.map((group, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-white p-4 dark:border-dark-border dark:bg-dark-surface"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <p className="font-display font-bold text-text dark:text-dark-text">
                          Group {i + 1}
                        </p>
                        <span className="text-xs text-muted dark:text-dark-muted">
                          ({group.length})
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {group.map((name, j) => (
                          <li
                            key={j}
                            className="text-sm text-text dark:text-dark-text"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="py-12 text-center text-muted dark:text-dark-muted">
              Add at least 2 names to create groups
            </p>
          )}
        </div>
      )}
    </div>
  );
}
