import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import Tenant from "@/models/Tenant";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const tenant = await Tenant.findById(admin.tenantId).lean();

  if (!tenant) {
    return NextResponse.json({ tenant: null }, { status: 404 });
  }

  return NextResponse.json({
    tenant: {
      id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      website: tenant.website,
      status: tenant.status,
    },
  });
}
