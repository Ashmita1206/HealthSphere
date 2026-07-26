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
      riskScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
      lifestyleScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
      recoveryScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
      sleepScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
      nutritionScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
      hydrationScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
      medicationScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
      stressScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
      activityScore: { score: Number, why: String, trend: String, recommendation: String, target: String, improvementPlan: String, estimatedRecoveryTime: String },
    },
    predictions: {
      diabetesRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      hypertensionRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      heartDiseaseRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      kidneyDiseaseRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      liverDiseaseRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      vitaminDeficiencyRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      lifestyleRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      medicationNonAdherence: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      stressRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
      sleepRisk: { level: String, probability: Number, riskFactors: [String], supportingEvidence: String, confidence: Number, preventiveAction: String, lifestyleChanges: [String], expectedTimeline: String },
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

