import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { likeDelta, dislikeDelta } = body;

  if (
    typeof likeDelta !== "number" ||
    typeof dislikeDelta !== "number" ||
    likeDelta < -1 || likeDelta > 1 ||
    dislikeDelta < -1 || dislikeDelta > 1
  ) {
    return NextResponse.json({ error: "Invalid deltas" }, { status: 400 });
  }

  const current = await prisma.prepTalk.findUnique({ where: { id }, select: { likes: true, dislikes: true } });
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newLikes = Math.max(0, current.likes + likeDelta);
  const newDislikes = Math.max(0, current.dislikes + dislikeDelta);

  const updated = await prisma.prepTalk.update({
    where: { id },
    data: { likes: newLikes, dislikes: newDislikes },
  });

  return NextResponse.json({ likes: updated.likes, dislikes: updated.dislikes });
}
