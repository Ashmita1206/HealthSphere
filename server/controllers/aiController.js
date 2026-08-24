const { parseMedicalReport, compareMedicalReports } = require('../services/ocr/ocrService');
const { analyzeMedicalImage } = require('../services/vision/visionService');
const { calculateUserHealthScores } = require('../services/healthScore/healthScoreService');
const { generateHealthPredictions } = require('../services/predictions/predictionService');
const Medicine = require('../models/Medicine');
const Report = require('../models/Report');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const HealthLog = require('../models/HealthLog');
const DoseLog = require('../models/DoseLog');
const { generateGeminiText, safeParseJSON } = require('../services/gemini/geminiService');
const logger = require('../utils/logger');

/**
 * Report OCR & Intelligence Analysis
 */
async function analyzeReport(req, res, next) {
  try {
    const { mimeType, base64Data, textContent } = req.body;
    const analysis = await parseMedicalReport({ mimeType, base64Data, textContent });

    // Save report to database if user is authenticated and analysis succeeded
    if (req.user?._id && analysis && analysis.ocrStatus !== 'failed') {
      const normalizedRisk = analysis.riskLevel ? analysis.riskLevel.toLowerCase() : 'low';
      const validRisk = ['low', 'moderate', 'high', 'critical'].includes(normalizedRisk) ? normalizedRisk : 'low';

      await Report.create({
        userId: req.user._id,
        title: analysis.reportTitle || 'Medical Report Analysis',
        category: analysis.category || 'General',
        summary: analysis.summary || '',
        riskLevel: validRisk,
        abnormalValues: analysis.abnormalValues || [],
        biomarkers: analysis.biomarkers || {},
        ocrStatus: 'completed',
        fileUrl: '',
      }).catch((err) => logger.warn('Failed saving report record in direct analyze path', { error: err.message }));
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Compare 2 Reports
 */
async function compareReports(req, res, next) {
  try {
    const { reportA, reportB } = req.body;
    const result = await compareMedicalReports(reportA, reportB);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * AI Vision Multimodal Analysis
 */
async function analyzeVision(req, res, next) {
  try {
    const { category, mimeType, base64Data } = req.body;
    const analysis = await analyzeMedicalImage({ category, mimeType, base64Data });
    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get AI Health Scores
 */
async function getHealthScores(req, res, next) {
  try {
    const userId = req.user?._id;
    const healthScores = await calculateUserHealthScores(userId);
    res.status(200).json({
      success: true,
      data: healthScores,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get AI Predictive Analytics
 */
async function getPredictions(req, res, next) {
  try {
    const userId = req.user?._id;
    const predictions = await generateHealthPredictions(userId);
    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Module 6 — AI Dashboard Logic
 */
function getLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDailyFrequency(freqStr) {
  if (!freqStr || typeof freqStr !== 'string') return 1;
  const lower = freqStr.toLowerCase();
  if (lower.includes('twice') || lower.includes('2x') || lower.includes('2 time') || lower.includes('bid') || lower.includes('every 12')) return 2;
  if (lower.includes('thrice') || lower.includes('3x') || lower.includes('3 time') || lower.includes('tid') || lower.includes('every 8')) return 3;
  if (lower.includes('4x') || lower.includes('4 time') || lower.includes('qid') || lower.includes('every 6')) return 4;
  return 1;
}

async function getDashboardLogic(req, res, next) {
  try {
    const userId = req.user?._id;

    // Compute last 7 days date strings [day-6, day-5, day-4, day-3, day-2, day-1, day-0] using local date strings
    const last7Dates = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      last7Dates.push({
        dateStr: getLocalDateStr(d),
        dayLabel: dayLabels[d.getDay()],
      });
    }

    const todayStr = last7Dates[last7Dates.length - 1].dateStr;

    const [user, medicines, reports, appointments, reminders, logs, doseLogs] = await Promise.all([
      User.findById(userId).lean().catch(() => null),
      Medicine.find({ userId, isActive: true }).lean().catch(() => []),
      Report.find({ userId }).sort({ createdAt: -1 }).limit(5).lean().catch(() => []),
      Appointment.find({ userId, status: 'scheduled' }).sort({ appointmentDate: 1 }).limit(3).lean().catch(() => []),
      Reminder.find({ userId, isActive: true }).sort({ time: 1 }).lean().catch(() => []),
      HealthLog.find({ userId }).sort({ date: 1 }).limit(30).lean().catch(() => []),
      DoseLog.find({ userId, scheduledDate: { $in: last7Dates.map((d) => d.dateStr) } }).lean().catch(() => []),
    ]);

    const validReports = reports.filter((r) => r.ocrStatus !== 'failed');
    const latestReport = validReports[0] || null;
    const latestLog = logs[logs.length - 1];

    // 1. One Thing To Know
    const oneThingToKnow = latestReport
      ? {
          title: `${latestReport.title} Analyzed`,
          subtitle: latestReport.summary || `Lab parameters extracted from document.`,
          category: (latestReport.category || 'OCR LAB INSIGHT').toUpperCase(),
        }
      : latestLog
      ? {
          title: 'Latest Vitals Recorded',
          subtitle: `Recorded vitals log on ${new Date(latestLog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
          category: 'TELEMETRY',
        }
      : {
          title: 'No Clinical Reports or Logs',
          subtitle: 'Upload a medical report or log daily vitals to generate automated health summaries.',
          category: 'AWAITING DATA',
        };

    // 2. One Thing To Do
    const firstReminder = reminders[0];
    const firstMedicine = medicines[0];
    const oneThingToDo = firstReminder
      ? {
          title: `Scheduled Dose: ${firstReminder.medicineName || firstReminder.title}`,
          subtitle: `Take ${firstReminder.dosage || 'prescribed dose'} at ${firstReminder.time}.`,
        }
      : firstMedicine
      ? {
          title: `Active Prescription: ${firstMedicine.name}`,
          subtitle: `Dosage: ${firstMedicine.dosage || 'As prescribed'} (${firstMedicine.frequency || 'Daily'}).`,
        }
      : {
          title: 'No Active Medications',
          subtitle: 'Add your active prescriptions or dose reminders to track daily care actions.',
        };

    // 3. Clinical Insight (null if no valid analyzed report exists)
    const clinicalInsight = (latestReport && (latestReport.summary || latestReport.title))
      ? {
          category: (latestReport.category || 'OCR LAB INSIGHT').toUpperCase(),
          insightTitle: latestReport.title,
          insightBody: latestReport.summary || 'Lab findings extracted and parameters stored.',
          sourceLabel: `Uploaded · ${new Date(latestReport.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        }
      : null;

    // 4. Care Actions with persisted completion status
    const todayLogs = doseLogs.filter((dl) => dl.scheduledDate === todayStr && dl.completed);
    let careActions = [];
    if (reminders.length > 0) {
      careActions = reminders.slice(0, 5).map((r) => {
        const actionId = String(r._id);
        const isCompleted = todayLogs.some(
          (dl) => dl.careActionId === actionId || String(dl.reminderId) === actionId
        );
        return {
          id: actionId,
          reminderId: actionId,
          medicineName: r.medicineName,
          title: `${r.medicineName || r.title} (${r.dosage || 'Prescribed'})`,
          timeText: r.time || 'Scheduled',
          contextNote: r.description || 'Take as instructed',
          isCompleted,
          type: 'medication',
        };
      });
    } else if (medicines.length > 0) {
      careActions = medicines.slice(0, 5).map((m) => {
        const actionId = String(m._id);
        const isCompleted = todayLogs.some(
          (dl) => dl.careActionId === actionId || String(dl.medicineId) === actionId
        );
        return {
          id: actionId,
          medicineId: actionId,
          medicineName: m.name,
          title: `${m.name} (${m.dosage || 'Prescribed'})`,
          timeText: 'Scheduled',
          contextNote: `Frequency: ${m.frequency || 'Daily'}`,
          isCompleted,
          type: 'medication',
        };
      });
    }

    // 5. Dynamic Vitals Telemetry (Weight, Fasting Glucose, Heart Rate)
    const weightSeries = logs.filter((l) => typeof l.weight === 'number' && !isNaN(l.weight)).map((l) => ({
      date: new Date(l.date).toISOString().split('T')[0],
      weight: l.weight,
      value: l.weight,
    }));

    const glucoseSeries = logs.filter((l) => typeof l.glucose === 'number' && !isNaN(l.glucose)).map((l) => ({
      date: new Date(l.date).toISOString().split('T')[0],
      value: l.glucose,
    }));

    const heartRateSeries = logs.filter((l) => typeof l.heartRate === 'number' && !isNaN(l.heartRate)).map((l) => ({
      date: new Date(l.date).toISOString().split('T')[0],
      value: l.heartRate,
    }));

    // 6. Real 7-Day Adherence Calculation (Denominator strictly based on scheduled daily care actions)
    let totalScheduledPerDay = 0;
    if (reminders.length > 0) {
      totalScheduledPerDay = reminders.reduce((sum, r) => sum + parseDailyFrequency(r.frequency), 0);
    } else if (medicines.length > 0) {
      totalScheduledPerDay = medicines.reduce((sum, m) => sum + parseDailyFrequency(m.frequency), 0);
    }

    let adherenceData = [];
    let adherenceRate = null;

    if (totalScheduledPerDay > 0) {
      let totalDosesTaken = 0;
      let totalDosesScheduled = 0;

      adherenceData = last7Dates.map(({ dateStr, dayLabel }) => {
        const logsForDay = doseLogs.filter((dl) => dl.scheduledDate === dateStr && dl.completed);
        const dosesTaken = Math.min(logsForDay.length, totalScheduledPerDay);
        const dosesTotal = totalScheduledPerDay;

        const adherence = Math.min(100, Math.round((dosesTaken / dosesTotal) * 100));
        totalDosesTaken += dosesTaken;
        totalDosesScheduled += dosesTotal;

        return {
          day: dayLabel,
          adherence,
          dosesTaken,
          dosesTotal,
        };
      });

      if (totalDosesScheduled > 0) {
        adherenceRate = Math.min(100, Math.round((totalDosesTaken / totalDosesScheduled) * 100));
      }
    }

    // 7. Dynamic Timeline Preview
    const timelineEvents = [];
    appointments.forEach((a) => {
      timelineEvents.push({
        id: String(a._id),
        title: `Appointment: Dr. ${a.doctorName}`,
        description: `${a.specialty || 'General'} · ${a.hospital || 'Medical Center'}`,
        timestamp: new Date(a.appointmentDate).toISOString(),
        type: 'appointment',
      });
    });
    reports.forEach((r) => {
      timelineEvents.push({
        id: String(r._id),
        title: `Lab Report: ${r.title}`,
        description: `Category: ${r.category || 'General'}`,
        timestamp: new Date(r.createdAt).toISOString(),
        type: 'report',
      });
    });
    medicines.forEach((m) => {
      timelineEvents.push({
        id: String(m._id),
        title: `Medication Added: ${m.name}`,
        description: `Dosage: ${m.dosage || 'Prescribed'} (${m.frequency || 'Daily'})`,
        timestamp: new Date(m.createdAt).toISOString(),
        type: 'medicine',
      });
    });
    timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const dashboardSummary = {
      userName: user?.name || (user?.email ? user.email.split('@')[0] : null),
      healthScore: typeof user?.healthScore === 'number' ? user.healthScore : null,
      oneThingToKnow,
      oneThingToDo,
      oneThingToExplore: {
        title: 'AI Health Intelligence',
        subtitle: 'Synthesize lab reports, active prescriptions, and continuous telemetry.',
        actionLabel: 'Explore AI Insights',
      },
      clinicalInsight,
      careActions,
      adherenceRate,
      adherenceData,
      vitalsData: {
        weight: weightSeries,
        glucose: glucoseSeries,
        heartRate: heartRateSeries,
      },
      timelineEvents: timelineEvents.slice(0, 4),
    };

    res.status(200).json({
      success: true,
      data: dashboardSummary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Module 8 — AI Global Search
 */
async function globalAISearch(req, res, next) {
  try {
    const { query } = req.query;
    const userId = req.user?._id;
    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }

    const safeQuery = String(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeQuery, 'i');

    const [medicines, reports, sessions, appointments] = await Promise.all([
      Medicine.find({ userId, name: regex }).lean().catch(() => []),
      Report.find({ userId, $or: [{ title: regex }, { category: regex }] }).lean().catch(() => []),
      ChatSession.find({ userId, title: regex }).lean().catch(() => []),
      Appointment.find({ userId, doctorName: regex }).lean().catch(() => []),
    ]);

    const results = [
      ...medicines.map((m) => ({ type: 'Medicine', title: m.name, subtitle: `Dosage: ${m.dosage || 'Standard'}`, id: m._id, link: '/medicines' })),
      ...reports.map((r) => ({ type: 'Report', title: r.title, subtitle: `Risk Level: ${r.riskLevel}`, id: r._id, link: '/reports' })),
      ...sessions.map((s) => ({ type: 'Chat', title: s.title, subtitle: `Last active: ${new Date(s.lastActivityAt).toLocaleDateString()}`, id: s._id, link: '/ai-chat' })),
      ...appointments.map((a) => ({ type: 'Appointment', title: `Dr. ${a.doctorName}`, subtitle: `Date: ${new Date(a.appointmentDate).toLocaleDateString()}`, id: a._id, link: '/appointments' })),
    ];

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Module 10 — AI Wellness Coach
 */
async function getWellnessCoach(req, res, next) {
  try {
    const userId = req.user?._id;
    const prompt = `
Generate a personalized daily wellness coaching plan.
Return JSON:
{
  "morningBrief": "Good morning! Start your day with 500ml water and 10 minutes light breathing exercises.",
  "eveningSummary": "Great progress today. Ensure screen dimming 1 hour before sleep.",
  "exercise": "30 minutes moderate brisk walking or light swimming.",
  "hydration": "Target 8 glasses (2.5L) throughout the day.",
  "nutrition": "Focus on high-fiber greens, lean protein, and reduced refined sugars.",
  "sleep": "Aim for 7.5 to 8 hours sleep tonight.",
  "stressAdvice": "Practice 4-7-8 breathing method if feeling overwhelmed."
}
`;

    const raw = await generateGeminiText({ prompt });
    const coachData = safeParseJSON(raw, {
      morningBrief: 'Hydrate well and begin with light morning stretching.',
      eveningSummary: 'Reflect on daily achievements and prepare for restful sleep.',
      exercise: '30 mins active walking.',
      hydration: '2.5L daily target.',
      nutrition: 'Balanced greens & proteins.',
      sleep: '7.5 hours recommended rest.',
      stressAdvice: 'Take 5-minute mindfulness breaks.',
    });

    res.status(200).json({
      success: true,
      data: coachData,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeReport,
  compareReports,
  analyzeVision,
  getHealthScores,
  getPredictions,
  getDashboardLogic,
  globalAISearch,
  getWellnessCoach,
};
