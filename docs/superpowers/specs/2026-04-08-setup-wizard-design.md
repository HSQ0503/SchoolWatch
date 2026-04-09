# SchoolWatch Setup Wizard — Design Spec

**Date:** 2026-04-08
**Status:** Approved
**Goal:** Let non-technical SGA students create and manage a SchoolWatch dashboard for their school through a web-based setup wizard, with zero coding or terminal usage required.

---

## Context

SchoolWatch is a school dashboard with a live bell schedule countdown, events calendar, and productivity tools. It's currently configured via a TypeScript config file (`school.config.ts`) and requires forking a repo, editing config, setting up MongoDB/Resend, and deploying to Vercel — a workflow designed for coding clubs.

The target audience is shifting to Student Government Associations (SGA), who have zero coding experience. The wizard eliminates all technical steps.

## Key Decisions

- **No database layer in deployed school sites.** The admin panel, announcements, MongoDB, Resend, and auth are stripped from the template. The countdown timer (90% of the value) runs entirely client-side from config data baked in at build time.
- **Events/calendar are static.** Set once during setup, editable by returning to the wizard. Changes trigger a redeploy.
- **Each school gets its own Vercel project** under Han's Pro account. Target: under 10 schools initially. Can revisit multi-tenant if scale demands it.
- **Schools need zero accounts.** The wizard handles deployment programmatically via Vercel API. SGA students never touch GitHub, Vercel, or a terminal.

## Architecture

Two pieces:

### 1. Wizard App

A Next.js app hosted on Vercel (one project). This is the only piece with a backend.

**Responsibilities:**
- Marketing landing page explaining SchoolWatch
- Multi-step setup form for creating a new school site
- Edit flow for returning schools to update their config
- Stores each school's config data in a database (so they can return and edit)
- Talks to Vercel API to create projects, deploy, and redeploy
- Manages school logo uploads

**Tech stack:**
- Next.js (App Router), TypeScript, Tailwind CSS
- Database: Supabase or MongoDB Atlas (free tier) for storing school configs
- Vercel API for project creation and deployment
- Email-based magic link auth for returning schools

### 2. SchoolWatch Template Repo

The current SchoolWatch repo, stripped of all backend/admin code. Becomes a purely static/client-side Next.js app.

**What gets removed:**
- `app/api/admin/*` — all admin auth routes
- `app/admin/page.tsx` — admin panel page
- `components/Admin*.tsx` — AdminLoginForm, AdminEventForm, AdminAnnouncementForm, AdminEventsPanel, AdminAnnouncementsPanel
- `components/AnnouncementsFeed.tsx` — announcements display
- `lib/auth.ts` — JWT/bcrypt auth utilities
- `lib/email.ts` — Resend email sending
- `lib/announcements.ts` — announcement queries
- `prisma/` — schema and seed script
- `prisma.config.ts`
- Dependencies: `@prisma/client`, `prisma`, `mongodb`, `resend`, `bcryptjs`, `jsonwebtoken`, and their type packages

**What gets modified:**
- `app/page.tsx` — remove announcements polling and display
- `app/api/events/` — remove (events baked into config, no API needed)
- `app/api/announcements/` — remove entirely
- `components/Navbar.tsx` — remove admin link detection
- `package.json` — remove backend dependencies
- `features.announcements` — removed from config type and template entirely

**What stays intact:**
- Countdown timer, schedule viewer, day type detection, lunch waves
- Dark/light theme, mobile responsiveness
- Productivity tools (Pomodoro, Wordle, todos, randomizer)
- Events/calendar page (reads from config at build time)
- All `lib/schedule.ts` logic
- Config validation (`lib/validateConfig.ts`)

## Wizard Flow

A multi-step form:

### Step 1: School Info
- School name (full official name)
- Short name (casual)
- Acronym (2-4 letters)
- Mascot
- App name (what the dashboard is called, e.g., "HighlanderWatch")
- City, state, state code, country
- Logo upload
- Academic year (e.g., "2026-2027")

