import { findTenantByApiKey } from "@/lib/tenancy/apiKeys";

export async function resolveTenantFromApiKeyRequest(req) {
  const apiKey = req.headers.get("x-sentinel-api-key");
  if (!apiKey) {
    return null;
  }

  return findTenantByApiKey(apiKey);
}

export function getScopedTenantId(req, admin) {
  if (!admin) {
    return null;
  }

  return admin.tenantId || req.nextUrl.searchParams.get("tenantId") || null;
}
