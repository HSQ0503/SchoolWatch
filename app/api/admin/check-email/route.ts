import { NextRequest, NextResponse } from "next/server";
import { isEmailWhitelisted } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  if (!isEmailWhitelisted(normalized)) {
    return NextResponse.json({ status: "not_whitelisted" });
  }

  const existing = await prisma.admin.findUnique({
    where: { email: normalized },
  });

  return NextResponse.json({
    status: existing ? "registered" : "unregistered",
  });
}
