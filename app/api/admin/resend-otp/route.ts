import { NextRequest, NextResponse } from "next/server";
import { verifyPendingRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOtp, sendOtpEmail } from "@/lib/email";

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export async function POST(request: NextRequest) {
  const pending = verifyPendingRequest(request);
  if (!pending) {
    return NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { id: pending.adminId },
  });

  if (!admin) {
    return NextResponse.json(
      { error: "Account not found" },
      { status: 400 }
    );
  }

  // Rate limit: check if last OTP was sent less than 60 seconds ago
  if (admin.otpExpiresAt) {
    const otpSentAt = new Date(admin.otpExpiresAt.getTime() - 5 * 60 * 1000);
    if (Date.now() - otpSentAt.getTime() < RESEND_COOLDOWN_MS) {
      return NextResponse.json(
        { error: "Please wait before requesting a new code" },
        { status: 429 }
      );
    }
  }

  const otp = generateOtp();
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      otpCode: otp,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      otpAttempts: 0,
    },
  });

  await sendOtpEmail(admin.email, otp);

  return NextResponse.json({ success: true });
}
