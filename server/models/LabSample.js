const mongoose = require('mongoose');

const TestParameterResultSchema = new mongoose.Schema({
  parameterName: { type: String, required: true },
  observedValue: { type: Number, required: true },
  unit: { type: String, required: true },
  referenceRangeLow: { type: Number, required: true },
  referenceRangeHigh: { type: Number, required: true },
  abnormalityFlag: { 
    type: String, 
    enum: ['normal', 'low', 'high', 'critical_low', 'critical_high'], 
    default: 'normal' 
  },
  aiInsight: { type: String, default: null }
}, { _id: false });

const LabOrderSchema = new mongoose.Schema({
  testOrderId: { type: String, required: true, unique: true },
  specimenId: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  testCode: { type: String, required: true },
  testName: { type: String, required: true },
  panelCategory: { 
    type: String, 
    enum: ['Hematology', 'Biochemistry', 'Immunology', 'Microbiology', 'Histopathology', 'Endocrinology'], 
    required: true 
  },
  orderedByDoctor: { type: String, required: true },
  priority: { type: String, enum: ['routine', 'stat_urgent', 'critical'], default: 'routine' },
  status: { 
    type: String, 
    enum: ['ordered', 'specimen_collected', 'in_progress', 'preliminary_ready', 'verified', 'approved'], 
    default: 'ordered' 
  },
  results: [TestParameterResultSchema],
  aiSummary: { type: String, default: null },
  criticalValueAlert: { type: Boolean, default: false },
  technicianNotes: { type: String, default: '' },
  pathologistSignOff: {
    doctorName: { type: String, default: null },
    signedAt: { type: Date, default: null }
  }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

module.exports = mongoose.model('LabOrder', LabOrderSchema);
