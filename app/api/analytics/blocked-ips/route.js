import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getScopedTenantId } from "@/lib/auth/tenantScope";
import Threat from "@/models/Threat";

export async function GET(req) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const tenantId = getScopedTenantId(req, admin);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant is required" }, { status: 400 });
  }

  const now = new Date();
  const threats = await Threat.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    blockedUntil: { $gt: now },
  })
    .select("ip threatScore blockedUntil reasons lastDetectedAt")
    .sort({ blockedUntil: -1 })
    .lean();

  const data = threats.map((t) => ({
    ip: t.ip,
    threatScore: t.threatScore,
    blockedUntil: t.blockedUntil,
    remainingSeconds: Math.ceil((new Date(t.blockedUntil) - now) / 1000),
    lastDetectedAt: t.lastDetectedAt,
    reasons: t.reasons?.slice(-3) ?? [],
  }));

  return NextResponse.json({ data });
}
