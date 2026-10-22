/**
 * Clinical Eligibility Screening Rules for Voluntary Blood Donation
 * Aligned with standard National Blood Transfusion guidelines:
 * - Age: 18 - 65 years
 * - Weight: Minimum 50 kg (for 350ml/450ml donation)
 * - Health: Free from acute fever, respiratory infection, or active systemic illness
 * - Surgery deferral: 6 months post-major surgery
 * - Pregnancy deferral: Deferred during pregnancy and 6 months postpartum
 * - Donation interval: Minimum 12 weeks (3 months) for males / 16 weeks (4 months) for females
 */

export interface EligibilityAnswers {
  age?: string;
  weight?: string;
  hasFever?: string;
  recentSurgery?: string;
  pregnancy?: string;
  recentDonation?: string;
}

export type EligibilityStatus = 'eligible' | 'not-eligible' | 'maybe-eligible' | 'incomplete';

export interface EligibilityEvaluation {
  status: EligibilityStatus;
  isComplete: boolean;
  message: string;
  reasons: string[];
  nextSteps: string;
  color: string;
}

export const ELIGIBILITY_DISCLAIMER =
  'Preliminary screening guide only. HealthSphere cannot certify clinical eligibility. Final determination is made exclusively by licensed blood-bank medical officers on-site after hemoglobin, vital signs, and confidential clinical assessment.';

export const AGE_OPTIONS: Record<string, { label: string; eligible: boolean; note?: string }> = {
  'under-18': {
    label: 'Under 18 years',
    eligible: false,
    note: 'Legal voluntary donation requires minimum age of 18 years.',
  },
  '18-25': { label: '18-25 years', eligible: true },
  '26-35': { label: '26-35 years', eligible: true },
  '36-45': { label: '36-45 years', eligible: true },
  '46-55': { label: '46-55 years', eligible: true },
  '56-65': { label: '56-65 years', eligible: true },
  '65+': {
    label: 'Over 65 years',
    eligible: false,
    note: 'Donors over 65 require prior clinical approval and medical clearance at the blood bank.',
  },
};

export const WEIGHT_OPTIONS: Record<string, { label: string; eligible: boolean; note?: string }> = {
  'under-50': {
    label: 'Under 50 kg',
    eligible: false,
    note: 'Minimum weight must be 50 kg (110 lbs) to donate safely.',
  },
  '50-60': { label: '50-60 kg', eligible: true },
  '61-70': { label: '61-70 kg', eligible: true },
  '71-80': { label: '71-80 kg', eligible: true },
  '81-90': { label: '81-90 kg', eligible: true },
  '90+': { label: 'Over 90 kg', eligible: true },
};

export function evaluateEligibility(answers: EligibilityAnswers): EligibilityEvaluation {
  const { age, weight, hasFever, recentSurgery, pregnancy, recentDonation } = answers;

  // 1. Completeness validation
  const unanswered: string[] = [];
  if (!age) unanswered.push('Age range');
  if (!weight) unanswered.push('Weight range');
  if (!hasFever) unanswered.push('Fever / infection status');
  if (!recentSurgery) unanswered.push('Recent surgery status');
  if (!pregnancy) unanswered.push('Pregnancy status');
  if (!recentDonation) unanswered.push('Recent donation history');

  if (unanswered.length > 0) {
    return {
      status: 'incomplete',
      isComplete: false,
      message: `Complete all questions to check preliminary eligibility (${unanswered.length} remaining).`,
      reasons: unanswered.map((field) => `Unanswered: ${field}`),
      nextSteps: 'Please answer all questions above to receive an accurate screening assessment.',
      color: 'bg-slate-50 text-slate-700 border-slate-200',
    };
  }

  const disqualifications: string[] = [];
  const consultFlags: string[] = [];

  // 2. Age check with explicit option mapping (NO parseInt bugs)
  const ageConfig = AGE_OPTIONS[age];
  if (!ageConfig || !ageConfig.eligible) {
    disqualifications.push(ageConfig?.note || 'Age must be between 18 and 65 years for standard blood donation.');
  }

  // 3. Weight check with explicit mapping (NO parseInt bugs)
  const weightConfig = WEIGHT_OPTIONS[weight];
  if (!weightConfig || !weightConfig.eligible) {
    disqualifications.push(weightConfig?.note || 'Weight must be at least 50 kg to ensure donor safety.');
  }

  // 4. Acute fever or active infection
  if (hasFever === 'yes') {
    disqualifications.push('You must be completely symptom-free and recovered from any infection or fever for at least 14 days.');
  }

  // 5. Recent surgery in last 6 months
  if (recentSurgery === 'yes') {
    disqualifications.push('A 6-month deferral is required following major surgery for tissue recovery and hemoglobin restoration.');
  }

  // 6. Pregnancy
  if (pregnancy === 'yes') {
    disqualifications.push('Donation is temporarily deferred during pregnancy and for 6 months post-delivery.');
  } else if (pregnancy === 'unsure') {
    consultFlags.push('Pregnancy status requires on-site clinical consultation before donation.');
  }

  // 7. Recent donation in last 3 months
  if (recentDonation === 'yes') {
    disqualifications.push('A minimum interval of 3 months (12 weeks) is required between whole blood donations.');
  } else if (recentDonation === 'unsure') {
    consultFlags.push('Verify the exact date of your last donation with your donor record.');
  }

  // Final evaluation
  if (disqualifications.length > 0) {
    return {
      status: 'not-eligible',
      isComplete: true,
      message: 'You currently do not meet preliminary eligibility criteria for blood donation.',
      reasons: disqualifications,
      nextSteps: 'Review the deferral guidelines above. Temporary deferrals can be rechecked once the recovery interval has elapsed.',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  }

  if (consultFlags.length > 0) {
    return {
      status: 'maybe-eligible',
      isComplete: true,
      message: 'Consultation with a blood-bank medical officer is recommended.',
      reasons: consultFlags,
      nextSteps: 'Visit your nearest blood bank for an on-site clinical review and hemoglobin screening.',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  return {
    status: 'eligible',
    isComplete: true,
    message: 'You meet the preliminary eligibility criteria to donate blood.',
    reasons: ['Age (18-65), weight (50kg+), recovery intervals, and general health criteria met.'],
    nextSteps: 'Hydrate well, rest well, and present a valid photo ID at your chosen donation facility.',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
}
