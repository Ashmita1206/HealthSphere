const mongoose = require('mongoose');

const medicalReportAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
      index: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    reportType: {
      type: String,
      enum: ['blood', 'xray', 'prescription', 'lab', 'pathology', 'general'],
      default: 'general',
    },
    aiSummary: {
      type: String,
      default: '',
    },
    abnormalFindings: {
      type: Array,
      default: [],
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'low',
    },
    recommendations: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

medicalReportAnalysisSchema.index({ userId: 1, reportId: 1 });

module.exports = mongoose.model('MedicalReportAnalysis', medicalReportAnalysisSchema);
