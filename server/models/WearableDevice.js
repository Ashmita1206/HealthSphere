const mongoose = require('mongoose');

const wearableDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['apple_health', 'google_fit', 'fitbit', 'garmin', 'samsung_health'],
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      required: true,
      trim: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    batteryLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['connected', 'syncing', 'disconnected'],
      default: 'connected',
    },
    lastSyncAt: {
      type: Date,
      default: Date.now,
    },
    syncPreferences: {
      autoSync: { type: Boolean, default: true },
      syncIntervalMinutes: { type: Number, default: 15 },
      metricsEnabled: {
        type: [String],
        default: ['heartRate', 'sleep', 'steps', 'spo2', 'bloodPressure', 'calories', 'ecg', 'activity'],
      },
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

wearableDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('WearableDevice', wearableDeviceSchema);
