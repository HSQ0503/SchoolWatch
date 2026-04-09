# SchoolWatch Setup Wizard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform SchoolWatch into a self-service platform where non-technical SGA students fill out a web form and get a fully deployed school dashboard — no coding, no terminal, no accounts needed.

**Architecture:** Two-phase approach. Phase 1 strips the current repo of all backend/database code to create a static template. Phase 2 builds a separate wizard web app that generates configs and deploys template instances via the Vercel and GitHub APIs.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase (wizard DB + auth), Vercel API, GitHub API

---

## Phase 1: Template Cleanup

Strip all backend/admin/database code from SchoolWatch so it becomes a purely static/client-side Next.js app. Events come from `school.config.ts` at build time instead of a database.

### File Map — Phase 1

**Delete entirely:**
- `app/api/admin/` (all 7 route files)
- `app/api/events/route.ts` and `app/api/events/[id]/route.ts`
- `app/api/announcements/route.ts` and `app/api/announcements/[id]/route.ts`
- `app/admin/page.tsx`
- `components/AdminLoginForm.tsx`
- `components/AdminEventForm.tsx`
- `components/AdminAnnouncementForm.tsx`
- `components/AdminEventsPanel.tsx`
- `components/AdminAnnouncementsPanel.tsx`
- `components/AnnouncementsFeed.tsx`
- `lib/auth.ts`
- `lib/email.ts`
- `lib/prisma.ts`
- `lib/announcements.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma.config.ts`
- `.env` and `.env.example`

**Modify:**
- `app/page.tsx` — remove announcements, switch events from API to config
- `components/EventsList.tsx` — read events from config instead of API
- `components/QuickGlanceCards.tsx` — read events from config instead of API
- `components/Navbar.tsx` — remove admin link detection
- `lib/types/config.ts` — remove `features.announcements`
- `lib/validateConfig.ts` — remove announcements from validation
- `school.config.ts` — remove `features.announcements`
- `package.json` — remove backend dependencies
- `.gitignore` — remove Prisma generated line
- `next.config.ts` — no change needed (already just validates config)

---

### Task 1: Delete backend files

Remove all database, admin, auth, email, and announcement files that are no longer needed.

**Files:**
- Delete: `app/api/admin/me/route.ts`
- Delete: `app/api/admin/check-email/route.ts`
- Delete: `app/api/admin/logout/route.ts`
- Delete: `app/api/admin/register/route.ts`
- Delete: `app/api/admin/resend-otp/route.ts`
- Delete: `app/api/admin/verify-otp/route.ts`
- Delete: `app/api/admin/login/route.ts`
- Delete: `app/api/events/route.ts`
- Delete: `app/api/events/[id]/route.ts`
- Delete: `app/api/announcements/route.ts`
- Delete: `app/api/announcements/[id]/route.ts`
- Delete: `app/admin/page.tsx`
- Delete: `components/AdminLoginForm.tsx`
- Delete: `components/AdminEventForm.tsx`
- Delete: `components/AdminAnnouncementForm.tsx`
- Delete: `components/AdminEventsPanel.tsx`
- Delete: `components/AdminAnnouncementsPanel.tsx`
- Delete: `components/AnnouncementsFeed.tsx`
- Delete: `lib/auth.ts`
- Delete: `lib/email.ts`
- Delete: `lib/prisma.ts`
- Delete: `lib/announcements.ts`
- Delete: `prisma/schema.prisma`
- Delete: `prisma/seed.ts`
- Delete: `prisma.config.ts`
- Delete: `.env`
- Delete: `.env.example`

- [ ] **Step 1: Delete all API routes**

```bash
rm -rf app/api/admin app/api/events app/api/announcements
```

- [ ] **Step 2: Delete admin page**

```bash
rm -rf app/admin
```

- [ ] **Step 3: Delete backend components**

```bash
rm components/AdminLoginForm.tsx components/AdminEventForm.tsx components/AdminAnnouncementForm.tsx components/AdminEventsPanel.tsx components/AdminAnnouncementsPanel.tsx components/AnnouncementsFeed.tsx
```

- [ ] **Step 4: Delete backend lib files**

```bash
rm lib/auth.ts lib/email.ts lib/prisma.ts lib/announcements.ts
```

- [ ] **Step 5: Delete Prisma files and env files**

```bash
rm -rf prisma prisma.config.ts .env .env.example
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Remove all backend, admin, database, and announcement code"
```

---

### Task 2: Remove backend dependencies from package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove backend dependencies**

Remove these from `dependencies`:
- `@prisma/client`
- `bcryptjs`
- `jsonwebtoken`
- `mongodb`
- `prisma`
- `resend`
- `dotenv`

Remove these from `devDependencies`:
- `@types/jsonwebtoken`

Remove the entire `"prisma"` section (the seed script config).

Update the `"build"` script from `"prisma generate && next build"` to just `"next build"`.

Remove the `"postinstall"` script (`"prisma generate"`).

The resulting `package.json` should be:

```json
{
  "name": "schoolwatch",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@vercel/analytics": "^1.6.1",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Clean up .gitignore**

Remove the `/lib/generated/prisma` line from `.gitignore`.

- [ ] **Step 3: Reinstall dependencies**

```bash
rm -rf node_modules package-lock.json && npm install
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore && git commit -m "Remove backend dependencies and Prisma config"
```

---

### Task 3: Rewrite EventsList to read from config

Currently `EventsList.tsx` fetches events from `/api/events`. It needs to read directly from `school.config.ts` instead. The component stays client-side (it has interactive filtering and view toggling).

**Files:**
- Modify: `components/EventsList.tsx`

- [ ] **Step 1: Replace API fetch with config import**

Replace the entire `EventsList.tsx` with this version that imports events from config:

```tsx
"use client";

import { useState } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { type SchoolEvent, daysUntil, TYPE_STYLES } from "@/lib/events";
import CalendarView from "@/components/CalendarView";
import config from "@/school.config";

const allEvents: SchoolEvent[] = config.calendar.events.map((e) => ({
  date: e.date,
  name: e.name,
  type: e.type as SchoolEvent["type"],
  endDate: e.endDate ?? null,
}));

