const mongoose = require('mongoose');

const medicalImageSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    modality: {
      type: String,
      enum: ['X-RAY', 'CT', 'MRI', 'ULTRASOUND'],
      required: true,
      index: true,
    },
    bodyPart: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    baselineImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalImage',
      default: null,
    },
    aiAnnotations: [
      {
        id: String,
        label: String,
        box: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
        confidence: Number,
        severity: {
          type: String,
          enum: ['BENIGN', 'SUSPICIOUS', 'MALIGNANT', 'ACUTE', 'INDETERMINATE'],
          default: 'INDETERMINATE',
        },
      },
    ],
    heatmapOverlay: {
      peakLocation: {
        x: Number,
        y: Number,
      },
      intensity: Number,
      activationPoints: [
        {
          x: Number,
          y: Number,
          weight: Number,
        },
      ],
    },
    aiRadiologySummary: {
      findings: String,
      impression: String,
      recommendedFollowUp: String,
      radsClassification: String, // e.g. BI-RADS 2, Lung-RADS 3, PI-RADS 4
      confidenceScore: Number,
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'ANALYZED', 'VERIFIED'],
      default: 'ANALYZED',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
    bufferCommands: false,
  },
);

module.exports = mongoose.model('MedicalImage', medicalImageSchema);
