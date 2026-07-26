const mongoose = require('mongoose');

const HealthScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overallHealthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scores: {
      riskScore: { score: Number, why: String, trend: String, recommendation: String },
      lifestyleScore: { score: Number, why: String, trend: String, recommendation: String },
      recoveryScore: { score: Number, why: String, trend: String, recommendation: String },
      sleepScore: { score: Number, why: String, trend: String, recommendation: String },
      nutritionScore: { score: Number, why: String, trend: String, recommendation: String },
      hydrationScore: { score: Number, why: String, trend: String, recommendation: String },
      medicationScore: { score: Number, why: String, trend: String, recommendation: String },
    },
    predictions: {
      diabetesRisk: { level: String, probability: Number, preventiveAction: String },
      hypertensionRisk: { level: String, probability: Number, preventiveAction: String },
      heartDiseaseRisk: { level: String, probability: Number, preventiveAction: String },
      vitaminDeficiencyRisk: { level: String, probability: Number, preventiveAction: String },
      lifestyleRisk: { level: String, probability: Number, preventiveAction: String },
      medicationNonAdherence: { level: String, probability: Number, preventiveAction: String },
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

HealthScoreSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('HealthScore', HealthScoreSchema);