function formatEventDate(event: SchoolEvent): string {
  const date = new Date(event.date + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const start = date.toLocaleDateString("en-US", options);

  if (event.endDate) {
    const end = new Date(event.endDate + "T12:00:00");
    const endDay = end.toLocaleDateString("en-US", { day: "numeric" });
    return `${start}\u2013${endDay}`;
  }

  return start;
}

function getMonthYear(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function EventsList() {
  const mounted = useHasMounted();
  const [showPast, setShowPast] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "calendar">("calendar");

  if (!mounted) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-border" />
        ))}
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const filteredEvents = showPast
    ? allEvents
    : allEvents.filter((e) => {
        const compareDate = e.endDate || e.date;
        return compareDate >= todayStr;
      });

  const grouped: Record<string, SchoolEvent[]> = {};
  for (const event of filteredEvents) {
    const month = getMonthYear(event.date);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(event);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-text dark:text-dark-text">
          School Events
        </h2>
        <div className="flex items-center gap-3">
          {viewMode === "cards" && (
            <button
              onClick={() => setShowPast(!showPast)}
              className="text-sm text-muted transition-colors hover:text-red dark:text-dark-muted dark:hover:text-dark-text"
            >
              {showPast ? "Hide past events" : "Show past events"}
            </button>
          )}
          <div className="flex gap-1 rounded-lg border border-border bg-white p-1 dark:border-dark-border dark:bg-dark-surface">
            {(["cards", "calendar"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-red text-white"
                    : "text-muted hover:text-text dark:text-dark-muted dark:hover:text-dark-text"
                }`}
              >
                {mode === "cards" ? "Cards" : "Calendar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <CalendarView events={allEvents} />
      ) : (
        <>
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
                {month}
              </h3>
              <div className="space-y-2">
                {monthEvents.map((event, i) => {
                  const days = daysUntil(event.date);
                  const isPast = days < 0;
                  const style = TYPE_STYLES[event.type];

                  return (
                    <div
                      key={`${event.date}-${i}`}
                      className={`rounded-xl border p-4 ${style.border} ${style.bg} ${isPast ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-2 h-2 w-2 rounded-full ${style.dot}`}
                          />
                          <div>
                            <p className="font-medium text-text dark:text-dark-text">{event.name}</p>
                            <p className="text-sm text-muted dark:text-dark-muted">
                              {formatEventDate(event)}
                            </p>
                          </div>
                        </div>
                        {!isPast && (
                          <span className="whitespace-nowrap text-sm text-muted dark:text-dark-muted">
                            {days === 0
                              ? "Today"
                              : days === 1
                                ? "Tomorrow"
                                : `${days} days`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <p className="py-8 text-center text-muted dark:text-dark-muted">No upcoming events</p>
          )}
        </>
      )}
    </div>
  );
}
```

Key changes from original:
- Removed `useState` for events and `loading` state
- Removed `useEffect` with `fetch("/api/events")`
- Added `import config from "@/school.config"`
- Created `allEvents` constant from `config.calendar.events` at module level
- Used `allEvents` everywhere instead of the `events` state variable
- Changed event keys from `event.id || ...` to just `${event.date}-${i}` (no IDs from DB)

- [ ] **Step 2: Verify the component compiles**

```bash
npx next build 2>&1 | head -30
```

Expected: No import errors related to EventsList.

- [ ] **Step 3: Commit**

```bash
git add components/EventsList.tsx && git commit -m "Rewrite EventsList to read events from config instead of API"
```

---

### Task 4: Rewrite QuickGlanceCards to read from config

Currently fetches events from `/api/events`. Needs to read from config.

**Files:**
- Modify: `components/QuickGlanceCards.tsx`

- [ ] **Step 1: Replace API fetch with config import**

Replace the entire `QuickGlanceCards.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";
import { storageKey } from "@/lib/storage";
import { filterUpcoming, findNextNoSchool, daysUntil, type SchoolEvent } from "@/lib/events";
import config from "@/school.config";

const allEvents: SchoolEvent[] = config.calendar.events.map((e) => ({
  date: e.date,
  name: e.name,
  type: e.type as SchoolEvent["type"],
  endDate: e.endDate ?? null,
}));

type TodoItem = { text: string; completed: boolean };

function readActiveTodos(): TodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(storageKey("todos"));
    if (stored) {
      const todos: TodoItem[] = JSON.parse(stored);
      return todos.filter((t) => !t.completed);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateRange(startDate: string, endDate?: string | null): string {
  const start = formatShortDate(startDate);
  if (!endDate) return start;
  const startD = new Date(startDate + "T00:00:00");
  const endD = new Date(endDate + "T00:00:00");
  if (startD.getMonth() === endD.getMonth()) {
    return `${start}\u2013${endD.getDate()}`;
  }
  return `${start} \u2013 ${formatShortDate(endDate)}`;
}

export default function QuickGlanceCards() {
  const mounted = useHasMounted();
  const [activeTodos] = useState(readActiveTodos);

  const todoCount = activeTodos.length;
  const nextTodo = activeTodos[0];

  if (!mounted) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-border dark:bg-white/10" />
        <div className="h-24 animate-pulse rounded-xl bg-border dark:bg-white/10" />
      </div>
    );
  }

  const nextBreak = findNextNoSchool(allEvents);
  const upcomingEvents = filterUpcoming(allEvents);
  const nextEvent = upcomingEvents[0];

  const eventTarget = nextBreak || nextEvent;
  const eventLabel = nextBreak ? "Next Break" : "Next Event";
  const eventName = eventTarget?.name ?? "No upcoming events";
  const eventDays = eventTarget ? daysUntil(eventTarget.date) : null;
  const eventDateRange = eventTarget
    ? formatDateRange(eventTarget.date, eventTarget.endDate)
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link
        href="/events"
        className="rounded-xl border border-red/15 border-l-[3px] border-l-red bg-white p-5 shadow-sm transition-all hover:shadow-md hover:bg-red/5 dark:border-dark-border dark:border-l-red dark:bg-dark-surface dark:shadow-none dark:backdrop-blur-md dark:hover:bg-white/10"
      >
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red">
          {eventLabel}
        </p>
        <p className="font-display text-lg font-bold text-text dark:text-dark-text">
          {eventName}
        </p>
        {eventDays !== null && (
          <p className="mt-1 text-sm text-muted dark:text-dark-muted">
            {eventDays === 0
              ? "Today"
              : eventDays === 1
                ? "Tomorrow"
                : `${eventDays} days away`}
            {eventDateRange && ` \u00B7 ${eventDateRange}`}
          </p>
        )}
      </Link>

      <Link
        href="/todos"
        className="rounded-xl border border-red/15 border-l-[3px] border-l-red bg-white p-5 shadow-sm transition-all hover:shadow-md hover:bg-red/5 dark:border-dark-border dark:border-l-red dark:bg-dark-surface dark:shadow-none dark:backdrop-blur-md dark:hover:bg-white/10"
      >
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red dark:text-red-light">
          To-Do
        </p>
        <p className="font-display text-lg font-bold text-text dark:text-dark-text">
          {todoCount === 0
            ? "All caught up!"
            : `${todoCount} task${todoCount === 1 ? "" : "s"} remaining`}
        </p>
        <p className="mt-1 truncate text-sm text-muted dark:text-dark-muted">
          {nextTodo ? `Next: ${nextTodo.text}` : "Nothing to do"}
        </p>
      </Link>
    </div>
  );
}
```

Key changes:
- Removed `useEffect` with `fetch("/api/events")`
- Removed `events` state
- Added `import config from "@/school.config"`
- Created `allEvents` from config at module level
- Used `allEvents` directly in render

- [ ] **Step 2: Commit**

```bash
git add components/QuickGlanceCards.tsx && git commit -m "Rewrite QuickGlanceCards to read events from config"
```

---

### Task 5: Rewrite dashboard page (remove announcements)

The dashboard currently polls `/api/announcements` and `/api/events`. Remove all announcement logic and switch events to config-based.

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite the dashboard**

Replace `app/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import DayStatusHero from "@/components/DayStatusHero";
import PeriodCountdown from "@/components/PeriodCountdown";
import QuickGlanceCards from "@/components/QuickGlanceCards";
import { useLunchWave } from "@/hooks/useLunchWave";
import { formatDateStr } from "@/lib/schedule";
import { getDevDate } from "@/lib/devTime";
import { type SchoolEvent } from "@/lib/events";
import config from "@/school.config";

const allEvents: SchoolEvent[] = config.calendar.events.map((e) => ({
  date: e.date,
  name: e.name,
  type: e.type as SchoolEvent["type"],
  endDate: e.endDate ?? null,
}));

export default function Dashboard() {
  const { lunchWave } = useLunchWave();
  const [isEarlyDismissal, setIsEarlyDismissal] = useState(false);

  useEffect(() => {
    const today = formatDateStr(getDevDate(new Date()));
    setIsEarlyDismissal(
      allEvents.some(
        (e) =>
          e.type === "early-dismissal" &&
          e.date <= today &&
          (e.endDate ?? e.date) >= today
      )
    );
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-white p-6 pb-8 shadow-sm dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
        <div className="flex flex-col items-center text-center">
          <DayStatusHero isEarlyDismissal={isEarlyDismissal} />
          <PeriodCountdown lunchWave={lunchWave} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
          At a Glance
        </p>
        <QuickGlanceCards />
      </div>
    </div>
  );
}
```

Key changes:
- Removed all announcement imports, state, and polling
- Removed `AnnouncementsFeed` import
- Removed two-column layout with announcements sidebar
- Removed `useRef`, `useCallback` imports
- Events for early dismissal check now come from config, not API
- Removed the 5-second polling interval

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx && git commit -m "Remove announcements from dashboard, use config for events"
```

---

### Task 6: Remove admin detection from Navbar

**Files:**
- Modify: `components/Navbar.tsx`

- [ ] **Step 1: Remove admin link and API call**

In `components/Navbar.tsx`, make these changes:

1. Remove the `isAdmin` state and the `useEffect` that calls `/api/admin/me`
2. Remove the admin `<Link>` in the desktop nav (the `{isAdmin && ...}` block)
3. Remove the admin `<Link>` in the mobile menu (the `{isAdmin && ...}` block)

The resulting component removes these pieces:

Remove from the state declarations:
```tsx
  const [isAdmin, setIsAdmin] = useState(false);
```

Remove the useEffect:
```tsx
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (res.ok) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);
```

Remove from the desktop right section (inside `<div className="hidden shrink-0 items-center gap-2 md:flex">`):
```tsx
          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-red/10 text-red dark:bg-white/10 dark:text-white"
                  : "text-muted hover:bg-red/5 hover:text-red dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              Admin
            </Link>
          )}
```

Remove from the mobile menu (inside the `{menuOpen && ...}` block):
```tsx
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-red/5 text-red dark:bg-white/10 dark:text-white"
                  : "text-muted hover:bg-red/5 hover:text-red dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              Admin
            </Link>
          )}
```

- [ ] **Step 2: Commit**

```bash
git add components/Navbar.tsx && git commit -m "Remove admin link and auth check from Navbar"
```

---

### Task 7: Remove announcements from config type and validation

**Files:**
- Modify: `lib/types/config.ts`
- Modify: `lib/validateConfig.ts`
- Modify: `school.config.ts`

- [ ] **Step 1: Update the SchoolConfig type**

In `lib/types/config.ts`, change the `features` field in `SchoolConfig` from:

```typescript
  features: {
    announcements: boolean;
    events: boolean;
    productivity: boolean;
  };
```

to:

```typescript
  features: {
    events: boolean;
    productivity: boolean;
  };
```

- [ ] **Step 2: Update school.config.ts**

In `school.config.ts`, change the features section from:

```typescript
  features: {
    announcements: true,
    events: true,
    productivity: true,
  },
```

to:

```typescript
  features: {
    events: true,
    productivity: true,
  },
