const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt.config');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const User = require('../models/User');

const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseUserAgent(userAgent = '') {
  const ua = userAgent.toLowerCase();
  let deviceType = 'desktop';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    deviceType = /tablet|ipad/i.test(ua) ? 'tablet' : 'mobile';
  } else if (/bot|crawler|spider/i.test(ua)) {
    deviceType = 'bot';
  }

  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';

  if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';

  return { deviceType, browser, os };
}

function generateAccessToken(user) {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role || 'patient',
    name: user.name,
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

async function createSession(user, req) {
  const userAgent = req?.headers?.['user-agent'] || 'Unknown User Agent';
  const ipAddress = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';
  const { deviceType, browser, os } = parseUserAgent(userAgent);

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const tokenFamily = crypto.randomUUID();
  const refreshTokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const session = await Session.create({
    userId: user._id || user.id,
    tokenFamily,
    refreshTokenHash,
    userAgent,
    deviceType,
    browser,
    os,
    ipAddress,
    expiresAt,
  });

  return {
    session,
    rawRefreshToken: `${session._id}.${rawRefreshToken}`,
  };
}

async function rotateRefreshToken(combinedToken) {
  if (!combinedToken || !combinedToken.includes('.')) {
    throw new Error('Invalid refresh token format');
  }

  const [sessionId, secret] = combinedToken.split('.');
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error('Session not found or expired');
  }

  const presentedHash = hashToken(secret);

  // Reuse detection: If session is revoked but token family is reused, invalidate entire family
  if (session.isRevoked) {
    await Session.updateMany(
      { tokenFamily: session.tokenFamily },
      { isRevoked: true, revokedReason: 'Suspected token reuse attack' },
    );
    throw new Error('Revoked session token detected. All associated family sessions invalidated.');
  }

  if (session.refreshTokenHash !== presentedHash) {
    // Hash mismatch
    await Session.updateMany(
      { tokenFamily: session.tokenFamily },
      { isRevoked: true, revokedReason: 'Token family tamper detected' },
    );
    throw new Error('Security violation: token hash mismatch');
  }

  if (session.expiresAt < new Date()) {
    session.isRevoked = true;
    session.revokedReason = 'Session expired';
    await session.save();
    throw new Error('Refresh token has expired. Please log in again.');
  }

  const user = await User.findById(session.userId);
  if (!user) {
    throw new Error('User associated with session no longer exists');
  }

  // Issue new secret for next rotation
  const newSecret = crypto.randomBytes(40).toString('hex');
  session.refreshTokenHash = hashToken(newSecret);
  session.lastActive = new Date();
  await session.save();

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = `${session._id}.${newSecret}`;

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

async function recordLoginHistory({ userId, email, status, req, failureReason = null }) {
  const userAgent = req?.headers?.['user-agent'] || 'Unknown';
  const ipAddress = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';
  const { deviceType } = parseUserAgent(userAgent);

  return LoginHistory.create({
    userId: userId || null,
    email: email ? email.toLowerCase() : 'unknown',
    status,
    ipAddress,
    userAgent,
    deviceType,
    failureReason,
  });
}

async function handleFailedLogin(user, req, reason = 'Invalid credentials') {
  if (user) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }
    await user.save();
  }

  await recordLoginHistory({
    userId: user?._id,
    email: user?.email || req.body?.email,
    status: user && user.isAccountLocked() ? 'ACCOUNT_LOCKED' : 'FAILED_CREDENTIALS',
    req,
    failureReason: reason,
  });
}

async function handleSuccessfulLogin(user, req) {
  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  await recordLoginHistory({
    userId: user._id,
    email: user.email,
    status: 'SUCCESS',
    req,
  });
}

function createPasswordResetToken(user) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return rawToken;
}

function createEmailVerificationToken(user) {
  const rawToken = crypto.randomBytes(24).toString('hex');
  user.emailVerificationToken = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return rawToken;
}

module.exports = {
  hashToken,
  parseUserAgent,
  generateAccessToken,
  createSession,
  rotateRefreshToken,
  recordLoginHistory,
  handleFailedLogin,
  handleSuccessfulLogin,
  createPasswordResetToken,
  createEmailVerificationToken,
  ACCESS_TOKEN_EXPIRY,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_MINUTES,
};
