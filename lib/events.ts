export type SchoolEvent = {
  id?: string;
  date: string; // "YYYY-MM-DD"
  name: string;
  type: "no-school" | "early-dismissal" | "event" | "exam" | "deadline";
  endDate?: string | null;
};

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function filterUpcoming(events: SchoolEvent[]): SchoolEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatLocalDate(today);

  return events.filter((e) => {
    const compareDate = e.endDate || e.date;
    return compareDate >= todayStr;
  });
}

export function findNextNoSchool(events: SchoolEvent[]): SchoolEvent | null {
  const upcoming = filterUpcoming(events);
  return upcoming.find((e) => e.type === "no-school") ?? null;
}

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const TYPE_STYLES: Record<
  SchoolEvent["type"],
  { border: string; bg: string; dot: string }
> = {
  "no-school": {
    border: "border-red/20 dark:border-red/15",
    bg: "bg-red/5 dark:bg-red/10",
    dot: "bg-red",
  },
  "early-dismissal": {
    border: "border-red/15 dark:border-red/10",
    bg: "bg-red/5 dark:bg-red/10",
    dot: "bg-red-light",
  },
  event: {
    border: "border-border dark:border-dark-border",
    bg: "bg-white dark:bg-dark-surface",
    dot: "bg-red dark:bg-red-light",
  },
  exam: {
    border: "border-red/20 dark:border-red/15",
    bg: "bg-red/5 dark:bg-red/10",
    dot: "bg-red",
  },
  deadline: {
    border: "border-red/15 dark:border-red/10",
    bg: "bg-red/5 dark:bg-red/10",
    dot: "bg-red-light",
  },
};
