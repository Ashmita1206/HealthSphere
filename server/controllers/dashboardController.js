const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const HealthScore = require('../models/HealthScore');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
const Report = require('../models/Report');
const SymptomAssessment = require('../models/SymptomAssessment');
const HealthTimeline = require('../models/HealthTimeline');
const Notification = require('../models/Notification');
const EmergencyIncident = require('../models/EmergencyIncident');
const { getUserHealthContext, calculateAdherenceMetrics } = require('../services/aiContextService');
const { generateHealthScores } = require('../services/healthScoreEngine');
const { generateComprehensiveRecommendations } = require('../services/recommendationEngine');
const logger = require('../utils/logger');

/**
 * High-performance In-Memory TTL Cache Layer
 */
const dashboardCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCachedDashboard(userId) {
  const cached = dashboardCache.get(String(userId));
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  return null;
}

function setCachedDashboard(userId, data, ttlMs = CACHE_TTL_MS) {
  dashboardCache.set(String(userId), {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function invalidateDashboardCache(userId) {
  if (userId) {
    dashboardCache.delete(String(userId));
  } else {
    dashboardCache.clear();
  }
}

/**
 * GET /api/dashboard
 * Powers complete healthcare command center
 */
async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const forceRefresh = req.query.refresh === 'true';

    // 1. Check Caching Layer
    if (!forceRefresh) {
      const cached = getCachedDashboard(userId);
      if (cached) {
        return res.status(200).json({
          success: true,
          fromCache: true,
          data: cached,
        });
      }
    }

    const now = new Date();

    // 2. High-performance parallel queries with projection & lean execution
    const [
      user,
      profile,
      latestScoreDoc,
      upcomingAppointments,
      activeMedicines,
      doseLogs,
      recentReports,
      recentSymptoms,
      timelineEvents,
      activeNotifications,
      activeIncidents,
      lastEmergency,
      scoreHistory,
    ] = await Promise.all([
      User.findById(userId).select('-password').lean(),
      MedicalProfile.findOne({ userId }).lean(),
      HealthScore.findOne({ userId }).sort({ createdAt: -1 }).lean(),
      Appointment.find({ userId, appointmentDate: { $gte: now } })
        .sort({ appointmentDate: 1 })
        .limit(5)
        .lean(),
      Medicine.find({ userId, isActive: true, status: { $ne: 'archived' } })
        .sort({ createdAt: -1 })
        .lean(),
      DoseLog.find({ userId })
        .sort({ scheduledDate: -1, createdAt: -1 })
        .limit(60)
        .lean(),
      Report.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category fileUrl summary riskLevel abnormalValues createdAt')
        .lean(),
      SymptomAssessment.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('symptoms severity riskLevel suggestedSpecialist requiresDoctor createdAt')
        .lean(),
      HealthTimeline.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Notification.find({ userId, isRead: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      EmergencyIncident.find({ userId, status: { $in: ['active', 'investigating'] } })
        .sort({ createdAt: -1 })
        .lean(),
      EmergencyIncident.findOne({ userId })
        .sort({ createdAt: -1 })
        .lean(),
      HealthScore.find({ userId })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean(),
    ]);

    // 3. Construct Profile Summary
    const profileSummary = {
      id: userId,
      name: user?.name || profile?.fullName || 'User',
      email: user?.email || '',
      digitalHealthId: profile?.digitalHealthId || `HS-${String(userId).slice(-6).toUpperCase()}`,
      bloodGroup: profile?.bloodGroup || user?.bloodType || 'Unknown',
      gender: profile?.gender || user?.gender || 'Unspecified',
      dateOfBirth: profile?.dateOfBirth || user?.dateOfBirth || null,
      allergies: profile?.allergies || [],
      chronicConditions: profile?.chronicConditions || [],
      emergencyContactName: profile?.emergencyContactName || null,
      emergencyContactPhone: profile?.emergencyContactPhone || null,
    };

    // 4. Calculate or Format Health Score
    let healthScore = latestScoreDoc
      ? {
          overallScore: latestScoreDoc.overallHealthScore,
          scores: latestScoreDoc.scores || {},
          calculatedAt: latestScoreDoc.calculatedAt || latestScoreDoc.createdAt,
        }
      : null;

    if (!healthScore) {
      try {
        const generated = await generateHealthScores(userId);
        healthScore = {
          overallScore: generated.overallHealthScore,
          scores: generated.scores,
          calculatedAt: generated.calculatedAt,
        };
      } catch (_e) {
        healthScore = {
          overallScore: 78,
          scores: {},
          calculatedAt: new Date(),
        };
      }
    }

    // 5. Calculate Medicine Adherence
    const medicineAdherence = calculateAdherenceMetrics(activeMedicines, doseLogs);

    // 6. Generate AI Recommendations
    let aiRecommendations = [];
    try {
      const context = await getUserHealthContext(userId);
      const comprehensive = generateComprehensiveRecommendations(context);
      aiRecommendations = [
        ...comprehensive.medicineReminders.slice(0, 2),
        ...comprehensive.lifestyle.slice(0, 2),
        ...comprehensive.riskPrevention.slice(0, 2),
      ];
    } catch (_e) {
      aiRecommendations = [
        'Maintain timely prescription dosing routines.',
        'Log daily hydration and resting vitals.',
        'Schedule routine preventive biometric reviews.',
      ];
    }

    // 7. Synthesize Critical Alerts
    const alerts = [];
    for (const notif of activeNotifications) {
      if (notif.severity === 'high' || notif.type === 'alert' || notif.priority === 'high') {
        alerts.push({
          id: notif._id,
          title: notif.title,
          message: notif.message,
          severity: notif.severity,
          createdAt: notif.createdAt,
        });
      }
    }

    if (medicineAdherence.rate < 65 && activeMedicines.length > 0) {
      alerts.push({
        id: `alert-adherence-${Date.now()}`,
        title: 'Medication Adherence Alert',
        message: `Current adherence is ${medicineAdherence.rate}%. Missed ${medicineAdherence.missedCount} recent doses.`,
        severity: 'warning',
        createdAt: new Date(),
      });
    }

    // 8. Emergency Status, Active Alerts, and Risk Trend
    for (const inc of activeIncidents) {
      alerts.unshift({
        id: inc._id,
        title: `EMERGENCY ALERT: ${inc.severity}`,
        message: inc.triggerReason,
        severity: inc.severity === 'CRITICAL' ? 'critical' : 'high',
        createdAt: inc.createdAt,
      });
    }

    const hasCriticalEmergency = activeIncidents.some((i) => i.severity === 'CRITICAL');
    const emergencyStatus = hasCriticalEmergency
      ? 'critical'
      : activeIncidents.length > 0 || alerts.some((a) => a.severity === 'critical')
      ? 'alert'
      : 'normal';

    let riskTrend = 'stable';
    if (scoreHistory.length >= 2) {
      const diff = scoreHistory[0].overallHealthScore - scoreHistory[1].overallHealthScore;
      if (diff > 2) riskTrend = 'improving';
      else if (diff < -2) riskTrend = 'deteriorating';
    }

    const dashboardPayload = {
      profileSummary,
      healthScore,
      upcomingAppointments,
      activeMedicines: activeMedicines.map((m) => ({
        id: m._id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        time: m.time || m.timing,
        adherenceRate: m.adherenceRate,
      })),
      medicineAdherence,
      recentReports,
      recentSymptoms,
      healthTimeline: timelineEvents,
      aiRecommendations,
      alerts,
      activeAlerts: alerts,
      emergencyStatus,
      riskTrend,
      lastEmergency: lastEmergency || null,
    };

    // 8. Cache response
    setCachedDashboard(userId, dashboardPayload);

    res.status(200).json({
      success: true,
      fromCache: false,
      data: dashboardPayload,
    });
  } catch (error) {
    logger.error('Dashboard controller error', { error: error.message });
    next(error);
  }
}

module.exports = {
  getDashboard,
  getCachedDashboard,
  setCachedDashboard,
  invalidateDashboardCache,
};
