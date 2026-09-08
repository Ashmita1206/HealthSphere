const HealthScore = require('../models/HealthScore');
const HealthLog = require('../models/HealthLog');
const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
const SymptomAssessment = require('../models/SymptomAssessment');
const { createNotification } = require('./notificationService');
const timelineService = require('./timelineService');
const { calculateAdherenceMetrics } = require('./aiContextService');
const logger = require('../utils/logger');

/**
 * Continuous Health Monitoring Service (Live Health Monitor)
 * Scans for deteriorating trends, adherence drops, recurring symptoms, and vital anomalies.
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<Object>} Status report and generated alerts
 */
async function runLiveHealthCheck(userId) {
  if (!userId) {
    throw new Error('userId is required for live health monitoring');
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [scores, healthLogs, medicines, doseLogs, symptoms] = await Promise.all([
      HealthScore.find({ userId }).sort({ createdAt: -1 }).limit(3).lean().catch(() => []),
      HealthLog.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(10).lean().catch(() => []),
      Medicine.find({ userId, isActive: true, status: { $ne: 'archived' } }).lean().catch(() => []),
      DoseLog.find({ userId }).sort({ scheduledDate: -1, createdAt: -1 }).limit(30).lean().catch(() => []),
      SymptomAssessment.find({ userId, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).lean().catch(() => []),
    ]);

    const alerts = [];
    let isCritical = false;

    // 1. Medication Adherence Monitoring
    const adherence = calculateAdherenceMetrics(medicines, doseLogs);
    if (medicines.length > 0 && adherence.rate < 65) {
      alerts.push({
        type: 'medication_adherence',
        severity: 'high',
        message: `Medication adherence dropped to ${adherence.rate}%. Missed ${adherence.missedCount} recent doses.`,
      });
      await createNotification({
        userId,
        title: 'Medication Adherence Alert',
        message: `Your medication adherence has dropped to ${adherence.rate}%. Please take your scheduled doses.`,
        type: 'medication',
        severity: 'warning',
        priority: 'high',
        route: '/medicines',
      });
    }

    // 2. Repeated Symptoms Monitoring
    const symptomFrequency = new Map();
    for (const assessment of symptoms) {
      for (const sym of assessment.symptoms || []) {
        const norm = sym.trim().toLowerCase();
        symptomFrequency.set(norm, (symptomFrequency.get(norm) || 0) + 1);
      }
    }
    for (const log of healthLogs) {
      for (const sym of log.symptoms || []) {
        const norm = sym.trim().toLowerCase();
        symptomFrequency.set(norm, (symptomFrequency.get(norm) || 0) + 1);
      }
    }

    for (const [sym, count] of symptomFrequency.entries()) {
      if (count >= 3) {
        alerts.push({
          type: 'recurring_symptom',
          severity: 'high',
          message: `Repeated symptom detected: "${sym}" logged ${count} times in the past 7 days.`,
        });
        await createNotification({
          userId,
          title: 'Recurring Symptom Warning',
          message: `You have reported "${sym}" ${count} times recently. Consulting a doctor is recommended.`,
          type: 'alert',
          severity: 'warning',
          priority: 'high',
          route: '/ai-chat',
        });
        break; // Alert once for recurring pattern
      }
    }

    // 3. Deteriorating Health Score Monitoring
    if (scores.length >= 2) {
      const currentScore = scores[0].overallHealthScore;
      const prevScore = scores[1].overallHealthScore;
      const scoreDrop = prevScore - currentScore;

      if (scoreDrop >= 10) {
        alerts.push({
          type: 'health_score_drop',
          severity: 'high',
          message: `Health score declined by ${scoreDrop} points (from ${prevScore} to ${currentScore}).`,
        });
        await createNotification({
          userId,
          title: 'Health Score Decline Notice',
          message: `Your composite health score decreased from ${prevScore} to ${currentScore}. Check your wellness recommendations.`,
          type: 'general',
          severity: 'info',
          priority: 'normal',
          route: '/analytics',
        });
      }
    }

    // 4. Abnormal Vitals Monitoring
    const latestLog = healthLogs[0];
    if (latestLog) {
      if (latestLog.systolic >= 160 || latestLog.diastolic >= 100) {
        isCritical = true;
        alerts.push({
          type: 'vital_anomaly_bp',
          severity: 'critical',
          message: `Critical blood pressure spike recorded: ${latestLog.systolic}/${latestLog.diastolic} mmHg.`,
        });
      }
      if (latestLog.heartRate >= 130 || (latestLog.heartRate > 0 && latestLog.heartRate < 45)) {
        isCritical = true;
        alerts.push({
          type: 'vital_anomaly_hr',
          severity: 'critical',
          message: `Extreme heart rate reading recorded: ${latestLog.heartRate} bpm.`,
        });
      }
      if (typeof latestLog.glucose === 'number' && (latestLog.glucose > 280 || latestLog.glucose < 60)) {
        isCritical = true;
        alerts.push({
          type: 'vital_anomaly_glucose',
          severity: 'critical',
          message: `Extreme blood glucose reading recorded: ${latestLog.glucose} mg/dL.`,
        });
      }
    }

    const status = isCritical ? 'critical' : alerts.length > 0 ? 'alert' : 'normal';

    return {
      status,
      alertsCount: alerts.length,
      alerts,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Live health monitor error', { error: error.message, userId });
    return {
      status: 'normal',
      alertsCount: 0,
      alerts: [],
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = {
  runLiveHealthCheck,
};
