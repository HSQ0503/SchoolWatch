import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  const body = await request.json();
  const { title, body: announcementBody, type, pinned, active, expiresAt } = body;

  const validTypes = ["info", "warning", "urgent"];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid announcement type" }, { status: 400 });
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(announcementBody && { body: announcementBody }),
      ...(type && { type }),
      ...(pinned !== undefined && { pinned }),
      ...(active !== undefined && { active }),
      expiresAt: expiresAt !== undefined ? expiresAt || null : undefined,
    },
  });
  return NextResponse.json(announcement);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
