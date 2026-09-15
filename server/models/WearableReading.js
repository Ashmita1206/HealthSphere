const mongoose = require('mongoose');

const wearableReadingSchema = new mongoose.Schema(
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
      trim: true,
    },
    provider: {
      type: String,
      enum: ['apple_health', 'google_fit', 'fitbit', 'garmin', 'samsung_health', 'manual_iot'],
      required: true,
      index: true,
    },
    metricType: {
      type: String,
      enum: ['heartRate', 'sleep', 'steps', 'spo2', 'bloodPressure', 'calories', 'ecg', 'activity'],
      required: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    recordedAt: {
      type: Date,
      required: true,
      index: true,
    },
    source: {
      type: String,
      default: 'Wearable Sensor',
      trim: true,
    },
    isAnomalous: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

wearableReadingSchema.index({ userId: 1, metricType: 1, recordedAt: -1 });

module.exports = mongoose.model('WearableReading', wearableReadingSchema);
