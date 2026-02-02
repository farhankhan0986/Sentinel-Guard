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

    const token = signToken({ adminId: admin._id });

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax", // ✅ IMPORTANT
      secure: false, // ✅ HTTP allowed (local)
      path: "/", // ✅ ALL ROUTES
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
