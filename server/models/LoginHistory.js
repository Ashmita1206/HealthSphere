const mongoose = require('mongoose');

const STATUS_ENUM = [
  'SUCCESS',
  'FAILED_CREDENTIALS',
  'ACCOUNT_LOCKED',
  'SUSPICIOUS_LOCATION',
  'REVOKED',
];

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: STATUS_ENUM,
      required: true,
      index: true,
      set: function (val) {
        if (!val) return val;
        const upper = String(val).toUpperCase();
        if (upper === 'SUCCESS') return 'SUCCESS';
        if (upper === 'FAILED' || upper === 'FAILED_CREDENTIALS') return 'FAILED_CREDENTIALS';
        if (upper === 'LOCKED' || upper === 'ACCOUNT_LOCKED') return 'ACCOUNT_LOCKED';
        if (upper === 'SUSPICIOUS_LOCATION') return 'SUSPICIOUS_LOCATION';
        if (upper === 'REVOKED') return 'REVOKED';
        return upper;
      },
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
      browser: {
        type: String,
        default: 'Unknown Browser',
      },
      os: {
        type: String,
        default: 'Unknown OS',
      },
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
        default: 'unknown',
      },
    },

    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
      default: function () {
        return this.device?.deviceType || 'unknown';
      },
    },

    location: {
      type: String,
      default: 'Local Network',
    },

    reason: {
      type: String,
      default: 'Normal Login',
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
    bufferCommands: false,
    autoIndex: false,
  }
);

loginHistorySchema.index({ createdAt: -1 });
loginHistorySchema.index({ attemptedAt: -1 });

module.exports =
  mongoose.models.LoginHistory ||
  mongoose.model('LoginHistory', loginHistorySchema);
