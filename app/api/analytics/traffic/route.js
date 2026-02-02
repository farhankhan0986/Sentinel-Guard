import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RequestLog from "@/models/RequestLog";

export async function GET() {
  await connectDB();

  const data = await RequestLog.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d %H:00",
            date: "$createdAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json({ data });
}
