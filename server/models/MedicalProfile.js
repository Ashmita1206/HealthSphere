const mongoose = require('mongoose');

const surgerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String },
  hospital: { type: String },
  notes: { type: String },
});

const familyHistorySchema = new mongoose.Schema({
  relation: { type: String, required: true },
  condition: { type: String, required: true },
});

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
});

const vaccinationSchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  dateGiven: { type: String },
  dose: { type: String },
});

const MedicalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    healthId: {
      type: String,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
      default: '',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''],
      default: 'Unknown',
    },
    height: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronicDiseases: {
      type: [String],
      default: [],
    },
    currentMedications: {
      type: [String],
      default: [],
    },
    surgeries: {
      type: [surgerySchema],
      default: [],
    },
    familyHistory: {
      type: [familyHistorySchema],
      default: [],
    },
    emergencyContacts: {
      type: [emergencyContactSchema],
      default: [],
    },
    insurance: {
      provider: { type: String, default: '' },
      policyNumber: { type: String, default: '' },
      groupNumber: { type: String, default: '' },
      expiryDate: { type: String, default: '' },
    },
    organDonor: {
      type: Boolean,
      default: false,
    },
    vaccinations: {
      type: [vaccinationSchema],
      default: [],
    },
    lifestyle: {
      smoking: { type: String, default: 'never' },
      alcohol: { type: String, default: 'never' },
      activityLevel: { type: String, default: 'moderate' },
      diet: { type: String, default: 'balanced' },
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    notes: {
      type: String,
      default: '',
    },
    qrData: {
      type: String,
      default: '',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to calculate profile completion percentage
MedicalProfileSchema.methods.calculateCompletion = function () {
  let score = 0;
  const total = 10;

  if (this.fullName && this.fullName.trim().length > 0) score += 1;
  if (this.dateOfBirth) score += 1;
  if (this.gender) score += 1;
  if (this.bloodGroup && this.bloodGroup !== 'Unknown') score += 1;
  if (this.height && this.weight) score += 1;
  if (this.allergies && this.allergies.length > 0) score += 1;
  if (this.emergencyContacts && this.emergencyContacts.length > 0) score += 1;
  if (this.insurance && this.insurance.provider) score += 1;
  if (this.address && this.address.city) score += 1;
  if (this.lifestyle && this.lifestyle.activityLevel) score += 1;

  this.completionPercentage = Math.round((score / total) * 100);
  return this.completionPercentage;
};

// Generate deterministic Health ID if absent
MedicalProfileSchema.pre('save', function (next) {
  if (!this.healthId && this.userId) {
    const year = new Date().getFullYear();
    const suffix = this.userId.toString().slice(-6).toUpperCase();
    this.healthId = `HS-${year}-${suffix}`;
  }

  // Generate QR payload
  const primaryContact = this.emergencyContacts?.find((c) => c.isPrimary) || this.emergencyContacts?.[0];
  const qrPayload = {
    healthId: this.healthId,
    fullName: this.fullName,
    bloodGroup: this.bloodGroup,
    allergies: this.allergies || [],
    emergencyContact: primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : 'None',
    organDonor: this.organDonor,
  };
  this.qrData = JSON.stringify(qrPayload);

  this.calculateCompletion();
  next();
});

module.exports = mongoose.model('MedicalProfile', MedicalProfileSchema);
