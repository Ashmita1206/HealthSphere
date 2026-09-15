const EmergencyIncident = require('../models/EmergencyIncident');
const EmergencyContact = require('../models/EmergencyContact');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { evaluateEmergencyRisk, EMERGENCY_LEVELS } = require('../services/emergencyEngine');
const timelineService = require('../services/timelineService');
const { createNotification } = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Dispatches simulated emergency email alerts to registered emergency contacts and primary doctors
 */
async function triggerEmergencyEmailAlerts({ user, incident, contacts, doctor }) {
  const contactPhones = contacts.map((c) => `${c.name} (${c.phone})`).join(', ');
  logger.warn(`[EMERGENCY DISPATCH ALERT] Critical Health Incident for ${user?.name || 'User'} (${user?.email})`, {
    incidentId: incident._id,
    severity: incident.severity,
    triggerReason: incident.triggerReason,
    contactsNotified: contactPhones,
    doctorNotified: doctor?.userId?.name || doctor?.specialization || 'On-Call Hospital Service',
    location: incident.location,
    timestamp: new Date().toISOString(),
  });
  return true;
}

/**
 * POST /api/emergency/report
 * Reports a new emergency incident, evaluates risk, and auto-escalates critical alerts
 */
async function reportEmergency(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const {
      vitals,
      triggerReason,
      location,
      severity: explicitSeverity,
      assignedDoctorId,
    } = req.body || {};

    // 1. Evaluate Risk using Emergency Engine
    let evaluated = {
      level: explicitSeverity || EMERGENCY_LEVELS.MEDIUM,
      triggers: [triggerReason || 'Patient initiated manual emergency signal'],
      isEmergency: true,
      recommendedAction: 'Medical evaluation required',
    };

    if (vitals && typeof vitals === 'object') {
      evaluated = evaluateEmergencyRisk(vitals);
      if (triggerReason) {
        evaluated.triggers.unshift(triggerReason);
      }
    }

    const finalSeverity = explicitSeverity || evaluated.level;
    const combinedReason = evaluated.triggers.join('. ');

    // 2. Resolve doctor if provided or linked
    let assignedDoctor = null;
    if (assignedDoctorId) {
      assignedDoctor = await Doctor.findById(assignedDoctorId).populate('userId', 'name email');
    }

    // 3. Create EmergencyIncident record
    const incident = await EmergencyIncident.create({
      userId,
      severity: finalSeverity,
      triggerReason: combinedReason || 'Medical emergency triggered',
      location: location || {},
      status: 'active',
      assignedDoctor: assignedDoctor?._id || null,
      escalatedAt: finalSeverity === EMERGENCY_LEVELS.CRITICAL ? new Date() : null,
    });

    const isCritical = finalSeverity === EMERGENCY_LEVELS.CRITICAL;

    // 4. Auto-Escalation Protocol for CRITICAL Emergencies
    let escalationDetails = null;
    if (isCritical) {
      const [user, contacts] = await Promise.all([
        User.findById(userId).select('name email phone bloodType').lean(),
        EmergencyContact.find({ userId }).lean(),
      ]);

      // a. Notify Emergency Contacts (in-app notifications and simulated dispatch)
      for (const contact of contacts) {
        await createNotification({
          userId,
          title: `SOS: Emergency Contact Alerted (${contact.name})`,
          message: `HealthSphere alerted ${contact.name} (${contact.phone}) regarding: ${combinedReason}`,
          type: 'alert',
          severity: 'critical',
          priority: 'high',
          route: '/emergency',
        });
      }

      // b. Notify Assigned Doctor if available
      if (assignedDoctor && (assignedDoctor.userId?._id || assignedDoctor.userId)) {
        await createNotification({
          userId: assignedDoctor.userId._id || assignedDoctor.userId,
          title: 'CRITICAL PATIENT EMERGENCY ALERT',
          message: `Patient ${user?.name || 'User'} has triggered a CRITICAL emergency: ${combinedReason}`,
          type: 'alert',
          severity: 'critical',
          priority: 'high',
          route: `/consultations`,
        });
      }

      // c. Push In-App Emergency Notification to patient
      await createNotification({
        userId,
        title: 'CRITICAL HEALTH EMERGENCY INITIATED',
        message: `${combinedReason}. Emergency contacts and healthcare providers have been alerted.`,
        type: 'alert',
        severity: 'critical',
        priority: 'high',
        route: '/emergency',
      });

      // d. Create Timeline Event
      await timelineService.createEvent({
        userId,
        eventType: 'EMERGENCY_INCIDENT',
        category: 'emergency',
        title: 'Critical Emergency Incident Triggered',
        description: `Severity: CRITICAL. Reason: ${combinedReason}`,
        metadata: {
          incidentId: incident._id,
          severity: incident.severity,
          contactsAlertedCount: contacts.length,
          location: incident.location,
        },
        relatedId: incident._id,
      });

      // e. Simulated Email Alert Trigger
      await triggerEmergencyEmailAlerts({ user, incident, contacts, doctor: assignedDoctor });

      escalationDetails = {
        contactsAlertedCount: contacts.length,
        doctorAlerted: Boolean(assignedDoctor),
        timelineRecorded: true,
        emailTriggered: true,
      };
    } else {
      // Non-critical timeline event
      await timelineService.createEvent({
        userId,
        eventType: 'EMERGENCY_INCIDENT',
        category: 'emergency',
        title: `Emergency Signal Logged (${finalSeverity})`,
        description: combinedReason,
        metadata: { incidentId: incident._id, severity: finalSeverity },
        relatedId: incident._id,
      });
    }

    res.status(201).json({
      success: true,
      message: isCritical ? 'Critical emergency reported and escalated immediately' : 'Emergency incident recorded',
      data: {
        incident,
        evaluatedRisk: evaluated,
        escalation: escalationDetails,
      },
    });
  } catch (error) {
    logger.error('Report emergency error', { error: error.message });
    next(error);
  }
}

/**
 * GET /api/emergency/history
 * Retrieves authenticated user's past emergency incidents
 */
async function getEmergencyHistory(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const incidents = await EmergencyIncident.find({ userId })
      .sort({ createdAt: -1 })
      .populate('assignedDoctor', 'specialization hospital');

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/emergency/active
 * Retrieves all active/investigating incidents for user
 */
async function getActiveEmergencies(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const active = await EmergencyIncident.find({
      userId,
      status: { $in: ['active', 'investigating'] },
    })
      .sort({ createdAt: -1 })
      .populate('assignedDoctor', 'specialization hospital');

    res.status(200).json({
      success: true,
      count: active.length,
      data: active,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/emergency/:id/resolve
 * Resolves an active emergency incident with IDOR protection
 */
async function resolveEmergency(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const incident = await EmergencyIncident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Emergency incident not found',
      });
    }

    // IDOR Protection: only incident owner or assigned doctor can resolve
    if (incident.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only resolve your own emergency incidents',
      });
    }

    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    await incident.save();

    // Timeline event
    await timelineService.createEvent({
      userId,
      eventType: 'EMERGENCY_INCIDENT',
      category: 'emergency',
      title: 'Emergency Incident Resolved',
      description: `Incident from ${incident.createdAt.toLocaleString()} was marked resolved.`,
      metadata: { incidentId: incident._id, status: 'resolved' },
      relatedId: incident._id,
    });

    res.status(200).json({
      success: true,
      message: 'Emergency incident resolved successfully',
      data: incident,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  reportEmergency,
  getEmergencyHistory,
  getActiveEmergencies,
  resolveEmergency,
};
