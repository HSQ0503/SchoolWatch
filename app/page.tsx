"use client";

import { useState, useEffect } from "react";
import DayStatusHero from "@/components/DayStatusHero";
import PeriodCountdown from "@/components/PeriodCountdown";
import QuickGlanceCards from "@/components/QuickGlanceCards";
import { useLunchWave } from "@/hooks/useLunchWave";
import type { SchoolEvent } from "@/lib/events";
import { formatDateStr } from "@/lib/schedule";
import { getDevDate } from "@/lib/devTime";
import config from "@/school.config";

const allEvents: SchoolEvent[] = config.calendar.events.map((e) => ({
  date: e.date,
  name: e.name,
  type: e.type as SchoolEvent["type"],
  endDate: e.endDate ?? null,
}));

export default function Dashboard() {
  const { lunchWave } = useLunchWave();
  const [isEarlyDismissal, setIsEarlyDismissal] = useState(false);

  useEffect(() => {
    const today = formatDateStr(getDevDate(new Date()));
    setIsEarlyDismissal(
      allEvents.some(
        (e) => e.type === "early-dismissal" && e.date <= today && (e.endDate ?? e.date) >= today
      )
    );
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-white p-6 pb-8 shadow-sm dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
        <div className="flex flex-col items-center text-center">
          <DayStatusHero isEarlyDismissal={isEarlyDismissal} />
          <PeriodCountdown lunchWave={lunchWave} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
          At a Glance
        </p>
        <QuickGlanceCards />
      </div>
    </div>
  );
}
