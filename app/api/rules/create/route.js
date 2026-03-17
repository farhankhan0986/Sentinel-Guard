import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import FirewallRule from "@/models/FirewallRule";

export async function POST(req) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const tenantId = admin.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant is required" }, { status: 400 });
    }

    const rule = await FirewallRule.create({
      ...body,
      tenantId,
    });

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 },
    );
  }
}
