const mongoose = require('mongoose');

const healthTimelineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['medicine', 'appointment', 'report', 'vitals', 'emergency', 'health_goal', 'general'],
      default: 'general',
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['medicine', 'appointment', 'report', 'vitals', 'emergency', 'health_goal', 'general'],
      default: function () {
        return this.eventType || 'general';
      },
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    relatedId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

healthTimelineSchema.index({ userId: 1, createdAt: -1 });
healthTimelineSchema.index({ userId: 1, eventType: 1 });
healthTimelineSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('HealthTimeline', healthTimelineSchema);
