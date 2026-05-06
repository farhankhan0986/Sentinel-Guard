import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { resolveTenantFromApiKeyRequest } from "@/lib/auth/tenantScope";
import Threat from "@/models/Threat";
import { analyzeThreat } from "@/lib/security/threatEngine";

export async function POST(req) {
  try {
    await connectDB();

    const tenant = await resolveTenantFromApiKeyRequest(req);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not resolved" }, { status: 401 });
    }

    const { ip, blocked, reason, statusCode } = await req.json();
    const analysis = analyzeThreat({ blocked, reason, statusCode });

    const isClean = analysis.threatDelta === 0 && !blocked;

    if (isClean) {
      await Threat.findOneAndUpdate(
        { tenantId: tenant._id, ip },
        {
          $set: { threatScore: 0, lastDetectedAt: new Date() },
        },
        { upsert: false }
      );
      return NextResponse.json({ success: true });
    }

    const update = {
      $set: { lastDetectedAt: new Date() },
      $inc: { threatScore: analysis.threatDelta },
    };

    if (analysis.reasons.length > 0) {
      update.$push = { reasons: { $each: analysis.reasons } };
    }

    const threat = await Threat.findOneAndUpdate(
      { tenantId: tenant._id, ip },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (threat.threatScore >= 10) {
      const alreadyBlocked =
        threat.blockedUntil && new Date(threat.blockedUntil) > new Date();

      if (!alreadyBlocked) {
        await Threat.findByIdAndUpdate(threat._id, {
          $set: {
            blockedUntil: new Date(Date.now() + 15 * 60 * 1000),
            lastDetectedAt: new Date(),
          },
          $push: { reasons: "IP blocked due to high threat score" },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Threat analysis failed" },
      { status: 500 }
    );
  }
}
