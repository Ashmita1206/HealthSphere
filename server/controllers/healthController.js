const HealthLog = require('../models/HealthLog');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const DoseLog = require('../models/DoseLog');
const { Donor, DonationRequest } = require('../models/Donation');
const { getAIHealthResponse } = require('../services/ai.service');
const { computeRiskFromText } = require('../services/riskEngine');
const {
  buildRecommendations,
  buildHealthInsights,
} = require('../services/recommendationEngine');
const logger = require('../utils/logger');

const mapMedicine = (m) => ({
  id: m._id,
  name: m.name,
  dosage: m.dosage,
  frequency: m.frequency,
  is_active: m.isActive,
  adherence_rate: m.adherenceRate,
  created_at: m.createdAt,
});

const mapAppointment = (a) => ({
  id: a._id,
  doctor_name: a.doctorName,
  specialty: a.specialty,
  hospital: a.hospital,
  appointment_date: a.appointmentDate,
  status: a.status,
});

async function listLogs(req, res, next) {
  try {
    res.json(await HealthLog.find({ userId: req.user._id }).sort({ date: -1 }));
  } catch (e) {
    next(e);
  }
}
async function createLog(req, res, next) {
  try {
    const { symptoms, notes, date, weight, glucose, heartRate, systolic, diastolic } = req.body;
    res
      .status(201)
      .json(await HealthLog.create({ userId: req.user._id, symptoms, notes, date: date || Date.now(), weight, glucose, heartRate, systolic, diastolic }));
  } catch (e) {
    next(e);
  }
}
async function updateLog(req, res, next) {
  try {
    const { symptoms, notes, date, weight, glucose, heartRate, systolic, diastolic } = req.body;
    res.json(
      await HealthLog.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: { symptoms, notes, date, weight, glucose, heartRate, systolic, diastolic } },
        { new: true },
      ),
    );
  } catch (e) {
    next(e);
  }
}
async function deleteLog(req, res, next) {
  try {
    await HealthLog.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}
async function listMedicines(req, res, next) {
  try {
    const q = { userId: req.user._id };
    if (req.query.active === 'true') q.isActive = true;
    res.json((await Medicine.find(q).sort({ createdAt: -1 })).map(mapMedicine));
  } catch (e) {
    next(e);
  }
}
async function createMedicine(req, res, next) {
  try {
    const row = await Medicine.create({
      userId: req.user._id,
      name: req.body.name,
      dosage: req.body.dosage,
      frequency: req.body.frequency,
    });
    res.status(201).json(mapMedicine(row));
  } catch (e) {
    next(e);
  }
}
async function deleteMedicine(req, res, next) {
  try {
    await Medicine.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}
async function listAppointments(req, res, next) {
  try {
    const q = { userId: req.user._id };
    if (req.query.status) q.status = req.query.status;
    res.json(
      (await Appointment.find(q).sort({ appointmentDate: 1 })).map(
        mapAppointment,
      ),
    );
  } catch (e) {
    next(e);
  }
}
async function createAppointment(req, res, next) {
  try {
    const row = await Appointment.create({
      userId: req.user._id,
      doctorName: req.body.doctor_name,
      specialty: req.body.specialty,
      hospital: req.body.hospital,
      appointmentDate: req.body.appointment_date,
    });
    res.status(201).json(mapAppointment(row));
  } catch (e) {
    next(e);
  }
}
async function deleteAppointment(req, res, next) {
  try {
    await Appointment.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}
async function updateAppointment(req, res, next) {
  try {
    const { doctor_name, specialty, hospital, appointment_date, status } = req.body;
    const row = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $set: {
          ...(doctor_name && { doctorName: doctor_name }),
          ...(specialty && { specialty }),
          ...(hospital && { hospital }),
          ...(appointment_date && { appointmentDate: appointment_date }),
          ...(status && { status }),
        },
      },
      { new: true }
    );
    if (!row) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(mapAppointment(row));
  } catch (e) {
    next(e);
  }
}
async function listDonors(req, res, next) {
  try {
    const rows = await Donor.find({}).sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}
async function listDonationRequests(req, res, next) {
  try {
    const rows = await DonationRequest.find({}).sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}
async function registerDonor(req, res, next) {
  try {
    res
      .status(201)
      .json(
        await Donor.create({
          userId: req.user._id,
          bloodType: req.body.blood_type,
          organType: req.body.organ_type,
          donationType: req.body.willing_to_donate,
        }),
      );
  } catch (e) {
    next(e);
  }
}
async function createDonationRequest(req, res, next) {
  try {
    res
      .status(201)
      .json(
        await DonationRequest.create({
          userId: req.user._id,
          requestType: req.body.request_type,
          bloodType: req.body.blood_type,
          organType: req.body.organ_type,
          urgency: req.body.urgency,
          notes: req.body.notes,
        }),
      );
  } catch (e) {
    next(e);
  }
}
async function chat(req, res, next) {
  try {
    const lastMessage =
      req.body?.messages?.[req.body.messages.length - 1]?.content || '';
    const ai = await getAIHealthResponse({ userMessage: lastMessage });
    const fallbackRisk = computeRiskFromText(lastMessage);
    const payload = {
      response: ai.response,
      riskLevel: ai.riskLevel || fallbackRisk.riskLevel,
      recommendations: ai.recommendations?.length
        ? ai.recommendations
        : buildRecommendations(fallbackRisk),
      requiresDoctor:
        typeof ai.requiresDoctor === 'boolean'
          ? ai.requiresDoctor
          : fallbackRisk.requiresDoctor,
    };
    logger.info('AI chat used', {
      userId: String(req.user._id),
      riskLevel: payload.riskLevel,
      requiresDoctor: payload.requiresDoctor,
    });
    res.json({
      ...payload,
      choices: [{ message: { content: payload.response } }],
    });
  } catch (error) {
    next(error);
  }
}

async function getInsights(req, res, next) {
  try {
    const [logs, reminders] = await Promise.all([
      HealthLog.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30),
      Reminder.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30),
    ]);
    const insights = buildHealthInsights({ logs, reminders });
    res.json({ insights });
  } catch (error) {
    next(error);
  }
}

function getLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function toggleDose(req, res, next) {
  try {
    const userId = req.user._id;
    const { careActionId, scheduledDate, completed, medicineName, medicineId, reminderId } = req.body;

    if (!careActionId) {
      return res.status(400).json({ error: "careActionId is required" });
    }

    // Verify ownership: careActionId must correspond to an active Medicine or Reminder belonging to req.user._id
    const [medicine, reminder] = await Promise.all([
      Medicine.findOne({ _id: careActionId, userId }).lean().catch(() => null),
      Reminder.findOne({ _id: careActionId, userId }).lean().catch(() => null),
    ]);

    if (!medicine && !reminder) {
      return res.status(404).json({ error: "Care action or prescription not found for user" });
    }

    const dateStr = scheduledDate || getLocalDateStr();
    const isCompleted = typeof completed === 'boolean' ? completed : true;

    if (!isCompleted) {
      await DoseLog.deleteOne({ userId, careActionId, scheduledDate: dateStr });
      return res.json({ success: true, careActionId, scheduledDate: dateStr, completed: false });
    }

    const resolvedMedId = medicine ? medicine._id : (medicineId || null);
    const resolvedRemId = reminder ? reminder._id : (reminderId || null);
    const resolvedMedName = medicineName || (medicine ? medicine.name : (reminder ? reminder.medicineName : 'Medication'));

    const updated = await DoseLog.findOneAndUpdate(
      { userId, careActionId, scheduledDate: dateStr },
      {
        $set: {
          completed: true,
          completedAt: new Date(),
          medicineName: resolvedMedName,
          medicineId: resolvedMedId,
          reminderId: resolvedRemId,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      careActionId: updated.careActionId,
      scheduledDate: updated.scheduledDate,
      completed: updated.completed,
      completedAt: updated.completedAt,
    });
  } catch (e) {
    next(e);
  }
}

async function getTodayDoses(req, res, next) {
  try {
    const userId = req.user._id;
    const dateStr = req.query.date || getLocalDateStr();
    const logs = await DoseLog.find({ userId, scheduledDate: dateStr, completed: true }).lean();
    res.json({ success: true, date: dateStr, doses: logs });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listLogs,
  createLog,
  updateLog,
  deleteLog,
  listMedicines,
  createMedicine,
  deleteMedicine,
  listAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  listDonors,
  listDonationRequests,
  registerDonor,
  createDonationRequest,
  chat,
  getInsights,
  toggleDose,
  getTodayDoses,
};
