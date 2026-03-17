import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Tenant from "../models/Tenant.js";
import { generateTenantApiKey, hashTenantApiKey } from "../lib/tenancy/apiKeys.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function createDemoAccount() {
  await mongoose.connect(MONGODB_URI);

  const name = process.env.DEMO_NAME || "Demo User";
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  const website = process.env.DEMO_WEBSITE;

  if (!email || !password || !website) {
    throw new Error("DEMO_EMAIL, DEMO_PASSWORD, and DEMO_WEBSITE are required");
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    console.log("Account already exists");
    process.exit(0);
  }

  const apiKey = generateTenantApiKey();
  const tenant = await Tenant.create({
    name,
    slug: website.toLowerCase().replace(/https?:\/\//g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    website,
    apiKeyHash: await hashTenantApiKey(apiKey),
  });

  await Admin.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "ADMIN",
    tenantId: tenant._id,
  });

  console.log("Demo account created successfully");
  console.log("Email:", email);
  console.log("API Key:", apiKey);

  process.exit(0);
}

createDemoAccount().catch((err) => {
  console.error(err);
  process.exit(1);
});
