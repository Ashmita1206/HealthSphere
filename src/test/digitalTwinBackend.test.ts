import { describe, it, expect, vi } from 'vitest';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const digitalTwinService = req('../../server/services/digitalTwinService');

describe('F19 — AI Digital Twin & Personalized Health Copilot Suite', () => {
  const patientUserId = '64b1f77bcf86cd7994390001';

  const mockComprehensiveContext = {
    userId: patientUserId,
    user: {
      name: 'John Doe',
      bloodType: 'O+',
    },
    healthScore: { current: 74, status: 'Fair' },
    vitals: {
      count: 15,
      latest: {
        systolic: 136,
        diastolic: 88,
        heartRate: 78,
        glucose: 142,
        oxygen: 97,
        temperature: 98.6,
      },
    },
    adherence: {
      rate: 72,
      totalScheduled: 20,
      totalCompleted: 14,
      missedCount: 6,
      status: 'Moderate Adherence',
    },
    medicines: [
      { name: 'Metformin', dosage: '500mg', timing: 'Morning' },
      { name: 'Lisinopril', dosage: '10mg', timing: 'Morning' },
      { name: 'Atorvastatin', dosage: '20mg', timing: 'Night' },
    ],
    medicalProfile: {
      conditions: [{ name: 'Type 2 Diabetes', status: 'Active' }],
      allergies: [{ allergen: 'Sulfonamides' }],
      familyHistory: ['Early onset myocardial infarction'],
      bmi: 27.2,
      bloodType: 'O+',
    },
    symptoms: [
      { symptom: 'Occasional morning headache', severity: 'mild' },
    ],
    reports: [
      {
        title: 'Complete Metabolic Panel',
        summary: 'Elevated fasting blood glucose and borderline HbA1c.',
        riskLevel: 'moderate',
        createdAt: new Date('2026-08-15'),
      },
    ],
    emergencies: [],
    consultations: [
      {
        doctorNotes: 'Advised lifestyle modification and adherence to evening lipid medication.',
        createdAt: new Date('2026-08-20'),
      },
    ],
  };

  /*
  ============================================================
  1. Build & Calibrate AI Digital Twin
  ============================================================
  */
  describe('1. Digital Twin Construction & Episodic Memory', () => {
    it('constructs a complete AI digital twin synthesizing vitals, memory, and behavioral patterns', async () => {
      const timelineService = req('../../server/services/timelineService');
      const createEventSpy = vi.spyOn(timelineService, 'createEvent').mockResolvedValue({} as any);

      const notificationService = req('../../server/services/notificationService');
      const createNotificationSpy = vi.spyOn(notificationService, 'createNotification').mockResolvedValue({} as any);

      const twin = await digitalTwinService.buildDigitalTwin(patientUserId, mockComprehensiveContext);

      expect(twin).toBeDefined();
      expect(twin.healthProfile.bloodType).toBe('O+');
      expect(twin.healthProfile.baselineVitals.systolic).toBe(136);
      expect(twin.healthProfile.chronicConditions).toContain('Type 2 Diabetes');

      // Episodic memory
      expect(twin.medicalMemory.length).toBeGreaterThanOrEqual(2);
      expect(twin.medicalMemory.some((m: any) => m.milestoneType === 'report_anomaly')).toBe(true);

      // Behavioral patterns
      expect(twin.behaviorPatterns.adherenceScore).toBe(72);
      expect(twin.behaviorPatterns.adherenceStability).toBe('Variable');

      // Risk profile
      expect(twin.riskProfile.cardiovascularRisk).toBe('Moderate');
      expect(twin.riskProfile.metabolicRisk).toBe('Moderate');

      // Confidence score
      expect(twin.confidenceScore).toBeGreaterThanOrEqual(70);

      // Timeline event
      expect(createEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: patientUserId,
          title: 'DIGITAL_TWIN_UPDATED',
        })
      );

      createEventSpy.mockRestore();
      createNotificationSpy.mockRestore();
    });
  });

  /*
  ============================================================
  2. Longitudinal Health Narrative
  ============================================================
  */
  describe('2. Longitudinal Health Narrative Generator', () => {
    it('synthesizes a comprehensive clinical narrative from the digital twin state', async () => {
      const narrativeResult = await digitalTwinService.generateHealthNarrative(
        patientUserId,
        await digitalTwinService.buildDigitalTwin(patientUserId, mockComprehensiveContext)
      );

      expect(narrativeResult.narrative).toBeDefined();
      expect(narrativeResult.narrative).toContain('136/88 mmHg');
      expect(narrativeResult.narrative).toContain('Type 2 Diabetes');
      expect(narrativeResult.narrative).toContain('Cardiovascular risk is Moderate');
      expect(narrativeResult.confidenceScore).toBeGreaterThanOrEqual(70);
    });
  });

  /*
  ============================================================
  3. Predictive Next Health Event
  ============================================================
  */
  describe('3. Predictive Next Health Event Engine', () => {
    it('predicts upcoming health event based on digital twin vulnerabilities', async () => {
      const twin = await digitalTwinService.buildDigitalTwin(patientUserId, mockComprehensiveContext);
      const prediction = await digitalTwinService.predictNextHealthEvent(patientUserId, twin);

      expect(prediction.nextEvent).toBeDefined();
      expect(prediction.nextEvent.eventType).toBeDefined();
      expect(prediction.nextEvent.probability).toBeGreaterThan(0);
      expect(prediction.nextEvent.recommendedIntervention).toBeDefined();
    });
  });

  /*
  ============================================================
  4. Conversational Health Copilot (Q&A using Complete Health History)
  ============================================================
  */
  describe('4. AI Health Copilot Conversational Intelligence', () => {
    it('explains why health score is dropping using digital twin telemetry and adherence drivers', async () => {
      const twin = await digitalTwinService.buildDigitalTwin(patientUserId, mockComprehensiveContext);

      const response = await digitalTwinService.chatWithHealthCopilot(
        patientUserId,
        'Why is my health score dropping recently?',
        twin
      );

      expect(response.reply).toBeDefined();
      expect(response.reply.toLowerCase()).toContain('health score');
      expect(response.reply.toLowerCase()).toContain('adherence');
      expect(response.sourceContext).toContain('digital_twin.riskProfile');
    });

    it('summarizes what changed this month comparing baseline shifts', async () => {
      const twin = await digitalTwinService.buildDigitalTwin(patientUserId, mockComprehensiveContext);

      const response = await digitalTwinService.chatWithHealthCopilot(
        patientUserId,
        'What changed this month in my health profile?',
        twin
      );

      expect(response.reply).toBeDefined();
      expect(response.reply).toContain('136');
      expect(response.sourceContext).toContain('digital_twin.lastAnalysis');
    });

    it('provides targeted clinical improvements grounded in risk profiles', async () => {
      const twin = await digitalTwinService.buildDigitalTwin(patientUserId, mockComprehensiveContext);

      const response = await digitalTwinService.chatWithHealthCopilot(
        patientUserId,
        'What should I improve right now?',
        twin
      );

      expect(response.reply).toBeDefined();
      expect(response.reply).toContain('DASH');
      expect(response.sourceContext).toContain('digital_twin.behaviorPatterns');
    });

    it('rejects empty query messages with proper error validation', async () => {
      const twin = await digitalTwinService.buildDigitalTwin(patientUserId, mockComprehensiveContext);

      await expect(
        digitalTwinService.chatWithHealthCopilot(patientUserId, '   ', twin)
      ).rejects.toThrow('User message is required for Health Copilot chat');
    });
  });
});
