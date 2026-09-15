import { describe, it, expect } from 'vitest';

const {
  cdssService,
  ClinicalDecisionSupportService,
} = require('../../server/services/cdssService');

describe('F46 — Clinical Decision Support System (CDSS)', () => {
  const cdss = new ClinicalDecisionSupportService();

  describe('Drug-Drug Interaction Checker', () => {
    it('detects CRITICAL bleeding risk between Warfarin and Aspirin', () => {
      const result = cdss.checkDrugInteractions(['Warfarin 5mg', 'Aspirin 81mg', 'Lisinopril 10mg']);

      expect(result.hasInteractions).toBe(true);
      expect(result.highestSeverity).toBe('CRITICAL');
      expect(result.interactions.some((i: any) => i.title.includes('Bleeding Risk'))).toBe(true);
      expect(result.interactions[0].citation).toBeDefined();
    });

    it('detects CRITICAL hypotension risk between Sildenafil and Nitroglycerin', () => {
      const result = cdss.checkDrugInteractions(['Sildenafil 50mg', 'Sublingual Nitroglycerin 0.4mg']);

      expect(result.hasInteractions).toBe(true);
      expect(result.highestSeverity).toBe('CRITICAL');
      expect(result.interactions[0].mechanism).toContain('cyclic GMP');
    });

    it('returns clean response when no known interactions exist', () => {
      const result = cdss.checkDrugInteractions(['Acetaminophen 500mg', 'Amoxicillin 500mg']);

      expect(result.hasInteractions).toBe(false);
      expect(result.interactions).toHaveLength(0);
      expect(result.highestSeverity).toBe('NONE');
    });
  });

  describe('Contraindication Engine', () => {
    it('flags Amoxicillin for patients with documented Penicillin allergy', () => {
      const profile = {
        conditions: ['Pharyngitis'],
        allergies: ['Penicillin'],
        isPregnant: false,
      };

      const result = cdss.checkContraindications(profile, ['Amoxicillin 500mg']);

      expect(result.hasContraindications).toBe(true);
      expect(result.alerts[0].drug).toBe('amoxicillin');
      expect(result.alerts[0].severity).toBe('CONTRAINDICATED');
      expect(result.alerts[0].alternative).toBeDefined();
    });

    it('flags ACE inhibitors (Lisinopril) during pregnancy', () => {
      const profile = {
        conditions: ['Gestational Hypertension'],
        allergies: [],
        isPregnant: true,
      };

      const result = cdss.checkContraindications(profile, ['Lisinopril 20mg']);

      expect(result.hasContraindications).toBe(true);
      expect(result.alerts[0].reason).toContain('teratogenicity');
      expect(result.alerts[0].alternative).toContain('Labetalol');
    });

    it('flags Metformin in severe renal impairment (eGFR < 30)', () => {
      const profile = {
        conditions: ['Type 2 Diabetes'],
        allergies: [],
        isPregnant: false,
        eGFR: 22,
      };

      const result = cdss.checkContraindications(profile, ['Metformin 1000mg']);

      expect(result.hasContraindications).toBe(true);
      expect(result.alerts[0].reason).toContain('lactic acidosis');
    });
  });

  describe('Differential Diagnosis Generator', () => {
    it('suggests Acute Coronary Syndrome for acute chest pain, dyspnea, and diaphoresis', () => {
      const result = cdss.generateDifferentialDiagnosis({
        symptoms: ['acute chest pain', 'dyspnea', 'diaphoresis'],
        vitals: { bloodPressureSys: 155, heartRate: 108 },
        age: 62,
      });

      expect(result.totalFound).toBeGreaterThanOrEqual(1);
      const topDiff = result.differentials[0];
      expect(topDiff.diagnosis).toContain('Acute Coronary Syndrome');
      expect(topDiff.icd10).toBe('I20.0');
      expect(topDiff.priority).toBe('CRITICAL');
      expect(topDiff.confidenceScore).toBeGreaterThanOrEqual(80);
      expect(topDiff.recommendedActions).toContain('Stat 12-lead ECG within 10 minutes of presentation');
    });

    it('suggests Community-Acquired Pneumonia for fever, cough, dyspnea, and crackles', () => {
      const result = cdss.generateDifferentialDiagnosis({
        symptoms: ['cough', 'dyspnea', 'crackles on auscultation'],
        vitals: { temperature: 38.6 },
      });

      expect(result.totalFound).toBeGreaterThanOrEqual(1);
      const cap = result.differentials.find((d: any) => d.diagnosis.includes('Pneumonia'));
      expect(cap).toBeDefined();
      expect(cap.icd10).toBe('J18.9');
    });
  });

  describe('Risk Stratification & Guidelines', () => {
    it('stratifies high-risk cardiac patient with stage 2 hypertension and hypoxemia', () => {
      const stratification = cdss.evaluateRiskStratification({
        age: 72,
        vitals: { bloodPressureSys: 175, spo2: 91, heartRate: 125 },
        conditions: ['Heart Failure', 'CKD Stage 3'],
      });

      expect(stratification.riskTier).toBe('CRITICAL');
      expect(stratification.riskScore).toBeGreaterThanOrEqual(8);
      expect(stratification.riskFactors.length).toBeGreaterThanOrEqual(3);
    });

    it('retrieves evidence-based clinical guidelines for diabetes and hypertension', () => {
      const guidelines = cdss.getClinicalGuidelineRecommendations({
        conditions: ['Hypertension', 'Type 2 Diabetes'],
      });

      expect(guidelines).toHaveLength(2);
      expect(guidelines.some((g: any) => g.guideline.includes('ACC/AHA'))).toBe(true);
      expect(guidelines.some((g: any) => g.guideline.includes('ADA'))).toBe(true);
    });
  });

  describe('Explainable AI Patient Case Synthesis', () => {
    it('synthesizes comprehensive assessment with confidence scoring and evidence sources', async () => {
      const caseData = {
        patientId: 'patient-404',
        age: 65,
        symptoms: ['chest pain', 'dyspnea', 'diaphoresis'],
        vitals: { bloodPressureSys: 165, heartRate: 110, spo2: 94 },
        conditions: ['Hypertension', 'Type 2 Diabetes'],
        allergies: ['Penicillin'],
        currentMedications: ['Warfarin 5mg'],
        proposedMedications: ['Aspirin 81mg', 'Amoxicillin 500mg'],
      };

      const result = await cdss.evaluatePatientCase(caseData);

      expect(result.patientId).toBe('patient-404');
      expect(result.summary).toContain('Acute Coronary Syndrome');
      expect(result.summary).toContain('drug-drug interaction');
      expect(result.summary).toContain('contraindication');
      expect(result.confidenceScore).toBeGreaterThanOrEqual(80);
      expect(result.explainabilityTrace.engine).toBe('HealthSphere-CDSS-Rules-v4');
      expect(result.explainabilityTrace.evidenceSources.length).toBeGreaterThanOrEqual(3);
    });
  });
});
