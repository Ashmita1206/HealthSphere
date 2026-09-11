/**
 * HealthSphere Audit Service
 * Non-blocking recording of security-sensitive events to the AuditLog collection
 */

const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Logs an event to the AuditLog database collection
 * @param {Object} event
 * @param {string} event.userId
 * @param {string} event.action
 * @param {string} event.resource
 * @param {string} [event.role]
 * @param {string} [event.ipAddress]
 * @param {string} [event.userAgent]
 * @param {'success'|'denied'|'failed'} [event.status]
 * @param {Object} [event.details]
 */
async function logAuditEvent({
  userId,
  action,
  resource = 'Auth',
  role = 'patient',
  ipAddress = '127.0.0.1',
  userAgent = 'Unknown',
  status = 'success',
  details = {},
}) {
  try {
    if (!userId || !action) return null;

    // If database connection is not active (e.g. In unit tests or during bootstrap), don't block
    if (mongoose.connection.readyState !== 1) {
      logger.info('Audit log skipped: database disconnected', { action, userId: String(userId) });
      return null;
    }

    const entry = await AuditLog.create({
      userId,
      action,
      resource,
      role,
      ipAddress,
      userAgent,
      status,
      details,
    });

    return entry;
  } catch (err) {
    // Non-blocking: log warning but never crash the request
    logger.warn('Failed to record audit log entry', {
      error: err.message,
      action,
      userId,
    });
    return null;
  }
}

module.exports = {
  logAuditEvent,
};
