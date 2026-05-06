import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Tenant from "@/models/Tenant";

const CACHE_TTL_MS = 5 * 60 * 1000;
const apiKeyCache = new Map();

function getCached(apiKey) {
  const entry = apiKeyCache.get(apiKey);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    apiKeyCache.delete(apiKey);
    return null;
  }
  return entry.tenant;
}

function setCached(apiKey, tenant) {
  apiKeyCache.set(apiKey, { tenant, expiry: Date.now() + CACHE_TTL_MS });
}

export function invalidateApiKeyCache() {
  apiKeyCache.clear();
}

export function generateTenantApiKey() {
  return `sg_${crypto.randomBytes(24).toString("hex")}`;
}

export async function hashTenantApiKey(apiKey) {
  return bcrypt.hash(apiKey, 10);
}

export async function findTenantByApiKey(apiKey) {
  if (!apiKey) return null;

  const cached = getCached(apiKey);
  if (cached) return cached;

  await connectDB();
  const tenants = await Tenant.find({ status: "active" }).lean();

  for (const tenant of tenants) {
    const match = await bcrypt.compare(apiKey, tenant.apiKeyHash);
    if (match) {
      setCached(apiKey, tenant);
      return tenant;
    }
  }

  return null;
}
