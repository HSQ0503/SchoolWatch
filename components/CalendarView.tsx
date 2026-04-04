"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { type SchoolEvent, TYPE_STYLES } from "@/lib/events";

type CalendarViewProps = {
  events: SchoolEvent[];
  interactive?: boolean;
  onDateClick?: (date: string) => void;
  onDateRangeSelect?: (start: string, end: string) => void;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function buildEventMap(events: SchoolEvent[]): Map<string, SchoolEvent[]> {
  const map = new Map<string, SchoolEvent[]>();
  for (const event of events) {
    const start = new Date(event.date + "T12:00:00");
    const end = event.endDate ? new Date(event.endDate + "T12:00:00") : start;
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = formatDateKey(cursor);
      const existing = map.get(key) || [];
      existing.push(event);
      map.set(key, existing);
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return map;
}

const MAX_VISIBLE = 3;

function isInRange(dateKey: string, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const lo = start < end ? start : end;
  const hi = start < end ? end : start;
  return dateKey >= lo && dateKey <= hi;
}

export default function CalendarView({ events, interactive, onDateClick, onDateRangeSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const isDragging = useRef(false);

  const eventMap = useMemo(() => buildEventMap(events), [events]);
  const days = useMemo(
    () => generateCalendarDays(currentMonth.year, currentMonth.month),
    [currentMonth.year, currentMonth.month],
  );

  const todayKey = formatDateKey(new Date());

  const monthLabel = new Date(
    currentMonth.year,
    currentMonth.month,
    1,
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function navigateMonth(delta: number) {
    setCurrentMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) {
        m = 11;
        y--;
      }
      if (m > 11) {
        m = 0;
        y++;
      }
      return { year: y, month: m };
    });
  }

  const handleMouseDown = useCallback((dateKey: string) => {
    if (!interactive) return;
    isDragging.current = true;
    setDragStart(dateKey);
    setDragEnd(dateKey);
  }, [interactive]);

  const handleMouseEnter = useCallback((dateKey: string) => {
    if (!interactive || !isDragging.current) return;
    setDragEnd(dateKey);
  }, [interactive]);

  const handleMouseUp = useCallback(() => {
    if (!interactive || !isDragging.current || !dragStart) return;
    isDragging.current = false;
    const end = dragEnd || dragStart;
    if (dragStart === end) {
      onDateClick?.(dragStart);
    } else {
      const lo = dragStart < end ? dragStart : end;
      const hi = dragStart < end ? end : dragStart;
      onDateRangeSelect?.(lo, hi);
    }
    setDragStart(null);
    setDragEnd(null);
  }, [interactive, dragStart, dragEnd, onDateClick, onDateRangeSelect]);

  useEffect(() => {
    if (!interactive) return;
    const handleGlobalUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setDragStart(null);
        setDragEnd(null);
      }
    };
    window.addEventListener("mouseup", handleGlobalUp);
    return () => window.removeEventListener("mouseup", handleGlobalUp);
  }, [interactive]);

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-red/30 hover:text-text dark:border-dark-border dark:text-dark-muted dark:hover:text-dark-text"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="font-display text-lg font-semibold text-text dark:text-dark-text">
          {monthLabel}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-red/30 hover:text-text dark:border-dark-border dark:text-dark-muted dark:hover:text-dark-text"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border border-border dark:border-dark-border">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-border bg-bg dark:border-dark-border dark:bg-dark-bg/50">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7" onMouseUp={interactive ? handleMouseUp : undefined}>
          {days.map((day, i) => {
            const key = day ? formatDateKey(day) : `empty-${i}`;
            const isToday = day ? key === todayKey : false;
            const cellEvents = day ? eventMap.get(key) || [] : [];
            const inRange = day ? isInRange(key, dragStart, dragEnd) : false;

            return (
              <div
                key={key}
                onMouseDown={day && interactive ? () => handleMouseDown(key) : undefined}
                onMouseEnter={day && interactive ? () => handleMouseEnter(key) : undefined}
                className={`min-h-[90px] border-b border-r border-border p-2 sm:min-h-[120px] dark:border-dark-border ${
                  inRange
                    ? "bg-red/10 dark:bg-red/15"
                    : isToday
                      ? "bg-red/5"
                      : day
                        ? "bg-white dark:bg-dark-surface"
                        : "bg-bg/50 dark:bg-dark-bg/30"
                } ${day && interactive ? "cursor-pointer select-none transition-colors hover:bg-red/5 dark:hover:bg-red/10" : ""}`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center text-sm font-medium ${
                        isToday
                          ? "rounded-full bg-red text-white"
                          : "text-text dark:text-dark-text"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {cellEvents.slice(0, MAX_VISIBLE).map((event, j) => (
                        <div
                          key={event.id || `${event.date}-${j}`}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className={`h-2 w-2 flex-shrink-0 rounded-full ${TYPE_STYLES[event.type].dot}`}
                          />
                          <span className="hidden truncate text-xs leading-snug text-text sm:inline dark:text-dark-text">
                            {event.name}
                          </span>
                        </div>
                      ))}
                      {cellEvents.length > MAX_VISIBLE && (
                        <span className="text-[11px] text-muted dark:text-dark-muted">
                          +{cellEvents.length - MAX_VISIBLE} more
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
