import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import Tenant from "@/models/Tenant";
import { generateTenantApiKey, hashTenantApiKey } from "@/lib/tenancy/apiKeys";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, website } = await req.json();

    if (!name || !email || !password || !website) {
      return NextResponse.json(
        { error: "Name, email, password, and website are required" },
        { status: 400 },
      );
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    const slugBase = createSlug(website);
    const existingTenant = await Tenant.findOne({ slug: slugBase });
    const slug = existingTenant ? `${slugBase}-${Date.now()}` : slugBase;
    const apiKey = generateTenantApiKey();
    const apiKeyHash = await hashTenantApiKey(apiKey);

    const tenant = await Tenant.create({
      name,
      slug,
      website,
      apiKeyHash,
      status: "active",
    });

    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({
      name,
      email,
      passwordHash,
      role: "ADMIN",
      tenantId: tenant._id,
    });

    return NextResponse.json({
      message: "Account created successfully",
      website: tenant.website,
      apiKey,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
