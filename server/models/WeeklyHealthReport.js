const mongoose = require('mongoose');

const weeklyHealthReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    overallHealthScore: {
      start: { type: Number, default: 75 },
      end: { type: Number, default: 75 },
      change: { type: Number, default: 0 },
    },
    vitalsSummary: {
      bloodPressure: {
        avgSystolic: { type: Number, default: 120 },
        avgDiastolic: { type: Number, default: 80 },
        status: { type: String, default: 'Normal' },
      },
      heartRate: {
        avg: { type: Number, default: 72 },
        min: { type: Number, default: 60 },
        max: { type: Number, default: 95 },
      },
      bloodGlucose: {
        avg: { type: Number, default: 100 },
        status: { type: String, default: 'Optimal' },
      },
      oxygenLevel: {
        avg: { type: Number, default: 98 },
        status: { type: String, default: 'Normal' },
      },
    },
    adherenceSummary: {
      rate: { type: Number, default: 100 },
      totalScheduled: { type: Number, default: 0 },
      totalCompleted: { type: Number, default: 0 },
      missedCount: { type: Number, default: 0 },
      status: { type: String, default: 'High Adherence' },
    },
    hospitalizationRisk: {
      score: { type: Number, default: 12 },
      level: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], default: 'LOW' },
      keyDrivers: [{ type: String }],
    },
    diseaseProgression: [
      {
        condition: { type: String, required: true },
        trajectory: { type: String, enum: ['improving', 'stable', 'worsening'], default: 'stable' },
        riskLevel: { type: String, default: 'Low' },
        details: { type: String, default: '' },
      },
    ],
    wellnessSummary: {
      dietTip: { type: String, default: '' },
      exerciseTip: { type: String, default: '' },
      stressTip: { type: String, default: '' },
      sleepTip: { type: String, default: '' },
    },
    recommendations: [
      {
        title: { type: String, required: true },
        category: { type: String, default: 'General' },
        action: { type: String, required: true },
        whyRecommended: { type: String, required: true },
        clinicalEvidence: { type: String, default: '' },
        confidenceScore: { type: Number, default: 90 },
      },
    ],
    aiConfidence: {
      score: { type: Number, default: 92 },
      tier: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
    },
    highlights: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

weeklyHealthReportSchema.index({ userId: 1, weekStartDate: -1 });

module.exports = mongoose.model('WeeklyHealthReport', weeklyHealthReportSchema);
