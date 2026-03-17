import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Tenant from "@/models/Tenant";

export function generateTenantApiKey() {
  return `sg_${crypto.randomBytes(24).toString("hex")}`;
}

export async function hashTenantApiKey(apiKey) {
  return bcrypt.hash(apiKey, 10);
}

export async function findTenantByApiKey(apiKey) {
  if (!apiKey) {
    return null;
  }

  await connectDB();
  const tenants = await Tenant.find({ status: "active" }).lean();

  for (const tenant of tenants) {
    const match = await bcrypt.compare(apiKey, tenant.apiKeyHash);
    if (match) {
      return tenant;
    }
  }

  return null;
}
