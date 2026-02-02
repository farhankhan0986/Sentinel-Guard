import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RequestLog from "@/models/RequestLog";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  await connectDB();

  const data = await RequestLog.aggregate([
    {
      $group: {
        _id: "$status", // 👈 "Allowed" | "Blocked"
        count: { $sum: 1 },
      },
    },
  ]);

  return NextResponse.json({ data });
}
