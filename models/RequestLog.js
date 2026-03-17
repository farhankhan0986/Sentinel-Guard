import mongoose from "mongoose";

const RequestLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    ip: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    userAgent: { type: String },
    status: {
      type: String,
      enum: ["Allowed", "Blocked"],
      required: true,
    },
    blocked: { type: Boolean, default: false },
    threatScore: { type: Number, default: 0 },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

RequestLogSchema.index({ tenantId: 1, ip: 1, createdAt: -1 });

export default mongoose.models.RequestLog ||
  mongoose.model("RequestLog", RequestLogSchema);
