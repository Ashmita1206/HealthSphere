const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifierName: { type: String, default: 'Attending Clinician' },
    content: { type: String, required: true },
    reason: { type: String, default: 'Clinical update' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sharedClinicalNoteSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    patientName: {
      type: String,
      default: 'Hospital Patient',
    },
    title: {
      type: String,
      required: true,
      default: 'Collaborative Multi-Disciplinary Rounds Note',
    },
    category: {
      type: String,
      enum: ['SOAP', 'discharge_plan', 'multidisciplinary_rounds', 'triage_assessment'],
      default: 'SOAP',
      index: true,
    },
    subjective: { type: String, default: '' },
    objective: { type: String, default: '' },
    assessment: { type: String, default: '' },
    plan: { type: String, default: '' },
    rawContent: { type: String, default: '' },
    version: {
      type: Number,
      default: 1,
      index: true,
    },
    currentLock: {
      lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      lockedByName: { type: String, default: null },
      lockedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null },
    },
    revisions: [revisionSchema],
    contributors: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        role: { type: String },
        lastActiveAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

module.exports = mongoose.model('SharedClinicalNote', sharedClinicalNoteSchema);
