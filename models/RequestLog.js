import mongoose from "mongoose";

const RequestLogSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    userAgent: { type: String },
    status: { type: Number },
    blocked: { type: Boolean, default: false },
    threatScore: { type: Number, default: 0 },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.RequestLog ||
  mongoose.model("RequestLog", RequestLogSchema);
