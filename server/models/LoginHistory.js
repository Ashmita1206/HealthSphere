const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Desktop',
    },
    location: {
      type: String,
      default: 'Local Network',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'locked'],
      default: 'success',
      index: true,
    },
    reason: {
      type: String,
      default: 'Normal Login',
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
    autoIndex: false,
  }
);

loginHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.models.LoginHistory || mongoose.model('LoginHistory', loginHistorySchema);
