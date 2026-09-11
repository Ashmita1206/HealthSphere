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
    lastActive: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index automatically evicts expired sessions
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
    autoIndex: false,
  }
);

module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);
