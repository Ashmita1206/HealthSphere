const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['medication', 'appointment', 'health', 'report', 'emergency', 'system', 'security', 'general'],
      default: 'general',
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical', 'info', 'healthy', 'attention'],
      default: 'normal',
      trim: true,
    },
    severity: {
      type: String,
      enum: ['info', 'healthy', 'attention', 'critical', 'low', 'normal', 'high'],
      default: 'info',
      trim: true,
    },
    route: {
      type: String,
      default: '/dashboard',
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
