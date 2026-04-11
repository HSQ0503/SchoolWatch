// ============================================================================
// EXAMPLE: Rotating schedule with odd/even days and grade-based lunch waves
// ============================================================================
//
// This config sets up:
//   - 4 day types: Monday (all periods), Odd (Tue/Thu), Even (Wed), Even (Fri)
//   - Grade-based lunch waves (9/10 and 11/12)
//   - Full academic calendar with holidays, breaks, and events
//
// This is based on Windermere Preparatory School's actual schedule.
//
// To use this: copy this entire file and paste it over school.config.ts
// Then replace the school info, colors, and bell times with your own.
// ============================================================================

import type { SchoolConfig } from "../lib/types/config";

const config: SchoolConfig = {
  school: {
    name: "Windermere Preparatory School",
    shortName: "Windermere Prep",
    acronym: "WPS",
    mascot: "Lakers",
    appName: "LakerWatch",
    domain: "lakerwatch.com",
    logoPath: "/logo.jpg",
    academicYear: "2025-2026",
  },

  location: {
    city: "Windermere",
    state: "Florida",
    stateCode: "FL",
    country: "US",
  },

  colors: {
    light: {
      navbar: "#ffffff",
      navText: "#1b2b5e",
      background: "#f5f7fa",
      heading: "#1b2b5e",
      ring: "#b22234",
      surface: "#ffffff",
      cardAccent: "#b22234",
      badge: "#b22234",
    },
    dark: {
      navbar: "#0a1628",
      navText: "#ffffff",
      background: "#0a1628",
      heading: "#f1f5f9",
      ring: "#d43344",
      surface: "#111a2c",
      cardAccent: "#b22234",
      badge: "#b22234",
    },
  },

  storagePrefix: "lakerwatch",

  schedule: {
    dayTypes: [
      { id: "monday",   label: "All Periods", weekdays: [1] },
      { id: "odd",      label: "Odd Day",     weekdays: [2, 4] },
      { id: "even",     label: "Even Day",    weekdays: [3] },
      { id: "even_fri", label: "Even Day",    weekdays: [5] },
    ],

    bells: {
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

    dayTypeOverrides: [],
  },

  lunchWaves: {
    options: [
      { id: "9/10",  label: "Grades 9/10" },
      { id: "11/12", label: "Grades 11/12" },
    ],
    default: "11/12",
  },

  calendar: {
    noSchoolDates: [
      { date: "2025-09-01", name: "Labor Day" },
      { date: "2025-09-19", name: "Conference Day" },
      { date: "2025-10-09", name: "Teacher Work Day" },
      { date: "2025-10-10", name: "Fall Break" },
      { date: "2025-10-13", name: "Fall Break" },
      { date: "2025-11-11", name: "Veterans Day" },
      { date: "2025-11-24", name: "Thanksgiving Break" },
      { date: "2025-11-25", name: "Thanksgiving Break" },
      { date: "2025-11-26", name: "Thanksgiving Break" },
      { date: "2025-11-27", name: "Thanksgiving Break" },
      { date: "2025-11-28", name: "Thanksgiving Break" },
      { date: "2025-12-19", name: "Teacher Work Day" },
      { date: "2025-12-22", name: "Winter Break" },
      { date: "2025-12-23", name: "Winter Break" },
      { date: "2025-12-24", name: "Winter Break" },
      { date: "2025-12-25", name: "Winter Break" },
      { date: "2025-12-26", name: "Winter Break" },
      { date: "2025-12-29", name: "Winter Break" },
      { date: "2025-12-30", name: "Winter Break" },
      { date: "2025-12-31", name: "Winter Break" },
      { date: "2026-01-01", name: "Winter Break" },
      { date: "2026-01-02", name: "Winter Break" },
      { date: "2026-01-05", name: "Teacher Work Day" },
      { date: "2026-01-19", name: "MLK Jr. Day" },
      { date: "2026-01-30", name: "Conference Day" },
      { date: "2026-02-13", name: "Presidents' Day Weekend" },
      { date: "2026-02-14", name: "Presidents' Day Weekend" },
      { date: "2026-02-15", name: "Presidents' Day Weekend" },
      { date: "2026-02-16", name: "Presidents' Day Weekend" },
      { date: "2026-03-13", name: "Teacher Work Day" },
      { date: "2026-03-16", name: "Spring Break" },
      { date: "2026-03-17", name: "Spring Break" },
      { date: "2026-03-18", name: "Spring Break" },
      { date: "2026-03-19", name: "Spring Break" },
      { date: "2026-03-20", name: "Spring Break" },
      { date: "2026-04-13", name: "Hurricane Make-Up Day" },
    ],

    earlyDismissalDates: [
      { date: "2025-10-08", name: "Teacher Work Day" },
      { date: "2025-12-18", name: "Winter Break Eve" },
      { date: "2026-03-12", name: "Spring Break Eve" },
    ],

    events: [
      { date: "2025-08-13", name: "First Day of School", type: "event" },
      { date: "2025-09-01", name: "Labor Day", type: "no-school" },
      { date: "2025-09-19", name: "Conference Day", type: "no-school" },
      { date: "2025-10-08", name: "Early Dismissal", type: "early-dismissal" },
      { date: "2025-10-10", name: "Fall Break", type: "no-school", endDate: "2025-10-13" },
      { date: "2025-11-11", name: "Veterans Day", type: "no-school" },
      { date: "2025-11-24", name: "Thanksgiving Break", type: "no-school", endDate: "2025-11-28" },
      { date: "2025-12-18", name: "Early Dismissal", type: "early-dismissal" },
      { date: "2025-12-22", name: "Winter Break", type: "no-school", endDate: "2026-01-02" },
      { date: "2026-01-06", name: "Classes Resume", type: "event" },
      { date: "2026-01-19", name: "MLK Jr. Day", type: "no-school" },
      { date: "2026-02-13", name: "Presidents' Day Weekend", type: "no-school", endDate: "2026-02-16" },
      { date: "2026-03-12", name: "Early Dismissal", type: "early-dismissal" },
      { date: "2026-03-16", name: "Spring Break", type: "no-school", endDate: "2026-03-20" },
      { date: "2026-05-22", name: "Last Day of School", type: "event" },
    ],
  },

  features: {
    events: true,
    productivity: true,
  },
};

export default config;
