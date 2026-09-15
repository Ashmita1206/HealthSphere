import { describe, it, expect, vi } from 'vitest';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const predictiveCareService = req('../../server/services/predictiveCareService');

describe('F18 — Predictive AI & Personalized Care Suite', () => {
  const mockHealthyContext = {
    userId: '64b1f77bcf86cd7994390001',
    healthScore: { current: 88, status: 'Optimal' },
    vitals: {
      count: 14,
      latest: {
        systolic: 118,
        diastolic: 76,
        heartRate: 68,
        glucose: 94,
        oxygen: 99,
        temperature: 98.4,
      },
    },
    adherence: {
      rate: 96,
      totalScheduled: 14,
      totalCompleted: 14,
      missedCount: 0,
      status: 'High Adherence',
    },
    medicines: [
      { name: 'Multivitamin', dosage: '1 tab', timing: 'Morning' },
    ],
    medicalProfile: {
      conditions: [],
      allergies: [],
      bmi: 22.4,
    },
    symptoms: [],
    reports: [
      { title: 'Annual Health Check', summary: 'All values within normal range.' },
    ],
  };

  const mockAtRiskContext = {
    userId: '64b1f77bcf86cd7994390002',
    healthScore: { current: 42, status: 'Critical' },
    vitals: {
      count: 20,
      latest: {
        systolic: 168,
        diastolic: 98,
        heartRate: 118,
        glucose: 260,
        oxygen: 91,
        temperature: 101.2,
      },
    },
    adherence: {
      rate: 52,
      totalScheduled: 21,
      totalCompleted: 11,
      missedCount: 10,
      status: 'Poor Adherence',
    },
    medicines: [
      { name: 'Metformin', dosage: '500mg', timing: 'Morning' },
      { name: 'Lisinopril', dosage: '10mg', timing: 'Morning' },
      { name: 'Atorvastatin', dosage: '20mg', timing: 'Night' },
      { name: 'Amlodipine', dosage: '5mg', timing: 'Night' },
      { name: 'Insulin Glargine', dosage: '15 units', timing: 'Bedtime' },
    ],
    medicalProfile: {
      conditions: [{ name: 'Type 2 Diabetes' }, { name: 'Essential Hypertension' }],
      allergies: [{ allergen: 'Penicillin' }],
      bmi: 31.8,
    },
    symptoms: [
      { symptom: 'Shortness of breath', severity: 'severe' },
      { symptom: 'Dizziness and blurred vision', severity: 'moderate' },
      { symptom: 'Chest tightness on exertion', severity: 'severe' },
    ],
    reports: [
      { title: 'Lipid & Metabolic Panel', summary: 'HbA1c elevated at 9.4%.' },
    ],
  };

  /*
  ============================================================
  1. AI Confidence Score & Data Density
  ============================================================
  */
  describe('1. AI Confidence Scoring Engine', () => {
    it('calculates higher confidence scores for data-rich patient contexts', () => {
      const confidence = predictiveCareService.calculateConfidenceMetrics(mockHealthyContext);
      expect(confidence.score).toBeGreaterThanOrEqual(75);
      expect(['HIGH', 'MEDIUM']).toContain(confidence.tier);
      expect(confidence.dataCompleteness).toBeDefined();
      expect(confidence.signalReliability).toBeDefined();
    });

    it('gracefully handles minimal context with safe floor confidence', () => {
      const minimalContext = { userId: 'empty-user', vitals: {}, adherence: {} };
      const confidence = predictiveCareService.calculateConfidenceMetrics(minimalContext);
      expect(confidence.score).toBeGreaterThanOrEqual(65);
      expect(confidence.tier).toBe('LOW');
    });
  });

  /*
  ============================================================
  2. Disease Progression Prediction
  ============================================================
  */
  describe('2. Disease Progression Prediction & Projections', () => {
    it('predicts stable/improving disease progression for healthy parameters', async () => {
      const result = await predictiveCareService.predictDiseaseProgression(mockHealthyContext);

      expect(result.overallTrajectory).toBe('improving');
      expect(result.conditions).toHaveLength(3);

      const glucose = result.conditions.find((c: any) => c.condition.includes('Glycemic'));
      expect(glucose.trajectory).toBe('improving');
      expect(glucose.riskLevel).toBe('Low');

      const cardio = result.conditions.find((c: any) => c.condition.includes('Cardiovascular'));
      expect(cardio.trajectory).toBe('improving');
    });

    it('predicts worsening progression for uncontrolled chronic indicators with Explainable AI', async () => {
      const result = await predictiveCareService.predictDiseaseProgression(mockAtRiskContext);

      expect(result.overallTrajectory).toBe('worsening');

      const glucose = result.conditions.find((c: any) => c.condition.includes('Glycemic'));
      expect(glucose.trajectory).toBe('worsening');
      expect(glucose.riskLevel).toBe('High');
      expect(glucose.timelineProjections.threeMonth).toBeDefined();

      // Explainable AI (XAI) validation
      expect(glucose.explainability).toBeDefined();
      expect(glucose.explainability.primaryReasons.length).toBeGreaterThan(0);
      expect(glucose.explainability.clinicalEvidence).toContain('American Diabetes Association');
      expect(glucose.explainability.contributingFactors.length).toBeGreaterThanOrEqual(2);
      expect(glucose.explainability.counterfactualAdvice).toBeDefined();
    });
  });

  /*
  ============================================================
  3. Medication Adherence Prediction
  ============================================================
  */
  describe('3. Medication Adherence Prediction Engine', () => {
    it('forecasts high adherence and low risk tier for compliant regimens', async () => {
      const adherence = await predictiveCareService.predictMedicationAdherence(mockHealthyContext);

      expect(adherence.currentRate).toBe(96);
      expect(adherence.predicted7DayRate).toBeGreaterThanOrEqual(85);
      expect(adherence.predicted30DayRate).toBeGreaterThanOrEqual(80);
      expect(adherence.riskTier).toBe('LOW');
    });

    it('identifies polypharmacy friction and pattern vulnerabilities in complex regimens with XAI', async () => {
      const adherence = await predictiveCareService.predictMedicationAdherence(mockAtRiskContext);

      expect(adherence.riskTier).toBe('HIGH');
      expect(adherence.vulnerabilityPatterns.length).toBeGreaterThan(0);
      expect(adherence.vulnerabilityPatterns.some((v: string) => v.includes('Multi-drug'))).toBe(true);

      // Explainable AI (XAI) validation
      expect(adherence.explainability.primaryReasons.length).toBeGreaterThan(0);
      expect(adherence.explainability.clinicalEvidence).toContain('World Health Organization');
      expect(adherence.explainability.proactiveNudges.length).toBeGreaterThan(0);
      expect(adherence.explainability.counterfactualAdvice).toBeDefined();
    });
  });

  /*
  ============================================================
  4. Hospitalization Risk Prediction
  ============================================================
  */
  describe('4. Hospitalization Risk Prediction Engine', () => {
    it('assesses LOW hospitalization risk for normal physiological telemetry', async () => {
      const risk = await predictiveCareService.predictHospitalizationRisk(mockHealthyContext);

      expect(risk.riskLevel).toBe('LOW');
      expect(risk.probability30Day).toBeLessThanOrEqual(22);
      expect(risk.probability90Day).toBeLessThanOrEqual(35);
      expect(risk.explainability.clinicalEvidence).toBeDefined();
    });

    it('flags HIGH or CRITICAL hospitalization risk when vitals and health scores severely deteriorate', async () => {
      const risk = await predictiveCareService.predictHospitalizationRisk(mockAtRiskContext);

      expect(['HIGH', 'CRITICAL']).toContain(risk.riskLevel);
      expect(risk.probability30Day).toBeGreaterThanOrEqual(45);
      expect(risk.riskDrivers.length).toBeGreaterThanOrEqual(3);

      // Verify specific clinical triggers are detected
      const driversStr = risk.riskDrivers.join(' ');
      expect(driversStr).toContain('oxygen');
      expect(driversStr).toContain('blood pressure');
      expect(driversStr).toContain('glucose');

      // Explainable AI (XAI) validation
      expect(risk.explainability.contributingFactors).toBeDefined();
      expect(risk.explainability.counterfactualAdvice).toContain('hospitalization');
    });
  });

  /*
  ============================================================
  5. Personalized Wellness Plans
  ============================================================
  */
  describe('5. Personalized Wellness Plan Generator', () => {
    it('generates customized 4-pillar wellness plans with biometric targets and XAI rationale', async () => {
      const result = await predictiveCareService.generatePersonalizedWellnessPlan(mockAtRiskContext);
      const plan = result.wellnessPlan;

      expect(plan.nutrition).toBeDefined();
      expect(plan.physicalActivity).toBeDefined();
      expect(plan.sleepAndCircadian).toBeDefined();
      expect(plan.stressAndMentalWellness).toBeDefined();
      expect(plan.biometricTargets).toBeDefined();

      // Nutrition tailored to hypertension
      expect(plan.nutrition.title).toContain('DASH');
      expect(plan.nutrition.whyRecommended).toBeDefined();
      expect(plan.nutrition.clinicalEvidence).toBeDefined();

      // Physical activity safeguards
      expect(plan.physicalActivity.safetyPrecautions).toBeDefined();
      expect(plan.biometricTargets.targetBloodPressure).toBeDefined();
      expect(plan.biometricTargets.targetFastingGlucose).toBeDefined();
    });
  });

  /*
  ============================================================
  6. Scheduled AI Re-Analysis Jobs
  ============================================================
  */
  describe('6. Scheduled AI Re-Analysis Jobs Engine', () => {
    it('executes scheduled re-analysis and creates alerts for deteriorating risk profiles', async () => {
      // Mock aiContextService.getUserHealthContext
      const aiContextService = req('../../server/services/aiContextService');
      const originalGetContext = aiContextService.getUserHealthContext;
      aiContextService.getUserHealthContext = vi.fn().mockResolvedValue(mockAtRiskContext);

      const notificationService = req('../../server/services/notificationService');
      const createNotificationSpy = vi.spyOn(notificationService, 'createNotification').mockResolvedValue({} as any);

      const timelineService = req('../../server/services/timelineService');
      const createEventSpy = vi.spyOn(timelineService, 'createEvent').mockResolvedValue({} as any);

      const reanalysis = await predictiveCareService.runScheduledAiReanalysis(mockAtRiskContext.userId, mockAtRiskContext);

      expect(reanalysis.success).toBe(true);
      expect(reanalysis.criticalAlerts.length).toBeGreaterThan(0);
      expect(reanalysis.diseaseProgression).toBeDefined();
      expect(reanalysis.medicationAdherence).toBeDefined();
      expect(reanalysis.hospitalizationRisk).toBeDefined();

      // Verify notifications and timeline events triggered
      expect(createNotificationSpy).toHaveBeenCalled();
      expect(createEventSpy).toHaveBeenCalled();

      // Restore mocks
      aiContextService.getUserHealthContext = originalGetContext;
      createNotificationSpy.mockRestore();
      createEventSpy.mockRestore();
    });
  });
});
