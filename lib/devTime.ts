/**
 * Dev-only time override via URL query params.
 * Usage: ?devTime=10:30&devDay=2
 * devDay: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
 */
export function getDevDate(realNow: Date): Date {
  if (process.env.NODE_ENV !== "development") return realNow;
  if (typeof window === "undefined") return realNow;

  const params = new URLSearchParams(window.location.search);
  const devTime = params.get("devTime");
  const devDay = params.get("devDay");

  if (!devTime && !devDay) return realNow;

  const fakeDate = new Date(realNow);

  if (devDay) {
    const targetDay = parseInt(devDay);
    if (targetDay >= 1 && targetDay <= 5) {
      // Known in-session week: Feb 2=Mon, Feb 3=Tue, ..., Feb 6=Fri (2026)
      fakeDate.setFullYear(2026, 1, 1 + targetDay);
    }
  }

  if (devTime) {
    const [h, m] = devTime.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      fakeDate.setHours(h, m, realNow.getSeconds());
    }
  }

  return fakeDate;
}
