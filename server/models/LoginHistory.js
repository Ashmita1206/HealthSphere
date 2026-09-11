const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED_CREDENTIALS', 'ACCOUNT_LOCKED', 'SUSPICIOUS_LOCATION', 'REVOKED'],
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'Unknown User Agent',
    },
    deviceType: {
      type: String,
      default: 'Desktop',
    },
    location: {
      type: String,
      default: 'Local Network',
    },
    failureReason: {
      type: String,
      default: null,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
    bufferCommands: false,
  },
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
