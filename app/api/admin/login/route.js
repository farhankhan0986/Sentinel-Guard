import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req) {
  try {
    await connectDB();
    const { floating_email, floating_password } = await req.json();

    const admin = await Admin.findOne({ email: floating_email });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(floating_password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = signToken({
      adminId: admin._id,
      tenantId: admin.tenantId?.toString(),
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          tenantId: admin.tenantId,
        },
      },
      { status: 200 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
