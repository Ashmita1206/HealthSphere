const mongoose = require('mongoose');

const AIMemorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    shortTermMemory: [
      {
        topic: String,
        content: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    longTermMemory: {
      allergies: [String],
      chronicConditions: [String],
      medications: [String],
      familyHistory: [String],
      dietaryPreferences: [String],
      vitalBaselines: {
        bloodPressure: String,
        sugarLevel: String,
        bmi: Number,
      },
      keyHealthGoals: [String],
    },
    conversationSummaries: [
      {
        sessionId: mongoose.Schema.Types.ObjectId,
        summary: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIMemory', AIMemorySchema);
