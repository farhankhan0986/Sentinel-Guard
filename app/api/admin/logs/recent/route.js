import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RequestLog from "@/models/RequestLog";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectDB();

  const logs = await RequestLog.find()
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  return NextResponse.json({ logs });
}
