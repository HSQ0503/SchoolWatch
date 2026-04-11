"use client";

import { useState, useEffect } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  getScheduleForDay,
  getCurrentPeriod,
  getTimeRemaining,
  getNextPeriod,
  getPeriodProgress,
  isSchoolOver,
  isBeforeSchool,
  getSchoolStartCountdown,
  getPassingTimeInfo,
  formatTime,
  getEffectiveDayOfWeek,
  isNoSchoolDate,
  formatDateStr,
  getNextSchoolDay,
  type LunchWave,
} from "@/lib/schedule";
import { getDevDate } from "@/lib/devTime";
import config from "@/school.config";

const BADGE_PALETTE = [
  "border-border bg-bg text-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text",
  "border-badge/20 bg-badge/70 text-white",
  "border-badge/20 bg-badge text-white",
];

const BADGE_COLORS: Record<string, string> = Object.fromEntries(
  config.schedule.dayTypes.map((dt, i) => [
    dt.id,
    BADGE_PALETTE[Math.min(i, BADGE_PALETTE.length - 1)],
  ]),
);

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PeriodCountdown({
  lunchWave,
}: {
  lunchWave: LunchWave;
}) {
  const mounted = useHasMounted();
  const [now, setNow] = useState(() => getDevDate(new Date()));

  useEffect(() => {
    const interval = setInterval(() => setNow(getDevDate(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="pt-4 text-center">
        <div className="mx-auto mb-2 h-6 w-48 animate-pulse rounded bg-border dark:bg-white/10" />
        <div className="mx-auto mb-3 h-16 w-56 animate-pulse rounded-lg bg-border dark:bg-white/10" />
        <div className="mx-auto h-2 w-48 animate-pulse rounded-full bg-border dark:bg-white/10" />
      </div>
    );
  }

  const dateStr = formatDateStr(now);
  const dayOfWeek = now.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6 || isNoSchoolDate(dateStr)) {
    return null;
  }

  const effectiveDow = getEffectiveDayOfWeek(now);
  const schedule = getScheduleForDay(effectiveDow, lunchWave);

  if (schedule.length === 0) return null;

  // School is over
  if (isSchoolOver(schedule, now)) {
    const next = getNextSchoolDay(now);
    const badgeColor = next ? (BADGE_COLORS[next.dayType] ?? BADGE_PALETTE[0]) : "";

    return (
      <div className="pt-6 pb-2 text-center">
        <p className="text-2xl font-medium text-muted dark:text-dark-muted">
          School&apos;s over — enjoy your evening!
        </p>
        {next && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <p className="text-base text-muted dark:text-dark-muted">
              {next.isTomorrow ? "Tomorrow" : next.dayName} is
            </p>
            <span
              className={`inline-block rounded-full border px-3 py-1 font-display text-sm font-bold uppercase tracking-wider ${badgeColor}`}
            >
              {next.label}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Before school
  if (isBeforeSchool(schedule, now)) {
    const seconds = getSchoolStartCountdown(schedule, now);
    return (
      <div className="pt-6 pb-2 text-center">
        <p className="mb-1 text-xl text-muted dark:text-dark-muted">School starts in</p>
        <p className="font-mono text-6xl font-bold tabular-nums text-text dark:text-dark-text md:text-7xl lg:text-8xl">
          {formatCountdown(Math.max(0, seconds))}
        </p>
      </div>
    );
  }

  // Currently in a period
  const currentPeriod = getCurrentPeriod(schedule, now);

  if (currentPeriod) {
    const remaining = getTimeRemaining(currentPeriod, now);
    const progress = getPeriodProgress(currentPeriod, now);
    const nextPeriod = getNextPeriod(schedule, now);

    return (
      <div className="pt-6 pb-2 text-center">
        <p className="mb-2 font-display text-2xl font-bold text-text dark:text-dark-text md:text-3xl">
          {currentPeriod.name}
        </p>
        <div className="relative mx-auto flex h-72 w-72 items-center justify-center md:h-80 md:w-80 lg:h-96 lg:w-96">
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 200 200"
          >
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-ring)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="var(--color-ring)" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              className="stroke-border dark:stroke-white/15"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              style={{
                transition: "stroke-dashoffset 1s linear",
              }}
            />
          </svg>
          <p className={`font-mono font-bold tabular-nums text-ring dark:text-white ${remaining >= 3600 ? "text-5xl md:text-6xl lg:text-7xl" : "text-6xl md:text-7xl lg:text-8xl"}`}>
            {formatCountdown(Math.max(0, remaining))}
          </p>
        </div>
        {nextPeriod && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-bg px-4 py-2 dark:border-dark-border dark:bg-white/5">
            <span className="text-sm font-medium text-muted dark:text-dark-muted">Next up</span>
            <span className="h-1 w-1 rounded-full bg-card-accent" />
            <span className="text-sm font-semibold text-text dark:text-dark-text">{nextPeriod.name}</span>
            <span className="font-mono text-sm tabular-nums text-muted dark:text-dark-muted">
              {formatTime(nextPeriod.start)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Passing time
  const passingInfo = getPassingTimeInfo(schedule, now);
  if (passingInfo) {
    return (
      <div className="pt-6 pb-2 text-center">
        <p className="mb-1 text-xl text-muted dark:text-dark-muted">
          Passing period —{" "}
          <span className="font-medium text-text dark:text-dark-text">
            {passingInfo.nextPeriod.name}
          </span>{" "}
          starts in
        </p>
        <p className="font-mono text-6xl font-bold tabular-nums text-ring md:text-7xl lg:text-8xl">
          {formatCountdown(Math.max(0, passingInfo.secondsUntil))}
        </p>
      </div>
    );
  }

  return null;
}
