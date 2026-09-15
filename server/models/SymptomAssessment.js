const mongoose = require('mongoose');

const symptomAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symptoms: {
      type: [String],
      required: true,
      default: [],
    },
    duration: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'critical'],
      default: 'moderate',
    },
    aiAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'low', 'medium', 'high', 'critical'],
      default: 'LOW',
      index: true,
    },
    recommendations: {
      type: [String],
      default: [],
    },
    suggestedSpecialist: {
      type: String,
      default: 'General Physician',
    },
    requiresDoctor: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

symptomAssessmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SymptomAssessment', symptomAssessmentSchema);
