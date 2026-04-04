// ============================================================
// Schedule Data (ported from lib/schedule.ts)
// ============================================================

const NO_SCHOOL_DATES = [
  "2025-09-01", "2025-09-19",
  "2025-10-09", "2025-10-10", "2025-10-13",
  "2025-11-11",
  "2025-11-24", "2025-11-25", "2025-11-26", "2025-11-27", "2025-11-28",
  "2025-12-19",
  "2025-12-22", "2025-12-23", "2025-12-24", "2025-12-25", "2025-12-26",
  "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02",
  "2026-01-05", "2026-01-19", "2026-01-30",
  "2026-02-13", "2026-02-14", "2026-02-15", "2026-02-16",
  "2026-03-13",
  "2026-03-16", "2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20",
  "2026-04-13",
];

const EIGHT_PERIOD_OVERRIDES = [];

const MONDAY_BEFORE = [
  { name: "1st Period", start: "07:45", end: "08:30" },
  { name: "2nd Period", start: "08:35", end: "09:20" },
  { name: "3rd Period", start: "09:25", end: "10:10" },
  { name: "4th Core/TOK", start: "10:15", end: "10:50" },
  { name: "5th Period", start: "10:55", end: "11:40" },
];
const MONDAY_910 = [
  { name: "Lunch", start: "11:45", end: "12:20" },
  { name: "6th Period", start: "12:25", end: "13:10" },
];
const MONDAY_1112 = [
  { name: "6th Period", start: "11:45", end: "12:30" },
  { name: "Lunch", start: "12:35", end: "13:10" },
];
const MONDAY_AFTER = [
  { name: "7th Period", start: "13:15", end: "14:00" },
  { name: "8th Period", start: "14:05", end: "14:50" },
];

const ODD_BEFORE = [
  { name: "1st Period", start: "07:45", end: "09:15" },
  { name: "3rd Period", start: "09:25", end: "10:55" },
];
const ODD_910 = [
  { name: "Lunch", start: "11:00", end: "11:35" },
  { name: "5th Period", start: "11:40", end: "13:10" },
];
const ODD_1112 = [
  { name: "5th Period", start: "11:00", end: "12:30" },
  { name: "Lunch", start: "12:35", end: "13:10" },
];
const ODD_AFTER = [{ name: "7th Period", start: "13:20", end: "14:50" }];

const WED_BEFORE = [
  { name: "2nd Period", start: "07:45", end: "09:15" },
  { name: "4th Core/TOK", start: "09:20", end: "10:15" },
];
const WED_910 = [
  { name: "Lunch", start: "10:20", end: "10:55" },
  { name: "6th Period", start: "10:55", end: "12:25" },
];
const WED_1112 = [
  { name: "6th Period", start: "10:20", end: "11:50" },
  { name: "Lunch", start: "11:50", end: "12:25" },
];
const WED_AFTER = [{ name: "8th Period", start: "12:30", end: "14:00" }];

const FRI_BEFORE = [
  { name: "2nd Period", start: "07:45", end: "09:15" },
  { name: "4th Core/TOK", start: "09:25", end: "10:55" },
];
const FRI_910 = [
  { name: "Lunch", start: "11:00", end: "11:35" },
  { name: "6th Period", start: "11:40", end: "13:10" },
];
const FRI_1112 = [
  { name: "6th Period", start: "11:00", end: "12:30" },
  { name: "Lunch", start: "12:35", end: "13:10" },
];
const FRI_AFTER = [{ name: "8th Period", start: "13:20", end: "14:50" }];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ============================================================
// Helper Functions
// ============================================================

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatCountdown(seconds) {
  if (seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isNoSchoolDate(dateStr) {
  return NO_SCHOOL_DATES.includes(dateStr);
}

function isEightPeriodOverride(dateStr) {
  return EIGHT_PERIOD_OVERRIDES.includes(dateStr);
}

function getEffectiveDayOfWeek(date) {
  const dateStr = formatDateStr(date);
  if (isEightPeriodOverride(dateStr)) return 1;
  return date.getDay();
}

function getDayType(dayOfWeek) {
  switch (dayOfWeek) {
    case 0: case 6: return null;
    case 1: return "monday";
    case 2: case 4: return "odd";
    case 3: case 5: return "even";
    default: return null;
  }
}

function getDayTypeLabel(dayType) {
  switch (dayType) {
    case "monday": return "All Periods";
    case "odd": return "Odd Day";
    case "even": return "Even Day";
  }
}

function getScheduleForDay(dayOfWeek, lunchWave) {
  const is910 = lunchWave === "9/10";
  switch (dayOfWeek) {
    case 1: return [...MONDAY_BEFORE, ...(is910 ? MONDAY_910 : MONDAY_1112), ...MONDAY_AFTER];
    case 2: case 4: return [...ODD_BEFORE, ...(is910 ? ODD_910 : ODD_1112), ...ODD_AFTER];
    case 3: return [...WED_BEFORE, ...(is910 ? WED_910 : WED_1112), ...WED_AFTER];
    case 5: return [...FRI_BEFORE, ...(is910 ? FRI_910 : FRI_1112), ...FRI_AFTER];
    default: return [];
  }
}

function getCurrentPeriod(schedule, now) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const period of schedule) {
    if (minutes >= timeToMinutes(period.start) && minutes < timeToMinutes(period.end)) {
      return period;
    }
  }
  return null;
}

