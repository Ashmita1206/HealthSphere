const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const HealthLog = require('../models/HealthLog');
const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const EmergencyContact = require('../models/EmergencyContact');
const SymptomAssessment = require('../models/SymptomAssessment');
const Consultation = require('../models/Consultation');
const HealthTimeline = require('../models/HealthTimeline');
const logger = require('../utils/logger');

/**
 * Calculates medication adherence summary from DoseLog and active Medicines
 */
function calculateAdherenceMetrics(medicines = [], doseLogs = []) {
  if (!medicines.length && !doseLogs.length) {
    return {
      rate: 100,
      totalScheduled: 0,
      totalCompleted: 0,
      missedCount: 0,
      status: 'No active medications',
    };
  }

  if (doseLogs.length > 0) {
    const totalScheduled = doseLogs.length;
    const totalCompleted = doseLogs.filter((d) => d.completed).length;
    const missedCount = totalScheduled - totalCompleted;
    const rate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 100;
    return {
      rate,
      totalScheduled,
      totalCompleted,
      missedCount,
      status: rate >= 85 ? 'High Adherence' : rate >= 65 ? 'Moderate Adherence' : 'Poor Adherence',
    };
  }

  // Fallback to average adherenceRate stored on medicines
  const rates = medicines
    .map((m) => m.adherenceRate)
    .filter((r) => typeof r === 'number' && !isNaN(r));
  const avg = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 100;

  return {
    rate: avg,
    totalScheduled: medicines.length,
    totalCompleted: Math.round((avg / 100) * medicines.length),
    missedCount: Math.round(((100 - avg) / 100) * medicines.length),
    status: avg >= 85 ? 'High Adherence' : avg >= 65 ? 'Moderate Adherence' : 'Poor Adherence',
  };
}

/**
 * Summarizes vital signs trends from recent health logs
 */
function summarizeVitals(logs = []) {
  if (!logs.length) {
    return {
      averageHeartRate: null,
      averageBloodPressure: null,
      latestWeight: null,
      latestGlucose: null,
      abnormalVitalsCount: 0,
    };
  }

  let hrSum = 0, hrCount = 0;
  let sysSum = 0, diaSum = 0, bpCount = 0;
  let latestWeight = null;
  let latestGlucose = null;
  let abnormalVitalsCount = 0;

  for (const log of logs) {
    if (typeof log.heartRate === 'number' && log.heartRate > 0) {
      hrSum += log.heartRate;
      hrCount++;
      if (log.heartRate < 55 || log.heartRate > 105) abnormalVitalsCount++;
    }
    if (typeof log.systolic === 'number' && typeof log.diastolic === 'number') {
      sysSum += log.systolic;
      diaSum += log.diastolic;
      bpCount++;
      if (log.systolic >= 140 || log.diastolic >= 90) abnormalVitalsCount++;
    }
    if (latestWeight === null && typeof log.weight === 'number') latestWeight = log.weight;
    if (latestGlucose === null && typeof log.glucose === 'number') {
      latestGlucose = log.glucose;
      if (log.glucose > 140 || log.glucose < 70) abnormalVitalsCount++;
    }
  }

  return {
    averageHeartRate: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
    averageBloodPressure: bpCount > 0 ? `${Math.round(sysSum / bpCount)}/${Math.round(diaSum / bpCount)}` : null,
    latestWeight,
    latestGlucose,
    abnormalVitalsCount,
  };
}

/**
 * Aggregates complete health context for a user in a structured, AI-ready format
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<Object>} Structured user health context
 */
