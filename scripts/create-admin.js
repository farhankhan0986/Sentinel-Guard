import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);

  const email = "farhankhan080304@gmail.com";
  const password = "StrongAdminPassword123"; // change later

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await Admin.create({
    email,
    passwordHash,
  });

  console.log("✅ Admin created successfully");
  console.log("Email:", email);
  console.log("Password:", password);

  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
