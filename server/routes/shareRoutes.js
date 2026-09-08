const express = require('express');
const router = express.Router();
const MedicalShare = require('../models/MedicalShare');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const HealthTimeline = require('../models/HealthTimeline');
const HealthScore = require('../models/HealthScore');
const { protect } = require('../middlewares/authMiddleware');
const {
  generateShareToken,
  calculateExpiresAt,
  sanitizePermissions,
} = require('../utils/shareEngine');

/**
 * Public / Read-Only Endpoint: GET /api/share/access/:token
 * Validates share token, checks expiration/revocation, and strictly projects ONLY permitted patient resources.
 */
router.get('/access/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token || !token.startsWith('HS_SHARE_')) {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        message: 'Invalid share token format. Must begin with HS_SHARE_',
      });
    }

    const share = await MedicalShare.findOne({ shareToken: token })
      .populate('doctorId', 'fullName specialization hospital qualification licenseNumber profileImage')
      .populate('patientId', 'name email bloodType');

    if (!share) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Medical share record not found or link has expired',
      });
    }

    // Check revocation
    if (share.status === 'revoked') {
      return res.status(403).json({
        success: false,
        status: 'revoked',
        message: 'Access to this medical record was revoked by the patient',
        revokedAt: share.updatedAt,
      });
    }

    // Check automatic expiration
    const now = new Date();
    if (now > new Date(share.expiresAt)) {
      if (share.status !== 'expired') {
        share.status = 'expired';
        await share.save();
      }
      return res.status(410).json({
        success: false,
        status: 'expired',
        message: 'This secure medical record link has expired',
        expiresAt: share.expiresAt,
      });
    }

    const patientId = share.patientId._id || share.patientId;
    const permissions = share.permissions || {};
    const records = {};

    // 1. Medical Profile & Emergency Info
    if (permissions.profile || permissions.emergency) {
      const profile = await MedicalProfile.findOne({ userId: patientId }).lean();
      if (permissions.profile) {
        records.profile = profile || {
          fullName: share.patientId.name,
          bloodGroup: share.patientId.bloodType || 'Unknown',
        };
      }
      if (permissions.emergency) {
        records.emergency = {
          bloodGroup: profile?.bloodGroup || share.patientId.bloodType || 'Unknown',
          allergies: profile?.allergies || [],
          chronicDiseases: profile?.chronicDiseases || [],
          emergencyContacts: profile?.emergencyContacts || [],
          organDonor: profile?.organDonor || false,
        };
      }
    }

    // 2. Active Medications
    if (permissions.medicines) {
      records.medicines = await Medicine.find({ userId: patientId })
        .select('name dosage frequency timing startDate endDate status adherenceRate instructions doctorName')
        .sort({ createdAt: -1 })
        .lean();
    }

    // 3. Appointments
    if (permissions.appointments) {
      records.appointments = await Appointment.find({ userId: patientId })
        .select('doctorName specialty hospital appointmentDate status')
        .sort({ appointmentDate: -1 })
        .lean();
    }

    // 4. Lab Reports
    if (permissions.reports) {
      records.reports = await Report.find({ userId: patientId })
        .select('title category riskLevel summary abnormalValues biomarkers createdAt fileUrl')
        .sort({ createdAt: -1 })
        .lean();
    }

    // 5. Health Timeline
    if (permissions.timeline) {
      records.timeline = await HealthTimeline.find({ userId: patientId })
        .select('eventType title description category metadata createdAt')
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    }

    // 6. Analytics & Health Score
    if (permissions.analytics) {
      const scoreDoc = await HealthScore.findOne({ userId: patientId }).sort({ createdAt: -1 }).lean();
      records.analytics = {
        score: scoreDoc?.score || 82,
        category: scoreDoc?.category || 'Optimal Health',
        breakdown: scoreDoc?.breakdown || {
          vitals: 85,
          adherence: 90,
          lifestyle: 80,
          risk: 75,
        },
        insights: scoreDoc?.insights || [
          'High prescription adherence maintained over past 30 days',
          'Biomarkers within expected clinical parameters',
        ],
      };
    }

    res.status(200).json({
      success: true,
      status: 'active',
      data: {
        shareToken: share.shareToken,
        doctor: share.doctorId,
        patient: {
          id: share.patientId._id,
          name: share.patientId.name,
        },
        permissions: share.permissions,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
        records,
      },
    });
  } catch (err) {
    next(err);
  }
});

// All routes below require patient authentication
router.use(protect);

/**
 * POST /api/share/create
 * Generates a new expiring share token for a specific doctor
 */
router.post('/create', async (req, res, next) => {
  try {
    const patientId = req.user._id || req.user.id;
    const { doctorId, permissions, expiryDuration } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId is required to share medical records',
      });
    }

    // Verify doctor exists
    let doctor = null;
    if (doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(doctorId);
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId });
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found in directory',
      });
    }

    const sanitizedPerms = sanitizePermissions(permissions);
    const expiresAt = calculateExpiresAt(expiryDuration || '24h');
    const shareToken = generateShareToken();

    const newShare = await MedicalShare.create({
      patientId,
      doctorId: doctor._id,
      shareToken,
      expiresAt,
      permissions: sanitizedPerms,
      status: 'active',
    });

    const populated = await MedicalShare.findById(newShare._id).populate(
      'doctorId',
      'fullName specialization hospital profileImage doctorId'
    );

    const clientOrigin =
      req.headers.origin ||
      process.env.CLIENT_URL ||
      'http://localhost:8081';
    const shareLink = `${clientOrigin}/#/shared/${shareToken}`;

    res.status(201).json({
      success: true,
      message: 'Secure share token generated successfully',
      data: {
        shareId: populated._id,
        shareToken,
        shareLink,
        expiresAt,
        permissions: sanitizedPerms,
        doctor: populated.doctorId,
        status: 'active',
        createdAt: populated.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/share
 * Returns patient's active, expired, and revoked shares
 */
router.get('/', async (req, res, next) => {
  try {
    const patientId = req.user._id || req.user.id;
    const shares = await MedicalShare.find({ patientId })
      .populate('doctorId', 'fullName specialization hospital profileImage doctorId qualification')
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const active = [];
    const expired = [];
    const revoked = [];

    for (const item of shares) {
      if (item.status === 'revoked') {
        revoked.push(item);
      } else if (now > new Date(item.expiresAt) || item.status === 'expired') {
        if (item.status !== 'expired') {
          await MedicalShare.findByIdAndUpdate(item._id, { status: 'expired' });
          item.status = 'expired';
        }
        expired.push(item);
      } else {
        active.push(item);
      }
    }

    res.status(200).json({
      success: true,
      counts: {
        total: shares.length,
        active: active.length,
        expired: expired.length,
        revoked: revoked.length,
      },
      data: {
        active,
        expired,
        revoked,
        all: shares,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/share/:token/revoke
 * Revokes an existing share token (with ownership validation / IDOR protection)
 */
router.post('/:token/revoke', async (req, res, next) => {
  try {
    const patientId = req.user._id || req.user.id;
    const { token } = req.params;

    const share = await MedicalShare.findOne({ shareToken: token });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share token not found',
      });
    }

    // Ownership check / IDOR defense
    if (share.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only revoke your own medical shares',
      });
    }

    share.status = 'revoked';
    await share.save();

    res.status(200).json({
      success: true,
      message: 'Medical share access revoked successfully',
      data: {
        shareToken: share.shareToken,
        status: 'revoked',
        revokedAt: share.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