async function getUserHealthContext(userId) {
  if (!userId) {
    throw new Error('userId is required to aggregate health context');
  }

  try {
    const [
      user,
      medicalProfile,
      healthLogs,
      medicines,
      doseLogs,
      appointments,
      reports,
      emergencyContacts,
      symptoms,
      consultations,
      timelineEvents,
    ] = await Promise.all([
      User.findById(userId).select('-password').lean().catch(() => null),
      MedicalProfile.findOne({ userId }).lean().catch(() => null),
      HealthLog.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(30).lean().catch(() => []),
      Medicine.find({ userId }).sort({ createdAt: -1 }).lean().catch(() => []),
      DoseLog.find({ userId }).sort({ scheduledDate: -1, createdAt: -1 }).limit(60).lean().catch(() => []),
      Appointment.find({ userId }).sort({ appointmentDate: -1 }).limit(10).lean().catch(() => []),
      Report.find({ userId }).sort({ createdAt: -1 }).limit(15).lean().catch(() => []),
      EmergencyContact.find({ userId }).lean().catch(() => []),
      SymptomAssessment.find({ userId }).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
      Consultation.find({ patientId: userId }).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
      HealthTimeline.find({ userId }).sort({ createdAt: -1 }).limit(25).lean().catch(() => []),
    ]);

    const activeMedicines = medicines.filter((m) => m.isActive !== false && m.status !== 'archived');
    const adherenceMetrics = calculateAdherenceMetrics(medicines, doseLogs);
    const vitalsSummary = summarizeVitals(healthLogs);

    // Identify recent high or critical risk events
    const recentHighRiskSymptoms = symptoms.filter((s) => ['HIGH', 'CRITICAL'].includes(s.riskLevel?.toUpperCase()));
    const recentAbnormalReports = reports.filter((r) => ['high', 'critical'].includes(r.riskLevel?.toLowerCase()) || (Array.isArray(r.abnormalValues) && r.abnormalValues.length > 0));

    const structuredContext = {
      userId: String(userId),
      profile: {
        name: user?.name || medicalProfile?.fullName || 'User',
        email: user?.email || '',
        gender: medicalProfile?.gender || user?.gender || 'unspecified',
        dateOfBirth: medicalProfile?.dateOfBirth || user?.dateOfBirth || null,
        bloodGroup: medicalProfile?.bloodGroup || user?.bloodType || 'Unknown',
        height: medicalProfile?.height || null,
        weight: vitalsSummary.latestWeight || medicalProfile?.weight || null,
        bmi: medicalProfile?.bmi || null,
        allergies: medicalProfile?.allergies || [],
        chronicConditions: medicalProfile?.chronicConditions || [],
        emergencyContactsCount: emergencyContacts.length,
      },
      vitals: vitalsSummary,
      medications: {
        totalCount: medicines.length,
        activeCount: activeMedicines.length,
        activeList: activeMedicines.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          timing: m.timing || m.time,
          adherenceRate: m.adherenceRate,
        })),
        adherence: adherenceMetrics,
      },
      clinicalHistory: {
        appointmentsCount: appointments.length,
        upcomingAppointments: appointments
          .filter((a) => new Date(a.appointmentDate) >= new Date())
          .map((a) => ({
            doctorName: a.doctorName,
            specialty: a.specialty,
            hospital: a.hospital,
            date: a.appointmentDate,
            status: a.status,
          })),
        consultationsCount: consultations.length,
        recentConsultations: consultations.slice(0, 3).map((c) => ({
          status: c.status,
          startedAt: c.startedAt,
          endedAt: c.endedAt,
          hasPrescription: Boolean(c.prescription?.length),
        })),
        reportsCount: reports.length,
        recentAbnormalReportsCount: recentAbnormalReports.length,
        recentReports: reports.slice(0, 5).map((r) => ({
          title: r.title,
          category: r.category,
          riskLevel: r.riskLevel,
          summary: r.summary,
          abnormalValuesCount: Array.isArray(r.abnormalValues) ? r.abnormalValues.length : 0,
        })),
      },
      symptomHistory: {
        totalAssessments: symptoms.length,
        recentHighRiskCount: recentHighRiskSymptoms.length,
        recentAssessments: symptoms.slice(0, 5).map((s) => ({
          symptoms: s.symptoms,
          severity: s.severity,
          riskLevel: s.riskLevel,
          suggestedSpecialist: s.suggestedSpecialist,
          requiresDoctor: s.requiresDoctor,
          createdAt: s.createdAt,
        })),
      },
      recentTimeline: timelineEvents.slice(0, 10).map((t) => ({
        eventType: t.eventType,
        title: t.title,
        description: t.description,
        createdAt: t.createdAt,
      })),
      timestamp: new Date().toISOString(),
    };

    return structuredContext;
  } catch (error) {
    logger.error('Failed to aggregate user health context', { error: error.message, userId });
    throw error;
  }
}

module.exports = {
  getUserHealthContext,
  calculateAdherenceMetrics,
  summarizeVitals,
};
