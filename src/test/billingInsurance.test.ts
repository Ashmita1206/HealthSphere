import { describe, it, expect } from 'vitest';

const billingService = require('../../server/services/billingInsuranceService');

describe('F52 — Insurance & Billing Platform Service Suite', () => {
  it('should compile financial revenue dashboard with AR and clean claim metrics', async () => {
    const dashboard = await billingService.getRevenueDashboard();

    expect(dashboard).toBeDefined();
    expect(dashboard.financialSummary.grossRevenueBilled).toBeGreaterThan(0);
    expect(dashboard.financialSummary.cleanClaimAdjudicationRatePct).toBeGreaterThanOrEqual(90);
    expect(dashboard.claimMetrics.totalClaims).toBeGreaterThanOrEqual(1);
    expect(dashboard.topPayers.length).toBeGreaterThanOrEqual(3);
  });

  it('should verify insurance eligibility and return coverage percentages', async () => {
    const verified = await billingService.verifyInsuranceEligibility('BCBS-992014', 'BlueCross BlueShield');

    expect(verified.eligible).toBe(true);
    expect(verified.copayPercentage).toBe(15);
    expect(verified.insuranceCoveragePercentage).toBe(85);
    expect(verified.remainingDeductible).toBe(300); // 1500 - 1200
    expect(verified.preAuthorizationRequiredFor.length).toBeGreaterThan(0);

    const invalid = await billingService.verifyInsuranceEligibility('NON-EXISTENT-999');
    expect(invalid.eligible).toBe(false);
  });

  it('should generate itemized patient invoice with automatic copay/insurance split', async () => {
    const invoice = await billingService.generateInvoice({
      patientId: 'PT-301',
      patientName: 'Arthur Dent',
      policyNumber: 'BCBS-992014', // 15% copay
      items: [
        {
          serviceCode: 'CPT-99215',
          description: 'High Complexity Outpatient Medical Decision Making',
          quantity: 1,
          unitCost: 300.00
        },
        {
          serviceCode: 'CPT-93000',
          description: '12-lead Electrocardiogram (ECG) with interpretation',
          quantity: 1,
          unitCost: 100.00
        }
      ]
    });

    expect(invoice.invoiceId).toBeDefined();
    expect(invoice.totalAmount).toBe(400.00);
    expect(invoice.patientBalanceDue).toBe(60.00); // 15% of 400
    expect(invoice.insuranceCoverageTotal).toBe(340.00); // 85% of 400
    expect(invoice.status).toBe('issued');
  });

  it('should submit claim for EDI adjudication and run AI claim scrubber', async () => {
    const claim = await billingService.submitClaim({
      invoiceId: 'INV-2025-002',
      patientId: 'PT-302',
      patientName: 'Maya Lin',
      insuranceProvider: 'Aetna Health Advantage',
      policyNumber: 'AET-771920',
      totalBilledAmount: 315.00
    });

    expect(claim.claimId).toBeDefined();
    expect(claim.aiClaimScrubberScore).toBeGreaterThanOrEqual(90);
    expect(claim.settlementStatus).toBe('submitted');

    // High value claim should flag scrubber
    const highValClaim = await billingService.submitClaim({
      invoiceId: 'INV-HIGH',
      patientId: 'PT-999',
      insuranceProvider: 'BlueCross BlueShield',
      policyNumber: 'BCBS-992014',
      totalBilledAmount: 75000.00
    });

    expect(highValClaim.scrubberFlags.length).toBeGreaterThan(0);
    expect(highValClaim.settlementStatus).toBe('in_review');
  });

  it('should adjudicate insurance claim with approval decision', async () => {
    const adjudication = await billingService.adjudicateClaim('CLM-9011', {
      decision: 'approve',
      approvedAmount: 314.50,
      notes: 'Adjudicated clean claim'
    });

    expect(adjudication.success).toBe(true);
    expect(adjudication.claim.settlementStatus).toBe('adjudicated_approved');
    expect(adjudication.claim.approvedAmount).toBe(314.50);
  });

  it('should record payment and update invoice balance', async () => {
    const payResult = await billingService.recordPayment({
      invoiceId: 'INV-2025-002',
      amountPaid: 35.00,
      paymentMethod: 'CreditCard'
    });

    expect(payResult.success).toBe(true);
    expect(payResult.payment.amountPaid).toBe(35.00);
    expect(payResult.updatedInvoice.amountPaid).toBe(35.00);
    expect(payResult.updatedInvoice.patientBalanceDue).toBe(0);
  });
});
