import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  getScopedTenantId,
  resolveTenantFromApiKeyRequest,
} from "@/lib/auth/tenantScope";
import FirewallRule from "@/models/FirewallRule";

export async function GET(req) {
  try {
    await connectDB();

    const admin = await requireAdmin();
    const tenantFromApiKey = await resolveTenantFromApiKeyRequest(req);
    const source = req.nextUrl.searchParams.get("source");

    let tenantId = null;
    if (admin) {
      tenantId = getScopedTenantId(req, admin);
    } else if (source === "proxy" && tenantFromApiKey) {
      tenantId = tenantFromApiKey._id.toString();
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await FirewallRule.find({ tenantId }).lean();
    return NextResponse.json({ rules });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}
