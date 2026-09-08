import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const wearableService = req('../../server/services/wearableService');
const wearableController = req('../../server/controllers/wearableController');
const notificationService = req('../../server/services/notificationService');
const timelineService = req('../../server/services/timelineService');

describe('F21 — Wearable Device & IoT Integration Backend Suite', () => {
  const testUserId = '64b1f77bcf86cd7994390001';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. evaluateReadingAnomaly correctly classifies normal and critical physiological signals', () => {
    // SpO2
    const normalSpo2 = wearableService.evaluateReadingAnomaly('spo2', 98);
    expect(normalSpo2.isAnomalous).toBe(false);

    const criticalSpo2 = wearableService.evaluateReadingAnomaly('spo2', 88);
    expect(criticalSpo2.isAnomalous).toBe(true);
    expect(criticalSpo2.severity).toBe('critical');
    expect(criticalSpo2.message).toContain('Critical hypoxemia');

    // Heart Rate
    const tachycardia = wearableService.evaluateReadingAnomaly('heartRate', 145);
    expect(tachycardia.isAnomalous).toBe(true);
    expect(tachycardia.severity).toBe('critical');
    expect(tachycardia.message).toContain('Severe tachycardia');

    const bradycardia = wearableService.evaluateReadingAnomaly('heartRate', 40);
    expect(bradycardia.isAnomalous).toBe(true);
    expect(bradycardia.severity).toBe('critical');

    // Blood Pressure
    const normalBp = wearableService.evaluateReadingAnomaly('bloodPressure', { systolic: 120, diastolic: 80 });
    expect(normalBp.isAnomalous).toBe(false);

    const crisisBp = wearableService.evaluateReadingAnomaly('bloodPressure', '195/125');
    expect(crisisBp.isAnomalous).toBe(true);
    expect(crisisBp.severity).toBe('critical');
    expect(crisisBp.message).toContain('Hypertensive emergency');
  });

  it('2. connectDevice pairs Apple Health / Fitbit / Garmin sensors with preferences', async () => {
    const timelineSpy = vi.spyOn(timelineService, 'createEvent').mockResolvedValue({});

    const device = await wearableService.connectDevice(testUserId, {
      provider: 'apple_health',
      deviceId: 'apple-watch-ultra-01',
      deviceName: 'Apple Watch Ultra 2',
      batteryLevel: 92,
      syncPreferences: {
        autoSync: true,
        syncIntervalMinutes: 10,
        metricsEnabled: ['heartRate', 'spo2', 'steps', 'ecg'],
      },
    });

    expect(device).toBeDefined();
    expect(device.provider).toBe('apple_health');
    expect(device.deviceId).toBe('apple-watch-ultra-01');
    expect(timelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
        eventType: 'general',
        title: 'Wearable Device Paired',
      })
    );
  });

  it('3. connectDevice enforces required provider and deviceId validation', async () => {
    await expect(
      wearableService.connectDevice(testUserId, { deviceName: 'Unknown Band' })
    ).rejects.toThrow(/provider and deviceId are required/i);
  });

  it('4. syncReadings deduplicates duplicate readings and resolves timestamp conflicts', async () => {
    const sameTime = new Date('2026-09-08T12:00:00.000Z');

    const result = await wearableService.syncReadings(testUserId, {
      provider: 'fitbit',
      deviceId: 'fitbit-charge-6',
      readings: [
        { metricType: 'heartRate', value: 72, recordedAt: sameTime },
        { metricType: 'heartRate', value: 74, recordedAt: sameTime }, // duplicate timestamp
        { metricType: 'steps', value: 3450, recordedAt: sameTime },
        { metricType: 'calories', value: 210, recordedAt: new Date('2026-09-08T12:05:00.000Z') },
      ],
    });

    expect(result.success).toBe(true);
    // HR duplicate timestamp collapsed to 1 reading + 1 steps + 1 calories = 3
    expect(result.processedCount).toBe(3);
    expect(result.anomaliesDetected).toBe(0);
  });

  it('5. syncReadings triggers multi-channel emergency alert when critical vitals breach threshold', async () => {
    const notifSpy = vi.spyOn(notificationService, 'createNotification').mockResolvedValue({});
    const timelineSpy = vi.spyOn(timelineService, 'createEvent').mockResolvedValue({});

    const result = await wearableService.syncReadings(testUserId, {
      provider: 'samsung_health',
      deviceId: 'galaxy-watch-6',
      readings: [
        { metricType: 'spo2', value: 86, recordedAt: new Date() }, // Critical hypoxemia < 90%
        { metricType: 'heartRate', value: 142, recordedAt: new Date() }, // Severe tachycardia
      ],
    });

    expect(result.success).toBe(true);
    expect(result.anomaliesDetected).toBe(2);
    expect(result.criticalAlerts.length).toBeGreaterThan(0);

    // Verified emergency escalation
    expect(notifSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
        type: 'emergency',
        severity: 'critical',
      })
    );
    expect(timelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
        eventType: 'emergency',
        title: 'Acute Wearable Telemetry Alarm',
      })
    );
  });

  it('6. getUserDevices and getUserReadings retrieve formatted telemetry', async () => {
    const devices = await wearableService.getUserDevices(testUserId);
    expect(Array.isArray(devices)).toBe(true);

    const readings = await wearableService.getUserReadings(testUserId, { metricType: 'heartRate', limit: 10 });
    expect(Array.isArray(readings)).toBe(true);
  });

  it('7. disconnectDevice removes device and records timeline unlinking event', async () => {
    const timelineSpy = vi.spyOn(timelineService, 'createEvent').mockResolvedValue({});

    const res = await wearableService.disconnectDevice(testUserId, 'device-to-remove-123');
    expect(res.success).toBe(true);
    expect(timelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
        title: 'Wearable Device Disconnected',
      })
    );
  });

  it('8. Controller endpoints handle connect, sync, getDevices, and disconnect', async () => {
    // 1. Connect controller
    const reqConnect = {
      user: { _id: testUserId },
      body: { provider: 'garmin', deviceId: 'garmin-forerunner-965', deviceName: 'Garmin Forerunner' },
    };
    let resData: any = null;
    let resStatus = 0;
    const resMock = {
      status: (code: number) => {
        resStatus = code;
        return {
          json: (data: any) => {
            resData = data;
          },
        };
      },
    };

    await wearableController.connectWearable(reqConnect as any, resMock as any, () => {});
    expect(resStatus).toBe(201);
    expect(resData.success).toBe(true);

    // 2. Sync controller
    const reqSync = {
      user: { _id: testUserId },
      body: {
        provider: 'garmin',
        deviceId: 'garmin-forerunner-965',
        readings: [{ metricType: 'steps', value: 8500 }],
      },
    };
    await wearableController.syncWearableReadings(reqSync as any, resMock as any, () => {});
    expect(resStatus).toBe(200);
    expect(resData.data.processedCount).toBe(1);

    // 3. Devices list controller
    const reqDevices = { user: { _id: testUserId } };
    await wearableController.getWearableDevices(reqDevices as any, resMock as any, () => {});
    expect(resStatus).toBe(200);
    expect(resData.success).toBe(true);

    // 4. Disconnect controller
    const reqDisconnect = { user: { _id: testUserId }, params: { deviceId: 'garmin-forerunner-965' } };
    await wearableController.disconnectWearable(reqDisconnect as any, resMock as any, () => {});
    expect(resStatus).toBe(200);
    expect(resData.data.success).toBe(true);
  });
});
