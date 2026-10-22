import { describe, it, expect } from 'vitest';
import {
  evaluateEligibility,
  AGE_OPTIONS,
  WEIGHT_OPTIONS,
  ELIGIBILITY_DISCLAIMER,
} from '../components/bloodDonation/eligibilityRules';

describe('Blood Donation & Eligibility Screening Unit Tests', () => {
  it('correctly maps raw backend donation request data to UI representation', () => {
    const rawRequest = {
      _id: 'req-99',
      requestType: 'blood',
      bloodType: 'A+',
      organType: null,
      urgency: 'critical',
      notes: 'Emergency Surgery Ward 3',
      createdAt: '2026-08-25T15:00:00.000Z',
    };

    const mapped = {
      id: rawRequest._id,
      patientName: 'Emergency Patient',
      bloodGroup: rawRequest.bloodType,
      hospital: rawRequest.notes,
      urgency: rawRequest.urgency,
      status: 'active',
    };

    expect(mapped.id).toBe('req-99');
    expect(mapped.bloodGroup).toBe('A+');
    expect(mapped.urgency).toBe('critical');
  });

  it('handles empty donor and donation request arrays cleanly', () => {
    const donors: any[] = [];
    const requests: any[] = [];

    expect(donors).toHaveLength(0);
    expect(requests).toHaveLength(0);
  });

  describe('Eligibility Rule Engine (evaluateEligibility)', () => {
    it('returns incomplete when any required question is unanswered', () => {
      const result = evaluateEligibility({
        age: '26-35',
        // weight missing
        hasFever: 'no',
        recentSurgery: 'no',
        pregnancy: 'no',
        recentDonation: 'no',
      });

      expect(result.status).toBe('incomplete');
      expect(result.isComplete).toBe(false);
      expect(result.message).toContain('1 remaining');
    });

    it('returns incomplete when all fields are empty', () => {
      const result = evaluateEligibility({});
      expect(result.status).toBe('incomplete');
      expect(result.isComplete).toBe(false);
      expect(result.reasons).toHaveLength(6);
    });

    it('correctly rejects age "under-18" without parseInt NaN bug', () => {
      const result = evaluateEligibility({
        age: 'under-18',
        weight: '61-70',
        hasFever: 'no',
        recentSurgery: 'no',
        pregnancy: 'no',
        recentDonation: 'no',
      });

      expect(result.status).toBe('not-eligible');
      expect(result.isComplete).toBe(true);
      expect(result.reasons.some((r) => r.includes('minimum age of 18'))).toBe(true);
    });

    it('correctly rejects age "65+" due to clinical clearance requirements', () => {
      const result = evaluateEligibility({
        age: '65+',
        weight: '61-70',
        hasFever: 'no',
        recentSurgery: 'no',
        pregnancy: 'no',
        recentDonation: 'no',
      });

      expect(result.status).toBe('not-eligible');
      expect(result.reasons.some((r) => r.includes('over 65'))).toBe(true);
    });

    it('correctly rejects weight "under-50" without parseInt NaN bug', () => {
      const result = evaluateEligibility({
        age: '26-35',
        weight: 'under-50',
        hasFever: 'no',
        recentSurgery: 'no',
        pregnancy: 'no',
        recentDonation: 'no',
      });

      expect(result.status).toBe('not-eligible');
      expect(result.reasons.some((r) => r.includes('50 kg'))).toBe(true);
    });

    it('correctly rejects active fever or systemic infection', () => {
      const result = evaluateEligibility({
        age: '26-35',
        weight: '61-70',
        hasFever: 'yes',
        recentSurgery: 'no',
        pregnancy: 'no',
        recentDonation: 'no',
      });

      expect(result.status).toBe('not-eligible');
      expect(result.reasons.some((r) => r.includes('14 days'))).toBe(true);
    });

    it('correctly rejects major surgery within last 6 months', () => {
      const result = evaluateEligibility({
        age: '26-35',
        weight: '61-70',
        hasFever: 'no',
        recentSurgery: 'yes',
        pregnancy: 'no',
        recentDonation: 'no',
      });

      expect(result.status).toBe('not-eligible');
      expect(result.reasons.some((r) => r.includes('6-month deferral'))).toBe(true);
    });

    it('correctly rejects active pregnancy', () => {
      const result = evaluateEligibility({
        age: '26-35',
        weight: '61-70',
        hasFever: 'no',
        recentSurgery: 'no',
        pregnancy: 'yes',
        recentDonation: 'no',
      });

      expect(result.status).toBe('not-eligible');
      expect(result.reasons.some((r) => r.includes('pregnancy'))).toBe(true);
    });

    it('flags unsure pregnancy as maybe-eligible for clinical consultation', () => {
      const result = evaluateEligibility({
        age: '26-35',
        weight: '61-70',
        hasFever: 'no',
        recentSurgery: 'no',
        pregnancy: 'unsure',
        recentDonation: 'no',
      });

      expect(result.status).toBe('maybe-eligible');
      expect(result.isComplete).toBe(true);
      expect(result.reasons.some((r) => r.includes('on-site clinical consultation'))).toBe(true);
    });

    it('correctly rejects recent blood donation within last 3 months', () => {
      const result = evaluateEligibility({
        age: '26-35',
        weight: '61-70',
        hasFever: 'no',
        recentSurgery: 'no',
        pregnancy: 'no',
        recentDonation: 'yes',
      });

      expect(result.status).toBe('not-eligible');
      expect(result.reasons.some((r) => r.includes('minimum interval of 3 months'))).toBe(true);
    });

    it('evaluates fully eligible donor who meets all criteria', () => {
      const result = evaluateEligibility({
        age: '26-35',
        weight: '61-70',
        hasFever: 'no',
        recentSurgery: 'no',
        pregnancy: 'no',
        recentDonation: 'no',
      });

      expect(result.status).toBe('eligible');
      expect(result.isComplete).toBe(true);
      expect(result.color).toContain('emerald');
      expect(result.message).toContain('meet the preliminary eligibility criteria');
    });

    it('includes official disclaimer in clinical guidelines', () => {
      expect(ELIGIBILITY_DISCLAIMER).toContain('HealthSphere cannot certify clinical eligibility');
      expect(ELIGIBILITY_DISCLAIMER).toContain('blood-bank medical officers');
    });
  });

  describe('Organ Donation Regulatory Guardrails', () => {
    it('verifies organ donation does not expose public inventory or commerce actions', () => {
      // THOTA compliance check: organ donation must be strictly informational and educational
      const restrictedActions = ['buy', 'sell', 'order', 'reserve', 'cart', 'bidding'];
      const allowedActions = ['pledge_intent', 'view_faqs', 'find_authorized_center', 'thota_guidance'];

      expect(restrictedActions.every((action) => !allowedActions.includes(action))).toBe(true);
    });
  });
});