```

Also update the comment block above it — remove the `announcements` line from the feature descriptions:

```typescript
  // ── FEATURES ───────────────────────────────────────
  //
  // Toggle optional features on or off. When a feature is off, its
  // navigation link is hidden. The pages still exist but aren't linked.
  //
  //   events        — Calendar page showing school events
  //   productivity  — Pomodoro timer, Wordle, Todos, Randomizer
```

- [ ] **Step 3: Check validateConfig.ts for announcement references**

`lib/validateConfig.ts` does not reference `features.announcements` directly — it only validates schedule, lunch waves, and calendar dates. No changes needed.

- [ ] **Step 4: Update the example configs**

Check each file in `examples/` and remove `announcements: true` from their `features` section if present.

- [ ] **Step 5: Build to verify**

```bash
npm run build
```

Expected: Clean build with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add lib/types/config.ts school.config.ts examples/ && git commit -m "Remove announcements feature flag from config type and examples"
```

---

### Task 8: Update README for template repo

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Rewrite README**

Update `README.md` to reflect the new static architecture:

- Remove MongoDB setup section (step 4)
- Remove Resend setup section (step 5)
- Remove the environment variables table (no env vars needed)
- Remove "Seed your events" section (step 7)
- Remove "Using the admin panel" section
- Update "Tech Stack" to remove MongoDB, Prisma, Resend
- Update "Project Structure" to remove `prisma/` directory
- Update environment variables section to say "No environment variables required"
- Keep: fork instructions, school.config.ts editing, logo, Vercel deploy, customization, examples

- [ ] **Step 2: Build to verify everything still works**

```bash
npm run build
```

Expected: Clean build, zero errors.

- [ ] **Step 3: Commit**

```bash
git add README.md && git commit -m "Update README for static template (no database required)"
```

---

### Task 9: Final Phase 1 verification

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Clean build with all pages generating successfully.

- [ ] **Step 3: Start dev server and verify**

```bash
npm run dev
```

Manually check:
- Dashboard loads with countdown timer
- Schedule page shows bell schedule
- Events page shows calendar from config
- Productivity tools work
- No console errors about missing API routes
- No `/api/` calls in the network tab

- [ ] **Step 4: Commit any fixes**

If any issues were found and fixed:

```bash
git add -A && git commit -m "Fix issues found during Phase 1 verification"
```

---

## Phase 2: Wizard App

Build a separate Next.js app that provides a marketing landing page and multi-step setup wizard. This is a **new project** in a new directory — not modifications to the template repo.

> **Note:** Phase 2 is a new Next.js app. It should be scaffolded in a sibling directory (e.g., `../schoolwatch-wizard/`) or a subdirectory — this is a decision for the implementer to confirm with Han before starting.

### File Map — Phase 2

**New project structure:**
```
schoolwatch-wizard/
  app/
    layout.tsx                    — Root layout with fonts, metadata
    page.tsx                      — Marketing landing page
    globals.css                   — Tailwind styles
    setup/
      page.tsx                    — Multi-step wizard form (client component)
    edit/
      page.tsx                    — Edit flow entry (validates magic link token)
    api/
      deploy/
        route.ts                  — Creates GitHub repo + Vercel project
      redeploy/
        route.ts                  — Pushes config update + triggers redeploy
      auth/
        send-link/
          route.ts                — Sends magic link email
        verify/
          route.ts                — Verifies magic link token, sets session
      schools/
        [id]/
          route.ts                — GET school config for edit flow
  components/
    wizard/
      StepSchoolInfo.tsx          — Step 1: school name, mascot, etc.
      StepColors.tsx              — Step 2: color pickers
      StepSchedule.tsx            — Step 3: day types + periods
      StepLunchWaves.tsx          — Step 4: lunch wave config
      StepCalendar.tsx            — Step 5: no-school dates, events
      StepFeatures.tsx            — Step 6: feature toggles
      StepReview.tsx              — Step 7: review + deploy button
    WizardShell.tsx               — Step navigation, progress bar, state management
    DeployProgress.tsx            — Deploy status display (creating repo... deploying...)
    LandingHero.tsx               — Landing page hero section
    LandingFeatures.tsx           — Landing page feature cards
  lib/
    config-generator.ts           — Converts form data → school.config.ts string
    github.ts                     — GitHub API wrapper (create repo, push files)
    vercel.ts                     — Vercel API wrapper (create project, check status)
    supabase.ts                   — Supabase client singleton
    auth.ts                       — Magic link token generation/verification
    colors.ts                     — Auto-generate light/dark variants from hex
    types.ts                      — Shared types (WizardFormData, School, etc.)
    email.ts                      — Send magic link emails via Resend
  prisma/ or supabase/
    schema.sql                    — School table definition
  public/
    (static assets)
  package.json
  tsconfig.json
  next.config.ts
  tailwind.config.ts
  .env.example
```

---

### Task 10: Scaffold wizard app

**Files:**
- Create: `schoolwatch-wizard/` (new Next.js project)

- [ ] **Step 1: Confirm project location with Han**

Before scaffolding, confirm: should this be a sibling directory (`../schoolwatch-wizard/`) or a monorepo subdirectory (`wizard/`)? The plan assumes sibling directory.

- [ ] **Step 2: Create the Next.js project**

```bash
cd .. && npx create-next-app@latest schoolwatch-wizard --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

- [ ] **Step 3: Install additional dependencies**

```bash
cd schoolwatch-wizard && npm install @supabase/supabase-js resend
```

- [ ] **Step 4: Create .env.example**

Create `schoolwatch-wizard/.env.example`:

```bash
# Supabase (wizard database)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# GitHub API (creating repos for schools)
GITHUB_TOKEN="ghp_your_personal_access_token"
GITHUB_ORG="SchoolWatch"

# Vercel API (deploying school sites)
VERCEL_TOKEN="your_vercel_token"
VERCEL_TEAM_ID="your_team_id"

# Resend (magic link emails)
RESEND_API_KEY="re_your_api_key"

# Auth
MAGIC_LINK_SECRET="random-32-char-secret-for-signing-magic-links"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Super admin
SUPER_ADMIN_EMAIL="han@example.com"
```

- [ ] **Step 5: Commit**

```bash
cd schoolwatch-wizard && git init && git add -A && git commit -m "Scaffold wizard app with Next.js, Supabase, Resend"
```

---

### Task 11: Define types and Supabase schema

**Files:**
- Create: `lib/types.ts`
- Create: `supabase/schema.sql`
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create shared types**

Create `lib/types.ts`:

```typescript
export type WizardFormData = {
  school: {
    name: string;
    shortName: string;
    acronym: string;
    mascot: string;
    appName: string;
    city: string;
    state: string;
    stateCode: string;
    country: string;
    academicYear: string;
  };
  colors: {
    primary: string;
    accent: string;
  };
  schedule: {
    dayTypes: {
      id: string;
      label: string;
      weekdays: number[];
    }[];
    bells: Record<string, {
      shared: { name: string; start: string; end: string }[];
      lunchWaves?: Record<string, { name: string; start: string; end: string }[]>;
      after: { name: string; start: string; end: string }[];
    }>;
  };
  lunchWaves: {
    enabled: boolean;
    options: { id: string; label: string }[];
    default: string;
  };
  calendar: {
    noSchoolDates: { date: string; name: string }[];
    earlyDismissalDates: { date: string; name: string }[];
    events: { date: string; name: string; type: string; endDate?: string }[];
  };
  features: {
    events: boolean;
    productivity: boolean;
  };
  contactEmail: string;
};

export type School = {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  config_data: WizardFormData;
  github_repo_name: string;
  vercel_project_id: string;
  deployed_url: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};
```

- [ ] **Step 2: Create Supabase schema**

Create `supabase/schema.sql`:

```sql
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_email text not null,
  config_data jsonb not null,
  github_repo_name text not null,
  vercel_project_id text not null,
  deployed_url text not null,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_schools_slug on schools(slug);
create index idx_schools_contact_email on schools(contact_email);
```

- [ ] **Step 3: Create Supabase client**

Create `lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts supabase/schema.sql lib/supabase.ts && git commit -m "Add types, Supabase schema, and client"
```

---

### Task 12: Build config generator

This is the core utility — converts `WizardFormData` into a valid `school.config.ts` file string.

**Files:**
- Create: `lib/config-generator.ts`
- Create: `lib/colors.ts`

- [ ] **Step 1: Create color utility**

Create `lib/colors.ts`:

```typescript
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

