import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RequestLog from "@/models/RequestLog";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getScopedTenantId } from "@/lib/auth/tenantScope";

export async function GET(req) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  await connectDB();
  const tenantId = getScopedTenantId(req, admin);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant is required" }, { status: 400 });
  }

  const logs = await RequestLog.find({ tenantId })
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  return NextResponse.json({ logs });
}
