const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    tokenHash: {

    tokenFamily: {

      type: String,
      required: true,
      index: true,
    },

    device: {
      browser: { type: String, default: 'Unknown' },
      os: { type: String, default: 'Unknown' },
      deviceType: { type: String, default: 'desktop' },
      ipAddress: { type: String, default: '127.0.0.1' },
      userAgent: { type: String, default: 'Unknown' },
      location: { type: String, default: 'Local Network' },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: 'Unknown Client',
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
      default: 'unknown',
    },
    browser: {
      type: String,
      default: 'Unknown Browser',
    },
    os: {
      type: String,
      default: 'Unknown OS',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index automatically evicts expired sessions

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedReason: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index to auto-clean expired sessions

    },
  },
  {
    timestamps: true,

    bufferCommands: false,
    autoIndex: false,
  }
);

module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);

    autoIndex: false,
    bufferCommands: false,
  },
);

module.exports = mongoose.model('Session', sessionSchema);