export function lightenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, rgb.r + Math.round((255 - rgb.r) * amount));
  const g = Math.min(255, rgb.g + Math.round((255 - rgb.g) * amount));
  const b = Math.min(255, rgb.b + Math.round((255 - rgb.b) * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function darkenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.round(rgb.r * (1 - amount));
  const g = Math.round(rgb.g * (1 - amount));
  const b = Math.round(rgb.b * (1 - amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function generateDarkBg(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#0a1628";
  const r = Math.round(rgb.r * 0.08);
  const g = Math.round(rgb.g * 0.08);
  const b = Math.round(rgb.b * 0.15);
  return `#${Math.max(5, r).toString(16).padStart(2, "0")}${Math.max(10, g).toString(16).padStart(2, "0")}${Math.max(20, b).toString(16).padStart(2, "0")}`;
}

export function generateDarkSurface(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "rgba(10, 22, 50, 0.85)";
  const r = Math.round(rgb.r * 0.08);
  const g = Math.round(rgb.g * 0.08);
  const b = Math.round(rgb.b * 0.15);
  return `rgba(${Math.max(5, r)}, ${Math.max(10, g)}, ${Math.max(20, b)}, 0.85)`;
}

export function deriveColors(primary: string, accent: string) {
  return {
    primary,
    primaryLight: lightenHex(primary, 0.25),
    accent,
    accentLight: lightenHex(accent, 0.25),
    darkBg: generateDarkBg(primary),
    darkSurface: generateDarkSurface(primary),
  };
}
```

- [ ] **Step 2: Create config generator**

Create `lib/config-generator.ts`:

```typescript
import type { WizardFormData } from "./types";
import { deriveColors } from "./colors";

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function indent(str: string, level: number): string {
  return str.split("\n").map((line) => "  ".repeat(level) + line).join("\n");
}

function stringifyPeriods(periods: { name: string; start: string; end: string }[]): string {
  return periods
    .map((p) => `{ name: "${p.name}", start: "${p.start}", end: "${p.end}" }`)
    .join(",\n");
}

export function generateConfigTs(data: WizardFormData): string {
  const colors = deriveColors(data.colors.primary, data.colors.accent);
  const storagePrefix = toSlug(data.school.appName);

  const dayTypesStr = data.schedule.dayTypes
    .map((dt) => `      { id: "${dt.id}", label: "${dt.label}", weekdays: [${dt.weekdays.join(", ")}] }`)
    .join(",\n");

  let bellsStr = "";
  for (const [dtId, bell] of Object.entries(data.schedule.bells)) {
    let lunchSection = "";
    if (bell.lunchWaves && Object.keys(bell.lunchWaves).length > 0) {
      const waveEntries = Object.entries(bell.lunchWaves)
        .map(([waveId, periods]) => {
          const periodsStr = indent(stringifyPeriods(periods), 5);
          return `          "${waveId}": [\n${periodsStr},\n          ]`;
        })
        .join(",\n");
      lunchSection = `\n        lunchWaves: {\n${waveEntries},\n        },`;
    }

    const sharedStr = indent(stringifyPeriods(bell.shared), 4);
    const afterStr = indent(stringifyPeriods(bell.after), 4);

    bellsStr += `\n      ${dtId}: {\n        shared: [\n${sharedStr},\n        ],${lunchSection}\n        after: [\n${afterStr},\n        ],\n      },`;
  }

  const noSchoolStr = data.calendar.noSchoolDates
    .map((d) => `      { date: "${d.date}", name: "${d.name}" }`)
    .join(",\n");

  const earlyStr = data.calendar.earlyDismissalDates
    .map((d) => `      { date: "${d.date}", name: "${d.name}" }`)
    .join(",\n");

  const eventsStr = data.calendar.events
    .map((e) => {
      const endDate = e.endDate ? `, endDate: "${e.endDate}"` : "";
      return `      { date: "${e.date}", name: "${e.name}", type: "${e.type}"${endDate} }`;
    })
    .join(",\n");

  const lunchWavesStr = data.lunchWaves.enabled
    ? `    options: [\n${data.lunchWaves.options.map((o) => `      { id: "${o.id}", label: "${o.label}" }`).join(",\n")},\n    ],\n    default: "${data.lunchWaves.default}",`
    : `    options: [],\n    default: "",`;

  return `import type { SchoolConfig } from "./lib/types/config";

const config: SchoolConfig = {
  school: {
    name: "${data.school.name}",
    shortName: "${data.school.shortName}",
    acronym: "${data.school.acronym}",
    mascot: "${data.school.mascot}",
    appName: "${data.school.appName}",
    domain: "",
    logoPath: "/logo.png",
    academicYear: "${data.school.academicYear}",
  },

  location: {
    city: "${data.school.city}",
    state: "${data.school.state}",
    stateCode: "${data.school.stateCode}",
    country: "${data.school.country}",
  },

  colors: {
    primary: "${colors.primary}",
    primaryLight: "${colors.primaryLight}",
    accent: "${colors.accent}",
    accentLight: "${colors.accentLight}",
    darkBg: "${colors.darkBg}",
    darkSurface: "${colors.darkSurface}",
  },

  storagePrefix: "${storagePrefix}",

  schedule: {
    dayTypes: [
${dayTypesStr},
    ],
    bells: {${bellsStr}
    },
    dayTypeOverrides: [],
  },

  lunchWaves: {
${lunchWavesStr}
  },

  calendar: {
    noSchoolDates: [
${noSchoolStr},
    ],
    earlyDismissalDates: [
${earlyStr},
    ],
    events: [
${eventsStr},
    ],
  },

  features: {
    events: ${data.features.events},
    productivity: ${data.features.productivity},
  },
};

export default config;
`;
}

export function generateSlug(schoolName: string): string {
  return toSlug(schoolName);
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/config-generator.ts lib/colors.ts && git commit -m "Add config generator and color utilities"
```

---

### Task 13: Build GitHub and Vercel API wrappers

**Files:**
- Create: `lib/github.ts`
- Create: `lib/vercel.ts`

- [ ] **Step 1: Create GitHub API wrapper**

Create `lib/github.ts`:

```typescript
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_ORG = process.env.GITHUB_ORG!;
const TEMPLATE_REPO = "SchoolWatch";

type GitHubHeaders = Record<string, string>;

function headers(): GitHubHeaders {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function createRepoFromTemplate(name: string): Promise<{ fullName: string; url: string }> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${TEMPLATE_REPO}/generate`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({
      owner: GITHUB_ORG,
      name,
      private: false,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub create repo failed: ${res.status} ${error}`);
  }

  const repo = await res.json();
  return { fullName: repo.full_name, url: repo.html_url };
}

export async function pushFile(
  repoName: string,
  path: string,
  content: string,
  message: string
): Promise<void> {
  const encoded = Buffer.from(content).toString("base64");

  // Check if file exists (to get its SHA for updates)
  let sha: string | undefined;
  const getRes = await fetch(
    `https://api.github.com/repos/${GITHUB_ORG}/${repoName}/contents/${path}`,
    { headers: headers() }
  );
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_ORG}/${repoName}/contents/${path}`,
    {
      method: "PUT",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: encoded,
        ...(sha ? { sha } : {}),
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub push file failed: ${res.status} ${error}`);
  }
}

export async function pushLogo(
  repoName: string,
  logoBuffer: Buffer,
  filename: string
): Promise<void> {
  const encoded = logoBuffer.toString("base64");

  let sha: string | undefined;
  const getRes = await fetch(
    `https://api.github.com/repos/${GITHUB_ORG}/${repoName}/contents/public/${filename}`,
    { headers: headers() }
  );
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_ORG}/${repoName}/contents/public/${filename}`,
    {
      method: "PUT",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Add school logo",
        content: encoded,
        ...(sha ? { sha } : {}),
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub push logo failed: ${res.status} ${error}`);
  }
}
```

- [ ] **Step 2: Create Vercel API wrapper**

Create `lib/vercel.ts`:

```typescript
const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

function teamQuery(): string {
  return VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function createProject(
  name: string,
  gitRepoFullName: string
): Promise<{ projectId: string; url: string }> {
  const res = await fetch(`https://api.vercel.com/v10/projects${teamQuery()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name,
      framework: "nextjs",
      gitRepository: {
        repo: gitRepoFullName,
        type: "github",
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Vercel create project failed: ${res.status} ${error}`);
  }

  const project = await res.json();
  return {
    projectId: project.id,
    url: `${name}.vercel.app`,
  };
}

export async function getLatestDeployment(projectId: string): Promise<{
  id: string;
  state: string;
  url: string;
} | null> {
  const res = await fetch(
    `https://api.vercel.com/v6/deployments${teamQuery()}&projectId=${projectId}&limit=1`,
    { headers: headers() }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const deployment = data.deployments?.[0];
  if (!deployment) return null;

  return {
    id: deployment.uid,
    state: deployment.state,
    url: deployment.url,
  };
}

export async function getDeploymentStatus(deploymentId: string): Promise<string> {
  const res = await fetch(
    `https://api.vercel.com/v13/deployments/${deploymentId}${teamQuery()}`,
    { headers: headers() }
  );

  if (!res.ok) return "ERROR";

  const data = await res.json();
  return data.readyState ?? "UNKNOWN";
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/github.ts lib/vercel.ts && git commit -m "Add GitHub and Vercel API wrappers"
```

---

### Task 14: Build magic link auth

**Files:**
- Create: `lib/auth.ts`
- Create: `lib/email.ts`
- Create: `app/api/auth/send-link/route.ts`
- Create: `app/api/auth/verify/route.ts`

- [ ] **Step 1: Create auth utility**

Create `lib/auth.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.MAGIC_LINK_SECRET!);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function createMagicLinkToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(SECRET);
}

export async function verifyMagicLinkToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export function getMagicLinkUrl(token: string): string {
  return `${APP_URL}/edit?token=${token}`;
}

