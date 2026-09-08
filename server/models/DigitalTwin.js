const mongoose = require('mongoose');

const medicalMemoryItemSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    milestoneType: {
      type: String,
      enum: ['diagnosis', 'surgery', 'hospitalization', 'emergency', 'report_anomaly', 'treatment_change', 'general'],
      default: 'general',
    },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    source: { type: String, default: 'clinical_history', trim: true },
    severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'low' },
  },
  { _id: false }
);

const behaviorPatternsSchema = new mongoose.Schema(
  {
    adherenceStability: { type: String, default: 'Consistent' },
    adherenceScore: { type: Number, default: 85 },
    activityPattern: { type: String, default: 'Moderate' },
    sleepConsistency: { type: String, default: 'Regular' },
    stressResponse: { type: String, default: 'Low' },
    dietaryPattern: { type: String, default: 'Balanced' },
    loggingFrequency: { type: String, default: 'Daily' },
    identifiedHabits: [{ type: String }],
  },
  { _id: false }
);

const riskProfileSchema = new mongoose.Schema(
  {
    cardiovascularRisk: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'], default: 'Low' },
    metabolicRisk: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'], default: 'Low' },
    respiratoryRisk: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'], default: 'Low' },
    hospitalizationRisk: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], default: 'LOW' },
    acuteVulnerabilityIndex: { type: Number, default: 15 },
    activeWarnings: [{ type: String }],
  },
  { _id: false }
);

const predictionItemSchema = new mongoose.Schema(
  {
    predictedAt: { type: Date, default: Date.now },
    eventType: { type: String, required: true },
    horizon: { type: String, default: '30_days' },
    probability: { type: Number, default: 50 },
    preventiveAction: { type: String, default: '' },
    actualOutcome: { type: String, default: 'pending' },
  },
  { _id: false }
);

const digitalTwinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    healthProfile: {
      baselineVitals: {
        systolic: { type: Number, default: 120 },
        diastolic: { type: Number, default: 80 },
        heartRate: { type: Number, default: 72 },
        glucose: { type: Number, default: 95 },
        oxygen: { type: Number, default: 98 },
        temperature: { type: Number, default: 98.6 },
      },
      bloodType: { type: String, default: 'Unknown' },
      bmi: { type: Number, default: 23.5 },
      chronicConditions: [{ type: String }],
      allergies: [{ type: String }],
      geneticRisks: [{ type: String }],
    },
    medicalMemory: [medicalMemoryItemSchema],
    behaviorPatterns: behaviorPatternsSchema,
    riskProfile: riskProfileSchema,
    predictionHistory: [predictionItemSchema],
    lastAnalysis: {
      timestamp: { type: Date, default: Date.now },
      narrativeSummary: { type: String, default: '' },
      primaryDrivers: [{ type: String }],
      keyShifts: [{ type: String }],
    },
    confidenceScore: {
      type: Number,
      default: 88,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

module.exports = mongoose.model('DigitalTwin', digitalTwinSchema);