function getTimeRemaining(period, now) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return (timeToMinutes(period.end) - nowMinutes) * 60 - now.getSeconds();
}

function getNextPeriod(schedule, now) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const period of schedule) {
    if (timeToMinutes(period.start) > minutes) return period;
  }
  return null;
}

function getPeriodProgress(period, now) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const start = timeToMinutes(period.start);
  const end = timeToMinutes(period.end);
  return Math.min(1, Math.max(0, (nowMinutes - start) / (end - start)));
}

function isSchoolOver(schedule, now) {
  if (schedule.length === 0) return true;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= timeToMinutes(schedule[schedule.length - 1].end);
}

function isBeforeSchool(schedule, now) {
  if (schedule.length === 0) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes < timeToMinutes(schedule[0].start);
}

function getSchoolStartCountdown(schedule, now) {
  if (schedule.length === 0) return 0;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return (timeToMinutes(schedule[0].start) - nowMinutes) * 60 - now.getSeconds();
}

function getPassingTimeInfo(schedule, now) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const seconds = now.getSeconds();
  for (let i = 1; i < schedule.length; i++) {
    const prevEnd = timeToMinutes(schedule[i - 1].end);
    const nextStart = timeToMinutes(schedule[i].start);
    if (minutes >= prevEnd && minutes < nextStart) {
      return { nextPeriod: schedule[i], secondsUntil: (nextStart - minutes) * 60 - seconds };
    }
  }
  return null;
}

function getNextSchoolDay(from) {
  const next = new Date(from);
  for (let i = 0; i < 30; i++) {
    next.setDate(next.getDate() + 1);
    const dow = next.getDay();
    if (dow === 0 || dow === 6) continue;
    const dateStr = formatDateStr(next);
    if (isNoSchoolDate(dateStr)) continue;
    const effectiveDow = isEightPeriodOverride(dateStr) ? 1 : dow;
    const dayType = getDayType(effectiveDow);
    if (!dayType) continue;
    return {
      dayName: DAY_NAMES[dow],
      dayType,
      label: getDayTypeLabel(dayType),
      isTomorrow: i === 0,
    };
  }
  return null;
}

// ============================================================
// SVG Ring Helper
// ============================================================

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function createRingHTML(progress, countdownStr, isLong) {
  const offset = CIRCUMFERENCE * (1 - progress);
  return `
    <div class="ring-container">
      <svg viewBox="0 0 200 200">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d43344"/>
            <stop offset="100%" stop-color="#b22234"/>
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="${RADIUS}" class="ring-bg"/>
        <circle cx="100" cy="100" r="${RADIUS}" class="ring-progress"
          stroke-dasharray="${CIRCUMFERENCE}"
          stroke-dashoffset="${offset}"/>
      </svg>
      <div class="countdown-text${isLong ? " small" : ""}">${countdownStr}</div>
    </div>`;
}

// ============================================================
// Badge Helper
// ============================================================

function badgeClass(dayType) {
  switch (dayType) {
    case "monday": return "badge badge-monday";
    case "odd": return "badge badge-odd";
    case "even": return "badge badge-even";
    default: return "badge";
  }
}

// ============================================================
// Render Functions
// ============================================================

