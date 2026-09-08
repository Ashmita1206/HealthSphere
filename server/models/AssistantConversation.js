const mongoose = require('mongoose');

const assistantConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'pa', 'hinglish'],
      default: 'en',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        inputType: {
          type: String,
          enum: ['text', 'voice'],
          default: 'text',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastInteraction: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

assistantConversationSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('AssistantConversation', assistantConversationSchema);
