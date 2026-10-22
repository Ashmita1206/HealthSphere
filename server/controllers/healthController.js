const mongoose = require('mongoose');
const HealthLog = require('../models/HealthLog');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const DoseLog = require('../models/DoseLog');
const Notification = require('../models/Notification');
const { Donor, DonationRequest, DonationRecord } = require('../models/Donation');
const bloodBankService = require('../services/bloodBankService');
const { broadcastBloodRequest, broadcastNotification } = require('../services/realtimeService');
const { getAIHealthResponse } = require('../services/ai.service');
const { computeRiskFromText } = require('../services/riskEngine');
const {
  buildRecommendations,
  buildHealthInsights,
} = require('../services/recommendationEngine');
const { recordTimelineEvent } = require('../services/timelineService');
const logger = require('../utils/logger');

const mapMedicine = (m) => ({
  id: m._id,
  name: m.name,
  dosage: m.dosage,
  frequency: m.frequency,
  time: m.time || m.timing,
  timing: m.timing || m.time,
  start_date: m.startDate,
  startDate: m.startDate,
  end_date: m.endDate,
  endDate: m.endDate,
  notes: m.notes,
  status: m.status || (m.isActive === false ? 'completed' : 'active'),
  is_active: m.isActive !== undefined ? m.isActive : (m.status ? m.status === 'active' : true),
  isActive: m.isActive !== undefined ? m.isActive : (m.status ? m.status === 'active' : true),
  adherence_rate: m.adherenceRate,
  adherenceRate: m.adherenceRate,
  remaining_pills: m.remainingPills,
  remainingPills: m.remainingPills,
  total_pills: m.totalPills,
  totalPills: m.totalPills,
  doctor_name: m.doctorName,
  doctorName: m.doctorName,
  description: m.description,
  instructions: m.instructions,
  strength: m.strength,
  created_at: m.createdAt,
  createdAt: m.createdAt,
  updated_at: m.updatedAt,
  updatedAt: m.updatedAt,
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
    const createdLog = await HealthLog.create({ userId: req.user._id, symptoms, notes, date: date || Date.now(), weight, glucose, heartRate, systolic, diastolic });
    recordTimelineEvent({
      userId: req.user._id,
      eventType: 'vitals',
      category: 'vitals',
      title: 'Health Vitals Logged',
      description: `Vitals recorded${heartRate ? ` (HR: ${heartRate} bpm)` : ''}${systolic ? ` (BP: ${systolic}/${diastolic || '--'})` : ''}`,
      relatedId: createdLog._id,
    }).catch(() => {});
    res.status(201).json(createdLog);
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
    const {
      name,
      dosage,
      frequency,
      time,
      timing,
      startDate,
      start_date,
      endDate,
      end_date,
      notes,
      status,
      isActive,
      is_active,
      remainingPills,
      remaining_pills,
      totalPills,
      total_pills,
      doctorName,
      doctor_name,
      description,
      instructions,
      strength,
      adherenceRate,
      adherence_rate,
      adherence,
    } = req.body;

    const row = await Medicine.create({
      userId: req.user._id,
      name,
      dosage,
      frequency,
      time: time || timing,
      timing: timing || time,
      startDate: startDate || start_date,
      endDate: endDate || end_date,
      notes,
      status: status || (isActive === false || is_active === false ? 'completed' : 'active'),
      isActive: isActive !== undefined ? isActive : (is_active !== undefined ? is_active : (status ? status === 'active' : true)),
      adherenceRate: adherenceRate ?? adherence_rate ?? adherence ?? 100,
      remainingPills: remainingPills ?? remaining_pills,
      totalPills: totalPills ?? total_pills,
      doctorName: doctorName || doctor_name,
      description,
      instructions,
      strength,
    });
    recordTimelineEvent({
      userId: req.user._id,
      eventType: 'medicine',
      category: 'medicine',
      title: `Medication: ${name}`,
      description: `Dosage: ${dosage || 'As prescribed'} (${frequency || 'Daily'})`,
      relatedId: row._id,
    }).catch(() => {});
    res.status(201).json(mapMedicine(row));
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: e.message });
    }
    next(e);
  }
}
async function updateMedicine(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid medicine ID' });
    }

    const existing = await Medicine.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this medicine' });
    }

    const updates = {};
    const b = req.body || {};

    if (b.name !== undefined) updates.name = b.name;
    if (b.dosage !== undefined) updates.dosage = b.dosage;
    if (b.frequency !== undefined) updates.frequency = b.frequency;
    if (b.time !== undefined) updates.time = b.time;
    if (b.timing !== undefined) updates.timing = b.timing;
    if (b.startDate !== undefined) updates.startDate = b.startDate;
    if (b.start_date !== undefined) updates.startDate = b.start_date;
    if (b.endDate !== undefined) updates.endDate = b.endDate;
    if (b.end_date !== undefined) updates.endDate = b.end_date;
    if (b.notes !== undefined) updates.notes = b.notes;
    if (b.description !== undefined) updates.description = b.description;
    if (b.instructions !== undefined) updates.instructions = b.instructions;
    if (b.strength !== undefined) updates.strength = b.strength;
    if (b.doctorName !== undefined) updates.doctorName = b.doctorName;
    if (b.doctor_name !== undefined) updates.doctorName = b.doctor_name;
    if (b.remainingPills !== undefined) updates.remainingPills = b.remainingPills;
    if (b.remaining_pills !== undefined) updates.remainingPills = b.remaining_pills;
    if (b.totalPills !== undefined) updates.totalPills = b.totalPills;
    if (b.total_pills !== undefined) updates.totalPills = b.total_pills;
    if (b.adherenceRate !== undefined) updates.adherenceRate = b.adherenceRate;
    if (b.adherence_rate !== undefined) updates.adherenceRate = b.adherence_rate;
    if (b.adherence !== undefined) updates.adherenceRate = b.adherence;

    if (b.status !== undefined) {
      updates.status = b.status;
      if (b.isActive === undefined && b.is_active === undefined) {
        updates.isActive = b.status === 'active';
      }
    }

    if (b.isActive !== undefined) {
      updates.isActive = Boolean(b.isActive);
      if (b.status === undefined) {
        updates.status = b.isActive ? 'active' : 'completed';
      }
    } else if (b.is_active !== undefined) {
      updates.isActive = Boolean(b.is_active);
      if (b.status === undefined) {
        updates.status = b.is_active ? 'active' : 'completed';
      }
    }

    // Protect immutable fields
    delete updates._id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updated = await Medicine.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json(mapMedicine(updated));
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: e.message });
    }
    if (e.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid field value', details: e.message });
    }
    next(e);
  }
}
async function deleteMedicine(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid medicine ID' });
    }
    const existing = await Medicine.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this medicine' });
    }
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
    recordTimelineEvent({
      userId: req.user._id,
      eventType: 'appointment',
      category: 'appointment',
      title: `Appointment: Dr. ${row.doctorName || 'Specialist'}`,
      description: `${row.specialty || 'General'} · ${row.hospital || 'Medical Center'}`,
      relatedId: row._id,
    }).catch(() => {});
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
function sanitizeBloodRequest(r) {
  return {
    id: (r._id || r.id).toString(),
    bloodGroup: r.bloodType || 'Not specified',
    componentType: r.componentType || 'whole_blood',
    hospital: r.hospital || 'Medical Facility',
    approximateArea: r.approximateArea || '',
    unitsRequired: r.unitsRequired || 1,
    requiredDate: r.requiredDate ? new Date(r.requiredDate).toISOString() : new Date().toISOString(),
    urgency: r.urgency || 'normal',
    status: r.status || 'active',
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
  };
}

