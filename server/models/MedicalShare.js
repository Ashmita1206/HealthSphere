const mongoose = require('mongoose');

const permissionsSchema = new mongoose.Schema(
  {
    profile: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    medicines: { type: Boolean, default: true },
    appointments: { type: Boolean, default: true },
    timeline: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    emergency: { type: Boolean, default: true },
  },
  { _id: false }
);

const medicalShareSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    shareToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({
        profile: true,
        reports: true,
        medicines: true,
        appointments: true,
        timeline: true,
        analytics: true,
        emergency: true,
      }),
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast patient queries sorted by creation
medicalShareSchema.index({ patientId: 1, createdAt: -1 });
medicalShareSchema.index({ patientId: 1, status: 1 });

// Helper to evaluate access validity
medicalShareSchema.methods.isExpired = function () {
  return new Date() > new Date(this.expiresAt);
};

medicalShareSchema.methods.isAccessible = function () {
  return this.status === 'active' && !this.isExpired();
};

module.exports = mongoose.model('MedicalShare', medicalShareSchema);
