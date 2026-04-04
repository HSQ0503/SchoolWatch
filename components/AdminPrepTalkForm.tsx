"use client";

import { useState } from "react";
import Image from "next/image";
import type { PrepTalk } from "@/lib/preptalks";
import { extractYoutubeId } from "@/lib/preptalks";

type AdminPrepTalkFormProps = {
  preptalk?: PrepTalk;
  onSave: (data: { title: string; youtubeUrl: string; weekDate: string; description: string }) => void;
  onCancel: () => void;
};

export default function AdminPrepTalkForm({ preptalk, onSave, onCancel }: AdminPrepTalkFormProps) {
  const [title, setTitle] = useState(preptalk?.title ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(preptalk?.youtubeUrl ?? "");
  const [weekDate, setWeekDate] = useState(preptalk?.weekDate ?? "");
  const [description, setDescription] = useState(preptalk?.description ?? "");

  const videoId = extractYoutubeId(youtubeUrl);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim() || !weekDate) return;
    onSave({ title: title.trim(), youtubeUrl: youtubeUrl.trim(), weekDate, description: description.trim() });
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
          placeholder="e.g. PrepTalk - Week of Feb 24"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
          YouTube URL
        </label>
        <input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className={inputClass}
          placeholder="e.g. https://www.youtube.com/watch?v=..."
          required
        />
        {youtubeUrl && (
          videoId ? (
            <div className="mt-2 overflow-hidden rounded-lg border border-border dark:border-dark-border">
              <Image
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video preview"
                width={320}
                height={96}
                className="h-24 w-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <p className="mt-1 text-xs text-red">Could not detect a valid YouTube video ID</p>
          )
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
          Week Date
        </label>
        <input
          type="date"
          value={weekDate}
          onChange={(e) => setWeekDate(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
          Description <span className="text-muted dark:text-dark-muted">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-none`}
          rows={2}
          placeholder="Brief description of this PrepTalk"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-red px-4 py-2 font-medium text-white transition-colors hover:bg-red-light"
        >
          {preptalk ? "Save Changes" : "Add PrepTalk"}
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
