"use client";

import { useState, useEffect } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  type FlikDay,
  type LunchStation,
  parseFlikDay,
  getWeekdayDays,
  getDayName,
  formatLunchDate,
} from "@/lib/lunch";

const FLIK_URL =
  "https://wps.flikisdining.com/menu/windermere-prep-school/lunch";

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function LunchPage() {
  const mounted = useHasMounted();
  const [weekdays, setWeekdays] = useState<FlikDay[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/lunch")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: { days: FlikDay[] }) => {
        const wd = getWeekdayDays(data.days);
        setWeekdays(wd);

        // Default to today if it's a weekday
        const today = formatLunchDate(new Date());
        const todayIdx = wd.findIndex((d) => d.date === today);
        if (todayIdx !== -1) setSelectedIdx(todayIdx);

        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (!mounted || loading) {
    return (
      <div>
        <div className="mb-2 h-12 w-48 animate-pulse rounded-lg bg-border/50 dark:bg-white/5" />
        <div className="mb-6 h-5 w-64 animate-pulse rounded bg-border/50 dark:bg-white/5" />
        <div className="mb-6 flex gap-2">
          {SHORT_DAYS.map((d) => (
            <div
              key={d}
              className="h-10 w-16 animate-pulse rounded-lg bg-border/50 dark:bg-white/5"
            />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-border/50 dark:bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || weekdays.length === 0) {
    return (
      <div>
        <h1 className="mb-2 font-display text-4xl font-extrabold text-text dark:text-dark-text md:text-5xl">
          Lunch Menu
        </h1>
        <p className="mb-8 text-lg text-muted dark:text-dark-muted">
          Daily menu from FLIK Dining
        </p>
        <div className="rounded-xl border border-dashed border-border py-16 text-center dark:border-dark-border">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-border dark:text-dark-border"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="mb-2 text-sm font-medium text-text dark:text-dark-text">
            No menu available this week
          </p>
          <p className="mb-4 text-xs text-muted dark:text-dark-muted">
            The menu may not be published yet — check back later
          </p>
          <a
            href={FLIK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-light"
          >
            View on FLIK Dining
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
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  const selected = weekdays[selectedIdx];
  const stations: LunchStation[] = selected ? parseFlikDay(selected) : [];
  const today = formatLunchDate(new Date());
  const isToday = selected?.date === today;

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl font-extrabold text-text dark:text-dark-text md:text-5xl">
        Lunch Menu
      </h1>
      <p className="mb-6 text-lg text-muted dark:text-dark-muted">
        {isToday
          ? "Today\u2019s menu from FLIK Dining"
          : `${getDayName(selected.date)}\u2019s menu from FLIK Dining`}
      </p>

      {/* Day selector */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {weekdays.map((day, i) => {
          const isActive = i === selectedIdx;
          const dayDate = new Date(day.date + "T12:00:00");
          const label = SHORT_DAYS[dayDate.getDay() - 1] ?? "?";
          const dateNum = dayDate.getDate();
          const isDayToday = day.date === today;

          return (
            <button
              key={day.date}
              onClick={() => setSelectedIdx(i)}
              className={`flex flex-col items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-red text-white shadow-sm"
                  : "border border-border bg-white text-muted hover:border-red/30 hover:text-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:text-dark-text"
              }`}
            >
              <span className="text-xs uppercase tracking-wider">{label}</span>
              <span className={`text-lg font-bold ${isDayToday && !isActive ? "text-red" : ""}`}>
                {dateNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* Menu content */}
      {stations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center dark:border-dark-border">
          <p className="text-sm text-muted dark:text-dark-muted">
            No menu items for {getDayName(selected.date)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stations.map((station) => (
            <div
              key={station.name}
              className="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-surface dark:shadow-none"
            >
              <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-text dark:text-dark-text">
                <span className="h-1.5 w-1.5 rounded-full bg-red" />
                {station.name}
              </h2>
              <div className="divide-y divide-border dark:divide-dark-border">
                {station.items.map((item, j) => (
                  <div key={j} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-medium text-text dark:text-dark-text">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-muted dark:text-dark-muted">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {item.calories != null && (
                        <span className="text-xs font-medium text-muted dark:text-dark-muted">
                          {item.calories} cal
                        </span>
                      )}
                      {item.allergens.length > 0 && (
                        <span className="text-xs text-muted/70 dark:text-dark-muted/70">
                          {item.allergens.join(" \u00B7 ")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer link */}
      <p className="mt-6 text-center text-xs text-muted dark:text-dark-muted">
        Menu data from{" "}
        <a
          href={FLIK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red transition-colors hover:text-red-light"
        >
          FLIK Dining
        </a>
      </p>
    </div>
  );
}
