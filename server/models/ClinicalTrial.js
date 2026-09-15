const mongoose = require('mongoose');

const EligibilityCriteriaSchema = new mongoose.Schema({
  minAge: { type: Number, default: 18 },
  maxAge: { type: Number, default: 75 },
  gender: { type: String, enum: ['All', 'Male', 'Female'], default: 'All' },
  inclusionConditions: [{ type: String }],
  exclusionConditions: [{ type: String }],
  biomarkerRequirements: [{ type: String }]
}, { _id: false });

const ClinicalTrialSchema = new mongoose.Schema({
  trialId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  phase: { 
    type: String, 
    enum: ['Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Observational'], 
    required: true 
  },
  therapeuticArea: { 
    type: String, 
    enum: ['Oncology', 'Cardiology', 'Neurology', 'Immunology', 'Endocrinology', 'Infectious Disease'], 
    required: true 
  },
  principalInvestigator: { type: String, required: true },
  sponsor: { type: String, required: true },
  targetEnrollment: { type: Number, required: true },
  currentEnrolled: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['recruiting', 'active_not_recruiting', 'completed', 'suspended'], 
    default: 'recruiting' 
  },
  eligibilityCriteria: EligibilityCriteriaSchema,
  primaryEndpoints: [{ type: String }],
  startDate: { type: Date, required: true },
  estimatedCompletionDate: { type: Date, required: true }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

const SubjectEnrollmentSchema = new mongoose.Schema({
  enrollmentId: { type: String, required: true, unique: true },
  trialId: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  eligibilityScore: { type: Number, min: 0, max: 100, required: true },
  cohortAssignment: { type: String, required: true }, // e.g. 'Arm A (Novel Monoclonal)' or 'Arm B (Placebo)'
  enrollmentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['screened', 'consented', 'randomized', 'completed', 'withdrawn'], 
    default: 'consented' 
  }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

module.exports = {
  ClinicalTrial: mongoose.model('ClinicalTrial', ClinicalTrialSchema),
  SubjectEnrollment: mongoose.model('SubjectEnrollment', SubjectEnrollmentSchema)
};
