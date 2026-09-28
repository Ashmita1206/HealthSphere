/**
 * HealthSphere Enterprise Session & Device Tracking Service
 */

const crypto = require('crypto');
const Session = require('../models/Session');
const Device = require('../models/Device');
const LoginHistory = require('../models/LoginHistory');
const { logAuditEvent } = require('./auditService');
const logger = require('../utils/logger');

function parseUserAgent(uaString = '') {
  let browser = 'Chrome';
  let os = 'Windows';
  let deviceType = 'desktop';

  if (/mobile/i.test(uaString)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(uaString)) deviceType = 'tablet';

  if (/firefox/i.test(uaString)) browser = 'Firefox';
  else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) browser = 'Safari';
  else if (/edge/i.test(uaString)) browser = 'Edge';

  if (/macintosh|mac os x/i.test(uaString)) os = 'macOS';
  else if (/linux/i.test(uaString)) os = 'Linux';
  else if (/android/i.test(uaString)) os = 'Android';
  else if (/iphone|ipad/i.test(uaString)) os = 'iOS';

  return { browser, os, deviceType };
}

/**
 * Creates an active session and tracks device
 */
async function createSession(userId, refreshToken, req) {
  try {
    const userAgent = req?.headers ? req.headers['user-agent'] || 'Unknown' : 'Unknown';
    const ipAddress = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';
    const { browser, os, deviceType } = parseUserAgent(userAgent);

    const rawToken = refreshToken || crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenFamily = crypto.randomUUID();
    const deviceFingerprint = crypto.createHash('sha256').update(`${userId}:${browser}:${os}`).digest('hex').slice(0, 16);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await Session.create({
      userId,
      tokenFamily,
      refreshTokenHash,
      device: {
        browser,
        os,
        deviceType,
        ipAddress,
        userAgent,
        location: 'Local Network',
      },
      browser,
      os,
      deviceType,
      ipAddress,
      userAgent,
      isActive: true,
      isRevoked: false,
      expiresAt,
    });

    // Register or update Device
    await Device.findOneAndUpdate(
      { userId, deviceId: deviceFingerprint },
      {
        userId,
        deviceId: deviceFingerprint,
        deviceName: `${browser} on ${os}`,
        browser,
        os,
        ipAddress,
        lastSeen: new Date(),
      },
      { upsert: true, new: true }
    );

    return session;
  } catch (err) {
    logger.warn('Failed to create session or track device', { error: err.message, userId });
    return null;
  }
}

/**
 * Retrieves all active sessions for a user
 */
async function getActiveSessions(userId) {
  try {
    return await Session.find({
      userId,
      isActive: true,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActive: -1 });
  } catch (_e) {
    return [];
  }
}

/**
 * Revokes a specific session
 */
async function revokeSession(sessionId, userId) {
  try {
    const updated = await Session.findOneAndUpdate(
      { _id: sessionId, userId },
      { isActive: false, isRevoked: true, revokedReason: 'User revoked session' },
      { new: true }
    );

    await logAuditEvent({
      userId,
      action: 'SESSION_REVOKED',
      resource: 'Session',
      status: 'success',
      details: { sessionId },
    });

    return !!updated;
  } catch (_e) {
    return false;
  }
}

/**
 * Revokes all other sessions for a user
 */
async function revokeAllOtherSessions(currentSessionId, userId) {
  try {
    const query = { userId, isActive: true, isRevoked: false };
    if (currentSessionId) {
      query._id = { $ne: currentSessionId };
    }

    const result = await Session.updateMany(query, {
      isActive: false,
      isRevoked: true,
      revokedReason: 'User revoked other sessions',
    });

    await logAuditEvent({
      userId,
      action: 'ALL_OTHER_SESSIONS_REVOKED',
      resource: 'Session',
      status: 'success',
      details: { revokedCount: result.modifiedCount },
    });

    return result.modifiedCount;
  } catch (_e) {
    return 0;
  }
}

/**
 * Retrieves trusted devices
 */
async function getTrustedDevices(userId) {
  try {
    return await Device.find({ userId }).sort({ lastSeen: -1 });
  } catch (_e) {
    return [];
  }
}

/**
 * Untrust / remove a device
 */
async function untrustDevice(deviceId, userId) {
  try {
    await Device.findOneAndDelete({ deviceId, userId });
    await logAuditEvent({
      userId,
      action: 'DEVICE_UNTRUSTED',
      resource: 'Device',
      status: 'success',
      details: { deviceId },
    });
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Records a login attempt into login history
 */
async function recordLoginAttempt({ userId, email, ipAddress, userAgent, status = 'SUCCESS', reason = 'Normal Login' }) {
  try {
    const { browser, os, deviceType } = parseUserAgent(userAgent);
    const upperStatus = String(status).toUpperCase();
    const isSuccess = upperStatus === 'SUCCESS';

    return await LoginHistory.create({
      userId: userId || null,
      email: email ? email.toLowerCase() : 'unknown',
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'Unknown',
      device: {
        browser,
        os,
        deviceType,
      },
      deviceType,
      status: isSuccess ? 'SUCCESS' : (upperStatus === 'LOCKED' || upperStatus === 'ACCOUNT_LOCKED' ? 'ACCOUNT_LOCKED' : 'FAILED_CREDENTIALS'),
      reason,
      failureReason: isSuccess ? null : reason,
      attemptedAt: new Date(),
    });
  } catch (err) {
    logger.warn('Failed to record login history', { error: err.message });
    return null;
  }
}

/**
 * Retrieves login history for a user
 */
async function getLoginHistory(userId, limit = 20) {
  try {
    return await LoginHistory.find({ userId }).sort({ attemptedAt: -1, createdAt: -1 }).limit(limit);
  } catch (_e) {
    return [];
  }
}

module.exports = {
  createSession,
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  getTrustedDevices,
  untrustDevice,
  recordLoginAttempt,
  getLoginHistory,
  parseUserAgent,
};
