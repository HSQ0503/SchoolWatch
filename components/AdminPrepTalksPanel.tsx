"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import AdminPrepTalkForm from "@/components/AdminPrepTalkForm";
import type { PrepTalk } from "@/lib/preptalks";
import { extractYoutubeId } from "@/lib/preptalks";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminPrepTalksPanel() {
  const [preptalks, setPreptalks] = useState<PrepTalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchPrepTalks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/preptalks");
      const data: PrepTalk[] = await res.json();
      setPreptalks(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPrepTalks(); }, [fetchPrepTalks]);

  async function handleAdd(data: { title: string; youtubeUrl: string; weekDate: string; description: string }) {
    const res = await fetch("/api/preptalks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { setShowAddForm(false); fetchPrepTalks(); }
  }

  async function handleEdit(data: { title: string; youtubeUrl: string; weekDate: string; description: string }) {
    if (!editingId) return;
    const res = await fetch(`/api/preptalks/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { setEditingId(null); fetchPrepTalks(); }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/preptalks/${id}`, {
      method: "DELETE",
    });
    if (res.ok) { setDeleteConfirmId(null); fetchPrepTalks(); }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-text dark:text-dark-text">
            PrepTalks
          </h2>
          <p className="text-sm text-muted dark:text-dark-muted">
            {preptalks.length} video{preptalks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          className="flex items-center gap-1.5 rounded-lg bg-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-light"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add PrepTalk
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 rounded-xl border border-red/15 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <h3 className="mb-4 font-display text-base font-bold text-text dark:text-dark-text">
            New PrepTalk
          </h3>
          <AdminPrepTalkForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-xl bg-border/50 dark:bg-white/5" />
          ))}
        </div>
      ) : preptalks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center dark:border-dark-border">
          <svg className="mx-auto mb-3 h-10 w-10 text-border dark:text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
          </svg>
          <p className="text-sm font-medium text-muted dark:text-dark-muted">No PrepTalks yet</p>
          <p className="mt-1 text-xs text-muted/60 dark:text-dark-muted/60">Click &quot;Add PrepTalk&quot; to create one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {preptalks.map((pt) => {
            const videoId = extractYoutubeId(pt.youtubeUrl);

            return (
              <div
                key={pt.id}
                className="group rounded-xl border border-border bg-white p-4 transition-colors hover:border-border dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-border"
              >
                {editingId === pt.id ? (
                  <div>
                    <h3 className="mb-3 font-display text-sm font-semibold text-text dark:text-dark-text">
                      Edit PrepTalk
                    </h3>
                    <AdminPrepTalkForm preptalk={pt} onSave={handleEdit} onCancel={() => setEditingId(null)} />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {videoId && (
                      <Image
                        src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                        alt=""
                        width={64}
                        height={48}
                        className="h-12 w-16 shrink-0 rounded object-cover"
                        unoptimized
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text dark:text-dark-text">
                        {pt.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted dark:text-dark-muted">
                        {formatDate(pt.weekDate)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {deleteConfirmId === pt.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(pt.id!)}
                            className="rounded-lg bg-red px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-light"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-text dark:border-dark-border dark:text-dark-muted dark:hover:text-dark-text"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingId(pt.id!); setShowAddForm(false); }}
                            className="rounded-lg px-2.5 py-1.5 text-sm text-muted opacity-0 transition-all hover:bg-border/50 hover:text-text group-hover:opacity-100 dark:text-dark-muted dark:hover:bg-white/10 dark:hover:text-dark-text"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(pt.id!)}
                            className="rounded-lg px-2.5 py-1.5 text-sm text-muted opacity-0 transition-all hover:bg-red/10 hover:text-red group-hover:opacity-100 dark:text-dark-muted"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
