import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeekSunday } from "@/lib/lunch";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");

  const target = dateParam
    ? new Date(dateParam + "T12:00:00")
    : new Date();
  const weekStart = getWeekSunday(target);

  const menu = await prisma.lunchMenu.findUnique({
    where: { weekStart },
  });

  if (!menu) {
    return NextResponse.json(
      { error: "No menu available for this week" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    weekStart: menu.weekStart,
    days: menu.days,
    updatedAt: menu.updatedAt,
  });
}
