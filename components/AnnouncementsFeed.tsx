"use client";

import type { Announcement } from "@/lib/announcements";

const TYPE_STYLES: Record<string, { dot: string; bg: string; border: string }> = {
  info: {
    dot: "bg-muted dark:bg-dark-muted",
    bg: "bg-bg dark:bg-dark-bg",
    border: "border-border dark:border-dark-border",
  },
  warning: {
    dot: "bg-red-light",
    bg: "bg-red-light/5 dark:bg-red-light/10",
    border: "border-red/20 dark:border-red/30",
  },
  urgent: {
    dot: "bg-red",
    bg: "bg-red/5 dark:bg-red/10",
    border: "border-red/30 dark:border-red/40",
  },
};

const BADGE_COLORS: Record<string, string> = {
  info: "bg-border/50 text-muted dark:bg-white/10 dark:text-dark-muted",
  warning: "bg-red-light/10 text-red-light dark:bg-red-light/20 dark:text-red-light",
  urgent: "bg-red/10 text-red dark:bg-red/20 dark:text-red-light",
};

type AnnouncementsFeedProps = {
  announcements: Announcement[];
};

export default function AnnouncementsFeed({ announcements }: AnnouncementsFeedProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="mb-3 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
        Announcements
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {announcements.map((a) => {
          const style = TYPE_STYLES[a.type] ?? TYPE_STYLES.info;
          return (
            <div
              key={a.id}
              className={`rounded-xl border ${style.border} ${style.bg} p-4`}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                <h3 className="font-display text-base font-bold text-text dark:text-dark-text">
                  {a.title}
                </h3>
                {a.pinned && (
                  <span className="ml-auto text-xs text-muted dark:text-dark-muted">
                    Pinned
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted dark:text-dark-muted">
                {a.body}
              </p>
              <div className="mt-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${BADGE_COLORS[a.type] ?? BADGE_COLORS.info}`}
                >
                  {a.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
