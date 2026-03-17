import { NextResponse } from "next/server";
import { resolveTenantFromApiKeyRequest } from "@/lib/auth/tenantScope";

export async function GET(req) {
  const tenant = await resolveTenantFromApiKeyRequest(req);

  if (!tenant || tenant.status !== "active") {
    return NextResponse.json(
      { error: "Invalid or suspended website key" },
      { status: 403 },
    );
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
