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

      default: 'Unknown',
    },
    device: {

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

    status: {
      type: String,
      enum: ['success', 'failed', 'locked'],
      default: 'success',
      index: true,
    },
    reason: {
      type: String,
      default: 'Normal Login',

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

    bufferCommands: false,
    autoIndex: false,
  }
);

loginHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.models.LoginHistory || mongoose.model('LoginHistory', loginHistorySchema);

    autoIndex: false,
    bufferCommands: false,
  },
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);

