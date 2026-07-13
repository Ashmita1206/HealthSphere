const HealthLog = require('../models/HealthLog');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
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
    res
      .status(201)
      .json(await HealthLog.create({ userId: req.user._id, ...req.body }));
  } catch (e) {
    next(e);
  }
}
async function updateLog(req, res, next) {
  try {
    res.json(
      await HealthLog.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
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
  registerDonor,
  createDonationRequest,
  chat,
  getInsights,
};
