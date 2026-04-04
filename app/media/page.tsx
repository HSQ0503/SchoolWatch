"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { PrepTalk } from "@/lib/preptalks";
import { extractYoutubeId } from "@/lib/preptalks";
import { useHasMounted } from "@/hooks/useHasMounted";

function formatWeekDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return `Week of ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
}

type VoteMap = Record<string, "like" | "dislike">;

function readVotes(): VoteMap {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("lakerwatch-preptalk-votes");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveVotes(votes: VoteMap) {
  localStorage.setItem("lakerwatch-preptalk-votes", JSON.stringify(votes));
}

function ThumbUpIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904m7.723-9.022a2.418 2.418 0 001.244.168m-1.244-.168v-.004M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
    </svg>
  );
}

function ThumbDownIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 01-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.75 2.25 2.25 0 009.75 22a.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m4.523-8.004a2.417 2.417 0 00-1.244.168M6.67 18.1a12.04 12.04 0 01-.27-.602c-.197-.4.078-.898.523-.898h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227H5.904c-.472 0-.745-.556-.5-.96a8.958 8.958 0 001.302-4.665 8.97 8.97 0 00-.654-3.375z" />
    </svg>
  );
}

function VoteButtons({
  preptalk,
  votes,
  onVote,
}: {
  preptalk: PrepTalk;
  votes: VoteMap;
  onVote: (id: string, type: "like" | "dislike") => void;
}) {
  const id = preptalk.id!;
  const userVote = votes[id] ?? null;

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={() => onVote(id, "like")}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          userVote === "like"
            ? "bg-red/10 text-red dark:bg-red/20 dark:text-red-light"
            : "text-muted hover:bg-border/50 hover:text-text dark:text-dark-muted dark:hover:bg-white/10 dark:hover:text-dark-text"
        }`}
      >
        <ThumbUpIcon filled={userVote === "like"} className="h-4 w-4" />
        {preptalk.likes ?? 0}
      </button>
      <button
        onClick={() => onVote(id, "dislike")}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          userVote === "dislike"
            ? "bg-red/10 text-red dark:bg-red/20 dark:text-red-light"
            : "text-muted hover:bg-border/50 hover:text-text dark:text-dark-muted dark:hover:bg-white/10 dark:hover:text-dark-text"
        }`}
      >
        <ThumbDownIcon filled={userVote === "dislike"} className="h-4 w-4" />
        {preptalk.dislikes ?? 0}
      </button>
    </div>
  );
}

export default function MediaPage() {
  const mounted = useHasMounted();
  const [preptalks, setPreptalks] = useState<PrepTalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [votes, setVotes] = useState<VoteMap>(readVotes);

  useEffect(() => {
    fetch("/api/preptalks")
      .then((res) => res.json())
      .then((data: PrepTalk[]) => {
        setPreptalks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleVote(id: string, type: "like" | "dislike") {
    const currentVote = votes[id] ?? null;

    let likeDelta = 0;
    let dislikeDelta = 0;
    const newVotes = { ...votes };

    if (currentVote === type) {
      // Clicking same button — remove vote
      if (type === "like") likeDelta = -1;
      else dislikeDelta = -1;
      delete newVotes[id];
    } else if (currentVote === null) {
      // No previous vote
      if (type === "like") likeDelta = 1;
      else dislikeDelta = 1;
      newVotes[id] = type;
    } else {
      // Switching vote
      if (type === "like") { likeDelta = 1; dislikeDelta = -1; }
      else { likeDelta = -1; dislikeDelta = 1; }
      newVotes[id] = type;
    }

    // Optimistic update
    setPreptalks((prev) =>
      prev.map((pt) =>
        pt.id === id
          ? {
              ...pt,
              likes: Math.max(0, (pt.likes ?? 0) + likeDelta),
              dislikes: Math.max(0, (pt.dislikes ?? 0) + dislikeDelta),
            }
          : pt,
      ),
    );
    setVotes(newVotes);
    saveVotes(newVotes);

    fetch(`/api/preptalks/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ likeDelta, dislikeDelta }),
    }).catch(() => {
      // Revert on failure
      setPreptalks((prev) =>
        prev.map((pt) =>
          pt.id === id
            ? {
                ...pt,
                likes: Math.max(0, (pt.likes ?? 0) - likeDelta),
                dislikes: Math.max(0, (pt.dislikes ?? 0) - dislikeDelta),
              }
            : pt,
        ),
      );
      setVotes(votes);
      saveVotes(votes);
    });
  }

  if (loading) {
    return (
      <div>
        <div className="mb-2 h-12 w-48 animate-pulse rounded-lg bg-border/50 dark:bg-white/5" />
        <div className="mb-8 h-5 w-64 animate-pulse rounded bg-border/50 dark:bg-white/5" />
        <div className="aspect-video w-full animate-pulse rounded-xl bg-border/50 dark:bg-white/5" />
        <div className="mt-4 h-6 w-72 animate-pulse rounded bg-border/50 dark:bg-white/5" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-border/50 dark:bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (preptalks.length === 0) {
    return (
      <div>
        <h1 className="mb-2 font-display text-4xl font-extrabold text-text dark:text-dark-text md:text-5xl">
          WPS-Media
        </h1>
        <p className="mb-8 text-lg text-muted dark:text-dark-muted">
          Weekly PrepTalk videos
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
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
            />
          </svg>
          <p className="text-sm font-medium text-muted dark:text-dark-muted">
            No PrepTalks yet
          </p>
          <p className="mt-1 text-xs text-muted/60 dark:text-dark-muted/60">
            Check back soon for the latest PrepTalk video
          </p>
        </div>
      </div>
    );
  }

  const latest = preptalks[0];
  const archive = preptalks.slice(1);
  const latestVideoId = extractYoutubeId(latest.youtubeUrl);

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl font-extrabold text-text dark:text-dark-text md:text-5xl">
        WPS-Media
      </h1>
      <p className="mb-8 text-lg text-muted dark:text-dark-muted">
        Weekly PrepTalk videos
      </p>

      {/* Hero — Latest PrepTalk */}
      {latestVideoId && (
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-red/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-red dark:bg-red/20 dark:text-red-light">
              Latest
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${latestVideoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
                title={latest.title}
              />
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl font-bold text-text dark:text-dark-text">
                {latest.title}
              </h2>
              <p className="mt-1 text-sm text-muted dark:text-dark-muted">
                {formatWeekDate(latest.weekDate)}
              </p>
              {latest.description && (
                <p className="mt-2 text-sm text-text/80 dark:text-dark-text/80">
                  {latest.description}
                </p>
              )}
              {mounted && <VoteButtons preptalk={latest} votes={votes} onVote={handleVote} />}
            </div>
          </div>
        </div>
      )}

      {/* Archive */}
      {archive.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-text dark:text-dark-text">
            Past PrepTalks
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {archive.map((pt) => {
              const videoId = extractYoutubeId(pt.youtubeUrl);
              if (!videoId) return null;

              const isExpanded = expandedId === pt.id;

              return (
                <div
                  key={pt.id}
                  className="overflow-hidden rounded-xl border border-border bg-white transition-colors dark:border-dark-border dark:bg-dark-surface"
                >
                  {isExpanded ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                        title={pt.title}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedId(pt.id ?? null)}
                      className="group relative aspect-video w-full cursor-pointer"
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={pt.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red/90 text-white shadow-lg transition-transform group-hover:scale-110">
                          <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-sm font-bold text-text dark:text-dark-text">
                      {pt.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted dark:text-dark-muted">
                      {formatWeekDate(pt.weekDate)}
                    </p>
                    {mounted && <VoteButtons preptalk={pt} votes={votes} onVote={handleVote} />}
                    {isExpanded && (
                      <button
                        onClick={() => setExpandedId(null)}
                        className="mt-2 text-xs font-medium text-red transition-colors hover:text-red-light dark:text-red-light"
                      >
                        Collapse
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
