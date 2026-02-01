import mongoose from 'mongoose';

const FirewallRuleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['BLOCK_IP', 'BLOCK_METHOD', 'BLOCK_ROUTE'],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.FirewallRule ||
  mongoose.model('FirewallRule', FirewallRuleSchema);
