"use client";

import { useState, useCallback, useEffect } from "react";
import AdminEventForm from "@/components/AdminEventForm";
import CalendarView from "@/components/CalendarView";
import type { SchoolEvent } from "@/lib/events";

const TYPE_LABELS: Record<string, string> = {
  "no-school": "No School",
  "early-dismissal": "Early Dismissal",
  event: "Event",
  exam: "Exam",
  deadline: "Deadline",
};

const TYPE_BADGE: Record<string, string> = {
  "no-school": "bg-red/10 text-red dark:bg-red/20",
  "early-dismissal": "bg-red-light/10 text-red-light dark:bg-red-light/20",
  event: "bg-border/50 text-muted dark:bg-white/10 dark:text-dark-muted",
  exam: "bg-red/10 text-red dark:bg-red/20",
  deadline: "bg-red-light/10 text-red-light dark:bg-red-light/20",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminEventsPanel() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [allEvents, setAllEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "calendar">("cards");
  const [prefillDate, setPrefillDate] = useState<string>("");
  const [prefillEndDate, setPrefillEndDate] = useState<string>("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data: SchoolEvent[] = await res.json();
      setAllEvents(data);
      const today = new Date().toISOString().split("T")[0];
      setEvents(data.filter((e) => (e.endDate ?? e.date) >= today));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  async function handleAdd(data: { date: string; name: string; type: SchoolEvent["type"]; endDate: string }) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { setShowAddForm(false); setPrefillDate(""); setPrefillEndDate(""); fetchEvents(); }
  }

  async function handleEdit(data: { date: string; name: string; type: SchoolEvent["type"]; endDate: string }) {
    if (!editingId) return;
    const res = await fetch(`/api/events/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { setEditingId(null); fetchEvents(); }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });
    if (res.ok) { setDeleteConfirmId(null); fetchEvents(); }
  }

  function handleCalendarDateClick(date: string) {
    setPrefillDate(date);
    setPrefillEndDate("");
    setShowAddForm(true);
    setEditingId(null);
  }

  function handleCalendarRangeSelect(start: string, end: string) {
    setPrefillDate(start);
    setPrefillEndDate(end);
    setShowAddForm(true);
    setEditingId(null);
  }

  function handleCancelAdd() {
    setShowAddForm(false);
    setPrefillDate("");
    setPrefillEndDate("");
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-text dark:text-dark-text">
            Events
          </h2>
          <p className="text-sm text-muted dark:text-dark-muted">
            {events.length} upcoming event{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border dark:border-dark-border">
            {(["cards", "calendar"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  viewMode === mode
                    ? "bg-red text-white"
                    : "text-muted hover:text-text dark:text-dark-muted dark:hover:text-dark-text"
                } ${mode === "cards" ? "rounded-l-md" : "rounded-r-md"}`}
              >
                {mode === "cards" ? "Cards" : "Calendar"}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); setPrefillDate(""); setPrefillEndDate(""); }}
            className="flex items-center gap-1.5 rounded-lg bg-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-light"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 rounded-xl border border-red/15 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <h3 className="mb-4 font-display text-base font-bold text-text dark:text-dark-text">
            New Event
          </h3>
          <AdminEventForm
            initialDate={prefillDate}
            initialEndDate={prefillEndDate}
            onSave={handleAdd}
            onCancel={handleCancelAdd}
          />
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" ? (
        <CalendarView
          events={allEvents}
          interactive
          onDateClick={handleCalendarDateClick}
          onDateRangeSelect={handleCalendarRangeSelect}
        />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-xl bg-border/50 dark:bg-white/5" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center dark:border-dark-border">
          <svg className="mx-auto mb-3 h-10 w-10 text-border dark:text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-sm font-medium text-muted dark:text-dark-muted">No events yet</p>
          <p className="mt-1 text-xs text-muted/60 dark:text-dark-muted/60">Click &quot;Add Event&quot; to create one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="group rounded-xl border border-border bg-white p-4 transition-colors hover:border-border dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-border"
            >
              {editingId === event.id ? (
                <div>
                  <h3 className="mb-3 font-display text-sm font-semibold text-text dark:text-dark-text">
                    Edit Event
                  </h3>
                  <AdminEventForm event={event} onSave={handleEdit} onCancel={() => setEditingId(null)} />
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-text dark:text-dark-text">
                        {event.name}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TYPE_BADGE[event.type] ?? "bg-border/50 text-muted"}`}>
                        {TYPE_LABELS[event.type] ?? event.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted dark:text-dark-muted">
                      {formatDate(event.date)}
                      {event.endDate && ` – ${formatDate(event.endDate)}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {deleteConfirmId === event.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(event.id!)}
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
                          onClick={() => { setEditingId(event.id!); setShowAddForm(false); }}
                          className="rounded-lg px-2.5 py-1.5 text-sm text-muted opacity-0 transition-all hover:bg-border/50 hover:text-text group-hover:opacity-100 dark:text-dark-muted dark:hover:bg-white/10 dark:hover:text-dark-text"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(event.id!)}
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
