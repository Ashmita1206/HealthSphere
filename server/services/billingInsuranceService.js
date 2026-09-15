const registeredPolicies = [
  {
    policyNumber: 'BCBS-992014',
    providerName: 'BlueCross BlueShield',
    subscriberName: 'Arthur Dent',
    planType: 'Comprehensive PPO Gold',
    annualLimit: 100000.00,
    deductibleTotal: 1500.00,
    deductibleMet: 1200.00,
    copayPercentage: 15, // Patient pays 15%, Insurance covers 85%
    status: 'active',
    validUntil: '2027-12-31'
  },
  {
    policyNumber: 'AET-771920',
    providerName: 'Aetna Health Advantage',
    subscriberName: 'Maya Lin',
    planType: 'HMO Standard',
    annualLimit: 75000.00,
    deductibleTotal: 2000.00,
    deductibleMet: 2000.00,
    copayPercentage: 10,
    status: 'active',
    validUntil: '2026-11-30'
  },
  {
    policyNumber: 'STAR-330192',
    providerName: 'Star Health Comprehensive',
    subscriberName: 'Viktor Krum',
    planType: 'Critical Illness Top-Up',
    annualLimit: 50000.00,
    deductibleTotal: 500.00,
    deductibleMet: 500.00,
    copayPercentage: 0,
    status: 'active',
    validUntil: '2027-06-30'
  }
];

const seedInvoices = [
  {
    invoiceId: 'INV-2025-001',
    patientId: 'PT-301',
    patientName: 'Arthur Dent',
    insuranceProvider: 'BlueCross BlueShield',
    policyNumber: 'BCBS-992014',
    items: [
      { itemId: 'ITM-1', serviceCode: 'CPT-99214', description: 'Level 4 Outpatient Specialist Consultation', quantity: 1, unitCost: 250.00, lineTotal: 250.00, insuranceCoveredAmount: 212.50, patientPayableAmount: 37.50 },
      { itemId: 'ITM-2', serviceCode: 'CPT-80053', description: 'Comprehensive Metabolic Panel (CMP)', quantity: 1, unitCost: 120.00, lineTotal: 120.00, insuranceCoveredAmount: 102.00, patientPayableAmount: 18.00 }
    ],
    subtotal: 370.00,
    taxAmount: 0.00,
    totalAmount: 370.00,
    insuranceCoverageTotal: 314.50,
    patientBalanceDue: 55.50,
    amountPaid: 55.50,
    status: 'paid_in_full',
    dueDate: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString()
  },
  {
    invoiceId: 'INV-2025-002',
    patientId: 'PT-302',
    patientName: 'Maya Lin',
    insuranceProvider: 'Aetna Health Advantage',
    policyNumber: 'AET-771920',
    items: [
      { itemId: 'ITM-3', serviceCode: 'CPT-71046', description: 'Chest X-Ray 2 Views (Radiology)', quantity: 1, unitCost: 350.00, lineTotal: 350.00, insuranceCoveredAmount: 315.00, patientPayableAmount: 35.00 }
    ],
    subtotal: 350.00,
    taxAmount: 0.00,
    totalAmount: 350.00,
    insuranceCoverageTotal: 315.00,
    patientBalanceDue: 35.00,
    amountPaid: 0.00,
    status: 'issued',
    dueDate: new Date(Date.now() + 1000 * 3600 * 24 * 15).toISOString()
  }
];

const seedClaims = [
  {
    claimId: 'CLM-9011',
    invoiceId: 'INV-2025-001',
    patientId: 'PT-301',
    patientName: 'Arthur Dent',
    insuranceProvider: 'BlueCross BlueShield',
    policyNumber: 'BCBS-992014',
    totalBilledAmount: 314.50,
    approvedAmount: 314.50,
    deductibleApplied: 0,
    copayApplied: 55.50,
    settlementStatus: 'settled',
    aiClaimScrubberScore: 98,
    scrubberFlags: [],
    adjudicationNotes: 'Clean claim auto-adjudicated with Tier-1 in-network fee schedule.'
  }
];

let activeInvoices = JSON.parse(JSON.stringify(seedInvoices));
let activeClaims = JSON.parse(JSON.stringify(seedClaims));
let paymentLedger = [];

