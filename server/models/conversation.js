const mongoose = require('mongoose');

const { RISK } = require('../utils/constants');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    riskLevel: {
      type: String,
      enum: [RISK.LOW, RISK.MEDIUM, RISK.HIGH, RISK.CRITICAL, null],
      default: null,
    },

    recommendations: {
      type: [String],
      default: [],
    },

    requiresDoctor: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: '',
      trim: true,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
==========================================
Indexes
==========================================
*/

conversationSchema.index({
  user: 1,
  lastMessageAt: -1,
});

conversationSchema.index({
  user: 1,
  isArchived: 1,
});

module.exports = mongoose.model('Conversation', conversationSchema);