async function listDonors(req, res, next) {
  try {
    const rows = await Donor.find({
      consentToDiscover: { $ne: false },
      status: { $ne: 'inactive' },
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const donors = rows.map((d) => {
      const rawName = d.userId?.name || '';
      const firstName = rawName.split(' ')[0];
      const displayName = firstName ? `${firstName} (Volunteer Donor)` : 'Consented Volunteer Donor';

      return {
        id: d._id.toString(),
        name: displayName,
        bloodGroup: d.bloodType || 'Not specified',
        city: d.city || d.approximateArea || 'Local Area',
        approximateArea: d.approximateArea || d.city || 'Local Area',
        availability: d.isAvailable ? 'available' : 'unavailable',
        lastDonation: d.lastDonationDate ? new Date(d.lastDonationDate).toISOString() : undefined,
        contactPreference: d.contactPreference || 'in-app',
      };
    });

    res.json(donors);
  } catch (e) {
    next(e);
  }
}

async function listDonationRequests(req, res, next) {
  try {
    const currentUserId = req.user?._id ? req.user._id.toString() : null;
    const rows = await DonationRequest.find({}).sort({ createdAt: -1 }).lean();

    const mapped = rows.map((r) => {
      const isOwner = Boolean(currentUserId && r.userId && r.userId.toString() === currentUserId);
      const safeRequiredDate = r.requiredDate
        ? new Date(r.requiredDate).toISOString()
        : r.requiredBy && !isNaN(new Date(r.requiredBy).getTime())
          ? new Date(r.requiredBy).toISOString()
          : new Date(Date.now() + 48 * 3600 * 1000).toISOString();

      return {
        id: (r._id || r.id).toString(),
        userId: r.userId ? r.userId.toString() : undefined,
        patientName: isOwner
          ? (r.patientName || 'Blood Recipient')
          : (r.patientName ? `${r.patientName.charAt(0)}. (Patient)` : 'Blood Recipient'),
        bloodGroup: r.bloodType || 'Not specified',
        componentType: r.componentType || 'whole_blood',
        hospital: r.hospital || 'Medical Facility',
        approximateArea: r.approximateArea || '',
        unitsRequired: r.unitsRequired || r.unitsNeeded || 1,
        requiredDate: safeRequiredDate,
        urgency: r.urgency || 'normal',
        contactPhone: isOwner ? (r.contactPhone || '') : undefined,
        notes: isOwner ? (r.notes || '') : (r.notes ? 'Clinical blood request registered' : ''),
        status: r.status || 'active',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        isOwner,
      };
    });

    res.json(mapped);
  } catch (e) {
    next(e);
  }
}

async function registerDonor(req, res, next) {
  try {
    const b = req.body || {};
    const bloodType = b.bloodType || b.blood_type;
    const organType = b.organType || b.organ_type;
    const donationType = b.donationType || b.willing_to_donate || 'blood';
    const city = b.city || 'Local Area';
    const approximateArea = b.approximateArea || b.approximate_area || city;
    const isAvailable = b.isAvailable !== undefined ? Boolean(b.isAvailable) : true;
    const consentToDiscover = b.consentToDiscover !== undefined ? Boolean(b.consentToDiscover) : true;
    const contactPreference = b.contactPreference || 'in-app';

    const updated = await Donor.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          bloodType,
          organType,
          donationType,
          city,
          approximateArea,
          isAvailable,
          consentToDiscover,
          contactPreference,
          status: 'active',
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(updated);
  } catch (e) {
    next(e);
  }
}

async function contactDonor(req, res, next) {
  try {
    const { id } = req.params;
    const { message, urgency, bloodGroup } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donor ID' });
    }

    const donor = await Donor.findById(id).populate('userId', 'name email');
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    if (!donor.isAvailable) {
      return res.status(400).json({ message: 'Donor is currently marked as unavailable for donations' });
    }

    const recipientUserId = donor.userId?._id || donor.userId;
    if (recipientUserId) {
      const notification = await Notification.create({
        userId: recipientUserId,
        title: `Blood Donation Inquiry (${bloodGroup || donor.bloodType || 'Urgent'})`,
        message: message || `A HealthSphere patient/hospital coordinator has sent a voluntary donation inquiry. Urgency: ${urgency || 'Normal'}. Please review in the Blood Donation registry.`,
        type: 'health',
        priority: urgency === 'critical' ? 'critical' : 'high',
        severity: urgency === 'critical' ? 'critical' : 'normal',
        route: '/blood-donation',
        metadata: {
          requesterId: req.user._id,
          donorId: donor._id,
          bloodGroup: bloodGroup || donor.bloodType,
        },
      });

      broadcastNotification(recipientUserId, notification);
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry routed securely through HealthSphere platform. Donor notified without disclosing private contact credentials.',
    });
  } catch (e) {
    next(e);
  }
}

