import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, email: admin.email });
}