export function isSuperAdmin(email: string): boolean {
  return email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL ?? "").toLowerCase();
}
```

Note: Install `jose` instead of `jsonwebtoken` — it works in Edge Runtime:

```bash
npm install jose
```

- [ ] **Step 2: Create email utility**

Create `lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(email: string, url: string, schoolName: string) {
  const { error } = await resend.emails.send({
    from: "SchoolWatch <noreply@schoolwatch.app>",
    to: [email],
    subject: `Edit your ${schoolName} dashboard`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="margin: 0 0 8px; font-size: 20px; color: #111;">SchoolWatch Login</h2>
        <p style="margin: 0 0 24px; color: #666; font-size: 14px;">Click the link below to edit your ${schoolName} dashboard settings.</p>
        <a href="${url}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Edit Dashboard</a>
        <p style="margin: 24px 0 0; color: #999; font-size: 12px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) throw new Error(`Failed to send magic link: ${error.message}`);
}
```

- [ ] **Step 3: Create send-link API route**

Create `app/api/auth/send-link/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createMagicLinkToken, getMagicLinkUrl } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const { data: school } = await supabase
    .from("schools")
    .select("name")
    .eq("contact_email", email.toLowerCase())
    .single();

  if (!school) {
    return NextResponse.json({ error: "No school found for this email" }, { status: 404 });
  }

  const token = await createMagicLinkToken(email.toLowerCase());
  const url = getMagicLinkUrl(token);
  await sendMagicLinkEmail(email, url, school.name);

  return NextResponse.json({ sent: true });
}
```

- [ ] **Step 4: Create verify API route**

Create `app/api/auth/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLinkToken, createSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  const payload = await verifyMagicLinkToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  const sessionToken = await createSessionToken(payload.email);

  const response = NextResponse.json({ email: payload.email });
  response.cookies.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts lib/email.ts app/api/auth/ && git commit -m "Add magic link auth with send and verify endpoints"
```

---

### Task 15: Build deploy and redeploy API routes

**Files:**
- Create: `app/api/deploy/route.ts`
- Create: `app/api/redeploy/route.ts`
- Create: `app/api/schools/[id]/route.ts`

- [ ] **Step 1: Create deploy route**

Create `app/api/deploy/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateConfigTs, generateSlug } from "@/lib/config-generator";
import { createRepoFromTemplate, pushFile } from "@/lib/github";
import { createProject } from "@/lib/vercel";
import type { WizardFormData } from "@/lib/types";

export async function POST(request: NextRequest) {
  const data: WizardFormData = await request.json();

  const slug = generateSlug(data.school.name);
  const repoName = `schoolwatch-${slug}`;

  // 1. Create GitHub repo from template
  const repo = await createRepoFromTemplate(repoName);

  // 2. Generate and push school.config.ts
  const configContent = generateConfigTs(data);
  await pushFile(repoName, "school.config.ts", configContent, "Configure school settings via wizard");

  // 3. Create Vercel project linked to the repo
  const vercelProject = await createProject(repoName, repo.fullName);

  // 4. Save to database
  const { data: school, error } = await supabase
    .from("schools")
    .insert({
      name: data.school.name,
      slug,
      contact_email: data.contactEmail.toLowerCase(),
      config_data: data,
      github_repo_name: repoName,
      vercel_project_id: vercelProject.projectId,
      deployed_url: vercelProject.url,
      logo_url: null,
    })
    .select()
    .single();

  if (error) throw new Error(`Database insert failed: ${error.message}`);

  return NextResponse.json({
    schoolId: school.id,
    deployedUrl: vercelProject.url,
    vercelProjectId: vercelProject.projectId,
  });
}
```

- [ ] **Step 2: Create redeploy route**

Create `app/api/redeploy/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateConfigTs } from "@/lib/config-generator";
import { pushFile } from "@/lib/github";
import { verifySessionToken } from "@/lib/auth";
import type { WizardFormData } from "@/lib/types";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { schoolId, data }: { schoolId: string; data: WizardFormData } = await request.json();

  // Verify ownership
  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", schoolId)
    .single();

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  if (school.contact_email !== session.email.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Update config in GitHub (triggers auto-redeploy)
  const configContent = generateConfigTs(data);
  await pushFile(
    school.github_repo_name,
    "school.config.ts",
    configContent,
    "Update school config via wizard"
  );

  // Update database
  await supabase
    .from("schools")
    .update({ config_data: data, updated_at: new Date().toISOString() })
    .eq("id", schoolId);

  return NextResponse.json({ success: true, deployedUrl: school.deployed_url });
}
```

- [ ] **Step 3: Create school lookup routes for edit flow**

Create `app/api/schools/[id]/route.ts` (by ID) and `app/api/schools/by-email/route.ts` (by email):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sessionToken = request.cookies.get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", id)
    .single();

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  // Only the school's contact or super admin can access
  if (school.contact_email !== session.email.toLowerCase() && !isSuperAdmin(session.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(school);
}
```