async function createDonationRequest(req, res, next) {
  try {
    const b = req.body || {};
    const safeRequiredDate = b.requiredDate
      ? new Date(b.requiredDate)
      : b.required_date
        ? new Date(b.required_date)
        : b.requiredBy && !isNaN(new Date(b.requiredBy).getTime())
          ? new Date(b.requiredBy)
          : new Date(Date.now() + 48 * 3600 * 1000);

    const doc = await DonationRequest.create({
      userId: req.user._id,
      patientName: b.patientName || b.patient_name || 'Blood Recipient',
      requestType: b.request_type || b.requestType || 'blood',
      bloodType: b.blood_type || b.bloodType || 'O+',
      componentType: b.component_type || b.componentType || 'whole_blood',
      hospital: b.hospital || 'Medical Facility',
      approximateArea: b.approximate_area || b.approximateArea || '',
      unitsRequired: Number(b.unitsRequired || b.units_required || b.unitsNeeded || 1),
      requiredDate: safeRequiredDate,
      urgency: b.urgency || 'normal',
      contactPhone: b.contactPhone || b.contact_phone || '',
      organType: b.organ_type || b.organType,
      notes: b.notes || b.additionalNotes || '',
      status: b.status || 'active',
    });

    // Broadcast sanitized real-time event
    broadcastBloodRequest('blood:request-created', sanitizeBloodRequest(doc));

    res.status(201).json(doc);
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: e.message });
    }
    next(e);
  }
}

