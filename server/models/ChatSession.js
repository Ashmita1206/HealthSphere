const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Healthcare Chat',
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    lastMessageText: {
      type: String,
      default: '',
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    summary: {
      text: String,
      importantSymptoms: [String],
      medicinesMentioned: [String],
      reportsDiscussed: [String],
      suggestedNextSteps: [String],
      updatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

ChatSessionSchema.index({ userId: 1, lastActivityAt: -1 });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);