function renderDayStatus(now) {
  const el = document.getElementById("day-status");
  const dayOfWeek = now.getDay();
  const dateStr = formatDateStr(now);

  // Weekend or no school
  if (dayOfWeek === 0 || dayOfWeek === 6 || isNoSchoolDate(dateStr)) {
    const next = getNextSchoolDay(now);
    let nextHTML = "";
    if (next) {
      nextHTML = `
        <div class="next-day-row">
          ${next.isTomorrow ? "Tomorrow" : next.dayName} is
          <span class="${badgeClass(next.dayType)}">${next.label}</span>
        </div>`;
    }
    el.innerHTML = `
      <p class="no-school-text">No School Today</p>
      <p class="subtext">Enjoy your time off!</p>
      ${nextHTML}`;
    return false;
  }

  const effectiveDow = getEffectiveDayOfWeek(now);
  const dayType = getDayType(effectiveDow);
  if (!dayType) { el.innerHTML = ""; return false; }

  const label = getDayTypeLabel(dayType);
  const earlyRelease = dayOfWeek === 3;

  el.innerHTML = `
    <p class="day-name">It's ${DAY_NAMES[dayOfWeek]}</p>
    <div class="badges">
      <span class="${badgeClass(dayType)}">${label}</span>
      ${earlyRelease ? '<span class="badge badge-early">Early Release</span>' : ""}
    </div>`;
  return true;
}

function renderTimer(now, lunchWave) {
  const el = document.getElementById("timer-section");
  const dayOfWeek = now.getDay();
  const dateStr = formatDateStr(now);

  if (dayOfWeek === 0 || dayOfWeek === 6 || isNoSchoolDate(dateStr)) {
    el.innerHTML = "";
    return;
  }

  const effectiveDow = getEffectiveDayOfWeek(now);
  const schedule = getScheduleForDay(effectiveDow, lunchWave);
  if (schedule.length === 0) { el.innerHTML = ""; return; }

  // School is over
  if (isSchoolOver(schedule, now)) {
    const next = getNextSchoolDay(now);
    let nextHTML = "";
    if (next) {
      nextHTML = `
        <div class="next-day-row" style="margin-top:8px">
          ${next.isTomorrow ? "Tomorrow" : next.dayName} is
          <span class="${badgeClass(next.dayType)}">${next.label}</span>
        </div>`;
    }
    el.innerHTML = `
      <p class="school-over-text">School's over — enjoy your evening!</p>
      ${nextHTML}`;
    return;
  }

  // Before school
  if (isBeforeSchool(schedule, now)) {
    const seconds = Math.max(0, getSchoolStartCountdown(schedule, now));
    el.innerHTML = `
      <p class="subtext">School starts in</p>
      <p class="countdown-inline">${formatCountdown(seconds)}</p>`;
    return;
  }

  // During a period
  const currentPeriod = getCurrentPeriod(schedule, now);
  if (currentPeriod) {
    const remaining = Math.max(0, getTimeRemaining(currentPeriod, now));
    const progress = getPeriodProgress(currentPeriod, now);
    const nextP = getNextPeriod(schedule, now);
    const isLong = remaining >= 3600;

    let nextHTML = "";
    if (nextP) {
      nextHTML = `<p class="next-period">Next up: <strong>${nextP.name}</strong> at ${formatTime(nextP.start)}</p>`;
    }

    el.innerHTML = `
      <p class="period-name">${currentPeriod.name}</p>
      ${createRingHTML(progress, formatCountdown(remaining), isLong)}
      ${nextHTML}`;
    return;
  }

  // Passing time
  const passingInfo = getPassingTimeInfo(schedule, now);
  if (passingInfo) {
    const seconds = Math.max(0, passingInfo.secondsUntil);
    el.innerHTML = `
      <p class="passing-label">Passing period — <strong>${passingInfo.nextPeriod.name}</strong> starts in</p>
      <p class="countdown-inline">${formatCountdown(seconds)}</p>`;
    return;
  }

  el.innerHTML = "";
}

// ============================================================
// Lunch Wave Toggle
// ============================================================

let lunchWave = "11/12";

function updateToggleUI() {
  const thumb = document.getElementById("toggle-thumb");
  const label910 = document.getElementById("wave-label-910");
  const label1112 = document.getElementById("wave-label-1112");

  if (lunchWave === "11/12") {
    thumb.classList.add("right");
    label1112.classList.add("active");
    label910.classList.remove("active");
  } else {
    thumb.classList.remove("right");
    label910.classList.add("active");
    label1112.classList.remove("active");
  }
}

function initLunchWave() {
  chrome.storage.local.get("lunchWave", (result) => {
    if (result.lunchWave === "9/10" || result.lunchWave === "11/12") {
      lunchWave = result.lunchWave;
    }
    updateToggleUI();
    tick();
  });

  document.getElementById("wave-toggle").addEventListener("click", () => {
    lunchWave = lunchWave === "9/10" ? "11/12" : "9/10";
    chrome.storage.local.set({ lunchWave });
    updateToggleUI();
    tick();
  });
}

// ============================================================
// Main Loop
// ============================================================

function tick() {
  const now = new Date();
  renderDayStatus(now);
  renderTimer(now, lunchWave);
}

initLunchWave();
setInterval(tick, 1000);
