import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { resolveTenantFromApiKeyRequest } from "@/lib/auth/tenantScope";
import RequestLog from "@/models/RequestLog";

export async function POST(req) {
  try {
    await connectDB();
    const admin = await requireAdmin();
    const tenantFromApiKey = await resolveTenantFromApiKeyRequest(req);
    const body = await req.json();

    const tenantId = admin?.tenantId || tenantFromApiKey?._id?.toString() || null;

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant context is required for logging" },
        { status: 401 },
      );
    }

    await RequestLog.create({
      ...body,
      tenantId,
      blocked: body.blocked ?? body.status === "Blocked",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to log request" },
      { status: 500 },
    );
  }
}
