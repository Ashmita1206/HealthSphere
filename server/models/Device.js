const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      default: 'Unknown Browser',
    },
    browser: {
      type: String,
      default: 'Chrome',
    },
    os: {
      type: String,
      default: 'Windows',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    location: {
      type: String,
      default: 'Local Network',
    },
    isTrusted: {
      type: Boolean,
      default: true,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
    autoIndex: false,
  }
);

deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.models.Device || mongoose.model('Device', deviceSchema);
