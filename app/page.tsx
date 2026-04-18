"use client";

import DayStatusHero from "@/components/DayStatusHero";
import PeriodCountdown from "@/components/PeriodCountdown";
import QuickGlanceCards from "@/components/QuickGlanceCards";
import AnnouncementsFeed from "@/components/AnnouncementsFeed";
import { useLunchWave } from "@/hooks/useLunchWave";
import { useAnnouncements } from "@/hooks/useAnnouncements";
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
  const announcements = useAnnouncements(config.announcements);
  const isEarlyDismissal = checkEarlyDismissal();

  const hasAnnouncements = announcements.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-white p-6 pb-8 shadow-sm dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
        {hasAnnouncements ? (
          <div className="flex flex-col lg:flex-row lg:gap-8">
            <div className="flex flex-col items-center text-center lg:flex-1">
              <DayStatusHero isEarlyDismissal={isEarlyDismissal} />
              <PeriodCountdown lunchWave={lunchWave} />
            </div>
            <div className="my-6 border-t border-border dark:border-dark-border lg:my-0 lg:border-l lg:border-t-0" />
            <div className="max-h-[420px] overflow-hidden lg:w-[340px] lg:max-h-none lg:shrink-0 lg:self-stretch lg:overflow-hidden">
              <AnnouncementsFeed announcements={announcements} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <DayStatusHero isEarlyDismissal={isEarlyDismissal} />
            <PeriodCountdown lunchWave={lunchWave} />
          </div>
        )}
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
