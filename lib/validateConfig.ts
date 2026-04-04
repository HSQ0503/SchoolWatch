import type { SchoolConfig } from "./types/config";

function fail(msg: string): never {
  throw new Error(`\n\n  Config Error: ${msg}\n`);
}

const TIME_RE = /^\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidTime(t: string): boolean {
  if (!TIME_RE.test(t)) return false;
  const [h, m] = t.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function isValidDate(d: string): boolean {
  if (!DATE_RE.test(d)) return false;
  const date = new Date(d + "T00:00:00");
  return !isNaN(date.getTime());
}

export function validateConfig(config: SchoolConfig): void {
  // ── School ──
  if (!config.school.name) fail('school.name is empty. Set your school\'s full name.');
  if (!config.school.appName) fail('school.appName is empty. Give your app a name (e.g., "EagleWatch").');
  if (!config.school.acronym) fail('school.acronym is empty. Set a 2-4 letter abbreviation.');

  // ── Schedule ──
  const { dayTypes, bells } = config.schedule;

  if (dayTypes.length === 0) {
    fail('schedule.dayTypes is empty. You need at least one day type (e.g., "Regular Day").');
  }

  const dayTypeIds = new Set(dayTypes.map((dt) => dt.id));

  for (const dt of dayTypes) {
    if (!dt.id) fail('A dayType has an empty id. Every day type needs a unique id like "regular" or "a_day".');
    if (!dt.label) fail(`dayType "${dt.id}" has an empty label. Set a display name like "Regular Day".`);
    if (dt.weekdays.length === 0) fail(`dayType "${dt.id}" has no weekdays. Add at least one (1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri).`);
    for (const w of dt.weekdays) {
      if (w < 0 || w > 6) fail(`dayType "${dt.id}" has invalid weekday ${w}. Use 0-6 (0=Sun, 1=Mon, ..., 6=Sat).`);
    }
  }

  // Check for duplicate weekday assignments
  const weekdayMap = new Map<number, string>();
  for (const dt of dayTypes) {
    for (const w of dt.weekdays) {
      if (weekdayMap.has(w)) {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        fail(`${dayNames[w]} (weekday ${w}) is assigned to both "${weekdayMap.get(w)}" and "${dt.id}". Each weekday can only belong to one day type.`);
      }
      weekdayMap.set(w, dt.id);
    }
  }

  // Check bells
  for (const dtId of dayTypeIds) {
    if (!bells[dtId]) {
      fail(`No bell schedule found for day type "${dtId}". Add a bells.${dtId} section with your periods.`);
    }
  }

  const lunchWaveIds = new Set(config.lunchWaves.options.map((o) => o.id));

  for (const [dtId, bell] of Object.entries(bells)) {
    if (!dayTypeIds.has(dtId)) {
      fail(`bells.${dtId} doesn't match any day type. Your day type ids are: ${[...dayTypeIds].join(", ")}`);
    }

    const allPeriods = [...bell.shared];

    // Validate lunch waves match config
    if (bell.lunchWaves) {
      for (const waveId of Object.keys(bell.lunchWaves)) {
        if (!lunchWaveIds.has(waveId)) {
          fail(`bells.${dtId}.lunchWaves has key "${waveId}" but there's no matching option in lunchWaves.options. Your options are: ${[...lunchWaveIds].join(", ") || "(none)"}`);
        }
        allPeriods.push(...bell.lunchWaves[waveId]);
      }
    }

    allPeriods.push(...bell.after);

    // Validate period times
    for (const p of allPeriods) {
      if (!p.name) fail(`bells.${dtId} has a period with an empty name.`);
      if (!isValidTime(p.start)) fail(`bells.${dtId} period "${p.name}" has invalid start time "${p.start}". Use 24-hour format like "07:45" or "13:30".`);
      if (!isValidTime(p.end)) fail(`bells.${dtId} period "${p.name}" has invalid end time "${p.end}". Use 24-hour format like "07:45" or "13:30".`);
    }
  }

  // ── Lunch Waves ──
  if (config.lunchWaves.options.length > 0 && !config.lunchWaves.default) {
    fail('lunchWaves.default is empty but you have options defined. Set a default like "9/10" or "a_lunch".');
  }

  if (config.lunchWaves.default && !lunchWaveIds.has(config.lunchWaves.default)) {
    fail(`lunchWaves.default "${config.lunchWaves.default}" doesn't match any option. Your options are: ${[...lunchWaveIds].join(", ")}`);
  }

  // ── Calendar dates ──
  for (const d of config.calendar.noSchoolDates) {
    if (!isValidDate(d.date)) fail(`calendar.noSchoolDates has invalid date "${d.date}". Use YYYY-MM-DD format like "2025-12-25".`);
  }
  for (const d of config.calendar.earlyDismissalDates) {
    if (!isValidDate(d.date)) fail(`calendar.earlyDismissalDates has invalid date "${d.date}". Use YYYY-MM-DD format like "2025-12-25".`);
  }
  for (const e of config.calendar.events) {
    if (!isValidDate(e.date)) fail(`calendar.events has invalid date "${e.date}" for "${e.name}". Use YYYY-MM-DD format like "2025-12-25".`);
    if (e.endDate && !isValidDate(e.endDate)) fail(`calendar.events "${e.name}" has invalid endDate "${e.endDate}". Use YYYY-MM-DD format.`);
  }
}
