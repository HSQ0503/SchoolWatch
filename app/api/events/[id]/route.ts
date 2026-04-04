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
  const { date, name, type, endDate } = body;

  const validTypes = ["no-school", "early-dismissal", "event", "exam", "deadline"];
  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const event = await prisma.schoolEvent.update({
    where: { id },
    data: {
      ...(date && { date }),
      ...(name && { name }),
      ...(type && { type }),
      endDate: endDate !== undefined ? endDate || null : undefined,
    },
  });
  return NextResponse.json(event);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  await prisma.schoolEvent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
