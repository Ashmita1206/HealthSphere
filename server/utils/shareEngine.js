const crypto = require('crypto');

/**
 * Generate a cryptographically secure random share token
 * Format: HS_SHARE_<32 hex chars>
 */
function generateShareToken() {
  const randomHex = crypto.randomBytes(16).toString('hex');
  return `HS_SHARE_${randomHex}`;
}

/**
 * Calculate expiry date from string duration
 * Supports: '1h', '6h', '12h', '24h', '48h', '7d', '14d', '30d'
 * Defaults to 24 hours
 */
function calculateExpiresAt(duration = '24h') {
  const now = Date.now();
  const normalized = String(duration).trim().toLowerCase();

  let ms = 24 * 60 * 60 * 1000; // default 24h

  if (normalized.endsWith('h')) {
    const hours = parseFloat(normalized.slice(0, -1));
    if (!isNaN(hours) && hours > 0) {
      ms = hours * 60 * 60 * 1000;
    }
  } else if (normalized.endsWith('d')) {
    const days = parseFloat(normalized.slice(0, -1));
    if (!isNaN(days) && days > 0) {
      ms = days * 24 * 60 * 60 * 1000;
    }
  } else if (normalized.endsWith('m')) {
    const minutes = parseFloat(normalized.slice(0, -1));
    if (!isNaN(minutes) && minutes > 0) {
      ms = minutes * 60 * 1000;
    }
  }

  return new Date(now + ms);
}

/**
 * Normalize and sanitize permissions object
 */
function sanitizePermissions(raw = {}) {
  return {
    profile: Boolean(raw.profile ?? true),
    reports: Boolean(raw.reports ?? true),
    medicines: Boolean(raw.medicines ?? true),
    appointments: Boolean(raw.appointments ?? true),
    timeline: Boolean(raw.timeline ?? true),
    analytics: Boolean(raw.analytics ?? true),
    emergency: Boolean(raw.emergency ?? true),
  };
}

module.exports = {
  generateShareToken,
  calculateExpiresAt,
  sanitizePermissions,
};
