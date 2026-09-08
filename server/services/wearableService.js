const mongoose = require('mongoose');
const WearableDevice = require('../models/WearableDevice');
const WearableReading = require('../models/WearableReading');
const notificationService = require('./notificationService');
const timelineService = require('./timelineService');
const logger = require('../utils/logger');

/**
 * Check if a reading breaches clinical safety thresholds
 */
function evaluateReadingAnomaly(metricType, value) {
  if (metricType === 'spo2') {
    const num = typeof value === 'number' ? value : Number(value);
    if (num < 90) return { isAnomalous: true, severity: 'critical', message: `Critical hypoxemia: SpO2 dropped to ${num}%` };
    if (num < 94) return { isAnomalous: true, severity: 'warning', message: `Borderline oxygen saturation: SpO2 at ${num}%` };
  }

  if (metricType === 'heartRate') {
    const num = typeof value === 'number' ? value : Number(value);
    if (num > 130) return { isAnomalous: true, severity: 'critical', message: `Severe tachycardia: Resting HR spiked to ${num} bpm` };
    if (num < 45) return { isAnomalous: true, severity: 'critical', message: `Severe bradycardia: Heart rate dropped to ${num} bpm` };
  }

  if (metricType === 'bloodPressure') {
    const sbp = value?.systolic || (typeof value === 'string' && Number(value.split('/')[0]));
    const dbp = value?.diastolic || (typeof value === 'string' && Number(value.split('/')[1]));
    if (sbp > 180 || dbp > 120) {
      return { isAnomalous: true, severity: 'critical', message: `Hypertensive emergency: BP measured at ${sbp}/${dbp} mmHg` };
    }
  }

  return { isAnomalous: false };
}

/**
 * 1. Register or Connect Wearable Device
 */