async function updateDonationRequest(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donation request ID' });
    }

    const request = await DonationRequest.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!request) {
      const existsForOtherUser = await DonationRequest.findById(id);
      if (existsForOtherUser) {
        return res.status(403).json({ message: 'Forbidden: You do not own this donation request' });
      }
      return res.status(404).json({ message: 'Donation request not found' });
    }

    const updates = {};
    const b = req.body || {};

    if (b.status !== undefined) {
      // Validate allowed status transitions
      const current = request.status;
      const target = b.status;
      if (current === 'fulfilled' && target === 'cancelled') {
        return res.status(400).json({ message: 'Validation failed', details: 'Cannot cancel an already fulfilled blood request' });
      }
      if (current === 'cancelled' && target === 'fulfilled') {
        return res.status(400).json({ message: 'Validation failed', details: 'Cannot fulfill an already cancelled blood request' });
      }
      updates.status = target;
    }

    if (b.notes !== undefined) updates.notes = b.notes;
    if (b.urgency !== undefined) updates.urgency = b.urgency;
    if (b.requestType !== undefined) updates.requestType = b.requestType;
    if (b.request_type !== undefined) updates.requestType = b.request_type;
    if (b.bloodType !== undefined) updates.bloodType = b.bloodType;
    if (b.blood_type !== undefined) updates.bloodType = b.blood_type;
    if (b.componentType !== undefined) updates.componentType = b.componentType;
    if (b.component_type !== undefined) updates.componentType = b.component_type;
    if (b.patientName !== undefined) updates.patientName = b.patientName;
    if (b.patient_name !== undefined) updates.patientName = b.patient_name;
    if (b.hospital !== undefined) updates.hospital = b.hospital;
    if (b.approximateArea !== undefined) updates.approximateArea = b.approximateArea;
    if (b.approximate_area !== undefined) updates.approximateArea = b.approximate_area;
    if (b.unitsRequired !== undefined) updates.unitsRequired = Number(b.unitsRequired);
    if (b.units_required !== undefined) updates.unitsRequired = Number(b.units_required);
    if (b.unitsNeeded !== undefined) updates.unitsRequired = Number(b.unitsNeeded);
    if (b.requiredDate !== undefined) updates.requiredDate = b.requiredDate ? new Date(b.requiredDate) : null;
    if (b.required_date !== undefined) updates.requiredDate = b.required_date ? new Date(b.required_date) : null;
    if (b.contactPhone !== undefined) updates.contactPhone = b.contactPhone;
    if (b.contact_phone !== undefined) updates.contactPhone = b.contact_phone;
    if (b.organType !== undefined) updates.organType = b.organType;
    if (b.organ_type !== undefined) updates.organType = b.organ_type;

    // Protect immutable fields
    delete updates._id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updated = await DonationRequest.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Broadcast sanitized real-time events
    const sanitized = sanitizeBloodRequest(updated);
    broadcastBloodRequest('blood:request-updated', sanitized);
    if (updates.status !== undefined) {
      broadcastBloodRequest('blood:request-status-changed', sanitized);
    }

    res.status(200).json(updated);
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: e.message });
    }
    if (e.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid field value', details: e.message });
    }
    next(e);
  }
}

