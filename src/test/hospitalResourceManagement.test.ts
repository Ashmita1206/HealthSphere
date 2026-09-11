import { describe, it, expect } from 'vitest';

// Require the backend service directly
const hospitalResourceService = require('../../server/services/hospitalResourceService');

describe('F48 — Hospital Resource Management Service Suite', () => {
  it('should compute complete hospital operational overview correctly', async () => {
    const overview = await hospitalResourceService.getOverview();

    expect(overview).toBeDefined();
    expect(overview.facilityId).toBe('HEALTHSPHERE-CENTRAL');
    expect(overview.beds.total).toBeGreaterThanOrEqual(8);
    expect(overview.beds.occupancyRatePercentage).toBeGreaterThan(0);
    expect(overview.icu.totalBeds).toBeGreaterThanOrEqual(4);
    expect(overview.icu.ventilatorsTotal).toBeGreaterThanOrEqual(3);
    expect(overview.operatingTheaters.totalTheaters).toBeGreaterThanOrEqual(3);
    expect(overview.ambulanceFleet.total).toBeGreaterThanOrEqual(3);
    expect(overview.staff.currentlyOnDuty).toBeGreaterThan(0);
    expect(overview.queueSummary.avgTriageWaitMinutes).toBeDefined();
  });

  it('should filter beds by department and acuity level', async () => {
    const allBeds = await hospitalResourceService.getBeds();
    expect(allBeds.length).toBeGreaterThanOrEqual(8);

    const icuBeds = await hospitalResourceService.getBeds({ acuityLevel: 'ICU' });
    expect(icuBeds.length).toBeGreaterThanOrEqual(4);
    expect(icuBeds.every((b: any) => b.acuityLevel === 'ICU')).toBe(true);

    const generalBeds = await hospitalResourceService.getBeds({ department: 'General Medicine' });
    expect(generalBeds.length).toBeGreaterThanOrEqual(2);
  });

  it('should allocate an available bed and reject double-booking', async () => {
    const allocation = await hospitalResourceService.allocateBed({
      bedId: 'BED-GEN-01',
      patientId: 'P-999',
      patientName: 'Alice Springs',
      acuityLevel: 'General'
    });

    expect(allocation.success).toBe(true);
    expect(allocation.bed.status).toBe('occupied');
    expect(allocation.bed.patientName).toBe('Alice Springs');

    // Double booking should throw error
    await expect(
      hospitalResourceService.allocateBed({
        bedId: 'BED-GEN-01',
        patientId: 'P-888',
        patientName: 'Bob Vance'
      })
    ).rejects.toThrow(/already occupied/i);

    // Discharge bed
    const discharge = await hospitalResourceService.dischargeBed('BED-GEN-01');
    expect(discharge.success).toBe(true);
    expect(discharge.bed.status).toBe('available');
    expect(discharge.bed.patientId).toBeNull();
  });

  it('should calculate ICU occupancy and ventilator metrics accurately', async () => {
    const icu = await hospitalResourceService.getIcuStatus();

    expect(icu.icuBeds.length).toBeGreaterThanOrEqual(4);
    expect(icu.ventilators.length).toBeGreaterThanOrEqual(3);
    expect(icu.stats.totalBeds).toBe(icu.icuBeds.length);
    expect(icu.stats.ventilatorsInUse).toBeGreaterThanOrEqual(2);
    expect(typeof icu.stats.acuityAlert).toBe('boolean');
  });

  it('should schedule surgery in operating theater and prevent conflict', async () => {
    const start = new Date(Date.now() + 3600000 * 20);
    const end = new Date(Date.now() + 3600000 * 23);

    const booking = await hospitalResourceService.scheduleSurgery({
      theaterId: 'OT-3',
      surgeryType: 'Laparoscopic Appendectomy',
      leadSurgeon: 'Dr. Michael Chen',
      anesthesiologist: 'Dr. S. Nair',
      scheduledStart: start,
      scheduledEnd: end,
      priority: 'urgent'
    });

    expect(booking.theaterId).toBe('OT-3');
    expect(booking.status).toBe('scheduled');
    expect(booking.priority).toBe('urgent');

    // Conflicting booking in same theater should be rejected
    await expect(
      hospitalResourceService.scheduleSurgery({
        theaterId: 'OT-3',
        surgeryType: 'Emergency Laparotomy',
        leadSurgeon: 'Dr. Sarah Connor',
        scheduledStart: new Date(start.getTime() + 1800000), // overlaps by 30 mins
        scheduledEnd: new Date(end.getTime() + 3600000)
      })
    ).rejects.toThrow(/Theater conflict/i);
  });

  it('should track and dispatch ambulance fleet', async () => {
    const ambulances = await hospitalResourceService.getAmbulances();
    expect(ambulances.length).toBeGreaterThanOrEqual(3);

    const available = ambulances.find((a: any) => a.status === 'available');
    expect(available).toBeDefined();

    const dispatch = await hospitalResourceService.dispatchAmbulance({
      vehicleNumber: available.vehicleNumber,
      destinationCoords: { lat: 28.6250, lng: 77.2200 },
      estimatedMinutes: 6
    });

    expect(dispatch.success).toBe(true);
    expect(dispatch.ambulance.status).toBe('dispatched');
    expect(dispatch.ambulance.etaMinutes).toBe(6);

    // Re-dispatching the now-busy ambulance should fail
    await expect(
      hospitalResourceService.dispatchAmbulance({
        vehicleNumber: available.vehicleNumber
      })
    ).rejects.toThrow(/currently dispatched/i);
  });

  it('should fetch department triage queues and equipment telemetry', async () => {
    const queues = await hospitalResourceService.getQueues();
    expect(queues.length).toBeGreaterThanOrEqual(2);
    expect(queues[0].department).toBe('Emergency & Trauma');
    expect(queues[0].queue.length).toBeGreaterThan(0);

    const ventilators = await hospitalResourceService.getEquipment({ category: 'Ventilator' });
    expect(ventilators.length).toBeGreaterThanOrEqual(3);
    expect(ventilators[0].telemetryMetrics.batteryPercentage).toBeGreaterThanOrEqual(90);
  });
});
