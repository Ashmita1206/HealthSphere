const crypto = require('crypto');
const RecordShare = require('../models/RecordShare');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const HealthTimeline = require('../models/HealthTimeline');
const HealthScore = require('../models/HealthScore');
const timelineService = require('../services/timelineService');
const { createNotification } = require('../services/notificationService');

/**
 * Generate secure random token
 */
function generateAccessToken() {
  return `HS_SHARE_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Parse expiry duration into Date
 */
function calculateExpiresAt(duration = '24h') {
  const now = Date.now();
  const normalized = String(duration).trim().toLowerCase();
  let ms = 24 * 60 * 60 * 1000;

  if (normalized.endsWith('h')) {
    const hours = parseFloat(normalized.slice(0, -1));
    if (!isNaN(hours) && hours > 0) ms = hours * 60 * 60 * 1000;
  } else if (normalized.endsWith('d')) {
    const days = parseFloat(normalized.slice(0, -1));
    if (!isNaN(days) && days > 0) ms = days * 24 * 60 * 60 * 1000;
  } else if (normalized.endsWith('m')) {
    const mins = parseFloat(normalized.slice(0, -1));
    if (!isNaN(mins) && mins > 0) ms = mins * 60 * 1000;
  }
  return new Date(now + ms);
}

/**
 * POST /api/records/share
 * Create an expiring share token for a specific doctor
 */
async function createShare(req, res, next) {
  try {
    const patientId = req.user._id || req.user.id;
    const { doctorId, records, permissions, expiryDuration } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId is required to share records',
      });
    }

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name email');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const accessToken = generateAccessToken();
    const expiresAt = calculateExpiresAt(expiryDuration || '24h');

    const hasExplicitPermissions = permissions && typeof permissions === 'object' && Object.keys(permissions).length > 0;
    const sanitizedPermissions = {
      medicalProfile: hasExplicitPermissions ? Boolean(permissions.medicalProfile) : recordsList.includes('medicalProfile'),
      reports: hasExplicitPermissions ? Boolean(permissions.reports) : recordsList.includes('reports'),
      medicines: hasExplicitPermissions ? Boolean(permissions.medicines) : recordsList.includes('medicines'),
      appointments: hasExplicitPermissions ? Boolean(permissions.appointments) : recordsList.includes('appointments'),
      timeline: hasExplicitPermissions ? Boolean(permissions.timeline) : recordsList.includes('timeline'),
      healthAnalytics: hasExplicitPermissions ? Boolean(permissions.healthAnalytics) : recordsList.includes('healthAnalytics'),
    };

    const allowedRecordKeys = [
      'medicalProfile',
      'reports',
      'medicines',
      'appointments',
      'timeline',
      'healthAnalytics',
    ];

    const recordsList = Array.isArray(records) && records.length > 0
      ? records.filter((r) => allowedRecordKeys.includes(r))
      : allowedRecordKeys;

    const share = await RecordShare.create({
      patientId,
      doctorId: doctor._id,
      records: recordsList,
      permissions: sanitizedPermissions,
      accessToken,
      expiresAt,
    });

    // Record timeline event
    await timelineService.createEvent({
      userId: patientId,
      eventType: 'general',
      title: 'Medical record shared',
      description: `Shared medical records with Dr. ${doctor.userId?.name || doctor.specialization}`,
      relatedId: share._id,
    });

    // Send notification to doctor if user account is attached
    if (doctor.userId?._id || doctor.userId) {
      await createNotification({
        userId: doctor.userId._id || doctor.userId,
        title: 'Medical Record Shared',
        message: `${req.user.name || 'A patient'} has granted you access to their medical records.`,
        type: 'security',
        route: `/records/share/${accessToken}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Medical records shared successfully',
      data: {
        shareId: share._id,
        accessToken: share.accessToken,
        expiresAt: share.expiresAt,
        permissions: share.permissions,
        records: share.records,
        doctor: {
          id: doctor._id,
          name: doctor.userId?.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/records/share/:token
 * Read-only access endpoint for shared medical records
 */
async function accessSharedRecords(req, res, next) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const share = await RecordShare.findOne({ accessToken: token })
      .populate('patientId', 'name email bloodType')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Medical share record not found or invalid token',
      });
    }

    if (share.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'This medical record share link has expired',
        expiresAt: share.expiresAt,
      });
    }

    // Access logging
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const userAgent = req.headers['user-agent'] || '';
    share.logAccess(ipAddress, userAgent, req.user?._id || null);
    await share.save();

    // Trigger notification to patient: Record access notice
    await createNotification({
      userId: share.patientId._id,
      title: 'Record Access Notice',
      message: 'Your shared medical records were accessed via secure link.',
      type: 'security',
      route: '/records/shared',
    });

    const patientId = share.patientId._id;
    const permissions = share.permissions || {};
    const projectedData = {};

    if (permissions.medicalProfile) {
      projectedData.medicalProfile = await MedicalProfile.findOne({ userId: patientId }).lean();
    }
    if (permissions.reports) {
      projectedData.reports = await Report.find({ userId: patientId }).sort({ createdAt: -1 }).lean();
    }
    if (permissions.medicines) {
      projectedData.medicines = await Medicine.find({ userId: patientId }).sort({ createdAt: -1 }).lean();
    }
    if (permissions.appointments) {
      projectedData.appointments = await Appointment.find({ userId: patientId }).sort({ appointmentDate: -1 }).lean();
    }
    if (permissions.timeline) {
      projectedData.timeline = await HealthTimeline.find({ userId: patientId }).sort({ createdAt: -1 }).limit(30).lean();
    }
    if (permissions.healthAnalytics) {
      projectedData.healthAnalytics = await HealthScore.findOne({ userId: patientId }).sort({ createdAt: -1 }).lean();
    }

    res.status(200).json({
      success: true,
      data: {
        accessToken: share.accessToken,
        expiresAt: share.expiresAt,
        patient: {
          id: share.patientId._id,
          name: share.patientId.name,
        },
        doctor: {
          id: share.doctorId?._id,
          specialization: share.doctorId?.specialization,
          hospital: share.doctorId?.hospital,
        },
        permissions: share.permissions,
        records: projectedData,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/records/shared
 * Retrieve all shares created by the authenticated patient
 */
async function getSharedRecordsList(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const shares = await RecordShare.find({ patientId: userId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shares.length,
      data: shares,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/records/share/:id
 * Revoke/delete a record share (IDOR protected)
 */
async function revokeShare(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const share = await RecordShare.findById(id);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share record not found',
      });
    }

    // IDOR Protection: only the owner patient can delete/revoke
    if (share.patientId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own record shares',
      });
    }

    await RecordShare.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Medical record share revoked successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createShare,
  accessSharedRecords,
  getSharedRecordsList,
  revokeShare,
};
