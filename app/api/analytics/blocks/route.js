import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import RequestLog from "@/models/RequestLog";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getScopedTenantId } from "@/lib/auth/tenantScope";

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
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

  const data = await RequestLog.aggregate([
    {
      $match: {
        tenantId: tenantObjectId,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return NextResponse.json({ data });
}
