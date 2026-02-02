import { NextResponse } from "next/server";
import connectDB  from "@/lib/db";
import Admin from "@/models/Admin";
import jwt from "jsonwebtoken";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const admin = await Admin.findById(decoded.adminId).select("-passwordHash");

    if (!admin) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

    return NextResponse.json({
      loggedIn: true,
        admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
