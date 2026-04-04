// ============================================================================
// EXAMPLE: Block schedule — A/B days with two lunch waves
// ============================================================================
//
// This config sets up:
//   - Two day types: "A Day" on Mon/Wed/Fri, "B Day" on Tue/Thu
//   - 4 long block periods per day (90 minutes each)
//   - Two lunch waves: "A Lunch" and "B Lunch"
//   - Productivity tools disabled (to show the toggle working)
//
// To use this: copy this entire file and paste it over school.config.ts
// Then replace the school info, colors, and bell times with your own.
// ============================================================================

import type { SchoolConfig } from "../lib/types/config";

const config: SchoolConfig = {
  school: {
    name: "Jefferson Academy",
    shortName: "Jefferson",
    acronym: "JA",
    mascot: "Eagles",
    appName: "EagleWatch",
    domain: "eaglewatch.example.com",
    logoPath: "/logo.jpg",
    academicYear: "2025-2026",
  },

  location: {
    city: "Denver",
    state: "Colorado",
    stateCode: "CO",
    country: "US",
  },

  colors: {
    primary: "#003366",
    primaryLight: "#1a5599",
    accent: "#cc8400",
    accentLight: "#e6a020",
    darkBg: "#0a1628",
    darkSurface: "rgba(10, 22, 40, 0.85)",
  },

  storagePrefix: "eaglewatch",

  schedule: {
    // A/B block schedule: two day types alternating through the week
    dayTypes: [
      { id: "a_day", label: "A Day", weekdays: [1, 3, 5] },
      { id: "b_day", label: "B Day", weekdays: [2, 4] },
    ],

    bells: {
      a_day: {
        shared: [
          { name: "Period 1", start: "08:00", end: "09:30" },
          { name: "Period 2", start: "09:40", end: "11:10" },
        ],
        lunchWaves: {
          "a_lunch": [
            { name: "Lunch",    start: "11:15", end: "11:45" },
            { name: "Period 3", start: "11:50", end: "13:20" },
          ],
          "b_lunch": [
            { name: "Period 3", start: "11:15", end: "12:45" },
            { name: "Lunch",    start: "12:50", end: "13:20" },
          ],
        },
        after: [
          { name: "Period 4", start: "13:30", end: "15:00" },
        ],
      },

      b_day: {
        shared: [
          { name: "Period 5", start: "08:00", end: "09:30" },
          { name: "Period 6", start: "09:40", end: "11:10" },
        ],
        lunchWaves: {
          "a_lunch": [
            { name: "Lunch",    start: "11:15", end: "11:45" },
            { name: "Period 7", start: "11:50", end: "13:20" },
          ],
          "b_lunch": [
            { name: "Period 7", start: "11:15", end: "12:45" },
            { name: "Lunch",    start: "12:50", end: "13:20" },
          ],
        },
        after: [
          { name: "Period 8", start: "13:30", end: "15:00" },
        ],
      },
    },

    dayTypeOverrides: [],
  },

  lunchWaves: {
    options: [
      { id: "a_lunch", label: "A Lunch" },
      { id: "b_lunch", label: "B Lunch" },
    ],
    default: "a_lunch",
  },

  calendar: {
    noSchoolDates: [
      { date: "2025-09-01", name: "Labor Day" },
      { date: "2025-11-24", name: "Thanksgiving Break" },
      { date: "2025-11-25", name: "Thanksgiving Break" },
      { date: "2025-11-26", name: "Thanksgiving Break" },
      { date: "2025-11-27", name: "Thanksgiving Break" },
      { date: "2025-11-28", name: "Thanksgiving Break" },
      { date: "2025-12-22", name: "Winter Break" },
      { date: "2025-12-23", name: "Winter Break" },
      { date: "2025-12-24", name: "Winter Break" },
      { date: "2025-12-25", name: "Winter Break" },
      { date: "2025-12-26", name: "Winter Break" },
      { date: "2026-01-19", name: "MLK Jr. Day" },
      { date: "2026-02-16", name: "Presidents' Day" },
      { date: "2026-03-17", name: "Spring Break" },
      { date: "2026-03-18", name: "Spring Break" },
      { date: "2026-03-19", name: "Spring Break" },
      { date: "2026-03-20", name: "Spring Break" },
      { date: "2026-03-21", name: "Spring Break" },
    ],

    earlyDismissalDates: [],

    events: [
      { date: "2025-08-20", name: "First Day of School", type: "event" },
      { date: "2025-09-01", name: "Labor Day", type: "no-school" },
      { date: "2025-11-24", name: "Thanksgiving Break", type: "no-school", endDate: "2025-11-28" },
      { date: "2025-12-22", name: "Winter Break", type: "no-school", endDate: "2026-01-02" },
      { date: "2026-01-19", name: "MLK Jr. Day", type: "no-school" },
      { date: "2026-02-16", name: "Presidents' Day", type: "no-school" },
      { date: "2026-03-17", name: "Spring Break", type: "no-school", endDate: "2026-03-21" },
      { date: "2026-05-22", name: "Last Day of School", type: "event" },
    ],
  },

  features: {
    announcements: true,
    events: true,
    productivity: false,   // Disabled — shows how to toggle features off
  },
};

export default config;