class BillingInsuranceService {
  /**
   * Enterprise Revenue & Financial Operations Dashboard
   */
  async getRevenueDashboard() {
    const totalBilled = activeInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalCollected = activeInvoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
    const totalInsuranceCovered = activeInvoices.reduce((acc, inv) => acc + inv.insuranceCoverageTotal, 0);
    const outstandingAR = totalBilled - totalCollected;

    const settledClaims = activeClaims.filter(c => c.settlementStatus === 'settled' || c.settlementStatus === 'adjudicated_approved');
    const claimApprovalRate = activeClaims.length > 0 ? Math.round((settledClaims.length / activeClaims.length) * 100) : 100;

    return {
      timestamp: new Date().toISOString(),
      financialSummary: {
        grossRevenueBilled: Number(totalBilled.toFixed(2)),
        totalCollections: Number(totalCollected.toFixed(2)),
        insurancePendingSettlements: Number(totalInsuranceCovered.toFixed(2)),
        outstandingAccountsReceivable: Number(outstandingAR.toFixed(2)),
        cleanClaimAdjudicationRatePct: claimApprovalRate,
        averageDaysInAR: 26.4
      },
      claimMetrics: {
        totalClaims: activeClaims.length,
        settledClaims: settledClaims.length,
        pendingReviewClaims: activeClaims.filter(c => c.settlementStatus === 'submitted' || c.settlementStatus === 'in_review').length
      },
      topPayers: [
        { payer: 'BlueCross BlueShield', sharePercentage: 44.5 },
        { payer: 'Aetna Health Advantage', sharePercentage: 28.0 },
        { payer: 'Star Health Comprehensive', sharePercentage: 15.5 },
        { payer: 'Self-Pay / Direct Out of Pocket', sharePercentage: 12.0 }
      ]
    };
  }

