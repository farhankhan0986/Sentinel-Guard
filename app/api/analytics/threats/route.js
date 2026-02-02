import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Threat from "@/models/Threat";

export async function GET() {
  await connectDB();

  const data = await Threat.aggregate([
    {
      $group: {
        _id: null,
        avgThreatScore: { $avg: "$threatScore" },
        maxThreatScore: { $max: "$threatScore" },
      },
    },
  ]);

  return NextResponse.json({ data });
}
