import type { SchoolConfig } from "./lib/types/config";

// ============================================================================
// SCHOOL CONFIGURATION
// ============================================================================
//
// This is the ONLY file you need to edit to set up this app for your school.
// Everything — your school name, colors, bell schedule, lunch waves — is
// controlled from here. Change the values below and the entire app updates.
//
// If you get stuck, scroll to the bottom of this file for complete examples
// you can copy-paste and adapt.
//
// ============================================================================

const config: SchoolConfig = {

  // ── YOUR SCHOOL'S INFO ────────────────────────────
  // These strings show up in the navbar, page titles, SEO tags, etc.

  school: {
    name: "Lake Highland Preparatory School",   // full official name
    shortName: "Lake Highland Prep",            // casual name used in descriptions
    acronym: "LHP",                             // 2-4 letter abbreviation
    mascot: "Highlanders",                      // school mascot name
    appName: "HighlanderWatch",                 // what the app is called (shows in navbar)
    domain: "lakehighlandprep.org",             // production URL (no https://)
    logoPath: "/logo.jpg",                      // path to your logo in the /public folder
    academicYear: "2026-2027",                  // shown on the events page
  },

  // ── LOCATION ──────────────────────────────────────
  // Used for SEO meta tags. Helps your site show up in local search results.

  location: {
    city: "Orlando",
    state: "Florida",
    stateCode: "FL",      // two-letter state code
    country: "US",        // two-letter country code
  },

  // ── COLORS ────────────────────────────────────────
  // Your school colors. These are used for buttons, badges, accent text,
  // progress rings, and the dark mode background.
  //
  // Use hex codes like "#003da5" or rgba like "rgba(10, 22, 50, 0.85)".
  // Tip: search "[your school] brand colors" to find the exact hex codes.

  colors: {
    primary: "#003da5",                         // main school color (nav, headings)
    primaryLight: "#1a5fc7",                    // lighter version of primary
    accent: "#003da5",                          // buttons, badges, active states
    accentLight: "#1a5fc7",                     // lighter accent (hover states, gradients)
    darkBg: "#0a1628",                          // dark mode page background
    darkSurface: "rgba(10, 22, 50, 0.85)",      // dark mode card background
  },

  // ── LOCAL STORAGE PREFIX ──────────────────────────
  // All user preferences (theme, lunch wave, todos) are saved in the browser
  // under keys like "highlanderwatch-theme". Change this to your app name
  // (lowercase, no spaces) so it doesn't conflict with other sites.

  storagePrefix: "highlanderwatch",

  // ── BELL SCHEDULE ─────────────────────────────────
  //
  // This is the most important section. It tells the app what periods your
  // school has and when they start/end, so the countdown timer works.
  //
  // HOW IT WORKS:
  //
  //   1. "dayTypes" — Define what kinds of days your school has.
  //      A simple school might have just one: "Regular Day" on Mon-Fri.
  //      A rotating school might have "Odd Day" on Tue/Thu and "Even Day" on Wed/Fri.
  //
  //   2. "bells" — For each day type, list the periods and their times.
  //      Times use 24-hour format: "07:45" = 7:45 AM, "13:30" = 1:30 PM.
  //
  //   3. "dayTypeOverrides" — Override a specific date to use a different
  //      schedule. Example: a Tuesday that runs on a Monday schedule.
  //
  // If your school has LUNCH WAVES (different lunch times for different
  // grades), see the "lunchWaves" section below the schedule.
  //
  // If your school does NOT have lunch waves, just put all periods in
  // "shared" and leave "after" as an empty array []. See Example 1 below.

  schedule: {

    // ── Day Types ──────────────────────────────────
    // What kinds of schedule days does your school have?
    //
    // "id"       — a short unique name (used internally, no spaces)
    // "label"    — what students see: "Odd Day", "A Day", "Regular", etc.
    // "weekdays" — which days of the week use this schedule
    //              1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday
    //
    // If Monday has a unique schedule, give it its own entry.
    // If Tue and Thu are identical, group them: weekdays: [2, 4]

    dayTypes: [
      { id: "monday",   label: "All Periods", weekdays: [1] },
      { id: "odd",      label: "Odd Day",     weekdays: [2, 4] },
      { id: "even",     label: "Even Day",    weekdays: [3] },
      { id: "even_fri", label: "Even Day",    weekdays: [5] },
    ],

    // ── Bell Schedules ─────────────────────────────
    // For each day type above, list every period and its start/end time.
    // Times are in 24-hour format: "07:45" = 7:45 AM, "13:30" = 1:30 PM
    //
    // Each day type has three sections:
    //
    //   "shared"     — Periods BEFORE the lunch split. Every student has
    //                  these at the same time.
    //
    //   "lunchWaves" — (optional) If your school has lunch waves, define
    //                  the lunch + surrounding periods for each wave here.
    //                  The keys ("9/10", "11/12") must match the lunch wave
    //                  IDs in the "lunchWaves" config section below.
    //                  If your school has NO lunch waves, delete this
    //                  section entirely and put ALL periods in "shared".
    //
    //   "after"      — Periods AFTER the lunch split. Every student has
    //                  these at the same time. If there are no periods
    //                  after lunch, use an empty array: after: []

    bells: {

      // ── Monday: All 8 periods ──
      monday: {
        shared: [
          { name: "1st Period",   start: "07:45", end: "08:30" },
          { name: "2nd Period",   start: "08:35", end: "09:20" },
          { name: "3rd Period",   start: "09:25", end: "10:10" },
          { name: "4th Core/TOK", start: "10:15", end: "10:50" },
          { name: "5th Period",   start: "10:55", end: "11:40" },
        ],
        lunchWaves: {
          "9/10": [
            { name: "Lunch",      start: "11:45", end: "12:20" },
            { name: "6th Period", start: "12:25", end: "13:10" },
          ],
          "11/12": [
            { name: "6th Period", start: "11:45", end: "12:30" },
            { name: "Lunch",      start: "12:35", end: "13:10" },
          ],
        },
        after: [
          { name: "7th Period", start: "13:15", end: "14:00" },
          { name: "8th Period", start: "14:05", end: "14:50" },
        ],
      },

      // ── Odd Day (Tuesday & Thursday): periods 1, 3, 5, 7 ──
      odd: {
        shared: [
          { name: "1st Period", start: "07:45", end: "09:15" },
          { name: "3rd Period", start: "09:25", end: "10:55" },
        ],
        lunchWaves: {
          "9/10": [
            { name: "Lunch",      start: "11:00", end: "11:35" },
            { name: "5th Period", start: "11:40", end: "13:10" },
          ],
          "11/12": [
            { name: "5th Period", start: "11:00", end: "12:30" },
            { name: "Lunch",      start: "12:35", end: "13:10" },
          ],
        },
        after: [
          { name: "7th Period", start: "13:20", end: "14:50" },
        ],
      },

      // ── Even Day — Wednesday (early release) ──
      even: {
        shared: [
          { name: "2nd Period",   start: "07:45", end: "09:15" },
          { name: "4th Core/TOK", start: "09:20", end: "10:15" },
        ],
        lunchWaves: {
          "9/10": [
            { name: "Lunch",      start: "10:20", end: "10:55" },
            { name: "6th Period", start: "10:55", end: "12:25" },
          ],
          "11/12": [
            { name: "6th Period", start: "10:20", end: "11:50" },
            { name: "Lunch",      start: "11:50", end: "12:25" },
          ],
        },
        after: [
          { name: "8th Period", start: "12:30", end: "14:00" },
        ],
      },

      // ── Even Day — Friday (regular length) ──
      even_fri: {
        shared: [
          { name: "2nd Period",   start: "07:45", end: "09:15" },
          { name: "4th Core/TOK", start: "09:25", end: "10:55" },
        ],
        lunchWaves: {
          "9/10": [
            { name: "Lunch",      start: "11:00", end: "11:35" },
            { name: "6th Period", start: "11:40", end: "13:10" },
          ],
          "11/12": [
            { name: "6th Period", start: "11:00", end: "12:30" },
            { name: "Lunch",      start: "12:35", end: "13:10" },
          ],
        },
        after: [
          { name: "8th Period", start: "13:20", end: "14:50" },
        ],
      },
    },

    // ── Day Type Overrides ─────────────────────────
    // Use this to override specific dates when your school runs a
    // different schedule than normal.
    //
    // Example: If Tuesday Jan 6 runs a Monday schedule:
    //   { date: "2026-01-06", dayTypeId: "monday" }

    dayTypeOverrides: [],
  },

  // ── LUNCH WAVES ───────────────────────────────────
  //
  // If your school has different lunch times for different grades, define
  // them here. Students pick their wave and the schedule adjusts.
  //
  // "id"      — must match the keys in "lunchWaves" inside each bell
  //             schedule above (e.g., "9/10" and "11/12")
  // "label"   — what students see in the schedule page selector
  // "default" — which wave is selected by default
  //
  // If your school has NO lunch waves (everyone eats at the same time),
  // set options to an empty array:
  //   options: [],
  //   default: "",

  lunchWaves: {
    options: [
      { id: "9/10",  label: "Grades 9/10" },
      { id: "11/12", label: "Grades 11/12" },
    ],
    default: "11/12",
  },

  // ── CALENDAR ──────────────────────────────────────
  //
  // Your school's academic calendar. This controls three things:
  //
  //   1. "noSchoolDates" — Days when school is closed. The countdown timer
  //      won't run on these days and they'll show "No School Today".
  //      List each day individually, even for multi-day breaks.
  //
  //   2. "earlyDismissalDates" — Days with an early release. The dashboard
  //      shows an "Early Release" badge on these days.
  //
  //   3. "events" — Everything that shows up on the Events / Calendar page.
  //      These get loaded into the database when you run the seed command.
  //
  //      Event types:
  //        "event"             — general school event (orientation, dance, etc.)
  //        "no-school"         — holiday or break (also add to noSchoolDates above!)
  //        "early-dismissal"   — early release day (also add to earlyDismissalDates!)
  //        "exam"              — exam period
  //        "deadline"          — deadline
  //
  //      For multi-day events (like "Spring Break"), set "endDate" to the last day.
  //      The calendar page will show it as a range.
  //
  // All dates use "YYYY-MM-DD" format. Example: December 25 = "2025-12-25"

  calendar: {
    noSchoolDates: [
      // September
      { date: "2025-09-01", name: "Labor Day" },
      { date: "2025-09-19", name: "Conference Day" },
      // October
      { date: "2025-10-09", name: "Teacher Work Day" },
      { date: "2025-10-10", name: "Fall Break" },
      { date: "2025-10-13", name: "Fall Break" },
      // November
      { date: "2025-11-11", name: "Veterans Day" },
      { date: "2025-11-24", name: "Thanksgiving Break" },
      { date: "2025-11-25", name: "Thanksgiving Break" },
      { date: "2025-11-26", name: "Thanksgiving Break" },
      { date: "2025-11-27", name: "Thanksgiving Break" },
      { date: "2025-11-28", name: "Thanksgiving Break" },
      // December
      { date: "2025-12-19", name: "Teacher Work Day" },
      { date: "2025-12-22", name: "Winter Break" },
      { date: "2025-12-23", name: "Winter Break" },
      { date: "2025-12-24", name: "Winter Break" },
      { date: "2025-12-25", name: "Winter Break" },
      { date: "2025-12-26", name: "Winter Break" },
      { date: "2025-12-29", name: "Winter Break" },
      { date: "2025-12-30", name: "Winter Break" },
      { date: "2025-12-31", name: "Winter Break" },
      // January
      { date: "2026-01-01", name: "Winter Break" },
      { date: "2026-01-02", name: "Winter Break" },
      { date: "2026-01-05", name: "Teacher Work Day" },
      { date: "2026-01-19", name: "MLK Jr. Day" },
      { date: "2026-01-30", name: "Conference Day" },
      // February
      { date: "2026-02-13", name: "Presidents' Day Weekend" },
      { date: "2026-02-14", name: "Presidents' Day Weekend" },
      { date: "2026-02-15", name: "Presidents' Day Weekend" },
      { date: "2026-02-16", name: "Presidents' Day Weekend" },
      // March
      { date: "2026-03-13", name: "Teacher Work Day" },
      { date: "2026-03-16", name: "Spring Break" },
      { date: "2026-03-17", name: "Spring Break" },
      { date: "2026-03-18", name: "Spring Break" },
      { date: "2026-03-19", name: "Spring Break" },
      { date: "2026-03-20", name: "Spring Break" },
      // April
      { date: "2026-04-13", name: "Hurricane Make-Up Day" },
    ],

    earlyDismissalDates: [
      { date: "2025-10-08", name: "Teacher Work Day" },
      { date: "2025-12-18", name: "Winter Break Eve" },
      { date: "2026-03-12", name: "Spring Break Eve" },
    ],

    events: [
      // August 2025
      { date: "2025-08-07", name: "Student Group Activity Day (Athletics, Fine Arts, SGA)", type: "event" },
      { date: "2025-08-08", name: "HS New Student/Family Orientation", type: "event" },
      { date: "2025-08-11", name: "LS New Family Orientation & Meet the Teacher / MS New Family Orientation", type: "event" },
      { date: "2025-08-12", name: "LS Returning Families Meet the Teacher / MS Back-to-School Social / HS Create Your Future Day", type: "event" },
      { date: "2025-08-13", name: "First Day of School (LS, 6th, 9th & new students)", type: "event" },
      { date: "2025-08-14", name: "First Day — All MS & HS Students", type: "event" },
      { date: "2025-08-25", name: "Middle School Back to School Night", type: "event" },
      { date: "2025-08-26", name: "High School Back to School Night", type: "event" },
      { date: "2025-08-27", name: "Lower School Back to School Night", type: "event" },
      // September 2025
      { date: "2025-09-01", name: "Labor Day", type: "no-school" },
      { date: "2025-09-05", name: "Laker Day — 25th Anniversary Celebration", type: "event" },
      { date: "2025-09-19", name: "Conference Day", type: "no-school" },
      // October 2025
      { date: "2025-10-08", name: "Early Dismissal — Teacher Work Day", type: "early-dismissal" },
      { date: "2025-10-09", name: "Teacher Work Day", type: "no-school" },
      { date: "2025-10-10", name: "Fall Break", type: "no-school", endDate: "2025-10-13" },
      // November 2025
      { date: "2025-11-11", name: "Veterans Day (Hurricane Make-Up Day)", type: "no-school" },
      { date: "2025-11-24", name: "Thanksgiving Break", type: "no-school", endDate: "2025-11-28" },
      // December 2025
      { date: "2025-12-18", name: "Early Dismissal", type: "early-dismissal" },
      { date: "2025-12-19", name: "Teacher Work Day", type: "no-school" },
      { date: "2025-12-22", name: "Winter Break", type: "no-school", endDate: "2026-01-02" },
      // January 2026
      { date: "2026-01-05", name: "Teacher Work Day", type: "no-school" },
      { date: "2026-01-06", name: "Classes Resume — Semester 2 Begins", type: "event" },
      { date: "2026-01-19", name: "MLK Jr. Day", type: "no-school" },
      { date: "2026-01-30", name: "Conference Day — No School for HS", type: "no-school" },
      // February 2026
      { date: "2026-02-13", name: "Presidents' Day Weekend", type: "no-school", endDate: "2026-02-16" },
      // March 2026
      { date: "2026-03-12", name: "Early Dismissal", type: "early-dismissal" },
      { date: "2026-03-13", name: "Teacher Work Day", type: "no-school" },
      { date: "2026-03-16", name: "Spring Break", type: "no-school", endDate: "2026-03-20" },
      // April 2026
      { date: "2026-04-13", name: "No School (Hurricane Make-Up Day)", type: "no-school" },
      { date: "2026-04-17", name: "Conference Day — HS in session", type: "event" },
      // May 2026
      { date: "2026-05-18", name: "Final Exams — Early Dismissal", type: "exam", endDate: "2026-05-22" },
      { date: "2026-05-22", name: "Last Day of School / HS Graduation 7 PM", type: "event" },
    ],
  },
  // ── FEATURES ───────────────────────────────────────
  //
  // Toggle optional features on or off. When a feature is off, its
  // navigation link is hidden. The pages still exist but aren't linked.
  //
  //   events        — Calendar page showing school events
  //   productivity  — Pomodoro timer, Wordle, Todos, Randomizer

  features: {
    events: true,
    productivity: true,
  },
};

export default config;

// ============================================================================
// Need help? Check the examples/ folder for complete starter configs:
//   examples/simple-school.config.ts   — Same schedule every day, no lunch waves
//   examples/block-schedule.config.ts  — A/B block schedule with lunch waves
//   examples/rotating-schedule.config.ts — Rotating odd/even days
// ============================================================================
