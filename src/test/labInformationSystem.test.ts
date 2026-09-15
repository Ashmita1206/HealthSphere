import { describe, it, expect } from 'vitest';

const labService = require('../../server/services/labInformationService');

describe('F51 — Laboratory Information System (LIS) Service Suite', () => {
  it('should get lab dashboard metrics with analyzer operational statuses', async () => {
    const dashboard = await labService.getDashboard();

    expect(dashboard).toBeDefined();
    expect(dashboard.metrics.totalOrdersToday).toBeGreaterThanOrEqual(3);
    expect(dashboard.metrics.averageTurnaroundMinutes).toBeGreaterThan(0);
    expect(dashboard.metrics.analyzerOnlineStatus['Roche Cobas 6000 (Biochem)']).toContain('Operational');
    expect(dashboard.specimenOverview.totalActiveSpecimens).toBeGreaterThanOrEqual(3);
  });

  it('should track specimens and register new specimen barcodes', async () => {
    const specimens = await labService.getSpecimens();
    expect(specimens.length).toBeGreaterThanOrEqual(3);

    const newSpecimen = await labService.registerSpecimen({
      patientId: 'PT-450',
      patientName: 'Jane Doe',
      sampleType: 'Urine (Sterile Cup)',
      storageLocation: 'Fridge-Rack-1'
    });

    expect(newSpecimen.specimenId).toBeDefined();
    expect(newSpecimen.barcode).toBeDefined();
    expect(newSpecimen.status).toBe('received_in_lab');

    const queried = await labService.getSpecimens({ specimenId: newSpecimen.specimenId });
    expect(queried.length).toBe(1);
    expect(queried[0].patientName).toBe('Jane Doe');
  });

  it('should prioritize technician work queue placing STAT and critical orders first', async () => {
    const queue = await labService.getTechnicianQueue();

    expect(queue.length).toBeGreaterThanOrEqual(2);
    // First in queue must be critical or stat_urgent
    expect(['critical', 'stat_urgent']).toContain(queue[0].priority);
  });

  it('should submit analyzer results, flag abnormal parameters and calculate AI clinical interpretations', async () => {
    const rawResults = [
      {
        parameterName: 'Hemoglobin',
        observedValue: 10.5, // Below 12.0
        unit: 'g/dL',
        referenceRangeLow: 12.0,
        referenceRangeHigh: 16.0
      },
      {
        parameterName: 'Total Leukocyte Count (WBC)',
        observedValue: 18500, // Above 11,000 (critical high)
        unit: '/mcL',
        referenceRangeLow: 4000,
        referenceRangeHigh: 11000
      },
      {
        parameterName: 'Platelets',
        observedValue: 240000,
        unit: '/mcL',
        referenceRangeLow: 150000,
        referenceRangeHigh: 450000
      }
    ];

    const updated = await labService.submitTestResults('LAB-ORD-101', rawResults);

    expect(updated.status).toBe('preliminary_ready');
    expect(updated.results.length).toBe(3);

    const hb = updated.results.find((r: any) => r.parameterName === 'Hemoglobin');
    expect(hb.abnormalityFlag).toBe('low');

    const wbc = updated.results.find((r: any) => r.parameterName === 'Total Leukocyte Count (WBC)');
    expect(wbc.abnormalityFlag).toBe('critical_high');

    const plt = updated.results.find((r: any) => r.parameterName === 'Platelets');
    expect(plt.abnormalityFlag).toBe('normal');

    expect(updated.criticalValueAlert).toBe(true);
    expect(updated.aiSummary).toContain('AI Interpretation');
  });

  it('should authorize and sign off test results by pathologist', async () => {
    const verification = await labService.verifyResults('LAB-ORD-101', {
      doctorName: 'Dr. Gregory House, MD',
      technicianNotes: 'Confirmed with manual slide review'
    });

    expect(verification.success).toBe(true);
    expect(verification.order.status).toBe('approved');
    expect(verification.order.pathologistSignOff.doctorName).toBe('Dr. Gregory House, MD');
    expect(verification.order.pathologistSignOff.signedAt).toBeDefined();
  });

  it('should perform standalone AI abnormality detection across multiple biochemical markers', async () => {
    const cardiacPanel = [
      { name: 'Troponin I', value: 0.85, unit: 'ng/mL' },
      { name: 'CK-MB', value: 34, unit: 'U/L' }
    ];

    const detection = await labService.detectAbnormalities(cardiacPanel);

    expect(detection.detectionsCount).toBeGreaterThanOrEqual(1);
    expect(detection.detections[0].syndrome).toContain('Myocardial');
    expect(detection.detections[0].confidence).toBeGreaterThan(0.9);
  });
});
