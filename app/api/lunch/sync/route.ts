import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeekSunday, formatLunchDate } from "@/lib/lunch";
import { verifyAdmin } from "@/lib/auth";

const FLIK_BASE =
  "https://wps.api.flikisdining.com/menu/api/weeks/school/windermere-prep-school/menu-type/lunch";

export async function GET(request: NextRequest) {
  // Allow Vercel Cron (via CRON_SECRET) or admin auth
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Authorized via cron secret
  } else {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results: { week: string; status: string }[] = [];

  try {
    // Fetch current week + next week
    for (let offset = 0; offset <= 1; offset++) {
      const target = new Date();
      target.setDate(target.getDate() + offset * 7);

      const sunday = getWeekSunday(target);
      const d = new Date(sunday + "T12:00:00");
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();

      const url = `${FLIK_BASE}/${year}/${month}/${day}/`;

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        results.push({ week: sunday, status: `error-${res.status}` });
        continue;
      }

      const data = await res.json();

      await prisma.lunchMenu.upsert({
        where: { weekStart: sunday },
        update: { days: data.days },
        create: { weekStart: sunday, days: data.days },
      });

      results.push({ week: sunday, status: "synced" });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Lunch sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync lunch menu" },
      { status: 500 },
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  // For POST, allow fetching a specific date
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const dateStr = body.date || formatLunchDate(new Date());

  const target = new Date(dateStr + "T12:00:00");
  const sunday = getWeekSunday(target);
  const d = new Date(sunday + "T12:00:00");
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const url = `${FLIK_BASE}/${year}/${month}/${day}/`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Flik API returned ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();

    await prisma.lunchMenu.upsert({
      where: { weekStart: sunday },
      update: { days: data.days },
      create: { weekStart: sunday, days: data.days },
    });

    return NextResponse.json({ success: true, week: sunday });
  } catch (error) {
    console.error("Lunch sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync lunch menu" },
      { status: 500 },
    );
  }
}
