import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { generateTenantApiKey, hashTenantApiKey, invalidateApiKeyCache } from "@/lib/tenancy/apiKeys";
import Tenant from "@/models/Tenant";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const tenant = await Tenant.findById(admin.tenantId);

  if (!tenant) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  const apiKey = generateTenantApiKey();
  tenant.apiKeyHash = await hashTenantApiKey(apiKey);
  invalidateApiKeyCache();
  await tenant.save();

  return NextResponse.json({
    apiKey,
  });
}
