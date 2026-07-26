const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        url: String,
        fileType: String,
        name: String,
      },
    ],
    feedback: {
      type: String,
      enum: ['like', 'dislike', null],
      default: null,
    },
    suggestedFollowUps: [String],
    mode: {
      type: String,
      default: 'General Chat',
    },
    confidenceScore: {
      type: Number,
      default: 0.9,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    emergencyData: {
      warning: String,
      hospitalsApiRecommended: Boolean,
      numbers: [String],
    },
    smartRecommendations: {
      relatedQuestions: [String],
      lifestyleTips: [String],
      medicineReminder: String,
      waterReminder: String,
      exerciseSuggestion: String,
      dietSuggestion: String,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

