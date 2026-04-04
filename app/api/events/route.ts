import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const events = await prisma.schoolEvent.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  const body = await request.json();
  const { date, name, type, endDate } = body;

  if (!date || !name || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validTypes = ["no-school", "early-dismissal", "event", "exam", "deadline"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const event = await prisma.schoolEvent.create({
    data: { date, name, type, endDate: endDate || null },
  });
  return NextResponse.json(event, { status: 201 });
}
