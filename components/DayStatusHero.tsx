"use client";

import { useHasMounted } from "@/hooks/useHasMounted";
import {
  getDayType,
  getDayTypeLabel,
  isNoSchoolDate,
  formatDateStr,
  getEffectiveDayOfWeek,
  getNextSchoolDay,
} from "@/lib/schedule";
import { getDevDate } from "@/lib/devTime";
import config from "@/school.config";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const BADGE_PALETTE = [
  "border-border bg-bg text-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text",
  "border-red/20 bg-red-light text-white",
  "border-red/20 bg-red text-white",
];

const BADGE_COLORS: Record<string, string> = Object.fromEntries(
  config.schedule.dayTypes.map((dt, i) => [
    dt.id,
    BADGE_PALETTE[Math.min(i, BADGE_PALETTE.length - 1)],
  ]),
);

export default function DayStatusHero({ isEarlyDismissal = false }: { isEarlyDismissal?: boolean }) {
  const mounted = useHasMounted();

  if (!mounted) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto mb-2 h-10 w-64 animate-pulse rounded-lg bg-border dark:bg-white/10" />
        <div className="mx-auto h-7 w-40 animate-pulse rounded-full bg-border dark:bg-white/10" />
      </div>
    );
  }

  const now = getDevDate(new Date());
  const dayOfWeek = now.getDay();
  const dateStr = formatDateStr(now);
  const dayName = DAY_NAMES[dayOfWeek];

  if (dayOfWeek === 0 || dayOfWeek === 6 || isNoSchoolDate(dateStr)) {
    const next = getNextSchoolDay(now);
    const badgeColor = next ? (BADGE_COLORS[next.dayType] ?? BADGE_PALETTE[0]) : "";

    return (
      <div className="py-4 text-center">
        <p className="font-display text-4xl font-extrabold text-text dark:text-dark-text md:text-5xl lg:text-6xl">
          No School Today
        </p>
        <p className="mt-2 text-lg text-muted dark:text-dark-muted">Enjoy your time off!</p>
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

  const effectiveDow = getEffectiveDayOfWeek(now);
  const dayType = getDayType(effectiveDow);

  if (!dayType) return null;

  const dayTypeLabel = getDayTypeLabel(dayType);
  const badgeColor = BADGE_COLORS[dayType] ?? BADGE_PALETTE[0];

  return (
    <div className="py-4 text-center">
      <p className="font-display text-4xl font-extrabold text-navy dark:text-dark-text md:text-5xl lg:text-6xl">
        It&apos;s {dayName}
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <span
          className={`inline-block rounded-full border px-4 py-1.5 font-display text-base font-bold uppercase tracking-wider ${badgeColor}`}
        >
          {dayTypeLabel}
        </span>
        {isEarlyDismissal && (
          <span className="inline-block rounded-full border border-red/20 bg-red px-4 py-1.5 text-base font-bold text-white">
            Early Release
          </span>
        )}
      </div>
    </div>
  );
}
