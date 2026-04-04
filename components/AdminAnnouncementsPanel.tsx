"use client";

import { useState, useCallback, useEffect } from "react";
import AdminAnnouncementForm from "@/components/AdminAnnouncementForm";
import type { Announcement, AnnouncementType } from "@/lib/announcements";

const TYPE_LABELS: Record<string, string> = {
  info: "Info",
  warning: "Warning",
  urgent: "Urgent",
};

const TYPE_BADGE: Record<string, string> = {
  info: "bg-border/50 text-muted dark:bg-white/10 dark:text-dark-muted",
  warning: "bg-red-light/10 text-red-light dark:bg-red-light/20",
  urgent: "bg-red/10 text-red dark:bg-red/20 dark:text-red-light",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminAnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements?all=true");
      const data = await res.json();
      setAnnouncements(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  async function handleAdd(data: { title: string; body: string; type: AnnouncementType; pinned: boolean; expiresAt: string }) {
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { setShowAddForm(false); fetchAnnouncements(); }
  }

  async function handleEdit(data: { title: string; body: string; type: AnnouncementType; pinned: boolean; expiresAt: string }) {
    if (!editingId) return;
    const res = await fetch(`/api/announcements/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { setEditingId(null); fetchAnnouncements(); }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/announcements/${id}`, {
      method: "DELETE",
    });
    if (res.ok) { setDeleteConfirmId(null); fetchAnnouncements(); }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    if (!currentActive && atLimit) return;
    await fetch(`/api/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    fetchAnnouncements();
  }

  const MAX_ACTIVE = 4;
  const activeCount = announcements.filter((a) => a.active).length;
  const atLimit = activeCount >= MAX_ACTIVE;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-text dark:text-dark-text">
            Announcements
          </h2>
          <p className="text-sm text-muted dark:text-dark-muted">
            {activeCount}/{MAX_ACTIVE} active · {announcements.length} total
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          disabled={atLimit}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            atLimit
              ? "cursor-not-allowed bg-border text-muted dark:bg-white/10 dark:text-dark-muted"
              : "bg-red text-white hover:bg-red-light"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Announcement
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 rounded-xl border border-red/15 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <h3 className="mb-4 font-display text-base font-bold text-text dark:text-dark-text">
            New Announcement
          </h3>
          <AdminAnnouncementForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-xl bg-border/50 dark:bg-white/5" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center dark:border-dark-border">
          <svg className="mx-auto mb-3 h-10 w-10 text-border dark:text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
          </svg>
          <p className="text-sm font-medium text-muted dark:text-dark-muted">No announcements yet</p>
          <p className="mt-1 text-xs text-muted/60 dark:text-dark-muted/60">Click &quot;Add Announcement&quot; to create one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`group rounded-xl border border-border bg-white p-4 transition-colors dark:border-dark-border dark:bg-dark-surface ${!ann.active ? "opacity-50" : ""}`}
            >
              {editingId === ann.id ? (
                <div>
                  <h3 className="mb-3 font-display text-sm font-semibold text-text dark:text-dark-text">
                    Edit Announcement
                  </h3>
                  <AdminAnnouncementForm
                    announcement={ann}
                    onSave={handleEdit}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-text dark:text-dark-text">
                        {ann.title}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TYPE_BADGE[ann.type] ?? "bg-border/50 text-muted"}`}>
                        {TYPE_LABELS[ann.type] ?? ann.type}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted dark:text-dark-muted">
                      {ann.body}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {ann.pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-border/50 px-2 py-0.5 text-[11px] font-medium text-muted dark:bg-white/10 dark:text-dark-muted">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                          Pinned
                        </span>
                      )}
                      {!ann.active && (
                        <span className="rounded-full bg-red/10 px-2 py-0.5 text-[11px] font-medium text-red">
                          Inactive
                        </span>
                      )}
                      {ann.expiresAt && (
                        <span className="text-[11px] text-muted dark:text-dark-muted">
                          Expires {formatDate(ann.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {deleteConfirmId === ann.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(ann.id!)}
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
                          onClick={() => handleToggleActive(ann.id!, ann.active)}
                          title={ann.active ? "Deactivate" : "Activate"}
                          className="rounded-lg p-1.5 text-muted opacity-0 transition-all hover:bg-border/50 hover:text-text group-hover:opacity-100 dark:text-dark-muted dark:hover:bg-white/10 dark:hover:text-dark-text"
                        >
                          {ann.active ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => { setEditingId(ann.id!); setShowAddForm(false); }}
                          className="rounded-lg px-2.5 py-1.5 text-sm text-muted opacity-0 transition-all hover:bg-border/50 hover:text-text group-hover:opacity-100 dark:text-dark-muted dark:hover:bg-white/10 dark:hover:text-dark-text"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(ann.id!)}
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
          ))}
        </div>
      )}
    </div>
  );
}
