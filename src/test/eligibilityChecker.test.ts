import { describe, it, expect } from 'vitest';
import {
  evaluateEligibility,
  ELIGIBILITY_DISCLAIMER,
  EligibilityAnswers,
} from '@/components/bloodDonation/eligibilityRules';

describe('Blood Donation Clinical Eligibility Checker Suite', () => {
  const eligibleBaseline: EligibilityAnswers = {
    age: '26-35',
    weight: '61-70',
    hasFever: 'no',
    recentSurgery: 'no',
    pregnancy: 'no',
    recentDonation: 'no',
  };

  it('1. Fully eligible baseline scenario passes with clear guidance and steps', () => {
    const result = evaluateEligibility(eligibleBaseline);
    expect(result.status).toBe('eligible');
    expect(result.isComplete).toBe(true);
    expect(result.message).toContain('meet the preliminary eligibility');
    expect(result.nextSteps).toContain('Hydrate');
  });

  it('2. Fixes parseInt bug: "under-18" correctly evaluates to not-eligible', () => {
    const result = evaluateEligibility({
      ...eligibleBaseline,
      age: 'under-18',
    });
    expect(result.status).toBe('not-eligible');
    expect(result.reasons.some((r) => r.includes('18 years'))).toBe(true);
  });

  it('3. Donors over 65 ("65+") are marked not-eligible for standard unapproved walk-in donation', () => {
    const result = evaluateEligibility({
      ...eligibleBaseline,
      age: '65+',
    });
    expect(result.status).toBe('not-eligible');
    expect(result.reasons.some((r) => r.includes('65'))).toBe(true);
  });

  it('4. Fixes parseInt bug: "under-50" weight correctly evaluates to not-eligible', () => {
    const result = evaluateEligibility({
      ...eligibleBaseline,
      weight: 'under-50',
    });
    expect(result.status).toBe('not-eligible');
    expect(result.reasons.some((r) => r.includes('50 kg'))).toBe(true);
  });

  it('5. Active fever or respiratory infection ("yes") marks donor not-eligible', () => {
    const result = evaluateEligibility({
      ...eligibleBaseline,
      hasFever: 'yes',
    });
    expect(result.status).toBe('not-eligible');
    expect(result.reasons.some((r) => r.includes('fever') || r.includes('infection'))).toBe(true);
  });

  it('6. Recent surgery in last 6 months ("yes") triggers 6-month clinical deferral', () => {
    const result = evaluateEligibility({
      ...eligibleBaseline,
      recentSurgery: 'yes',
    });
    expect(result.status).toBe('not-eligible');
    expect(result.reasons.some((r) => r.includes('surgery') || r.includes('deferral'))).toBe(true);
  });

  it('7. Recent blood donation in last 3 months ("yes") triggers interval deferral', () => {
    const result = evaluateEligibility({
      ...eligibleBaseline,
      recentDonation: 'yes',
    });
    expect(result.status).toBe('not-eligible');
    expect(result.reasons.some((r) => r.includes('3 months'))).toBe(true);
  });

  it('8. Unsure donation interval triggers "maybe-eligible" status with clinical verification note', () => {
    const result = evaluateEligibility({
      ...eligibleBaseline,
      recentDonation: 'unsure',
    });
    expect(result.status).toBe('maybe-eligible');
    expect(result.reasons.some((r) => r.includes('Verify the exact date'))).toBe(true);
  });

  it('9. Pregnancy: active pregnancy ("yes") defers, unsure requires medical officer consultation', () => {
    const activePreg = evaluateEligibility({
      ...eligibleBaseline,
      pregnancy: 'yes',
    });
    expect(activePreg.status).toBe('not-eligible');

    const unsurePreg = evaluateEligibility({
      ...eligibleBaseline,
      pregnancy: 'unsure',
    });
    expect(unsurePreg.status).toBe('maybe-eligible');
  });

  it('10. Incomplete answers: detects all missing questionnaire fields cleanly', () => {
    const emptyResult = evaluateEligibility({});
    expect(emptyResult.status).toBe('incomplete');
    expect(emptyResult.isComplete).toBe(false);
    expect(emptyResult.reasons).toHaveLength(6);

    const partialResult = evaluateEligibility({
      age: '18-25',
      weight: '50-60',
    });
    expect(partialResult.status).toBe('incomplete');
    expect(partialResult.reasons).toHaveLength(4);
  });

  it('11. Authoritative clinical disclaimer is present and explicit about on-site medical authority', () => {
    expect(ELIGIBILITY_DISCLAIMER).toContain('Preliminary screening guide only');
    expect(ELIGIBILITY_DISCLAIMER).toContain('licensed blood-bank medical officers');
  });
});
