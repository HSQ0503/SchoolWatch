import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const showAll = request.nextUrl.searchParams.get("all") === "true";

  if (showAll) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(announcements);
  }

  const now = new Date().toISOString();
  const announcements = await prisma.announcement.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  const body = await request.json();
  const { title, body: announcementBody, type, pinned, expiresAt } = body;

  if (!title || !announcementBody || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validTypes = ["info", "warning", "urgent"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid announcement type" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const activeCount = await prisma.announcement.count({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
  });
  if (activeCount >= 4) {
    return NextResponse.json({ error: "Maximum of 4 active announcements allowed" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      body: announcementBody,
      type,
      pinned: pinned ?? false,
      active: true,
      expiresAt: expiresAt || null,
    },
  });
  return NextResponse.json(announcement, { status: 201 });
}
