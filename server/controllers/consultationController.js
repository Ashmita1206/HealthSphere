const crypto = require('crypto');
const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const ConsultationMessage = require('../models/ConsultationMessage');
const timelineService = require('../services/timelineService');
const realtimeService = require('../services/realtimeService');
const { createNotification } = require('../services/notificationService');

/**
 * Generate unique meeting room ID
 */
function generateMeetingRoomId() {
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  return `room-${Date.now()}-${randomSuffix}`;
}

/**
 * Helper to check if a user is the doctor of this consultation
 */
async function isUserConsultingDoctor(userId, consultation) {
  const doctorDoc = await Doctor.findOne({ userId });
  if (!doctorDoc) return false;
  return doctorDoc._id.toString() === consultation.doctorId.toString();
}

/**
 * POST /api/consultations
 * Schedule / create a new telemedicine consultation
 */
async function createConsultation(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { doctorId, appointmentId, patientId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId is required to schedule a consultation',
      });
    }

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name email');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Determine target patient: caller or explicit patientId
    const targetPatientId = patientId || userId;
    const patientUser = await User.findById(targetPatientId);
    if (!patientUser) {
      return res.status(404).json({
        success: false,
        message: 'Patient user not found',
      });
    }

    const meetingRoomId = generateMeetingRoomId();

    const consultation = await Consultation.create({
      patientId: targetPatientId,
      doctorId: doctor._id,
      appointmentId: appointmentId || null,
      meetingRoomId,
      status: 'scheduled',
    });

    // Notify doctor
    if (doctor.userId?._id || doctor.userId) {
      await createNotification({
        userId: doctor.userId._id || doctor.userId,
        title: 'New Consultation Request',
        message: `Telemedicine consultation scheduled with patient ${patientUser.name}.`,
        type: 'appointment',
        route: `/consultations/${consultation._id}`,
      });
    }

    // Notify patient
    await createNotification({
      userId: targetPatientId,
      title: 'Consultation Scheduled',
      message: `Your telemedicine consultation with Dr. ${doctor.userId?.name || doctor.specialization} is confirmed.`,
      type: 'appointment',
      route: `/consultations/${consultation._id}`,
    });

    const populated = await Consultation.findById(consultation._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    res.status(201).json({
      success: true,
      message: 'Consultation scheduled successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultations
 * List consultations for authenticated user (as patient or doctor)
 */
async function getConsultations(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;

    // Check if user is a doctor
    const doctorProfile = await Doctor.findOne({ userId });

    const query = doctorProfile
      ? { $or: [{ patientId: userId }, { doctorId: doctorProfile._id }] }
      : { patientId: userId };

    const consultations = await Consultation.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultations/:id
 * Retrieve specific consultation by ID with IDOR protection
 */
async function getConsultationById(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const consultation = await Consultation.findById(id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // IDOR Protection: Caller must be either patient or doctor
    const isPatient = consultation.patientId?._id?.toString() === userId.toString();
    const isDoctor = consultation.doctorId?.userId?._id?.toString() === userId.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a participant in this consultation',
      });
    }

    res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/consultations/:id/start
 * Begin consultation session and update Health Timeline
 */
async function startConsultation(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const consultation = await Consultation.findById(id).populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name' },
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // IDOR verification
    const isPatient = consultation.patientId.toString() === userId.toString();
    const isDoctor = await isUserConsultingDoctor(userId, consultation);

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only participants can start this consultation',
      });
    }

    consultation.status = 'active';
    consultation.startedAt = new Date();
    await consultation.save();

    realtimeService.broadcastConsultationStatus(consultation._id, {
      status: 'active',
      startedAt: consultation.startedAt,
    });

    // Timeline event
    await timelineService.createEvent({
      userId: consultation.patientId,
      eventType: 'appointment',
      title: 'Doctor consultation started',
      description: `Telemedicine session initiated in room ${consultation.meetingRoomId}`,
      relatedId: consultation._id,
    });

    // Notify patient
    await createNotification({
      userId: consultation.patientId,
      title: 'Consultation Started',
      message: 'Your telemedicine session has started. Tap to enter the consultation room.',
      type: 'appointment',
      priority: 'high',
      route: `/consultations/${consultation._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Consultation started successfully',
      data: consultation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/consultations/:id/end
 * Conclude consultation session and update Health Timeline
 */
async function endConsultation(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // IDOR verification
    const isPatient = consultation.patientId.toString() === userId.toString();
    const isDoctor = await isUserConsultingDoctor(userId, consultation);

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only participants can end this consultation',
      });
    }

    consultation.status = 'completed';
    consultation.endedAt = new Date();
    await consultation.save();

    realtimeService.broadcastConsultationStatus(consultation._id, {
      status: 'completed',
      endedAt: consultation.endedAt,
    });

    // Timeline event
    await timelineService.createEvent({
      userId: consultation.patientId,
      eventType: 'appointment',
      title: 'Doctor consultation completed',
      description: `Telemedicine session completed with duration ${
        consultation.startedAt
          ? Math.round((consultation.endedAt.getTime() - consultation.startedAt.getTime()) / 60000)
          : 0
      } minutes`,
      relatedId: consultation._id,
    });

    // Notify patient
    await createNotification({
      userId: consultation.patientId,
      title: 'Consultation Completed',
      message: 'Your telemedicine session has concluded. Check your summary and prescription.',
      type: 'appointment',
      route: `/consultations/${consultation._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Consultation completed successfully',
      data: consultation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/consultations/:id/notes
 * Doctor attaches clinical notes and prescription
 */
async function addDoctorNotes(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { doctorNotes, prescription } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // Strict authorization: Only the assigned doctor can add doctor notes!
    const isDoctor = await isUserConsultingDoctor(userId, consultation);
    if (!isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the assigned physician can add clinical notes and prescriptions',
      });
    }

    if (doctorNotes !== undefined) {
      consultation.doctorNotes = String(doctorNotes).trim();
    }

    if (Array.isArray(prescription)) {
      consultation.prescription = prescription.map((p) => ({
        medicineName: String(p.medicineName || '').trim(),
        dosage: String(p.dosage || '').trim(),
        frequency: String(p.frequency || '').trim(),
        duration: String(p.duration || '').trim(),
        instructions: String(p.instructions || '').trim(),
      }));
    }

    await consultation.save();

    realtimeService.broadcastPrescriptionUpdate(consultation._id, {
      prescription: consultation.prescription,
      doctorNotes: consultation.doctorNotes,
    });

    // Notify patient about new clinical notes
    await createNotification({
      userId: consultation.patientId,
      title: 'Doctor Notes & Prescription Added',
      message: 'Your physician has attached consultation notes and prescription to your record.',
      type: 'medication',
      route: `/consultations/${consultation._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Doctor notes and prescription attached successfully',
      data: consultation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultations/:id/messages
 * Retrieve messages for consultation session with IDOR protection
 */
async function getConsultationMessages(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    const isPatient = consultation.patientId.toString() === userId.toString();
    const isDoctor = await isUserConsultingDoctor(userId, consultation);

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a participant in this consultation',
      });
    }

    const messages = await ConsultationMessage.find({ consultationId: id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/consultations/:id/messages
 * Post a new message in consultation with real-time room broadcast and IDOR protection
 */
async function sendConsultationMessage(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { content, attachments } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    const isPatient = consultation.patientId.toString() === userId.toString();
    const isDoctor = await isUserConsultingDoctor(userId, consultation);

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a participant in this consultation',
      });
    }

    const role = isDoctor ? 'doctor' : 'patient';

    const message = await ConsultationMessage.create({
      consultationId: id,
      senderId: userId,
      senderRole: role,
      content: String(content).trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      status: 'sent',
    });

    const populated = await ConsultationMessage.findById(message._id).populate(
      'senderId',
      'name email'
    );

    realtimeService.broadcastConsultationMessage(id, populated);

    // Send push / notification to recipient
    const recipientUserId = isDoctor
      ? consultation.patientId
      : (await Doctor.findById(consultation.doctorId))?.userId;

    if (recipientUserId) {
      await createNotification({
        userId: recipientUserId,
        title: `Message from ${isDoctor ? 'Physician' : 'Patient'}`,
        message: String(content).slice(0, 80),
        type: 'consultation',
        route: `/consultations/${id}`,
      });
    }

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createConsultation,
  getConsultations,
  getConsultationById,
  startConsultation,
  endConsultation,
  addDoctorNotes,
  getConsultationMessages,
  sendConsultationMessage,
};
