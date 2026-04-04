// ============================================================================
// EXAMPLE: Simple school — same schedule every day, no lunch waves
// ============================================================================
//
// This is the easiest config to start with. It sets up:
//   - One schedule that runs Monday through Friday
//   - 7 periods with a single lunch (no lunch waves)
//   - A few example holidays and events
//
// To use this: copy this entire file and paste it over school.config.ts
// Then replace the school info, colors, and bell times with your own.
// ============================================================================

import type { SchoolConfig } from "../lib/types/config";

const config: SchoolConfig = {
  school: {
    name: "Lincoln High School",
    shortName: "Lincoln High",
    acronym: "LHS",
    mascot: "Lions",
    appName: "LionWatch",
    domain: "lionwatch.example.com",
    logoPath: "/logo.jpg",
    academicYear: "2025-2026",
  },

  location: {
    city: "Springfield",
    state: "Illinois",
    stateCode: "IL",
    country: "US",
  },

  colors: {
    primary: "#1a3c6e",
    primaryLight: "#2a5c9e",
    accent: "#c8102e",
    accentLight: "#e0334a",
    darkBg: "#0c1a2e",
    darkSurface: "rgba(12, 26, 46, 0.85)",
  },

  storagePrefix: "lionwatch",

  schedule: {
    // One day type for all weekdays — the simplest setup
    dayTypes: [
      { id: "regular", label: "Regular Day", weekdays: [1, 2, 3, 4, 5] },
    ],

    bells: {
      regular: {
        // When there are no lunch waves, put ALL periods in "shared"
        shared: [
          { name: "Period 1", start: "08:00", end: "08:50" },
          { name: "Period 2", start: "08:55", end: "09:45" },
          { name: "Period 3", start: "09:50", end: "10:40" },
          { name: "Lunch",    start: "10:45", end: "11:15" },
          { name: "Period 4", start: "11:20", end: "12:10" },
          { name: "Period 5", start: "12:15", end: "13:05" },
          { name: "Period 6", start: "13:10", end: "14:00" },
          { name: "Period 7", start: "14:05", end: "14:55" },
        ],
        // No lunch waves — leave "after" empty
        after: [],
      },
    },

    dayTypeOverrides: [],
  },

  // No lunch waves — everyone eats at the same time
  lunchWaves: {
    options: [],
    default: "",
  },

  calendar: {
    noSchoolDates: [
      { date: "2025-09-01", name: "Labor Day" },
      { date: "2025-11-27", name: "Thanksgiving Break" },
      { date: "2025-11-28", name: "Thanksgiving Break" },
      { date: "2025-12-22", name: "Winter Break" },
      { date: "2025-12-23", name: "Winter Break" },
      { date: "2025-12-24", name: "Winter Break" },
      { date: "2025-12-25", name: "Winter Break" },
      { date: "2025-12-26", name: "Winter Break" },
      { date: "2026-01-01", name: "New Year's Day" },
      { date: "2026-01-19", name: "MLK Jr. Day" },
      { date: "2026-03-16", name: "Spring Break" },
      { date: "2026-03-17", name: "Spring Break" },
      { date: "2026-03-18", name: "Spring Break" },
      { date: "2026-03-19", name: "Spring Break" },
      { date: "2026-03-20", name: "Spring Break" },
    ],

    earlyDismissalDates: [
      { date: "2025-12-19", name: "Last Day Before Break" },
    ],

    events: [
      { date: "2025-08-18", name: "First Day of School", type: "event" },
      { date: "2025-09-01", name: "Labor Day", type: "no-school" },
      { date: "2025-10-10", name: "Homecoming", type: "event" },
      { date: "2025-11-27", name: "Thanksgiving Break", type: "no-school", endDate: "2025-11-28" },
      { date: "2025-12-19", name: "Early Dismissal", type: "early-dismissal" },
      { date: "2025-12-22", name: "Winter Break", type: "no-school", endDate: "2026-01-02" },
      { date: "2026-01-19", name: "MLK Jr. Day", type: "no-school" },
      { date: "2026-03-16", name: "Spring Break", type: "no-school", endDate: "2026-03-20" },
      { date: "2026-05-29", name: "Last Day of School", type: "event" },
    ],
  },

  features: {
    announcements: true,
    events: true,
    productivity: true,
  },
};

export default config;
