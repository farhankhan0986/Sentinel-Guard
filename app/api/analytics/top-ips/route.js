import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RequestLog from "@/models/RequestLog";

export async function GET() {
  await connectDB();

  const data = await RequestLog.aggregate([
    { $match: { blocked: true } },
    {
      $group: {
        _id: "$ip",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  return NextResponse.json({ data });
}
