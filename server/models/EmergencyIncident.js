const mongoose = require('mongoose');

const emergencyIncidentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      default: 'MEDIUM',
    },
    triggerReason: {
      type: String,
      required: true,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'investigating', 'resolved'],
      default: 'active',
      index: true,
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

emergencyIncidentSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('EmergencyIncident', emergencyIncidentSchema);
