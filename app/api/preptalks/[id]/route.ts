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
  const { title, youtubeUrl, weekDate, description } = body;

  const preptalk = await prisma.prepTalk.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(youtubeUrl && { youtubeUrl }),
      ...(weekDate && { weekDate }),
      description: description !== undefined ? description || null : undefined,
    },
  });
  return NextResponse.json(preptalk);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  await prisma.prepTalk.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
