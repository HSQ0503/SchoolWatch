import config from "../school.config";
import type { Period } from "./types/config";

export type { Period };
export type LunchWave = string;
export type DayType = string;

const noSchoolDateSet = new Set(config.calendar.noSchoolDates.map((d) => d.date));
const earlyDismissalDateSet = new Set(config.calendar.earlyDismissalDates.map((d) => d.date));

// --- Helper Functions ---

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const mo = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

// --- Day Type Resolution ---

export function getDayType(dayOfWeek: number): string | null {
  const dt = config.schedule.dayTypes.find((d) => d.weekdays.includes(dayOfWeek));
  return dt?.id ?? null;
}

export function getDayTypeLabel(dayType: string): string {
  const dt = config.schedule.dayTypes.find((d) => d.id === dayType);
  return dt?.label ?? dayType;
}

export function isNoSchoolDate(dateStr: string): boolean {
  return noSchoolDateSet.has(dateStr);
}

export function isEarlyDismissalDate(dateStr: string): boolean {
  return earlyDismissalDateSet.has(dateStr);
}

export function getEffectiveDayOfWeek(date: Date): number {
  const dateStr = formatDateStr(date);
  const override = config.schedule.dayTypeOverrides.find((o) => o.date === dateStr);
  if (override) {
    const dt = config.schedule.dayTypes.find((d) => d.id === override.dayTypeId);
    return dt?.weekdays[0] ?? date.getDay();
  }
  return date.getDay();
}

// --- Schedule Building ---

export function getScheduleForDay(
  dayOfWeek: number,
  lunchWave: LunchWave,
): Period[] {
  const dayTypeId = getDayType(dayOfWeek);
  if (!dayTypeId) return [];

  const bells = config.schedule.bells[dayTypeId];
  if (!bells) return [];

  const wavePeriods = bells.lunchWaves?.[lunchWave] ?? [];
  return [...bells.shared, ...wavePeriods, ...bells.after];
}

// --- Period Calculations ---

export function getCurrentPeriod(schedule: Period[], now: Date): Period | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const period of schedule) {
    const start = timeToMinutes(period.start);
    const end = timeToMinutes(period.end);
    if (minutes >= start && minutes < end) {
      return period;
    }
  }
  return null;
}

export function getTimeRemaining(period: Period, now: Date): number {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowSeconds = now.getSeconds();
  const endMinutes = timeToMinutes(period.end);
  return (endMinutes - nowMinutes) * 60 - nowSeconds;
}

export function getNextPeriod(schedule: Period[], now: Date): Period | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const period of schedule) {
    if (timeToMinutes(period.start) > minutes) {
      return period;
    }
  }
  return null;
}

export function getPeriodProgress(period: Period, now: Date): number {
  const nowMinutes =
    now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const start = timeToMinutes(period.start);
  const end = timeToMinutes(period.end);
  return Math.min(1, Math.max(0, (nowMinutes - start) / (end - start)));
}

export function getPeriodDuration(period: Period): number {
  return timeToMinutes(period.end) - timeToMinutes(period.start);
}

export function isSchoolOver(schedule: Period[], now: Date): boolean {
  if (schedule.length === 0) return true;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const lastPeriod = schedule[schedule.length - 1];
  return minutes >= timeToMinutes(lastPeriod.end);
}

export function isBeforeSchool(schedule: Period[], now: Date): boolean {
  if (schedule.length === 0) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes < timeToMinutes(schedule[0].start);
}

export function getSchoolStartCountdown(
  schedule: Period[],
  now: Date,
): number {
  if (schedule.length === 0) return 0;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowSeconds = now.getSeconds();
  const startMinutes = timeToMinutes(schedule[0].start);
  return (startMinutes - nowMinutes) * 60 - nowSeconds;
}

export function getPassingTimeInfo(
  schedule: Period[],
  now: Date,
): { nextPeriod: Period; secondsUntil: number } | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const seconds = now.getSeconds();

  for (let i = 1; i < schedule.length; i++) {
    const prevEnd = timeToMinutes(schedule[i - 1].end);
    const nextStart = timeToMinutes(schedule[i].start);

    if (minutes >= prevEnd && minutes < nextStart) {
      return {
        nextPeriod: schedule[i],
        secondsUntil: (nextStart - minutes) * 60 - seconds,
      };
    }
  }

  return null;
}

// --- Navigation ---

export function getNextSchoolDay(from: Date): {
  date: Date;
  dayName: string;
  dayType: string;
  label: string;
  isTomorrow: boolean;
} | null {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const next = new Date(from);
  for (let i = 0; i < 30; i++) {
    next.setDate(next.getDate() + 1);
    const dateStr = formatDateStr(next);
    if (isNoSchoolDate(dateStr)) continue;

    const effectiveDow = getEffectiveDayOfWeek(next);
    const dayType = getDayType(effectiveDow);
    if (!dayType) continue;

    return {
      date: next,
      dayName: dayNames[next.getDay()],
      dayType,
      label: getDayTypeLabel(dayType),
      isTomorrow: i === 0,
    };
  }
  return null;
}
