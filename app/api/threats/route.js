import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Threat from "@/models/Threat";
import { analyzeThreat } from "@/lib/security/threatEngine";

export async function POST(req) {
  try {
    await connectDB();

    const { ip, status, blocked } = await req.json();

    let threat = await Threat.findOne({ ip });

    const analysis = analyzeThreat({
      ip,
      status,
      blocked,
      existingThreat: threat,
    });

    if (!threat) {
      threat = await Threat.create({
        ip,
        threatScore: analysis.threatScore,
        blockedUntil: analysis.blockedUntil,
        reasons: analysis.reasons,
      });
    } else {
      threat.threatScore = analysis.threatScore;
      threat.blockedUntil = analysis.blockedUntil;
      threat.reasons = analysis.reasons;
      threat.lastDetectedAt = new Date();
      await threat.save();
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Threat analysis failed" },
      { status: 500 },
    );
  }
}
