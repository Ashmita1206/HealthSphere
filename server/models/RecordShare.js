const mongoose = require('mongoose');

const permissionsSchema = new mongoose.Schema(
  {
    medicalProfile: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    medicines: { type: Boolean, default: true },
    appointments: { type: Boolean, default: true },
    timeline: { type: Boolean, default: true },
    healthAnalytics: { type: Boolean, default: true },
  },
  { _id: false }
);

const accessLogSchema = new mongoose.Schema(
  {
    accessedAt: { type: Date, default: Date.now },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    accessorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false }
);

const recordShareSchema = new mongoose.Schema(
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
    records: {
      type: [String],
      enum: ['medicalProfile', 'reports', 'medicines', 'appointments', 'timeline', 'healthAnalytics'],
      default: ['medicalProfile', 'reports', 'medicines', 'appointments', 'timeline', 'healthAnalytics'],
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({
        medicalProfile: true,
        reports: true,
        medicines: true,
        appointments: true,
        timeline: true,
        healthAnalytics: true,
      }),
    },
    accessToken: {
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
    accessHistory: {
      type: [accessLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

recordShareSchema.index({ patientId: 1, createdAt: -1 });

recordShareSchema.methods.isExpired = function () {
  return new Date() > new Date(this.expiresAt);
};

recordShareSchema.methods.logAccess = function (ipAddress = '', userAgent = '', accessorId = null) {
  this.accessHistory.push({
    accessedAt: new Date(),
    ipAddress,
    userAgent,
    accessorId,
  });
};

module.exports = mongoose.model('RecordShare', recordShareSchema);
