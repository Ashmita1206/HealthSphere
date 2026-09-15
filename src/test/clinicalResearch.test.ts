import { describe, it, expect } from 'vitest';

const researchService = require('../../server/services/clinicalResearchService');

describe('F53 — Research & Clinical Trials Service Suite', () => {
  it('should retrieve clinical research operations overview', async () => {
    const overview = await researchService.getResearchOverview();

    expect(overview).toBeDefined();
    expect(overview.summary.activeClinicalTrialsCount).toBeGreaterThanOrEqual(3);
    expect(overview.summary.totalSubjectsEnrolled).toBeGreaterThan(500);
    expect(overview.summary.recruitmentProgressPercentage).toBeGreaterThan(0);
    expect(overview.therapeuticAreas.length).toBeGreaterThanOrEqual(3);
  });

  it('should list and filter clinical trials by therapeutic area and phase', async () => {
    const all = await researchService.getTrials();
    expect(all.length).toBeGreaterThanOrEqual(3);

    const oncology = await researchService.getTrials({ therapeuticArea: 'Oncology' });
    expect(oncology.length).toBe(1);
    expect(oncology[0].therapeuticArea).toBe('Oncology');

    const phase2 = await researchService.getTrials({ phase: 'Phase II' });
    expect(phase2.length).toBeGreaterThanOrEqual(2);
  });

  it('should run AI eligibility matching for patient profiles', async () => {
    // Eligible oncology patient
    const matchResults = await researchService.matchPatientEligibility({
      age: 52,
      gender: 'Female',
      diagnoses: ['Invasive Ductal Carcinoma', 'HER2-Positive'],
      medicalHistory: ['Appendectomy 2018']
    });

    expect(matchResults.matchedTrials.length).toBeGreaterThanOrEqual(3);
    const topTrial = matchResults.matchedTrials[0];
    expect(topTrial.trialId).toBe('NCT-05891244');
    expect(topTrial.eligibilityScore).toBeGreaterThanOrEqual(75);
    expect(topTrial.isEligible).toBe(true);

    // Ineligible patient due to gender or age
    const maleMismatch = await researchService.matchPatientEligibility({
      age: 82, // above 75
      gender: 'Male', // female required
      diagnoses: ['Invasive Ductal Carcinoma']
    });

    const oncTrial = maleMismatch.matchedTrials.find((t: any) => t.trialId === 'NCT-05891244');
    expect(oncTrial.isEligible).toBe(false);
    expect(oncTrial.eligibilityScore).toBeLessThan(50);
  });

  it('should enroll subject and assign stratified cohort randomization', async () => {
    const initialTrials = await researchService.getTrials({ therapeuticArea: 'Cardiology' });
    const initialEnrolled = initialTrials[0].currentEnrolled;

    const enrollment = await researchService.enrollSubject({
      trialId: 'NCT-04921008',
      patientId: 'PT-770',
      patientName: 'Eleanor Gray',
      eligibilityScore: 94
    });

    expect(enrollment.success).toBe(true);
    expect(enrollment.enrollment.cohortAssignment).toMatch(/Arm A|Arm B/);
    expect(enrollment.updatedTrialStats.currentEnrolled).toBe(initialEnrolled + 1);

    const subjects = await researchService.getEnrolledSubjects('NCT-04921008');
    expect(subjects.some((s: any) => s.patientName === 'Eleanor Gray')).toBe(true);
  });

  it('should deliver research diversity and recruitment velocity analytics', async () => {
    const analytics = await researchService.getResearchAnalytics();

    expect(analytics.diversityMetrics.femalePercentage).toBeGreaterThan(0);
    expect(analytics.recruitmentVelocityByPhase.length).toBeGreaterThan(0);
    expect(analytics.trialCompletionForecast.length).toBeGreaterThanOrEqual(3);
  });

  it('should retrieve peer-reviewed clinical trial publications', async () => {
    const pubs = await researchService.getPublications();

    expect(pubs.length).toBeGreaterThanOrEqual(2);
    expect(pubs[0].doi).toBeDefined();
    expect(pubs[0].impactFactor).toBeGreaterThan(50);
  });
});