### Step 2: Colors
- Primary color (color picker, with a text input for hex)
- Accent color (color picker)
- Auto-generate light variants and dark mode background from the primary/accent
- Live preview swatch showing how the colors look

### Step 3: Schedule Setup
- How many types of schedule days? (1 = same every day, 2 = A/B block, etc.)
- For each day type: label, which weekdays it applies to
- For each day type: list of periods with name, start time, end time
- Ability to add/remove periods dynamically

### Step 4: Lunch Waves (optional)
- Does your school have different lunch times for different grades? (yes/no)
- If yes: define wave labels (e.g., "9/10", "11/12") and assign lunch periods per wave within each day type's schedule

### Step 5: Calendar
- No-school dates: click dates on a calendar, label them
- Early dismissal dates: same UI
- Events: date, name, type (event/exam/deadline), optional end date for ranges
- Pre-populate common US holidays as suggestions they can toggle on

### Step 6: Features
- Toggle: Productivity tools (Pomodoro, Wordle, todos, randomizer) on/off
- Toggle: Events/calendar page on/off

### Step 7: Review + Deploy
- Summary of all entered data
- "Deploy" button
- Show progress: creating project... deploying... done
- Display final URL (e.g., `highlander-watch.vercel.app`)
- Option to set a custom subdomain

## Deploy Pipeline

### New School (Create)
1. Wizard backend validates all form data
2. Generates `school.config.ts` content from form data
3. Stores the school's config + metadata in wizard database
4. Creates a new GitHub repo from the template repo via GitHub API (under Han's GitHub account or a dedicated org)
5. Pushes generated `school.config.ts` + uploaded logo to the new repo via GitHub API
6. Creates a Vercel project linked to the new repo via Vercel API — Vercel auto-deploys on push
7. Returns the deployed URL to the user

### Existing School (Edit)
1. School returns to wizard, authenticates via magic link
2. Loads their existing config from the wizard database
3. They edit whatever they need (schedule change, new calendar dates, etc.)
4. Wizard regenerates `school.config.ts`
5. Updates config in wizard database
6. Pushes updated `school.config.ts` to the school's GitHub repo via GitHub API
7. Vercel auto-redeploys from the push
8. Confirms successful redeploy

## Auth for the Wizard

- During initial setup, SGA enters a contact email
- That email becomes their login for future edits
- Auth via magic link (email a login link, no passwords)
- Magic links expire after 15 minutes
- Session persists via httpOnly cookie (7-day expiry)
- Han can also access any school's config as a super-admin

## Data Model (Wizard Database)

```
School {
  id
  name             // "Lake Highland Prep"
  slug             // "lake-highland-prep" (used for Vercel project name)
  contactEmail     // SGA contact for magic link auth
  configData       // JSON blob of all form data (not the generated TS — the raw form values)
  githubRepoName   // GitHub repo name for pushing config updates
  vercelProjectId  // Vercel project ID for status checks
  deployedUrl      // "highlander-watch.vercel.app"
  logoUrl          // uploaded logo file URL
  createdAt
  updatedAt
}
```

## Hosting Summary

| Component | Where | Cost |
|-----------|-------|------|
| Wizard app | Vercel (1 project, Han's Pro account) | Included in Pro |
| Wizard database | Supabase free tier or MongoDB Atlas M0 | Free |
| Each school's site | Vercel (1 project per school, Han's Pro account) | Included in Pro |
| Template repo | GitHub | Free |
| Logo storage | Vercel Blob or Supabase Storage | Free tier |

## Scope Boundaries

**In scope:**
- Marketing landing page
- Multi-step setup wizard form
- Config generation from form data
- Automated Vercel deployment via API
- Edit flow with magic link auth
- Template repo cleanup (strip backend code)

**Out of scope (future):**
- Custom domains for schools (they can set this up in Vercel manually, or we add it later)
- Announcements / admin panel (could return as a premium feature)
- Analytics dashboard (how many students use each school's site)
- Multi-tenant architecture (revisit if >10 schools)
- School-to-school feature differences beyond config toggles

## Open Questions

None — all decisions resolved during brainstorming.
