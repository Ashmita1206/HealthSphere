import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const adminAnalyticsService = req('../../server/services/adminAnalyticsService');

describe('F20 — Population Health Analytics & Admin Console Suite', () => {
  /*
  ============================================================
  1. Hospital Enterprise KPIs
  ============================================================
  */
  describe('1. Hospital Enterprise KPIs', () => {
    it('computes comprehensive hospital operational metrics', async () => {
      const kpis = await adminAnalyticsService.getHospitalKPIs();

      expect(kpis).toBeDefined();
      expect(kpis.totalPatients).toBeGreaterThan(0);
      expect(kpis.totalDoctors).toBeGreaterThan(0);
      expect(kpis.emergencyResolutionRate).toBeGreaterThanOrEqual(0);
      expect(kpis.bedUtilizationRate).toBeDefined();
      expect(kpis.systemStatus).toBe('Optimal');
    });
  });

  /*
  ============================================================
  2. Disease Distribution Analytics
  ============================================================
  */
  describe('2. Disease Distribution & Population Demographics', () => {
    it('analyzes disease prevalence and demographic breakdowns', async () => {
      const distribution = await adminAnalyticsService.getDiseaseDistribution();

      expect(distribution.diseasePrevalence).toBeInstanceOf(Array);
      expect(distribution.diseasePrevalence.length).toBeGreaterThan(0);
      expect(distribution.diseasePrevalence.some((d: any) => d.disease.includes('Diabetes'))).toBe(true);

      // Demographics
      expect(distribution.demographics.ageDistribution.length).toBeGreaterThanOrEqual(3);
      expect(distribution.demographics.genderDistribution.male).toBeDefined();
    });
  });

  /*
  ============================================================
  3. Medication Adherence Analytics
  ============================================================
  */
  describe('3. Medication Adherence Population Analytics', () => {
    it('evaluates adherence cohorts, weekly drop-off trends, and drug classes', async () => {
      const adherence = await adminAnalyticsService.getMedicationAdherenceAnalytics();

      expect(adherence.overallPopulationAdherence).toBeGreaterThanOrEqual(70);
      expect(adherence.cohortBreakdown.highAdherence).toBeDefined();
      expect(adherence.weeklyDropOffTrends).toHaveLength(7);
      expect(adherence.mostPrescribedDrugClasses.length).toBeGreaterThan(0);
    });
  });

  /*
  ============================================================
  4. Emergency Incident & Triage Analytics
  ============================================================
  */
  describe('4. Emergency Analytics & Triage Heatmap', () => {
    it('aggregates emergency incidents, response times, and severity triage', async () => {
      const emergency = await adminAnalyticsService.getEmergencyAnalytics();

      expect(emergency.severityBreakdown.CRITICAL).toBeDefined();
      expect(emergency.severityBreakdown.HIGH).toBeDefined();
      expect(emergency.avgResponseTimeMinutes).toBeLessThan(10);
      expect(emergency.autoEscalationRate).toBe(100);
      expect(emergency.topEmergencyTriggers.length).toBeGreaterThan(0);
    });
  });

  /*
  ============================================================
  5. Predictive Risk Heatmap (Population Stratification)
  ============================================================
  */
  describe('5. Predictive Risk Heatmap', () => {
    it('generates clinical risk clusters for population health stratification', async () => {
      const riskMap = await adminAnalyticsService.getPredictiveRiskHeatmap();

      expect(riskMap.populationSize).toBeGreaterThan(0);
      expect(riskMap.riskClusters.length).toBeGreaterThanOrEqual(3);

      const criticalZone = riskMap.riskClusters.find((c: any) => c.riskLevel === 'CRITICAL');
      expect(criticalZone).toBeDefined();
      expect(criticalZone.primaryDrivers.length).toBeGreaterThan(0);
      expect(criticalZone.recommendedIntervention).toBeDefined();
    });
  });

  /*
  ============================================================
  6. Anonymous Population Statistics & Privacy
  ============================================================
  */
  describe('6. Anonymous Population Statistics', () => {
    it('returns anonymized statistical baselines complying with differential privacy', async () => {
      const stats = await adminAnalyticsService.getAnonymousPopulationStats();

      expect(stats.sampleSize).toBeGreaterThan(0);
      expect(stats.meanHealthScore).toBeDefined();
      expect(stats.meanVitals.systolic).toBeDefined();
      expect(stats.anonymizationProtocol).toContain('Differential Privacy');
    });
  });

  /*
  ============================================================
  7. Live System Health & Infrastructure Telemetry
  ============================================================
  */
  describe('7. System Infrastructure Health Telemetry', () => {
    it('reports live status, memory utilization, and microservices readiness', async () => {
      const health = await adminAnalyticsService.getSystemHealth();

      expect(health.status).toBeDefined();
      expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(health.memoryUsageMB).toBeGreaterThan(0);
      expect(health.services.apiGateway).toBe('HEALTHY');
      expect(health.services.aiHealthEngine).toBe('HEALTHY');
    });
  });

  /*
  ============================================================
  8. Role-Based Access Control (RBAC) Protection
  ============================================================
  */
  describe('8. Admin RBAC Verification', () => {
    const { authorizeRoles } = req('../../server/middlewares/authMiddleware');

    const runRbac = (role: string, allowed: string[]) => {
      let status = 200;
      let errorBody: any = null;

      const reqMock = { user: { role } };
      const resMock = {
        status: (code: number) => {
          status = code;
          return {
            json: (body: any) => {
              errorBody = body;
            },
          };
        },
      };
      let calledNext = false;
      const nextMock = () => {
        calledNext = true;
      };

      const middleware = authorizeRoles(...allowed);
      middleware(reqMock, resMock, nextMock);

      return { status, errorBody, calledNext };
    };

    it('allows super_admin, admin, doctor, and support roles', () => {
      const allowedRoles = ['super_admin', 'admin', 'doctor', 'support'];

      expect(runRbac('super_admin', allowedRoles).calledNext).toBe(true);
      expect(runRbac('admin', allowedRoles).calledNext).toBe(true);
      expect(runRbac('doctor', allowedRoles).calledNext).toBe(true);
      expect(runRbac('support', allowedRoles).calledNext).toBe(true);
    });

    it('forbids standard patient role with 403 Forbidden', () => {
      const allowedRoles = ['super_admin', 'admin', 'doctor', 'support'];
      const result = runRbac('patient', allowedRoles);

      expect(result.calledNext).toBe(false);
      expect(result.status).toBe(403);
      expect(result.errorBody.message).toContain('Forbidden');
    });
  });
});
