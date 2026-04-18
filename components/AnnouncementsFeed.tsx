
import type { AnnouncementType, PublicAnnouncement } from "@/lib/types/announcements";

const TYPE_STYLES: Record<AnnouncementType, { dot: string; bg: string; border: string }> = {
  info: {
    dot: "bg-gray-400 dark:bg-white/40",
    bg: "bg-gray-50 dark:bg-white/5",
    border: "border-gray-200 dark:border-white/10",
  },
  warning: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
  },
  urgent: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
  },
};

const BADGE_COLORS: Record<AnnouncementType, string> = {
  info: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-dark-muted",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

type AnnouncementsFeedProps = {
  announcements: PublicAnnouncement[];
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
                <div aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
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
