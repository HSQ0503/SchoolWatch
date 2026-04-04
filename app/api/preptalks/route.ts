import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const preptalks = await prisma.prepTalk.findMany({
    orderBy: { weekDate: "desc" },
  });
  return NextResponse.json(preptalks);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  const body = await request.json();
  const { title, youtubeUrl, weekDate, description } = body;

  if (!title || !youtubeUrl || !weekDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const preptalk = await prisma.prepTalk.create({
    data: { title, youtubeUrl, weekDate, description: description || null },
  });
  return NextResponse.json(preptalk, { status: 201 });
}
