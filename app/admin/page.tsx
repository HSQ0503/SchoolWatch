"use client";

import { useState, useEffect } from "react";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminEventsPanel from "@/components/AdminEventsPanel";
import AdminAnnouncementsPanel from "@/components/AdminAnnouncementsPanel";
import AdminPrepTalksPanel from "@/components/AdminPrepTalksPanel";

type Tab = "events" | "announcements" | "preptalks";
type AuthState = "loading" | "authenticated" | "unauthenticated";

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [adminEmail, setAdminEmail] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("events");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthState("authenticated");
          setAdminEmail(data.email);
        } else {
          setAuthState("unauthenticated");
        }
      })
      .catch(() => setAuthState("unauthenticated"));
  }, []);

  function handleAuthenticated() {
    setAuthState("authenticated");
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => { if (d.email) setAdminEmail(d.email); });
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthState("unauthenticated");
    setAdminEmail("");
  }

  if (authState === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red border-t-transparent" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <AdminLoginForm onAuthenticated={handleAuthenticated} />;
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "events",
      label: "Events",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      key: "announcements",
      label: "Announcements",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      ),
    },
    {
      key: "preptalks",
      label: "PrepTalks",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text dark:text-dark-text">
            Admin Panel
          </h1>
          <p className="mt-0.5 text-sm text-muted dark:text-dark-muted">
            {adminEmail}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-text dark:border-dark-border dark:text-dark-muted dark:hover:text-dark-text"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Log Out
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-bg p-1 dark:border-dark-border dark:bg-dark-bg">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-red text-white shadow-sm"
                : "text-muted hover:text-text dark:text-dark-muted dark:hover:text-dark-text"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "events" && <AdminEventsPanel />}
      {activeTab === "announcements" && <AdminAnnouncementsPanel />}
      {activeTab === "preptalks" && <AdminPrepTalksPanel />}
    </div>
  );
}
