export type Period = {
  name: string;
  start: string; // "HH:MM" 24hr
  end: string; // "HH:MM" 24hr
};

export type DayType = "monday" | "odd" | "even";
export type LunchWave = "9/10" | "11/12";

export const EIGHT_PERIOD_OVERRIDES: string[] = [];

export const NO_SCHOOL_DATES: string[] = [
  // Labor Day
  "2025-09-01",
  // Conference Day
  "2025-09-19",
  // Fall Break + PD day
  "2025-10-09",
  "2025-10-10",
  "2025-10-13",
  // Veterans Day
  "2025-11-11",
  // Thanksgiving Break
  "2025-11-24", "2025-11-25", "2025-11-26", "2025-11-27", "2025-11-28",
  // Teacher Work Day
  "2025-12-19",
  // Winter Break
  "2025-12-22", "2025-12-23", "2025-12-24", "2025-12-25", "2025-12-26",
  "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02",
  // PD Day
  "2026-01-05",
  // MLK Jr. Day
  "2026-01-19",
  // Conference Day (no school for HS)
  "2026-01-30",
  // Presidents' Day Weekend
  "2026-02-13", "2026-02-14", "2026-02-15", "2026-02-16",
  // PD Day
  "2026-03-13",
  // Spring Break
  "2026-03-16", "2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20",
  // Hurricane Make-Up Day
  "2026-04-13",
];

export const EARLY_DISMISSAL_DATES: string[] = [
  "2025-10-08",
  "2025-12-18",
  "2026-03-12",
];

// --- Monday (All 8 Periods) ---

const MONDAY_BEFORE: Period[] = [
  { name: "1st Period", start: "07:45", end: "08:30" },
  { name: "2nd Period", start: "08:35", end: "09:20" },
  { name: "3rd Period", start: "09:25", end: "10:10" },
  { name: "4th Core/TOK", start: "10:15", end: "10:50" },
  { name: "5th Period", start: "10:55", end: "11:40" },
];

const MONDAY_910: Period[] = [
  { name: "Lunch", start: "11:45", end: "12:20" },
  { name: "6th Period", start: "12:25", end: "13:10" },
];

const MONDAY_1112: Period[] = [
  { name: "6th Period", start: "11:45", end: "12:30" },
  { name: "Lunch", start: "12:35", end: "13:10" },
];

const MONDAY_AFTER: Period[] = [
  { name: "7th Period", start: "13:15", end: "14:00" },
  { name: "8th Period", start: "14:05", end: "14:50" },
];

// --- Tuesday/Thursday (Odd Day) ---

const ODD_BEFORE: Period[] = [
  { name: "1st Period", start: "07:45", end: "09:15" },
  { name: "3rd Period", start: "09:25", end: "10:55" },
];

const ODD_910: Period[] = [
  { name: "Lunch", start: "11:00", end: "11:35" },
  { name: "5th Period", start: "11:40", end: "13:10" },
];

const ODD_1112: Period[] = [
  { name: "5th Period", start: "11:00", end: "12:30" },
  { name: "Lunch", start: "12:35", end: "13:10" },
];

const ODD_AFTER: Period[] = [{ name: "7th Period", start: "13:20", end: "14:50" }];

// --- Wednesday (Even Day, Early Release) ---

const WED_BEFORE: Period[] = [
  { name: "2nd Period", start: "07:45", end: "09:15" },
  { name: "4th Core/TOK", start: "09:20", end: "10:15" },
];

const WED_910: Period[] = [
  { name: "Lunch", start: "10:20", end: "10:55" },
  { name: "6th Period", start: "10:55", end: "12:25" },
];

const WED_1112: Period[] = [
  { name: "6th Period", start: "10:20", end: "11:50" },
  { name: "Lunch", start: "11:50", end: "12:25" },
];

const WED_AFTER: Period[] = [{ name: "8th Period", start: "12:30", end: "14:00" }];

// --- Friday (Even Day) ---

const FRI_BEFORE: Period[] = [
  { name: "2nd Period", start: "07:45", end: "09:15" },
  { name: "4th Core/TOK", start: "09:25", end: "10:55" },
];

const FRI_910: Period[] = [
  { name: "Lunch", start: "11:00", end: "11:35" },
  { name: "6th Period", start: "11:40", end: "13:10" },
];

const FRI_1112: Period[] = [
  { name: "6th Period", start: "11:00", end: "12:30" },
  { name: "Lunch", start: "12:35", end: "13:10" },
];

const FRI_AFTER: Period[] = [{ name: "8th Period", start: "13:20", end: "14:50" }];

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

export function getDayType(dayOfWeek: number): DayType | null {
  switch (dayOfWeek) {
    case 0:
    case 6:
      return null;
    case 1:
      return "monday";
    case 2:
    case 4:
      return "odd";
    case 3:
    case 5:
      return "even";
    default:
      return null;
  }
}

export function getDayTypeLabel(dayType: DayType): string {
  switch (dayType) {
    case "monday":
      return "All Periods";
    case "odd":
      return "Odd Day";
    case "even":
      return "Even Day";
  }
}
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isNoSchoolDate(dateStr: string): boolean {
  return NO_SCHOOL_DATES.includes(dateStr);
}

export function isEightPeriodOverride(dateStr: string): boolean {
  return EIGHT_PERIOD_OVERRIDES.includes(dateStr);
}

export function getEffectiveDayOfWeek(date: Date): number {
  const dateStr = formatDateStr(date);
  if (isEightPeriodOverride(dateStr)) return 1;
  return date.getDay();
}

export function getScheduleForDay(
  dayOfWeek: number,
  lunchWave: LunchWave,
): Period[] {
  const is910 = lunchWave === "9/10";

  switch (dayOfWeek) {
    case 1:
      return [
        ...MONDAY_BEFORE,
        ...(is910 ? MONDAY_910 : MONDAY_1112),
        ...MONDAY_AFTER,
      ];
    case 2:
    case 4:
      return [
        ...ODD_BEFORE,
        ...(is910 ? ODD_910 : ODD_1112),
        ...ODD_AFTER,
      ];
    case 3:
      return [
        ...WED_BEFORE,
        ...(is910 ? WED_910 : WED_1112),
        ...WED_AFTER,
      ];
    case 5:
      return [
        ...FRI_BEFORE,
        ...(is910 ? FRI_910 : FRI_1112),
        ...FRI_AFTER,
      ];
    default:
      return [];
  }
}

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

export function getNextSchoolDay(from: Date): {
  date: Date;
  dayName: string;
  dayType: DayType;
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
  // Check up to 30 days ahead to skip long breaks
  for (let i = 0; i < 30; i++) {
    next.setDate(next.getDate() + 1);
    const dow = next.getDay();
    if (dow === 0 || dow === 6) continue;
    const dateStr = formatDateStr(next);
    if (isNoSchoolDate(dateStr)) continue;
    const effectiveDow = isEightPeriodOverride(dateStr) ? 1 : dow;
    const dayType = getDayType(effectiveDow);
    if (!dayType) continue;
    return {
      date: next,
      dayName: dayNames[dow],
      dayType,
      label: getDayTypeLabel(dayType),
      isTomorrow: i === 0,
    };
  }
  return null;
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
