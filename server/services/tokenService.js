/**
 * HealthSphere Enterprise Token Service
 * Access Token & Refresh Token Lifecycle, Rotation, and Cookie Configuration
 */

const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt.config');

const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate Access and Refresh Token pair
 */
function generateTokens(userId, role = 'patient') {
  const secret = getJwtSecret();
  const idStr = String(userId);

  const accessToken = jwt.sign(
    { id: idStr, role, type: 'access' },
    secret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: idStr, role, type: 'refresh' },
    secret,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify Refresh Token
 */
function verifyRefreshToken(token) {
  if (!token) {
    throw new Error('Refresh token is required');
  }
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret);
  if (decoded.type && decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

/**
 * Cookie options for Secure HTTP-only cookies
 */
function getCookieOptions(isRefresh = false) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: isRefresh ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000,
    path: '/',
  };
}

/**
 * Set authentication cookies on response
 */
function setAuthCookies(res, { accessToken, refreshToken }) {
  if (accessToken) {
    res.cookie('accessToken', accessToken, getCookieOptions(false));
  }
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, getCookieOptions(true));
  }
}

/**
 * Clear authentication cookies on response
 */
function clearAuthCookies(res) {
  const opts = { httpOnly: true, path: '/' };
  res.clearCookie('accessToken', opts);
  res.clearCookie('refreshToken', opts);
}

module.exports = {
  generateTokens,
  verifyRefreshToken,
  getCookieOptions,
  setAuthCookies,
  clearAuthCookies,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
