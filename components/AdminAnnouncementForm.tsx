"use client";

import { useState } from "react";
import type { AnnouncementType } from "@/lib/announcements";
import { ANNOUNCEMENT_TYPES } from "@/lib/announcements";

type AdminAnnouncementFormProps = {
  announcement?: {
    title: string;
    body: string;
    type: AnnouncementType;
    pinned: boolean;
    expiresAt?: string | null;
  };
  onSave: (data: {
    title: string;
    body: string;
    type: AnnouncementType;
    pinned: boolean;
    expiresAt: string;
  }) => void;
  onCancel: () => void;
};

export default function AdminAnnouncementForm({
  announcement,
  onSave,
  onCancel,
}: AdminAnnouncementFormProps) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [type, setType] = useState<AnnouncementType>(announcement?.type ?? "info");
  const [pinned, setPinned] = useState(announcement?.pinned ?? false);
  const [expiresAt, setExpiresAt] = useState(announcement?.expiresAt ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSave({ title: title.trim(), body: body.trim(), type, pinned, expiresAt });
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-bg px-3 py-2 text-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-red/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Schedule Change Tomorrow"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder="Announcement details..."
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AnnouncementType)}
            className={inputClass}
          >
            {ANNOUNCEMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
            Expires <span className="text-muted dark:text-dark-muted">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="pinned"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-red"
        />
        <label htmlFor="pinned" className="text-sm font-medium text-text dark:text-dark-text">
          Pin to top
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-red px-4 py-2 font-medium text-white transition-colors hover:bg-red-light"
        >
          {announcement ? "Save Changes" : "Add Announcement"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 font-medium text-text transition-colors hover:bg-border/50 dark:border-dark-border dark:text-dark-text dark:hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
