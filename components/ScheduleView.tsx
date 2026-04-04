"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useLunchWave } from "@/hooks/useLunchWave";
import {
  getScheduleForDay,
  getCurrentPeriod,
  getTimeRemaining,
  formatTime,
  getPeriodDuration,
  timeToMinutes,
} from "@/lib/schedule";
import { getDevDate } from "@/lib/devTime";
import config from "@/school.config";

const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_TABS = config.schedule.dayTypes
  .flatMap((dt) => dt.weekdays)
  .sort((a, b) => a - b)
  .filter((v, i, a) => a.indexOf(v) === i)
  .map((d) => ({ label: SHORT_DAY_NAMES[d], dayOfWeek: d }));

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

function getInitialDay(): number {
  if (typeof window === "undefined") return DAY_TABS[0]?.dayOfWeek ?? 1;
  const today = new Date().getDay();
  const hasToday = DAY_TABS.some((t) => t.dayOfWeek === today);
  return hasToday ? today : DAY_TABS[0]?.dayOfWeek ?? 1;
}

export default function ScheduleView() {
  const mounted = useHasMounted();
  const { lunchWave, setWave, options, hasLunchWaves } = useLunchWave();
  const [selectedDay, setSelectedDay] = useState(getInitialDay);
  const [now, setNow] = useState(() => getDevDate(new Date()));
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(getDevDate(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-lg bg-border" />
        <div className="h-10 animate-pulse rounded-lg bg-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-border" />
        ))}
      </div>
    );
  }

  const schedule = getScheduleForDay(selectedDay, lunchWave);
  const isToday = now.getDay() === selectedDay;
  const currentPeriod = isToday ? getCurrentPeriod(schedule, now) : null;

  return (
    <div className="space-y-6">
      {/* Lunch wave toggle */}
      {hasLunchWaves && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted dark:text-dark-muted">Lunch Wave:</span>
          <div className="flex overflow-hidden rounded-lg border border-border dark:border-dark-border">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setWave(opt.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  lunchWave === opt.id
                    ? "bg-red text-white"
                    : "bg-white dark:bg-dark-surface text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Day tabs */}
      <div className="flex gap-1 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-1">
        {DAY_TABS.map((tab) => (
          <button
            key={tab.dayOfWeek}
            onClick={() => setSelectedDay(tab.dayOfWeek)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              selectedDay === tab.dayOfWeek
                ? "bg-red text-white"
                : "text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text"
            } ${isToday && tab.dayOfWeek === now.getDay() ? "ring-1 ring-red/30" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Period list */}
      <div className="space-y-3">
        {schedule.map((period) => {
          const isCurrent =
            currentPeriod &&
            currentPeriod.name === period.name &&
            currentPeriod.start === period.start;
          const isPast =
            isToday &&
            timeToMinutes(period.end) <=
              now.getHours() * 60 + now.getMinutes();
          const duration = getPeriodDuration(period);

          return (
            <div
              key={`${period.name}-${period.start}`}
              className={`rounded-xl border p-4 transition-colors ${
                isCurrent
                  ? "border-red dark:border-red/40 bg-red/5"
                  : isPast
                    ? "border-border dark:border-dark-border bg-bg dark:bg-dark-surface opacity-60"
                    : "border-border dark:border-dark-border bg-white dark:bg-dark-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isPast && !isCurrent && (
                    <span className="text-sm text-green-600">&#10003;</span>
                  )}
                  {isCurrent && (
                    <span className="rounded-full bg-red px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                      Now
                    </span>
                  )}
                  <div>
                    <p
                      className={`font-display font-semibold ${isCurrent ? "text-red" : "text-text dark:text-dark-text"}`}
                    >
                      {period.name}
                    </p>
                    <p className="text-sm text-muted dark:text-dark-muted">
                      {formatTime(period.start)} – {formatTime(period.end)} ·{" "}
                      {duration} min
                    </p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="font-mono text-lg font-bold tabular-nums text-red">
                    {formatCountdown(
                      Math.max(0, getTimeRemaining(period, now)),
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Official schedule image button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setShowImage(true)}
          className="flex items-center gap-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-2.5 text-sm text-muted dark:text-dark-muted transition-colors hover:border-red/30 hover:text-red dark:hover:text-dark-text"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          View Official Schedule
        </button>
      </div>

      {/* Schedule image modal */}
      {showImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowImage(false)}
        >
          <div
            className="relative max-h-[90vh] w-[80vw] overflow-auto rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImage(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-dark-surface text-muted dark:text-dark-muted shadow-md transition-colors hover:text-text dark:hover:text-dark-text"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src="/Schedual.jpg"
              alt={`${config.school.acronym} ${config.school.academicYear} Daily Schedule`}
              width={800}
              height={600}
              className="h-auto w-full rounded-xl"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
