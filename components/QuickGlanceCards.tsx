"use client";

import { useState } from "react";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";
import { storageKey } from "@/lib/storage";
import { filterUpcoming, findNextNoSchool, daysUntil, type SchoolEvent } from "@/lib/events";
import config from "@/school.config";

const allEvents: SchoolEvent[] = config.calendar.events.map((e) => ({
  date: e.date,
  name: e.name,
  type: e.type as SchoolEvent["type"],
  endDate: e.endDate ?? null,
}));

type TodoItem = { text: string; completed: boolean };

function readActiveTodos(): TodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(storageKey("todos"));
    if (stored) {
      const todos: TodoItem[] = JSON.parse(stored);
      return todos.filter((t) => !t.completed);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateRange(startDate: string, endDate?: string | null): string {
  const start = formatShortDate(startDate);
  if (!endDate) return start;
  const startD = new Date(startDate + "T00:00:00");
  const endD = new Date(endDate + "T00:00:00");
  if (startD.getMonth() === endD.getMonth()) {
    return `${start}\u2013${endD.getDate()}`;
  }
  return `${start} \u2013 ${formatShortDate(endDate)}`;
}

export default function QuickGlanceCards() {
  const mounted = useHasMounted();
  const [activeTodos] = useState(readActiveTodos);

  const todoCount = activeTodos.length;
  const nextTodo = activeTodos[0];

  if (!mounted) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-border dark:bg-white/10" />
        <div className="h-24 animate-pulse rounded-xl bg-border dark:bg-white/10" />
      </div>
    );
  }

  const nextBreak = findNextNoSchool(allEvents);
  const upcomingEvents = filterUpcoming(allEvents);
  const nextEvent = upcomingEvents[0];

  const eventTarget = nextBreak || nextEvent;
  const eventLabel = nextBreak ? "Next Break" : "Next Event";
  const eventName = eventTarget?.name ?? "No upcoming events";
  const eventDays = eventTarget ? daysUntil(eventTarget.date) : null;
  const eventDateRange = eventTarget
    ? formatDateRange(eventTarget.date, eventTarget.endDate)
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link
        href="/events"
        className="rounded-xl border border-red/15 border-l-[3px] border-l-red bg-white p-5 shadow-sm transition-all hover:shadow-md hover:bg-red/5 dark:border-dark-border dark:border-l-red dark:bg-dark-surface dark:shadow-none dark:backdrop-blur-md dark:hover:bg-white/10"
      >
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red">
          {eventLabel}
        </p>
        <p className="font-display text-lg font-bold text-text dark:text-dark-text">
          {eventName}
        </p>
        {eventDays !== null && (
          <p className="mt-1 text-sm text-muted dark:text-dark-muted">
            {eventDays === 0
              ? "Today"
              : eventDays === 1
                ? "Tomorrow"
                : `${eventDays} days away`}
            {eventDateRange && ` \u00B7 ${eventDateRange}`}
          </p>
        )}
      </Link>

      <Link
        href="/todos"
        className="rounded-xl border border-red/15 border-l-[3px] border-l-red bg-white p-5 shadow-sm transition-all hover:shadow-md hover:bg-red/5 dark:border-dark-border dark:border-l-red dark:bg-dark-surface dark:shadow-none dark:backdrop-blur-md dark:hover:bg-white/10"
      >
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red dark:text-red-light">
          To-Do
        </p>
        <p className="font-display text-lg font-bold text-text dark:text-dark-text">
          {todoCount === 0
            ? "All caught up!"
            : `${todoCount} task${todoCount === 1 ? "" : "s"} remaining`}
        </p>
        <p className="mt-1 truncate text-sm text-muted dark:text-dark-muted">
          {nextTodo ? `Next: ${nextTodo.text}` : "Nothing to do"}
        </p>
      </Link>
    </div>
  );
}
