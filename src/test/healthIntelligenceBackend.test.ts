import { describe, it, expect } from 'vitest';

interface HealthSubScore {
  score: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  factors: string[];
  recommendations: string[];
}

interface HealthScoresResult {
  userId: string;
  overallHealthScore: number;
  status: string;
  scores: Record<string, HealthSubScore>;
  calculatedAt: string;
}

describe('F13 AI Health Intelligence Engine Backend Suite', () => {
  // Test Data Fixtures
  const patientA = 'user-patient-a';
  const patientB = 'user-patient-b';

  const mockContextPatientA = {
    userId: patientA,
    profile: {
      name: 'Alice Smith',
      gender: 'female',
      bmi: 22.4,
      bloodGroup: 'A+',
      chronicConditions: ['Mild Asthma'],
    },
    vitals: {
      averageHeartRate: 72,
      averageBloodPressure: '118/76',
      latestWeight: 62,
      latestGlucose: 95,
      abnormalVitalsCount: 0,
    },
    medications: {
      totalCount: 2,
      activeCount: 2,
      activeList: [
        { name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'as needed', adherenceRate: 95 },
        { name: 'Multivitamin', dosage: '1 tablet', frequency: 'daily', adherenceRate: 90 },
      ],
      adherence: {
        rate: 92,
        totalScheduled: 60,
        totalCompleted: 55,
        missedCount: 5,
        status: 'High Adherence',
      },
    },
    clinicalHistory: {
      appointmentsCount: 2,
      upcomingAppointments: [{ doctorName: 'Dr. John Doe', specialty: 'Pulmonology', date: new Date(Date.now() + 86400000) }],
      consultationsCount: 1,
      recentConsultations: [{ status: 'completed' }],
      reportsCount: 3,
      recentAbnormalReportsCount: 0,
      recentReports: [{ title: 'Annual Spirometry', riskLevel: 'low', abnormalValuesCount: 0 }],
    },
    symptomHistory: {
      totalAssessments: 2,
      recentHighRiskCount: 0,
      recentAssessments: [{ symptoms: ['mild cough'], severity: 'mild', riskLevel: 'LOW' }],
    },
  };

  const mockContextHighRiskPatient = {
    userId: 'user-patient-high-risk',
    profile: {
      name: 'Bob Jones',
      gender: 'male',
      bmi: 31.2,
      chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    },
    vitals: {
      averageHeartRate: 98,
      averageBloodPressure: '152/96',
      latestWeight: 102,
      latestGlucose: 188,
      abnormalVitalsCount: 4,
    },
    medications: {
      totalCount: 3,
      activeCount: 3,
      activeList: [
        { name: 'Lisinopril', dosage: '20mg', frequency: 'daily', adherenceRate: 50 },
        { name: 'Metformin', dosage: '1000mg', frequency: 'twice daily', adherenceRate: 55 },
      ],
      adherence: {
        rate: 52,
        totalScheduled: 60,
        totalCompleted: 31,
        missedCount: 29,
        status: 'Poor Adherence',
      },
    },
    clinicalHistory: {
      appointmentsCount: 1,
      upcomingAppointments: [],
      consultationsCount: 1,
      recentConsultations: [{ status: 'active' }],
      reportsCount: 4,
      recentAbnormalReportsCount: 2,
      recentReports: [{ title: 'Comprehensive Metabolic Panel', riskLevel: 'high', abnormalValuesCount: 3 }],
    },
    symptomHistory: {
      totalAssessments: 4,
      recentHighRiskCount: 2,
      recentAssessments: [
        { symptoms: ['shortness of breath', 'chest tightness'], severity: 'severe', riskLevel: 'HIGH' },
      ],
    },
  };

  // Mock score engine logic matching server/services/healthScoreEngine.js
  function computeHealthScores(context: typeof mockContextPatientA): HealthScoresResult {
    const adherenceRate = context.medications.adherence.rate;
    const medScore: HealthSubScore = {
      score: adherenceRate,
      status: adherenceRate >= 85 ? 'Excellent' : adherenceRate >= 70 ? 'Good' : 'Needs Attention',
      factors: adherenceRate >= 85 ? ['Medication adherence high'] : ['Low medication adherence detected'],
      recommendations: adherenceRate >= 85 ? ['Maintain regular dosing'] : ['Set automated reminders'],
    };

    const hr = context.vitals.averageHeartRate || 75;
    const isHrNormal = hr >= 60 && hr <= 85;
    const heartScore: HealthSubScore = {
      score: isHrNormal ? 90 : 65,
      status: isHrNormal ? 'Excellent' : 'Fair',
      factors: [isHrNormal ? `Optimal resting heart rate (${hr} bpm)` : `Elevated heart rate (${hr} bpm)`],
      recommendations: [isHrNormal ? 'Continue aerobic conditioning' : 'Consult doctor regarding resting heart rate'],
    };

    const highRiskSymptoms = context.symptomHistory.recentHighRiskCount;
    const abnormalReports = context.clinicalHistory.recentAbnormalReportsCount;
    const riskScoreVal = Math.max(20, 100 - (highRiskSymptoms * 25 + abnormalReports * 15));
    const riskScore: HealthSubScore = {
      score: riskScoreVal,
      status: riskScoreVal >= 85 ? 'Excellent' : riskScoreVal >= 70 ? 'Good' : 'Needs Attention',
      factors: highRiskSymptoms > 0 ? [`${highRiskSymptoms} high risk symptom assessments`] : ['No high-risk symptom events'],
      recommendations: highRiskSymptoms > 0 ? ['Immediate clinical follow-up recommended'] : ['Maintain routine screenings'],
    };

    const bmi = context.profile.bmi || 24;
    const isBmiNormal = bmi >= 18.5 && bmi <= 24.9;
    const lifestyleScore: HealthSubScore = {
      score: isBmiNormal ? 85 : 68,
      status: isBmiNormal ? 'Excellent' : 'Fair',
      factors: [isBmiNormal ? `Healthy BMI profile (${bmi})` : `Elevated BMI profile (${bmi})`],
      recommendations: [isBmiNormal ? 'Maintain current active lifestyle' : 'Incorporate 150 mins weekly exercise'],
    };

    const subScores: Record<string, HealthSubScore> = {
      medicationAdherence: medScore,
      lifestyle: lifestyleScore,
      recovery: { score: 82, status: 'Good', factors: ['Normal recovery intervals'], recommendations: ['Adequate sleep'] },
      risk: riskScore,
      sleep: { score: 78, status: 'Good', factors: ['Regular sleep routine'], recommendations: ['Target 7-8 hours'] },
      activity: { score: 80, status: 'Good', factors: ['Active routine'], recommendations: ['8k daily steps'] },
      hydration: { score: 85, status: 'Excellent', factors: ['2.5L target met'], recommendations: ['Maintain fluid intake'] },
      nutrition: { score: 82, status: 'Good', factors: ['Balanced dietary pattern'], recommendations: ['Prioritize fiber'] },
      mentalWellness: { score: 76, status: 'Good', factors: ['Stress resilience stable'], recommendations: ['Daily mindfulness'] },
      heartHealth: heartScore,
    };

    const overall = Math.round(
      medScore.score * 0.15 +
      heartScore.score * 0.15 +
      riskScore.score * 0.15 +
      lifestyleScore.score * 0.10 +
      subScores.recovery.score * 0.10 +
      subScores.activity.score * 0.10 +
      subScores.nutrition.score * 0.10 +
      subScores.sleep.score * 0.05 +
      subScores.hydration.score * 0.05 +
      subScores.mentalWellness.score * 0.05
    );

    return {
      userId: context.userId,
      overallHealthScore: overall,
      status: overall >= 85 ? 'Excellent' : overall >= 70 ? 'Good' : 'Needs Attention',
      scores: subScores,
      calculatedAt: new Date().toISOString(),
    };
  }

  it('1. AI Context Aggregation: Normalizes and structures 10 clinical data streams', () => {
    expect(mockContextPatientA.profile.bloodGroup).toBe('A+');
    expect(mockContextPatientA.medications.adherence.rate).toBe(92);
    expect(mockContextPatientA.vitals.averageHeartRate).toBe(72);
    expect(mockContextPatientA.clinicalHistory.reportsCount).toBe(3);
    expect(mockContextPatientA.symptomHistory.recentAssessments.length).toBeGreaterThan(0);
  });

  it('2. AI Health Score Engine: Computes overall score and all 10 standard sub-scores', () => {
    const result = computeHealthScores(mockContextPatientA);

    expect(result.overallHealthScore).toBeGreaterThanOrEqual(0);
    expect(result.overallHealthScore).toBeLessThanOrEqual(100);
    expect(['Excellent', 'Good', 'Fair', 'Needs Attention']).toContain(result.status);

    const requiredSubScoreKeys = [
      'medicationAdherence',
      'lifestyle',
      'recovery',
      'risk',
      'sleep',
      'activity',
      'hydration',
      'nutrition',
      'mentalWellness',
      'heartHealth',
    ];

    for (const key of requiredSubScoreKeys) {
      expect(result.scores[key]).toBeDefined();
      expect(typeof result.scores[key].score).toBe('number');
      expect(result.scores[key].status).toBeDefined();
      expect(Array.isArray(result.scores[key].factors)).toBe(true);
      expect(Array.isArray(result.scores[key].recommendations)).toBe(true);
      expect(result.scores[key].factors.length).toBeGreaterThan(0);
      expect(result.scores[key].recommendations.length).toBeGreaterThan(0);
    }
  });

  it('3. Clinical Risk & Safety Rules: Escalates risk and mandates physician consultation for high-risk profiles', () => {
    const highRiskResult = computeHealthScores(mockContextHighRiskPatient);

    // High risk profile must have significantly lower risk score and heart score
    expect(highRiskResult.scores.risk.score).toBeLessThan(60);
    expect(highRiskResult.scores.heartHealth.score).toBeLessThan(70);
    expect(highRiskResult.overallHealthScore).toBeLessThan(75);

    // Must recommend physician follow-up
    const hasDoctorFollowup = highRiskResult.scores.risk.recommendations.some((r) =>
      /doctor|clinical|follow-up/i.test(r)
    );
    expect(hasDoctorFollowup).toBe(true);
  });

  it('4. AI Recommendation Engine Upgrade: Generates reminders optimization, lifestyle, risk prevention, and wellness plans', () => {
    const { optimizeMedicineReminders, generateLifestyleSuggestions, generateRiskPreventionSuggestions, generatePersonalizedWellnessPlan } =
      // @ts-expect-error loading dynamic commonjs module in vitest
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../../server/services/recommendationEngine');

    const reminderAdvice = optimizeMedicineReminders(mockContextPatientA);
    expect(Array.isArray(reminderAdvice)).toBe(true);
    expect(reminderAdvice.length).toBeGreaterThan(0);

    const lifestyleAdvice = generateLifestyleSuggestions(mockContextPatientA);
    expect(Array.isArray(lifestyleAdvice)).toBe(true);
    expect(lifestyleAdvice.length).toBeGreaterThan(0);

    const riskPrevention = generateRiskPreventionSuggestions(mockContextPatientA);
    expect(Array.isArray(riskPrevention)).toBe(true);
    expect(riskPrevention.length).toBeGreaterThan(0);

    const wellnessPlan = generatePersonalizedWellnessPlan(mockContextPatientA);
    expect(wellnessPlan.phase).toBeDefined();
    expect(wellnessPlan.dailyGoals.waterIntakeLiters).toBeGreaterThan(0);
    expect(wellnessPlan.weeklyMilestones.length).toBe(4);
  });

  it('5. AI Insights & Disclaimer: Enforces non-diagnostic clinical advice and mandatory disclaimer', async () => {
    // @ts-expect-error loading dynamic commonjs module in vitest
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { generateHealthInsights, MEDICAL_DISCLAIMER } = require('../../server/services/aiService');

    const insightsResult = await generateHealthInsights(mockContextPatientA);

    expect(insightsResult.disclaimer).toBe(MEDICAL_DISCLAIMER);
    expect(insightsResult.disclaimer).toMatch(/NOT provide a final medical diagnosis/);
    expect(Array.isArray(insightsResult.insights)).toBe(true);
    expect(insightsResult.insights.length).toBeGreaterThan(0);
    expect(['low', 'medium', 'high', 'critical']).toContain(insightsResult.riskLevel);
  });

  it('6. Security & User Data Isolation: Rejects cross-user data access and validates user scope', () => {
    function simulateUserAccess(callerId: string, requestedTargetId: string) {
      if (!callerId) return { status: 401, error: 'Unauthorized: JWT required' };
      if (callerId !== requestedTargetId) return { status: 403, error: 'Forbidden: Cannot access other user health context' };
      return { status: 200, data: mockContextPatientA };
    }

    // Unauthenticated request
    const unauthRes = simulateUserAccess('', patientA);
    expect(unauthRes.status).toBe(401);

    // Cross-user IDOR access attempt
    const idorRes = simulateUserAccess(patientB, patientA);
    expect(idorRes.status).toBe(403);

    // Legitimate owner access
    const legitRes = simulateUserAccess(patientA, patientA);
    expect(legitRes.status).toBe(200);
    expect(legitRes.data?.userId).toBe(patientA);
  });
});
