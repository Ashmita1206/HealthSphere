const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  serviceCode: { type: String, required: true }, // e.g. CPT-99213
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitCost: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  insuranceCoveredAmount: { type: Number, default: 0 },
  patientPayableAmount: { type: Number, default: 0 }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  insuranceProvider: { type: String, default: 'Self Pay' },
  policyNumber: { type: String, default: null },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  insuranceCoverageTotal: { type: Number, default: 0 },
  patientBalanceDue: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'issued', 'partially_paid', 'paid_in_full', 'written_off'], 
    default: 'issued' 
  },
  dueDate: { type: Date, required: true }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

const BillingClaimSchema = new mongoose.Schema({
  claimId: { type: String, required: true, unique: true },
  invoiceId: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  insuranceProvider: { type: String, required: true },
  policyNumber: { type: String, required: true },
  totalBilledAmount: { type: Number, required: true },
  approvedAmount: { type: Number, default: 0 },
  deductibleApplied: { type: Number, default: 0 },
  copayApplied: { type: Number, default: 0 },
  settlementStatus: { 
    type: String, 
    enum: ['pre_authorized', 'submitted', 'in_review', 'adjudicated_approved', 'denied', 'settled'], 
    default: 'submitted' 
  },
  aiClaimScrubberScore: { type: Number, min: 0, max: 100, default: 95 },
  scrubberFlags: [{ type: String }],
  adjudicationNotes: { type: String, default: null }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

module.exports = {
  Invoice: mongoose.model('Invoice', InvoiceSchema),
  BillingClaim: mongoose.model('BillingClaim', BillingClaimSchema)
};
