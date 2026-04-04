"use client";

import { useState } from "react";
import type { SchoolEvent } from "@/lib/events";

type AdminEventFormProps = {
  event?: SchoolEvent;
  initialDate?: string;
  initialEndDate?: string;
  onSave: (data: { date: string; name: string; type: SchoolEvent["type"]; endDate: string }) => void;
  onCancel: () => void;
};

const EVENT_TYPES: { value: SchoolEvent["type"]; label: string }[] = [
  { value: "event", label: "Event" },
  { value: "no-school", label: "No School" },
  { value: "early-dismissal", label: "Early Dismissal" },
  { value: "exam", label: "Exam" },
  { value: "deadline", label: "Deadline" },
];

export default function AdminEventForm({ event, initialDate, initialEndDate, onSave, onCancel }: AdminEventFormProps) {
  const [name, setName] = useState(event?.name ?? "");
  const [date, setDate] = useState(event?.date ?? initialDate ?? "");
  const [type, setType] = useState<SchoolEvent["type"]>(event?.type ?? "event");
  const [endDate, setEndDate] = useState(event?.endDate ?? initialEndDate ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) return;
    onSave({ date, name: name.trim(), type, endDate });
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-bg px-3 py-2 text-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-red/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
          Event Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="e.g. Spring Break"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
            Start Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
            End Date <span className="text-muted dark:text-dark-muted">(optional)</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text dark:text-dark-text">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as SchoolEvent["type"])}
          className={inputClass}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-red px-4 py-2 font-medium text-white transition-colors hover:bg-red-light"
        >
          {event ? "Save Changes" : "Add Event"}
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
