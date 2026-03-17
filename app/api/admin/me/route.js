import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import Tenant from "@/models/Tenant";
import jwt from "jsonwebtoken";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const admin = await Admin.findById(decoded.adminId)
      .select("-passwordHash")
      .lean();

    if (!admin) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

    let tenant = null;
    if (admin.tenantId) {
      tenant = await Tenant.findById(admin.tenantId).lean();
    }

    return NextResponse.json({
      loggedIn: true,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: "ADMIN",
        tenantId: admin.tenantId,
        tenant: tenant
          ? {
              id: tenant._id,
              name: tenant.name,
              slug: tenant.slug,
              website: tenant.website,
              status: tenant.status,
            }
          : null,
      },
    });
  } catch {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