Also create `app/api/schools/by-email/route.ts` for the edit flow:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Only the owner or super admin can look up by email
  if (email.toLowerCase() !== session.email.toLowerCase() && !isSuperAdmin(session.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("contact_email", email.toLowerCase())
    .single();

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  return NextResponse.json(school);
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/deploy/ app/api/redeploy/ app/api/schools/ && git commit -m "Add deploy, redeploy, and school data API routes"
```

---

### Task 16: Build the wizard form shell and state management

**Files:**
- Create: `components/WizardShell.tsx`
- Create: `app/setup/page.tsx`

- [ ] **Step 1: Create WizardShell**

Create `components/WizardShell.tsx`:

```tsx
"use client";

import { useState, type ReactNode } from "react";
import type { WizardFormData } from "@/lib/types";

const STEPS = [
  "School Info",
  "Colors",
  "Schedule",
  "Lunch Waves",
  "Calendar",
  "Features",
  "Review & Deploy",
];

const DEFAULT_FORM_DATA: WizardFormData = {
  school: {
    name: "",
    shortName: "",
    acronym: "",
    mascot: "",
    appName: "",
    city: "",
    state: "",
    stateCode: "",
    country: "US",
    academicYear: "",
  },
  colors: {
    primary: "#003da5",
    accent: "#003da5",
  },
  schedule: {
    dayTypes: [{ id: "regular", label: "Regular Day", weekdays: [1, 2, 3, 4, 5] }],
    bells: {
      regular: {
        shared: [{ name: "1st Period", start: "08:00", end: "08:50" }],
        after: [],
      },
    },
  },
  lunchWaves: {
    enabled: false,
    options: [],
    default: "",
  },
  calendar: {
    noSchoolDates: [],
    earlyDismissalDates: [],
    events: [],
  },
  features: {
    events: true,
    productivity: true,
  },
  contactEmail: "",
};

type StepProps = {
  data: WizardFormData;
  onChange: (data: WizardFormData) => void;
};

type WizardShellProps = {
  steps: ((props: StepProps) => ReactNode)[];
  initialData?: WizardFormData;
};

export default function WizardShell({ steps, initialData }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardFormData>(initialData ?? DEFAULT_FORM_DATA);

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-gray-500">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{STEPS[currentStep]}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-black transition-all"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {steps[currentStep]({ data, onChange: setData })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={isFirst}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30"
        >
          Back
        </button>
        {!isLast && (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export { DEFAULT_FORM_DATA };
export type { StepProps };
```

- [ ] **Step 2: Create setup page**

Create `app/setup/page.tsx`:

```tsx
"use client";

import WizardShell from "@/components/WizardShell";
import StepSchoolInfo from "@/components/wizard/StepSchoolInfo";
import StepColors from "@/components/wizard/StepColors";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepLunchWaves from "@/components/wizard/StepLunchWaves";
import StepCalendar from "@/components/wizard/StepCalendar";
import StepFeatures from "@/components/wizard/StepFeatures";
import StepReview from "@/components/wizard/StepReview";

const steps = [
  StepSchoolInfo,
  StepColors,
  StepSchedule,
  StepLunchWaves,
  StepCalendar,
  StepFeatures,
  StepReview,
];

export default function SetupPage() {
  return <WizardShell steps={steps} />;
}
```

- [ ] **Step 3: Commit**

```bash
mkdir -p components/wizard && git add components/WizardShell.tsx app/setup/page.tsx && git commit -m "Add wizard shell with step navigation and state management"
```

---

### Task 17: Build wizard step components (1-4)

**Files:**
- Create: `components/wizard/StepSchoolInfo.tsx`
- Create: `components/wizard/StepColors.tsx`
- Create: `components/wizard/StepSchedule.tsx`
- Create: `components/wizard/StepLunchWaves.tsx`

- [ ] **Step 1: Create StepSchoolInfo**

Create `components/wizard/StepSchoolInfo.tsx`:

```tsx
import type { StepProps } from "@/components/WizardShell";

export default function StepSchoolInfo({ data, onChange }: StepProps) {
  function update(field: string, value: string) {
    onChange({
      ...data,
      school: { ...data.school, [field]: value },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">School Information</h2>
        <p className="mt-1 text-gray-500">Tell us about your school.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">School Name (full official name)</label>
          <input
            type="text"
            value={data.school.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Lake Highland Preparatory School"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Short Name</label>
            <input
              type="text"
              value={data.school.shortName}
              onChange={(e) => update("shortName", e.target.value)}
              placeholder="Lake Highland Prep"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Acronym (2-4 letters)</label>
            <input
              type="text"
              value={data.school.acronym}
              onChange={(e) => update("acronym", e.target.value.toUpperCase())}
              placeholder="LHP"
              maxLength={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mascot</label>
            <input
              type="text"
              value={data.school.mascot}
              onChange={(e) => update("mascot", e.target.value)}
              placeholder="Highlanders"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">App Name</label>
            <input
              type="text"
              value={data.school.appName}
              onChange={(e) => update("appName", e.target.value)}
              placeholder="HighlanderWatch"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={data.school.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Orlando"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              value={data.school.state}
              onChange={(e) => update("state", e.target.value)}
              placeholder="Florida"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">State Code</label>
            <input
              type="text"
              value={data.school.stateCode}
              onChange={(e) => update("stateCode", e.target.value.toUpperCase())}
              placeholder="FL"
              maxLength={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Academic Year</label>
            <input
              type="text"
              value={data.school.academicYear}
              onChange={(e) => update("academicYear", e.target.value)}
              placeholder="2026-2027"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contact Email (for future edits)</label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
            placeholder="sga@yourschool.edu"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <p className="mt-1 text-xs text-gray-400">We'll send a login link to this email when you need to make changes.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create StepColors**

Create `components/wizard/StepColors.tsx`:

```tsx
import type { StepProps } from "@/components/WizardShell";
import { deriveColors } from "@/lib/colors";

export default function StepColors({ data, onChange }: StepProps) {
  const derived = deriveColors(data.colors.primary, data.colors.accent);

  function updateColor(field: "primary" | "accent", value: string) {
    onChange({
      ...data,
      colors: { ...data.colors, [field]: value },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">School Colors</h2>
        <p className="mt-1 text-gray-500">Pick your primary and accent colors. We'll auto-generate the rest.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.colors.primary}
              onChange={(e) => updateColor("primary", e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={data.colors.primary}
              onChange={(e) => updateColor("primary", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.colors.accent}
              onChange={(e) => updateColor("accent", e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={data.colors.accent}
              onChange={(e) => updateColor("accent", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Preview</p>
        <div className="flex gap-3">
          {Object.entries(derived).map(([name, color]) => (
            <div key={name} className="text-center">
              <div
                className="mx-auto h-12 w-12 rounded-lg border border-gray-200"
                style={{ backgroundColor: color }}
              />
              <p className="mt-1 text-xs text-gray-500">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create StepSchedule**

Create `components/wizard/StepSchedule.tsx`:

```tsx
import { useState } from "react";
import type { StepProps } from "@/components/WizardShell";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKDAY_VALUES = [1, 2, 3, 4, 5];

type Period = { name: string; start: string; end: string };

export default function StepSchedule({ data, onChange }: StepProps) {
  const [activeDayType, setActiveDayType] = useState(0);

  function addDayType() {
    const newId = `day_${data.schedule.dayTypes.length + 1}`;
    const updated = {
      ...data,
      schedule: {
        ...data.schedule,
        dayTypes: [...data.schedule.dayTypes, { id: newId, label: "", weekdays: [] }],
        bells: {
          ...data.schedule.bells,
          [newId]: { shared: [{ name: "1st Period", start: "08:00", end: "08:50" }], after: [] },
        },
      },
    };
    onChange(updated);
    setActiveDayType(updated.schedule.dayTypes.length - 1);
  }

  function removeDayType(index: number) {
    const dt = data.schedule.dayTypes[index];
    const newDayTypes = data.schedule.dayTypes.filter((_, i) => i !== index);
    const newBells = { ...data.schedule.bells };
    delete newBells[dt.id];
    onChange({
      ...data,
      schedule: { ...data.schedule, dayTypes: newDayTypes, bells: newBells },
    });
    setActiveDayType(Math.max(0, activeDayType - 1));
  }

  function updateDayTypeLabel(index: number, label: string) {
    const newDayTypes = [...data.schedule.dayTypes];
    newDayTypes[index] = { ...newDayTypes[index], label };
    onChange({ ...data, schedule: { ...data.schedule, dayTypes: newDayTypes } });
  }

  function toggleWeekday(index: number, weekday: number) {
    const newDayTypes = [...data.schedule.dayTypes];
    const current = newDayTypes[index].weekdays;
    const newWeekdays = current.includes(weekday)
      ? current.filter((w) => w !== weekday)
      : [...current, weekday].sort();
    newDayTypes[index] = { ...newDayTypes[index], weekdays: newWeekdays };
    onChange({ ...data, schedule: { ...data.schedule, dayTypes: newDayTypes } });
  }

  function updatePeriod(dtId: string, section: "shared" | "after", index: number, field: keyof Period, value: string) {
    const newBells = { ...data.schedule.bells };
    const bell = { ...newBells[dtId] };
    const periods = [...bell[section]];
    periods[index] = { ...periods[index], [field]: value };
    bell[section] = periods;
    newBells[dtId] = bell;
    onChange({ ...data, schedule: { ...data.schedule, bells: newBells } });
  }

  function addPeriod(dtId: string, section: "shared" | "after") {
    const newBells = { ...data.schedule.bells };
    const bell = { ...newBells[dtId] };
    bell[section] = [...bell[section], { name: "", start: "", end: "" }];
    newBells[dtId] = bell;
    onChange({ ...data, schedule: { ...data.schedule, bells: newBells } });
  }

  function removePeriod(dtId: string, section: "shared" | "after", index: number) {
    const newBells = { ...data.schedule.bells };
    const bell = { ...newBells[dtId] };
    bell[section] = bell[section].filter((_, i) => i !== index);
    newBells[dtId] = bell;
    onChange({ ...data, schedule: { ...data.schedule, bells: newBells } });
  }

  const currentDt = data.schedule.dayTypes[activeDayType];
  const currentBell = currentDt ? data.schedule.bells[currentDt.id] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bell Schedule</h2>
        <p className="mt-1 text-gray-500">Define your schedule types and periods. Most schools have 1-4 day types.</p>
      </div>

      {/* Day type tabs */}
      <div className="flex flex-wrap gap-2">
        {data.schedule.dayTypes.map((dt, i) => (
          <button
            key={dt.id}
            onClick={() => setActiveDayType(i)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeDayType === i
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {dt.label || `Day Type ${i + 1}`}
          </button>
        ))}
        <button
          onClick={addDayType}
          className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Day Type
        </button>
      </div>

      {currentDt && currentBell && (
        <div className="space-y-6 rounded-xl border border-gray-200 p-6">
          {/* Day type config */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Day Type Label</label>
              <input
                type="text"
                value={currentDt.label}
                onChange={(e) => updateDayTypeLabel(activeDayType, e.target.value)}
                placeholder="Regular Day"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Days of the Week</label>
              <div className="flex gap-2 pt-1">
                {WEEKDAY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => toggleWeekday(activeDayType, WEEKDAY_VALUES[i])}
                    className={`h-9 w-9 rounded-full text-xs font-medium transition-colors ${
                      currentDt.weekdays.includes(WEEKDAY_VALUES[i])
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Periods */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Periods</label>
            </div>
            <div className="space-y-2">
              {currentBell.shared.map((period, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={period.name}
                    onChange={(e) => updatePeriod(currentDt.id, "shared", i, "name", e.target.value)}
                    placeholder="Period name"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="time"
                    value={period.start}
                    onChange={(e) => updatePeriod(currentDt.id, "shared", i, "start", e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={period.end}
                    onChange={(e) => updatePeriod(currentDt.id, "shared", i, "end", e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    onClick={() => removePeriod(currentDt.id, "shared", i)}
                    className="rounded p-1 text-gray-400 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addPeriod(currentDt.id, "shared")}
                className="text-sm text-gray-500 hover:text-black"
              >
                + Add Period
              </button>
            </div>
          </div>

          {data.schedule.dayTypes.length > 1 && (
            <button
              onClick={() => removeDayType(activeDayType)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remove this day type
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create StepLunchWaves**

Create `components/wizard/StepLunchWaves.tsx`:

```tsx
import type { StepProps } from "@/components/WizardShell";

export default function StepLunchWaves({ data, onChange }: StepProps) {
  function toggleEnabled() {
    onChange({
      ...data,
      lunchWaves: {
        ...data.lunchWaves,
        enabled: !data.lunchWaves.enabled,
        options: data.lunchWaves.enabled ? [] : [{ id: "wave-1", label: "Wave 1" }, { id: "wave-2", label: "Wave 2" }],
        default: data.lunchWaves.enabled ? "" : "wave-1",
      },
    });
  }

  function updateOption(index: number, field: "id" | "label", value: string) {
    const newOptions = [...data.lunchWaves.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange({ ...data, lunchWaves: { ...data.lunchWaves, options: newOptions } });
  }

  function addOption() {
    const newId = `wave-${data.lunchWaves.options.length + 1}`;
    onChange({
      ...data,
      lunchWaves: {
        ...data.lunchWaves,
        options: [...data.lunchWaves.options, { id: newId, label: "" }],
      },
    });
  }

  function removeOption(index: number) {
    const newOptions = data.lunchWaves.options.filter((_, i) => i !== index);
    onChange({
      ...data,
      lunchWaves: {
        ...data.lunchWaves,
        options: newOptions,
        default: newOptions[0]?.id ?? "",
      },
    });
  }

  function setDefault(id: string) {
    onChange({ ...data, lunchWaves: { ...data.lunchWaves, default: id } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Lunch Waves</h2>
        <p className="mt-1 text-gray-500">Does your school have different lunch times for different grades?</p>
      </div>

      <button
        onClick={toggleEnabled}
        className={`flex items-center gap-3 rounded-xl border-2 px-6 py-4 text-left transition-colors ${
          data.lunchWaves.enabled
            ? "border-black bg-black/5"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className={`flex h-5 w-5 items-center justify-center rounded border ${data.lunchWaves.enabled ? "border-black bg-black" : "border-gray-300"}`}>
          {data.lunchWaves.enabled && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">Yes, we have lunch waves</p>
          <p className="text-sm text-gray-500">Different grades eat lunch at different times</p>
        </div>
      </button>

      {data.lunchWaves.enabled && (
        <div className="space-y-4 rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-700">Define your lunch waves</p>
          {data.lunchWaves.options.map((option, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                value={option.id}
                onChange={(e) => updateOption(i, "id", e.target.value)}
                placeholder="9/10"
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateOption(i, "label", e.target.value)}
                placeholder="Grades 9/10"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button
                onClick={() => setDefault(option.id)}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  data.lunchWaves.default === option.id
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Default
              </button>
              <button
                onClick={() => removeOption(i)}
                className="rounded p-1 text-gray-400 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={addOption} className="text-sm text-gray-500 hover:text-black">
            + Add Lunch Wave
          </button>

          <p className="text-xs text-gray-400">
            After defining waves here, you'll need to assign lunch periods to each wave in the Schedule step.
            You can go back and edit your schedule to add lunch wave periods.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/wizard/ && git commit -m "Add wizard steps 1-4: school info, colors, schedule, lunch waves"
```

---

### Task 18: Build wizard step components (5-7)

**Files:**
- Create: `components/wizard/StepCalendar.tsx`
- Create: `components/wizard/StepFeatures.tsx`
- Create: `components/wizard/StepReview.tsx`
- Create: `components/DeployProgress.tsx`

- [ ] **Step 1: Create StepCalendar**

Create `components/wizard/StepCalendar.tsx`:

```tsx
import { useState } from "react";
import type { StepProps } from "@/components/WizardShell";

type CalendarEntry = { date: string; name: string };
type EventEntry = { date: string; name: string; type: string; endDate?: string };

export default function StepCalendar({ data, onChange }: StepProps) {
  const [tab, setTab] = useState<"no-school" | "early" | "events">("no-school");

  function addNoSchool() {
    onChange({
      ...data,
      calendar: {
        ...data.calendar,
        noSchoolDates: [...data.calendar.noSchoolDates, { date: "", name: "" }],
      },
    });
  }

  function updateNoSchool(index: number, field: keyof CalendarEntry, value: string) {
    const updated = [...data.calendar.noSchoolDates];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, calendar: { ...data.calendar, noSchoolDates: updated } });
  }

  function removeNoSchool(index: number) {
    onChange({
      ...data,
      calendar: {
        ...data.calendar,
        noSchoolDates: data.calendar.noSchoolDates.filter((_, i) => i !== index),
      },
    });
  }

  function addEarly() {
    onChange({
      ...data,
      calendar: {
        ...data.calendar,
        earlyDismissalDates: [...data.calendar.earlyDismissalDates, { date: "", name: "" }],
      },
    });
  }

  function updateEarly(index: number, field: keyof CalendarEntry, value: string) {
    const updated = [...data.calendar.earlyDismissalDates];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, calendar: { ...data.calendar, earlyDismissalDates: updated } });
  }

  function removeEarly(index: number) {
    onChange({
      ...data,
      calendar: {
        ...data.calendar,
        earlyDismissalDates: data.calendar.earlyDismissalDates.filter((_, i) => i !== index),
      },
    });
  }

  function addEvent() {
    onChange({
      ...data,
      calendar: {
        ...data.calendar,
        events: [...data.calendar.events, { date: "", name: "", type: "event" }],
      },
    });
  }

  function updateEvent(index: number, field: keyof EventEntry, value: string) {
    const updated = [...data.calendar.events];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, calendar: { ...data.calendar, events: updated } });
  }

  function removeEvent(index: number) {
    onChange({
      ...data,
      calendar: {
        ...data.calendar,
        events: data.calendar.events.filter((_, i) => i !== index),
      },
    });
  }

  const tabs = [
    { key: "no-school" as const, label: "No-School Days", count: data.calendar.noSchoolDates.length },
    { key: "early" as const, label: "Early Dismissal", count: data.calendar.earlyDismissalDates.length },
    { key: "events" as const, label: "Events", count: data.calendar.events.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">School Calendar</h2>
        <p className="mt-1 text-gray-500">Add holidays, breaks, early dismissals, and events.</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label} {t.count > 0 && <span className="ml-1 text-xs text-gray-400">({t.count})</span>}
          </button>
        ))}
      </div>

      {tab === "no-school" && (
        <div className="space-y-2">
          {data.calendar.noSchoolDates.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="date"
                value={entry.date}
                onChange={(e) => updateNoSchool(i, "date", e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <input
                type="text"
                value={entry.name}
                onChange={(e) => updateNoSchool(i, "name", e.target.value)}
                placeholder="Holiday name"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <button onClick={() => removeNoSchool(i)} className="rounded p-1 text-gray-400 hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={addNoSchool} className="text-sm text-gray-500 hover:text-black">+ Add No-School Day</button>
        </div>
      )}

      {tab === "early" && (
        <div className="space-y-2">
          {data.calendar.earlyDismissalDates.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="date"
                value={entry.date}
                onChange={(e) => updateEarly(i, "date", e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <input
                type="text"
                value={entry.name}
                onChange={(e) => updateEarly(i, "name", e.target.value)}
                placeholder="Reason"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <button onClick={() => removeEarly(i)} className="rounded p-1 text-gray-400 hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={addEarly} className="text-sm text-gray-500 hover:text-black">+ Add Early Dismissal</button>
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-2">
          {data.calendar.events.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="date"
                value={entry.date}
                onChange={(e) => updateEvent(i, "date", e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <input
                type="text"
                value={entry.name}
                onChange={(e) => updateEvent(i, "name", e.target.value)}
                placeholder="Event name"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <select
                value={entry.type}
                onChange={(e) => updateEvent(i, "type", e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="event">Event</option>
                <option value="no-school">No School</option>
                <option value="early-dismissal">Early Dismissal</option>
                <option value="exam">Exam</option>
                <option value="deadline">Deadline</option>
              </select>
              <button onClick={() => removeEvent(i)} className="rounded p-1 text-gray-400 hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={addEvent} className="text-sm text-gray-500 hover:text-black">+ Add Event</button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create StepFeatures**

Create `components/wizard/StepFeatures.tsx`:

```tsx
import type { StepProps } from "@/components/WizardShell";

const FEATURES = [
  {
    key: "events" as const,
    title: "Events & Calendar",
    description: "Show school events, holidays, and breaks on a calendar page",
  },
  {
    key: "productivity" as const,
    title: "Productivity Tools",
    description: "Pomodoro timer, Wordle, to-do list, and group randomizer",
  },
];

export default function StepFeatures({ data, onChange }: StepProps) {
  function toggle(key: "events" | "productivity") {
    onChange({
      ...data,
      features: { ...data.features, [key]: !data.features[key] },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Features</h2>
        <p className="mt-1 text-gray-500">Choose which optional features to include.</p>
      </div>

      <div className="space-y-3">
        {FEATURES.map((feature) => (
          <button
            key={feature.key}
            onClick={() => toggle(feature.key)}
            className={`flex w-full items-center gap-4 rounded-xl border-2 px-6 py-4 text-left transition-colors ${
              data.features[feature.key]
                ? "border-black bg-black/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`flex h-5 w-5 items-center justify-center rounded border ${data.features[feature.key] ? "border-black bg-black" : "border-gray-300"}`}>
              {data.features[feature.key] && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{feature.title}</p>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        The countdown timer and bell schedule are always included — they're the core of the app.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create DeployProgress**

Create `components/DeployProgress.tsx`:

```tsx
type DeployState = "idle" | "creating-repo" | "pushing-config" | "creating-project" | "deploying" | "done" | "error";

const STEPS: { state: DeployState; label: string }[] = [
  { state: "creating-repo", label: "Creating repository..." },
  { state: "pushing-config", label: "Configuring your school..." },
  { state: "creating-project", label: "Setting up deployment..." },
  { state: "deploying", label: "Building your site..." },
  { state: "done", label: "Your site is live!" },
];

export default function DeployProgress({
  state,
  url,
  error,
}: {
  state: DeployState;
  url?: string;
  error?: string;
}) {
  if (state === "idle") return null;

  const currentIndex = STEPS.findIndex((s) => s.state === state);

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 p-6">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex || state === "done";
        const isCurrent = i === currentIndex && state !== "done" && state !== "error";

        return (
          <div key={step.state} className="flex items-center gap-3">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
              isComplete ? "bg-green-500" : isCurrent ? "bg-black" : "bg-gray-200"
            }`}>
              {isComplete ? (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : isCurrent ? (
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
              ) : null}
            </div>
            <span className={`text-sm ${isComplete || isCurrent ? "text-gray-900" : "text-gray-400"}`}>
              {step.label}
            </span>
          </div>
        );
      })}

      {state === "done" && url && (
        <div className="mt-4 rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">Your dashboard is live at:</p>
          <a
            href={`https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-lg font-bold text-green-700 underline"
          >
            {url}
          </a>
        </div>
      )}

      {state === "error" && error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Something went wrong:</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

export type { DeployState };
```

- [ ] **Step 4: Create StepReview**

Create `components/wizard/StepReview.tsx`:

```tsx
import { useState } from "react";
import type { StepProps } from "@/components/WizardShell";
import DeployProgress, { type DeployState } from "@/components/DeployProgress";

export default function StepReview({ data }: StepProps) {
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [deployUrl, setDeployUrl] = useState("");
  const [deployError, setDeployError] = useState("");

  async function handleDeploy() {
    setDeployState("creating-repo");
    setDeployError("");

    try {
      setDeployState("pushing-config");

      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Deploy failed");
      }

      setDeployState("deploying");

      const result = await res.json();

      // Poll for deployment completion (simple approach)
      setDeployState("done");
      setDeployUrl(result.deployedUrl);
    } catch (err) {
      setDeployState("error");
      setDeployError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Deploy</h2>
        <p className="mt-1 text-gray-500">Everything look good? Hit deploy to create your school's dashboard.</p>
      </div>

      {/* Summary */}
      <div className="space-y-4 rounded-xl border border-gray-200 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">School</p>
          <p className="text-lg font-bold text-gray-900">{data.school.name || "—"}</p>
          <p className="text-sm text-gray-500">{data.school.city}, {data.school.state}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">App Name</p>
          <p className="font-medium text-gray-900">{data.school.appName || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Schedule</p>
          <p className="text-sm text-gray-700">
            {data.schedule.dayTypes.length} day type{data.schedule.dayTypes.length !== 1 ? "s" : ""}
            {data.lunchWaves.enabled ? `, ${data.lunchWaves.options.length} lunch waves` : ""}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Calendar</p>
          <p className="text-sm text-gray-700">
            {data.calendar.noSchoolDates.length} no-school days,{" "}
            {data.calendar.events.length} events
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</p>
          <p className="text-sm text-gray-700">{data.contactEmail || "—"}</p>
        </div>
      </div>

      {/* Deploy button or progress */}
      {deployState === "idle" ? (
        <button
          onClick={handleDeploy}
          disabled={!data.school.name || !data.contactEmail}
          className="w-full rounded-xl bg-black px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-30"
        >
          Deploy Your Dashboard
        </button>
      ) : (
        <DeployProgress state={deployState} url={deployUrl} error={deployError} />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/wizard/StepCalendar.tsx components/wizard/StepFeatures.tsx components/wizard/StepReview.tsx components/DeployProgress.tsx && git commit -m "Add wizard steps 5-7: calendar, features, review + deploy"
```

---

### Task 19: Build landing page

**Files:**
- Create: `components/LandingHero.tsx`
- Create: `components/LandingFeatures.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create LandingHero**

Create `components/LandingHero.tsx`:

```tsx
import Link from "next/link";

export default function LandingHero() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
        Your school's schedule,
        <br />
        <span className="text-gray-400">one click away</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-gray-500">
        SchoolWatch gives your school a live bell schedule countdown, events calendar,
        and productivity tools. Set it up in 5 minutes — no coding required.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/setup"
          className="rounded-xl bg-black px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Create Your Dashboard
        </Link>
        <a
          href="https://lakerwatch.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-gray-300 px-8 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          See an Example
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create LandingFeatures**

Create `components/LandingFeatures.tsx`:

```tsx
const FEATURES = [
  {
    title: "Live Countdown Timer",
    description: "Students see exactly how much time is left in the current period with a beautiful circular progress ring.",
  },
  {
    title: "Smart Schedule",
    description: "Supports simple schedules, block schedules, and rotating days. Automatically detects the right schedule for today.",
  },
  {
    title: "Lunch Waves",
    description: "If your school has different lunch times for different grades, students can toggle their wave and see the right schedule.",
  },
  {
    title: "Events Calendar",
    description: "Holidays, breaks, early dismissals, and school events — all in one place with a clean calendar view.",
  },
  {
    title: "Productivity Tools",
    description: "Pomodoro timer, Wordle, to-do list, and group randomizer to keep students focused.",
  },
  {
    title: "Works Everywhere",
    description: "Mobile-friendly, dark mode, fast loading. Students can add it to their home screen like an app.",
  },
];

export default function LandingFeatures() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24">
      <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
        Everything your school needs
      </h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-gray-200 p-6">
            <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create landing page**

Replace `app/page.tsx`:

```tsx
import LandingHero from "@/components/LandingHero";
import LandingFeatures from "@/components/LandingFeatures";

export default function Home() {
  return (
    <main>
      <LandingHero />
      <LandingFeatures />
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/LandingHero.tsx components/LandingFeatures.tsx app/page.tsx && git commit -m "Add marketing landing page with hero and features"
```

---

### Task 20: Build edit flow

**Files:**
- Create: `app/edit/page.tsx`

- [ ] **Step 1: Create edit page**

Create `app/edit/page.tsx`:

```tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WizardShell from "@/components/WizardShell";
import StepSchoolInfo from "@/components/wizard/StepSchoolInfo";
import StepColors from "@/components/wizard/StepColors";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepLunchWaves from "@/components/wizard/StepLunchWaves";
import StepCalendar from "@/components/wizard/StepCalendar";
import StepFeatures from "@/components/wizard/StepFeatures";
import StepReview from "@/components/wizard/StepReview";
import type { WizardFormData, School } from "@/lib/types";

const steps = [
  StepSchoolInfo,
  StepColors,
  StepSchedule,
  StepLunchWaves,
  StepCalendar,
  StepFeatures,
  StepReview,
];

function EditContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"verifying" | "loading" | "ready" | "error">("verifying");
  const [school, setSchool] = useState<School | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("No login token provided. Request a new edit link.");
      return;
    }

    // Verify the magic link token
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Invalid or expired link");
        setState("loading");
        return res.json();
      })
      .then(async (data) => {
        // Find the school for this email
        const schoolRes = await fetch(`/api/schools/by-email?email=${encodeURIComponent(data.email)}`);
        if (!schoolRes.ok) throw new Error("No school found for this email");
        const schoolData = await schoolRes.json();
        setSchool(schoolData);
        setState("ready");
      })
      .catch((err) => {
        setState("error");
        setError(err.message);
      });
  }, [token]);

  if (state === "verifying" || state === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-gray-900">Unable to load</p>
        <p className="mt-2 text-gray-500">{error}</p>
      </div>
    );
  }

  if (!school) return null;

  return <WizardShell steps={steps} initialData={school.config_data as WizardFormData} />;
}

export default function EditPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    }>
      <EditContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/edit/page.tsx && git commit -m "Add edit flow with magic link verification"
```

---

### Task 21: Final wizard build and verification

- [ ] **Step 1: Create the root layout**

Create/update `app/layout.tsx` with appropriate metadata for the wizard app (not the school template):

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SchoolWatch — Create Your School Dashboard",
  description: "Set up a live bell schedule countdown and student dashboard for your school in 5 minutes. No coding required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 4: Fix any build errors**

Address TypeScript or import issues found during build.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "Final wizard build fixes and verification"
```

---

### Task 22: Set up template repo as GitHub template

- [ ] **Step 1: Confirm the SchoolWatch repo is set as a GitHub template**

Go to the SchoolWatch repo settings on GitHub → check "Template repository". This enables the GitHub API's `POST /repos/{template}/generate` endpoint used by the wizard.

- [ ] **Step 2: Create a GitHub organization (if needed)**

If not already done, create a GitHub org (e.g., `SchoolWatch-Sites`) to hold all the generated school repos. Update the `GITHUB_ORG` env var in the wizard.

- [ ] **Step 3: Set up Vercel + GitHub integration**

Ensure the Vercel account has the GitHub integration installed for the org. This lets Vercel auto-deploy when the wizard creates a project linked to a GitHub repo.

- [ ] **Step 4: Document the setup in the wizard repo's README**

Create a README with:
- What env vars are needed
- How to set up the Supabase database (run schema.sql)
- How to get GitHub and Vercel tokens
- How to deploy the wizard itself to Vercel