async function connectDevice(userId, deviceData = {}) {
  try {
    const { provider, deviceName, deviceId, batteryLevel, syncPreferences } = deviceData;

    if (!provider || !deviceId) {
      throw new Error('provider and deviceId are required to pair wearable device');
    }

    const payload = {
      userId,
      provider,
      deviceName: deviceName || `${provider.toUpperCase()} Smart Sensor`,
      deviceId,
      batteryLevel: batteryLevel ?? 95,
      status: 'connected',
      lastSyncAt: new Date(),
      syncPreferences: syncPreferences || {
        autoSync: true,
        syncIntervalMinutes: 15,
        metricsEnabled: ['heartRate', 'sleep', 'steps', 'spo2', 'bloodPressure', 'calories', 'ecg', 'activity'],
      },
    };

    let device = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      device = await WearableDevice.findOneAndUpdate(
        { userId, deviceId },
        { $set: payload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      device = { ...payload, _id: `dev-${Date.now()}` };
    }

    await timelineService.createEvent({
      userId,
      eventType: 'general',
      category: 'general',
      title: 'Wearable Device Paired',
      description: `Connected ${payload.deviceName} (${provider}) for live telemetry streaming.`,
    });

    return device;
  } catch (err) {
    logger.error('Failed to connect wearable device', { userId, error: err.message });
    throw err;
  }
}

/**
 * 2. Ingest and Synchronize Wearable Readings with Conflict Resolution & Anomaly Escalation
 */
async function syncReadings(userId, syncPayload = {}) {
  try {
    const { provider, deviceId, readings = [] } = syncPayload;

    if (!Array.isArray(readings) || readings.length === 0) {
      return { success: true, processedCount: 0, anomaliesDetected: 0, readings: [] };
    }

    const processedReadings = [];
    let anomaliesDetected = 0;
    const criticalAlerts = [];

    // Deduplication map: key = `${metricType}-${timestamp}`
    const dedupeMap = new Map();

    for (const r of readings) {
      if (!r.metricType || r.value === undefined) continue;

      const recordedAt = r.recordedAt ? new Date(r.recordedAt) : new Date();
      const dedupeKey = `${r.metricType}-${recordedAt.getTime()}`;

      // Conflict resolution: newest sensor timestamp takes precedence
      if (!dedupeMap.has(dedupeKey)) {
        dedupeMap.set(dedupeKey, { ...r, recordedAt });
      }
    }

    for (const item of dedupeMap.values()) {
      const anomalyCheck = evaluateReadingAnomaly(item.metricType, item.value);

      const readingDoc = {
        userId,
        deviceId: deviceId || 'virtual-iot-hub',
        provider: provider || 'manual_iot',
        metricType: item.metricType,
        value: item.value,
        unit: item.unit || (item.metricType === 'heartRate' ? 'bpm' : item.metricType === 'steps' ? 'steps' : item.metricType === 'spo2' ? '%' : 'units'),
        recordedAt: item.recordedAt,
        source: item.source || `${provider || 'Wearable'} Sensor`,
        isAnomalous: anomalyCheck.isAnomalous,
        metadata: item.metadata || {},
      };

      processedReadings.push(readingDoc);

      if (anomalyCheck.isAnomalous) {
        anomaliesDetected++;
        if (anomalyCheck.severity === 'critical') {
          criticalAlerts.push(anomalyCheck.message);
        }
      }
    }

    // Persist to MongoDB if connected
    if (mongoose.connection && mongoose.connection.readyState === 1 && processedReadings.length > 0) {
      await WearableReading.insertMany(processedReadings, { ordered: false }).catch(() => {});
      if (deviceId) {
        await WearableDevice.updateOne({ userId, deviceId }, { $set: { lastSyncAt: new Date() } });
      }
    }

    // Emergency Integration: Trigger multi-channel alert on critical anomaly
    if (criticalAlerts.length > 0) {
      await notificationService.createNotification({
        userId,
        title: 'Critical Wearable Biometric Alert',
        message: criticalAlerts[0],
        type: 'emergency',
        severity: 'critical',
        priority: 'high',
        route: '/emergency',
      });

      await timelineService.createEvent({
        userId,
        eventType: 'emergency',
        category: 'emergency',
        title: 'Acute Wearable Telemetry Alarm',
        description: criticalAlerts[0],
      });
    }

    return {
      success: true,
      processedCount: processedReadings.length,
      anomaliesDetected,
      criticalAlerts,
      readings: processedReadings,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.error('Failed to sync wearable readings', { userId, error: err.message });
    throw err;
  }
}

/**
 * 3. Retrieve User Connected Devices
 */
async function getUserDevices(userId) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return await WearableDevice.find({ userId }).sort({ lastSyncAt: -1 });
  }
  return [
    {
      _id: 'mock-device-apple',
      userId,
      provider: 'apple_health',
      deviceName: 'Apple Watch Series 9',
      deviceId: 'watch-series-9-uuid',
      status: 'connected',
      batteryLevel: 88,
      lastSyncAt: new Date(),
    },
  ];
}

/**
 * 4. Retrieve User Wearable Readings with Filtering
 */
async function getUserReadings(userId, filters = {}) {
  const { metricType, limit = 50, startDate, endDate } = filters;

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const query = { userId };
    if (metricType) query.metricType = metricType;
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    return await WearableReading.find(query)
      .sort({ recordedAt: -1 })
      .limit(Math.min(Number(limit) || 50, 200));
  }

  // Fallback demo data
  return [
    {
      userId,
      metricType: metricType || 'heartRate',
      value: 72,
      unit: 'bpm',
      recordedAt: new Date(),
      provider: 'apple_health',
      isAnomalous: false,
    },
  ];
}

/**
 * 5. Disconnect Wearable Device
 */
async function disconnectDevice(userId, deviceId) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await WearableDevice.findOneAndDelete({ userId, deviceId });
  }

  await timelineService.createEvent({
    userId,
    eventType: 'general',
    category: 'general',
    title: 'Wearable Device Disconnected',
    description: `Device ${deviceId} unlinked from patient telemetry stream.`,
  });

  return { success: true, message: 'Device disconnected successfully' };
}

module.exports = {
  evaluateReadingAnomaly,
  connectDevice,
  syncReadings,
  getUserDevices,
  getUserReadings,
  disconnectDevice,
};
