import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "admin-session";
const PENDING_COOKIE_NAME = "pending-auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const PENDING_MAX_AGE = 60 * 10; // 10 minutes

type JWTPayload = {
  adminId: string;
  email: string;
};

type PendingPayload = JWTPayload & {
  type: "pending-otp";
};

export function getWhitelistedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailWhitelisted(email: string): boolean {
  return getWhitelistedEmails().includes(email.toLowerCase());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(adminId: string, email: string): string {
  return jwt.sign({ adminId, email }, JWT_SECRET, { expiresIn: "7d" });
}

export function createPendingToken(adminId: string, email: string): string {
  return jwt.sign({ adminId, email, type: "pending-otp" }, JWT_SECRET, {
    expiresIn: "10m",
  });
}

export function verifyPendingToken(token: string): PendingPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as PendingPayload;
    if (payload.type !== "pending-otp") return null;
    return payload;
  } catch {
    return null;
  }
}

function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyAdmin(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  // Re-check the email is still whitelisted
  if (!isEmailWhitelisted(payload.email)) return null;
  return payload;
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function createSessionResponse(
  body: object,
  token: string
): NextResponse {
  const response = NextResponse.json(body);
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}

export function clearSessionResponse(body: object): NextResponse {
  const response = NextResponse.json(body);
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function createPendingResponse(
  body: object,
  token: string
): NextResponse {
  const response = NextResponse.json(body);
  response.cookies.set(PENDING_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_MAX_AGE,
  });
  return response;
}

export function verifyPendingRequest(
  request: NextRequest
): PendingPayload | null {
  const token = request.cookies.get(PENDING_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyPendingToken(token);
}

export function clearPendingCookie(response: NextResponse): void {
  response.cookies.set(PENDING_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
