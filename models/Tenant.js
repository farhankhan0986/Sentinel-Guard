import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    website: { type: String, required: true },
    apiKeyHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Tenant ||
  mongoose.model("Tenant", TenantSchema);
