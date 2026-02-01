import mongoose from 'mongoose';

const ThreatSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    threatScore: { type: Number, default: 0 },
    lastDetectedAt: { type: Date, default: Date.now },
    blockedUntil: { type: Date },
    reasons: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Threat || mongoose.model('Threat', ThreatSchema);