async function deleteDonationRequest(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donation request ID' });
    }

    const request = await DonationRequest.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!request) {
      const existsForOtherUser = await DonationRequest.findById(id);
      if (existsForOtherUser) {
        return res.status(403).json({ message: 'Forbidden: You do not own this donation request' });
      }
      return res.status(404).json({ message: 'Donation request not found' });
    }

    await DonationRequest.deleteOne({ _id: id, userId: req.user._id });

    // Broadcast sanitized real-time deletion
    broadcastBloodRequest('blood:request-deleted', { id });

    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

async function listBloodBanks(req, res, next) {
  try {
    const banks = await bloodBankService.listBloodBanks(req.query);
    res.json(banks);
  } catch (e) {
    next(e);
  }
}

async function listBloodStock(req, res, next) {
  try {
    const stock = await bloodBankService.listBloodStock(req.query);
    res.json(stock);
  } catch (e) {
    next(e);
  }
}

async function getBloodBankSyncStatus(req, res, next) {
  try {
    const status = await bloodBankService.getSyncStatus();
    res.json(status);
  } catch (e) {
    next(e);
  }
}

const mapDonationRecord = (d) => ({
  id: d._id ? d._id.toString() : d.id,
  donationDate: d.donationDate ? new Date(d.donationDate).toISOString() : new Date().toISOString(),
  facility: d.facility || 'HealthSphere Central Blood Bank',
  units: d.units || 1,
  status: d.status || 'completed',
  bloodType: d.bloodType || '',
  notes: d.notes || '',
});

async function listMyDonations(req, res, next) {
  try {
    const rows = await DonationRecord.find({ userId: req.user._id }).sort({ donationDate: -1, createdAt: -1 });
    res.status(200).json(rows.map(mapDonationRecord));
  } catch (e) {
    next(e);
  }
}

async function createMyDonation(req, res, next) {
  try {
    const { donationDate, facility, units, status, bloodType, notes } = req.body || {};
    const record = await DonationRecord.create({
      userId: req.user._id,
      donationDate: donationDate || Date.now(),
      facility: facility || 'HealthSphere Central Blood Bank',
      units: units || 1,
      status: status || 'completed',
      bloodType,
      notes,
    });
    recordTimelineEvent({
      userId: req.user._id,
      eventType: 'donation',
      category: 'donation',
      title: 'Blood Donation Logged',
      description: `Donated ${record.units} unit(s) at ${record.facility}`,
      relatedId: record._id,
    }).catch(() => {});
    res.status(201).json(mapDonationRecord(record));
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: e.message });
    }
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
  updateMedicine,
  deleteMedicine,
  listAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  listDonors,
  listDonationRequests,
  registerDonor,
  contactDonor,
  createDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
  listBloodBanks,
  listBloodStock,
  getBloodBankSyncStatus,
  listMyDonations,
  createMyDonation,
  chat,
  getInsights,
  toggleDose,
  getTodayDoses,
};
