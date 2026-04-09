"use client";

import DayStatusHero from "@/components/DayStatusHero";
import PeriodCountdown from "@/components/PeriodCountdown";
import QuickGlanceCards from "@/components/QuickGlanceCards";
import { useLunchWave } from "@/hooks/useLunchWave";
import { formatDateStr } from "@/lib/schedule";
import { getDevDate } from "@/lib/devTime";
import config from "@/school.config";

function checkEarlyDismissal(): boolean {
  const today = formatDateStr(getDevDate(new Date()));
  return config.calendar.events.some(
    (e) => e.type === "early-dismissal" && e.date <= today && (e.endDate ?? e.date) >= today
  );
}

export default function Dashboard() {
  const { lunchWave } = useLunchWave();
  const isEarlyDismissal = checkEarlyDismissal();

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
