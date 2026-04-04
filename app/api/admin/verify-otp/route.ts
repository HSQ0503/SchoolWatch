import { NextRequest, NextResponse } from "next/server";
import {
  verifyPendingRequest,
  createToken,
  createSessionResponse,
  clearPendingCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const pending = verifyPendingRequest(request);
  if (!pending) {
    return NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 }
    );
  }

  const { code } = await request.json();
  if (!code) {
    return NextResponse.json(
      { error: "Verification code required" },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { id: pending.adminId },
  });

  if (!admin || !admin.otpCode || !admin.otpExpiresAt) {
    return NextResponse.json(
      { error: "No pending verification. Please log in again." },
      { status: 400 }
    );
  }

  if (admin.otpAttempts >= MAX_OTP_ATTEMPTS) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { otpCode: null, otpExpiresAt: null, otpAttempts: 0 },
    });
    return NextResponse.json(
      { error: "Too many attempts. Please log in again." },
      { status: 429 }
    );
  }

  if (new Date() > admin.otpExpiresAt) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { otpCode: null, otpExpiresAt: null, otpAttempts: 0 },
    });
    return NextResponse.json(
      { error: "Code expired. Please log in again." },
      { status: 400 }
    );
  }

  if (code !== admin.otpCode) {
    const attempts = admin.otpAttempts + 1;
    await prisma.admin.update({
      where: { id: admin.id },
      data: { otpAttempts: attempts },
    });
    const remaining = MAX_OTP_ATTEMPTS - attempts;
    return NextResponse.json(
      {
        error: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      },
      { status: 400 }
    );
  }

  // OTP valid — clear OTP fields and grant full session
  await prisma.admin.update({
    where: { id: admin.id },
    data: { otpCode: null, otpExpiresAt: null, otpAttempts: 0 },
  });

  const token = createToken(admin.id, admin.email);
  const response = createSessionResponse(
    { success: true, email: admin.email },
    token
  );
  clearPendingCookie(response);
  return response;
}
