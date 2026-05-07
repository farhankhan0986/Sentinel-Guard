import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { resolveTenantFromApiKeyRequest } from "@/lib/auth/tenantScope";
import Threat from "@/models/Threat";

export async function GET(req) {
  await connectDB();
  const tenant = await resolveTenantFromApiKeyRequest(req);

  if (!tenant) {
    return NextResponse.json({ blocked: false }, { status: 401 });
  }

  const ip = req.nextUrl.searchParams.get("ip");
  if (!ip) {
    return NextResponse.json({ blocked: false });
  }

  const threat = await Threat.findOne({ tenantId: tenant._id, ip });
  if (threat?.blockedUntil && new Date(threat.blockedUntil) > new Date()) {
    const blockedUntil = new Date(threat.blockedUntil);
    const remainingSeconds = Math.ceil((blockedUntil - Date.now()) / 1000);
    return NextResponse.json({ blocked: true, blockedUntil, remainingSeconds });
  }

  return NextResponse.json({ blocked: false });
}
