const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bloodType: { type: String, trim: true },
    organType: { type: String, trim: true },
    donationType: { type: String, trim: true },
    status: { type: String, default: "active", trim: true },
    isAvailable: { type: Boolean, default: true },
    consentToDiscover: { type: Boolean, default: true },
    approximateArea: { type: String, trim: true },
    city: { type: String, trim: true, default: "Local Area" },
    lastDonationDate: { type: Date },
    contactPreference: {
      type: String,
      enum: ["in-app", "masked-phone", "email"],
      default: "in-app",
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

const donationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientName: { type: String, trim: true, default: "Patient in Need" },
    requestType: { type: String, trim: true, default: "blood" },
    bloodType: { type: String, trim: true, required: true },
    componentType: {
      type: String,
      enum: ["whole_blood", "prbc", "platelets", "ffp", "cryo"],
      default: "whole_blood",
    },
    hospital: { type: String, trim: true, required: true, default: "Medical Facility" },
    approximateArea: { type: String, trim: true },
    unitsRequired: { type: Number, default: 1, min: 1 },
    requiredDate: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
    urgency: {
      type: String,
      enum: ["critical", "high", "normal"],
      default: "normal",
      trim: true,
    },
    contactPhone: { type: String, trim: true },
    organType: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "fulfilled", "cancelled", "active"],
      default: "active",
      trim: true,
    },
  },
  { timestamps: true }
);

const donationRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    donationDate: { type: Date, default: Date.now },
    facility: { type: String, trim: true, default: "HealthSphere Blood Center" },
    units: { type: Number, default: 1, min: 1 },
    bloodType: { type: String, trim: true },
    componentType: { type: String, default: "whole_blood", trim: true },
    status: {
      type: String,
      enum: ["completed", "scheduled", "pending", "cancelled"],
      default: "completed",
      trim: true,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Verified Blood Bank Facility Entity
const bloodBankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, trim: true },
    category: {
      type: String,
      enum: ["Government", "Red Cross", "Trust/Charitable", "Private Hospital"],
      default: "Government",
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    operatingHours: { type: String, default: "24x7 Emergency Blood Bank" },
    isVerified: { type: Boolean, default: false },
    externalSyncId: { type: String, trim: true, index: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

// Verified Blood Stock Availability
const bloodStockSchema = new mongoose.Schema(
  {
    bloodBankId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodBank", required: true, index: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    component: {
      type: String,
      enum: ["whole_blood", "prbc", "platelets", "ffp", "cryo"],
      default: "whole_blood",
    },
    availableUnits: { type: Number, default: 0, min: 0 },
    lastVerifiedAt: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ["e-raktkosh", "hims", "internal_verified", "manual"],
      default: "internal_verified",
    },
    freshnessStatus: {
      type: String,
      enum: ["live", "recent", "stale"],
      default: "recent",
    },
    isDevelopmentFixture: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Donation Appointment Model (For booking donation slots at verified facilities)
const donationAppointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bloodBankId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodBank", required: true },
    slotTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled"],
      default: "scheduled",
    },
    donationType: { type: String, default: "blood" },
    tokenNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Synchronization Metadata & Audit Logging
const externalSyncLogSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    syncType: { type: String, required: true },
    status: {
      type: String,
      enum: ["success", "partial", "failed", "not_configured"],
      default: "not_configured",
    },
    recordsProcessed: { type: Number, default: 0 },
    errorMessage: { type: String },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = {
  Donor: mongoose.models.Donor || mongoose.model("Donor", donorSchema),
  DonationRequest: mongoose.models.DonationRequest || mongoose.model("DonationRequest", donationRequestSchema),
  DonationRecord: mongoose.models.DonationRecord || mongoose.model("DonationRecord", donationRecordSchema),
  BloodBank: mongoose.models.BloodBank || mongoose.model("BloodBank", bloodBankSchema),
  BloodStock: mongoose.models.BloodStock || mongoose.model("BloodStock", bloodStockSchema),
  DonationAppointment: mongoose.models.DonationAppointment || mongoose.model("DonationAppointment", donationAppointmentSchema),
  ExternalSyncLog: mongoose.models.ExternalSyncLog || mongoose.model("ExternalSyncLog", externalSyncLogSchema),
};
