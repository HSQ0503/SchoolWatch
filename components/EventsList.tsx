"use client";

import { useState } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { type SchoolEvent, daysUntil, TYPE_STYLES } from "@/lib/events";
import CalendarView from "@/components/CalendarView";
import config from "@/school.config";

const allEvents: SchoolEvent[] = config.calendar.events.map((e) => ({
  date: e.date,
  name: e.name,
  type: e.type as SchoolEvent["type"],
  endDate: e.endDate ?? null,
}));

function formatEventDate(event: SchoolEvent): string {
  const date = new Date(event.date + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const start = date.toLocaleDateString("en-US", options);

  if (event.endDate) {
    const end = new Date(event.endDate + "T12:00:00");
    const endDay = end.toLocaleDateString("en-US", { day: "numeric" });
    return `${start}\u2013${endDay}`;
  }

  return start;
}

function getMonthYear(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function EventsList() {
  const mounted = useHasMounted();
  const [showPast, setShowPast] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "calendar">("calendar");

  if (!mounted) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-border" />
        ))}
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const filteredEvents = showPast
    ? allEvents
    : allEvents.filter((e) => {
        const compareDate = e.endDate || e.date;
        return compareDate >= todayStr;
      });

  // Group by month
  const grouped: Record<string, SchoolEvent[]> = {};
  for (const event of filteredEvents) {
    const month = getMonthYear(event.date);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(event);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-text dark:text-dark-text">
          School Events
        </h2>
        <div className="flex items-center gap-3">
          {viewMode === "cards" && (
            <button
              onClick={() => setShowPast(!showPast)}
              className="text-sm text-muted transition-colors hover:text-card-accent dark:text-dark-muted dark:hover:text-dark-text"
            >
              {showPast ? "Hide past events" : "Show past events"}
            </button>
          )}
          <div className="flex gap-1 rounded-lg border border-border bg-surface p-1 dark:border-dark-border dark:bg-dark-surface">
            {(["cards", "calendar"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-badge text-white"
                    : "text-muted hover:text-text dark:text-dark-muted dark:hover:text-dark-text"
                }`}
              >
                {mode === "cards" ? "Cards" : "Calendar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <CalendarView events={allEvents} />
      ) : (
        <>
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
                {month}
              </h3>
              <div className="space-y-2">
                {monthEvents.map((event, i) => {
                  const days = daysUntil(event.date);
                  const isPast = days < 0;
                  const style = TYPE_STYLES[event.type];

                  return (
                    <div
                      key={`${event.date}-${i}`}
                      className={`rounded-xl border p-4 ${style.border} ${style.bg} ${isPast ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-2 h-2 w-2 rounded-full ${style.dot}`}
                          />
                          <div>
                            <p className="font-medium text-text dark:text-dark-text">{event.name}</p>
                            <p className="text-sm text-muted dark:text-dark-muted">
                              {formatEventDate(event)}
                            </p>
                          </div>
                        </div>
                        {!isPast && (
                          <span className="whitespace-nowrap text-sm text-muted dark:text-dark-muted">
                            {days === 0
                              ? "Today"
                              : days === 1
                                ? "Tomorrow"
                                : `${days} days`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <p className="py-8 text-center text-muted dark:text-dark-muted">No upcoming events</p>
          )}
        </>
      )}
    </div>
  );
}
