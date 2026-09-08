const mongoose = require('mongoose');

const automationRuleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    ruleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    trigger: {
      type: String,
      required: true,
      enum: ['vital_breach', 'medication_missed', 'appointment_upcoming', 'report_abnormal', 'symptom_alert', 'custom'],
      index: true,
    },
    conditions: [
      {
        field: { type: String, required: true },
        operator: {
          type: String,
          enum: ['gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'contains', 'in'],
          required: true,
        },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
      },
    ],
    actions: [
      {
        actionType: {
          type: String,
          enum: [
            'emergency_alert',
            'doctor_notification',
            'timeline_event',
            'push_notification',
            'reminder',
            'family_notification',
            'checklist',
          ],
          required: true,
        },
        payload: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
    executionCount: {
      type: Number,
      default: 0,
    },
    lastTriggeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

automationRuleSchema.index({ userId: 1, enabled: 1, trigger: 1 });

module.exports = mongoose.model('AutomationRule', automationRuleSchema);
