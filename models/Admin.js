import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN"],
      default: "ADMIN",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { timestamps: true },
);

const cachedAdmin = mongoose.models.Admin;

if (
  cachedAdmin &&
  !cachedAdmin.schema.path("role")?.enumValues?.includes("ADMIN")
) {
  mongoose.deleteModel("Admin");
}

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
