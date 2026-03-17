import mongoose from 'mongoose';

const ThreatSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    ip: { type: String, required: true },
    threatScore: { type: Number, default: 0 },
    lastDetectedAt: { type: Date, default: Date.now },
    blockedUntil: { type: Date },
    reasons: [{ type: String }],
  },
  { timestamps: true }
);

ThreatSchema.index({ tenantId: 1, ip: 1 }, { unique: true });

export default mongoose.models.Threat || mongoose.model('Threat', ThreatSchema);
