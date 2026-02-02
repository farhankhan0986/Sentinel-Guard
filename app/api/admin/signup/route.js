import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const { floating_name, floating_email, floating_password } = await req.json();

    if (!floating_email || !floating_password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const existingAdmin = await Admin.findOne({ email: floating_email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 },
      );
    }
    const hashedPassword = await bcrypt.hash(floating_password, 10);

    await Admin.create({
      name: floating_name,
      email: floating_email,
      passwordHash: hashedPassword,
    });
    return NextResponse.json({ message: "Admin created successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Admin signup failed" }, { status: 500 });
  }
}