  /**
   * Real-Time Insurance Eligibility Verification
   */
  async verifyInsuranceEligibility(policyNumber, providerName) {
    if (!policyNumber) throw new Error('Policy number is required for eligibility verification');

    const policy = registeredPolicies.find(p => 
      p.policyNumber.toLowerCase() === policyNumber.toLowerCase() ||
      (providerName && p.providerName.toLowerCase().includes(providerName.toLowerCase()))
    );

    if (!policy) {
      return {
        eligible: false,
        policyNumber,
        message: 'Policy not recognized or inactive with designated payer gateway',
        verifiedAt: new Date().toISOString()
      };
    }

    const remainingDeductible = Math.max(0, policy.deductibleTotal - policy.deductibleMet);

    return {
      eligible: true,
      policyNumber: policy.policyNumber,
      providerName: policy.providerName,
      subscriberName: policy.subscriberName,
      planType: policy.planType,
      copayPercentage: policy.copayPercentage,
      insuranceCoveragePercentage: 100 - policy.copayPercentage,
      remainingDeductible,
      preAuthorizationRequiredFor: ['Inpatient Surgery', 'Advanced Neuroimaging (MRI/CT)', 'Biological Therapies'],
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Generate Itemized Patient Invoice with Copay Split
   */
  async generateInvoice(invoiceData) {
    const { patientId, patientName, insuranceProvider, policyNumber, items } = invoiceData;
    if (!patientId || !patientName || !items || items.length === 0) {
      throw new Error('Invoice requires patient details and line items');
    }

    // Determine coverage percentage
    let copayPct = 20; // default 20% patient, 80% insurance
    if (policyNumber) {
      const pol = registeredPolicies.find(p => p.policyNumber.toLowerCase() === policyNumber.toLowerCase());
      if (pol) copayPct = pol.copayPercentage;
    } else if (insuranceProvider === 'Self Pay') {
      copayPct = 100;
    }

    let subtotal = 0;
    const computedItems = items.map((itm, idx) => {
      const qty = Number(itm.quantity) || 1;
      const cost = Number(itm.unitCost);
      const line = qty * cost;
      subtotal += line;

      const patientAmt = Number(((line * copayPct) / 100).toFixed(2));
      const insAmt = Number((line - patientAmt).toFixed(2));

      return {
        itemId: itm.itemId || `ITM-${idx + 1}`,
        serviceCode: itm.serviceCode || 'CPT-GENERIC',
        description: itm.description || 'Clinical Service',
        quantity: qty,
        unitCost: cost,
        lineTotal: line,
        insuranceCoveredAmount: insAmt,
        patientPayableAmount: patientAmt
      };
    });

    const taxAmount = 0.00;
    const totalAmount = subtotal + taxAmount;
    const totalPatientDue = Number(((totalAmount * copayPct) / 100).toFixed(2));
    const totalInsuranceCovered = Number((totalAmount - totalPatientDue).toFixed(2));

    const invoice = {
      invoiceId: invoiceData.invoiceId || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      patientName,
      insuranceProvider: insuranceProvider || 'Self Pay',
      policyNumber: policyNumber || null,
      items: computedItems,
      subtotal,
      taxAmount,
      totalAmount,
      insuranceCoverageTotal: totalInsuranceCovered,
      patientBalanceDue: totalPatientDue,
      amountPaid: 0.00,
      status: 'issued',
      dueDate: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString()
    };

    activeInvoices.push(invoice);
    return invoice;
  }

  /**
   * Submit EDI Claim with AI Claim Scrubber
   */
  async submitClaim(claimData) {
    const { invoiceId, patientId, patientName, insuranceProvider, policyNumber, totalBilledAmount } = claimData;
    if (!invoiceId || !patientId || !insuranceProvider || !policyNumber) {
      throw new Error('Claim submission requires invoiceId, patientId, and insurance details');
    }

    const scrubberFlags = [];
    let scrubberScore = 96;

    if (totalBilledAmount > 50000) {
      scrubberFlags.push('High-value claim requires secondary attachment: operative notes or imaging requisition');
      scrubberScore -= 8;
    }

    const claim = {
      claimId: claimData.claimId || `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId,
      patientId,
      patientName: patientName || 'Designated Patient',
      insuranceProvider,
      policyNumber,
      totalBilledAmount: Number(totalBilledAmount),
      approvedAmount: 0,
      deductibleApplied: 0,
      copayApplied: 0,
      settlementStatus: scrubberScore >= 90 ? 'submitted' : 'in_review',
      aiClaimScrubberScore: scrubberScore,
      scrubberFlags,
      adjudicationNotes: 'Processed via automated EDI 837 health claim transaction gateway'
    };

    activeClaims.push(claim);
    return claim;
  }

  /**
   * Adjudicate Claim Decision
   */
  async adjudicateClaim(claimId, { decision, approvedAmount, notes }) {
    const claim = activeClaims.find(c => c.claimId === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    if (decision === 'approve') {
      claim.settlementStatus = 'adjudicated_approved';
      claim.approvedAmount = approvedAmount || claim.totalBilledAmount;
      claim.adjudicationNotes = notes || 'Claim approved in full according to contracted fee schedules.';
    } else if (decision === 'deny') {
      claim.settlementStatus = 'denied';
      claim.approvedAmount = 0;
      claim.adjudicationNotes = notes || 'Claim denied: service exceeds contracted policy limits or lacks pre-authorization.';
    }

    return {
      success: true,
      message: `Claim ${claimId} successfully updated to ${claim.settlementStatus}`,
      claim
    };
  }

  /**
   * Record Patient or Insurer Payment
   */
  async recordPayment({ invoiceId, amountPaid, paymentMethod, referenceNumber }) {
    const invoice = activeInvoices.find(i => i.invoiceId === invoiceId);
    if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

    const payment = {
      transactionId: `TXN-${Date.now()}`,
      invoiceId,
      amountPaid: Number(amountPaid),
      paymentMethod: paymentMethod || 'CreditCard',
      referenceNumber: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString()
    };

    invoice.amountPaid += payment.amountPaid;
    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'paid_in_full';
      invoice.patientBalanceDue = 0;
    } else {
      invoice.status = 'partially_paid';
      invoice.patientBalanceDue = Math.max(0, invoice.patientBalanceDue - payment.amountPaid);
    }

    paymentLedger.push(payment);
    return {
      success: true,
      payment,
      updatedInvoice: invoice
    };
  }

  /**
   * Fetch Invoices
   */
  async getInvoices(query = {}) {
    let invoices = [...activeInvoices];
    if (query.patientId) invoices = invoices.filter(i => i.patientId === query.patientId);
    if (query.status) invoices = invoices.filter(i => i.status === query.status);
    return invoices;
  }

  /**
   * Fetch Claims
   */
  async getClaims(query = {}) {
    let claims = [...activeClaims];
    if (query.status) claims = claims.filter(c => c.settlementStatus === query.status);
    return claims;
  }
}

module.exports = new BillingInsuranceService();
