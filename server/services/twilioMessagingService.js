/**
 * twilioMessagingService.js
 * 
 * Production Twilio Programmable Messaging Service for HealthSphere Emergency SOS.
 * Uses native Node.js fetch (zero external SDK dependencies required).
 * Handles E.164 validation, non-PHI alert templating, dispatch status tracking,
 * and status callback processing.
 */

const crypto = require('crypto');
const path = require('path');
const logger = require('../utils/logger');

// Ensure server/.env is loaded once at module initialization
try {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
} catch {
  // ignore
}

function getTwilioConfig() {

  const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const phoneNumber = (process.env.TWILIO_PHONE_NUMBER || '').trim();
  const statusCallbackUrl = (process.env.TWILIO_STATUS_CALLBACK_URL || '').trim();

  const isConfigured = Boolean(
    accountSid &&
    authToken &&
    phoneNumber &&
    !accountSid.includes('your_') &&
    !authToken.includes('your_') &&
    accountSid.startsWith('AC')
  );

  return {
    accountSid,
    authToken,
    phoneNumber,
    statusCallbackUrl,
    isConfigured,
  };
}

/**
 * Validates and normalizes phone numbers into standard E.164 format (+[country][number])
 */
function formatE164(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required.' };
  }

  const cleaned = phone.trim();
  const e164Regex = /^\+[1-9]\d{9,14}$/;
  if (e164Regex.test(cleaned)) {
    return { valid: true, e164: cleaned };
  }

  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) {
    // 10 digits default to +1
    return { valid: true, e164: `+1${digits}` };
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return { valid: true, e164: `+${digits}` };
  }
  if (digits.length >= 10 && digits.length <= 15) {
    return { valid: true, e164: `+${digits}` };
  }

  return {
    valid: false,
    error: `Invalid phone number format: "${phone}". E.164 format required (e.g. +15551234567).`,
  };
}

/**
 * Constructs emergency SMS text WITHOUT exposing PHI (Protected Health Information).
 * Supports explicit test mode labeling to prevent panic during verification.
 */
function buildEmergencyMessageText({ userName, latitude, longitude, isTestMode }) {
  const sender = (userName && userName.trim()) || 'Your contact';
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !Number.isNaN(latitude) && !Number.isNaN(longitude);
  const locationLink = hasCoords
    ? `https://maps.google.com/?q=${latitude.toFixed(5)},${longitude.toFixed(5)}`
    : 'GPS coordinates unavailable';

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (isTestMode) {
    return `[TEST ALERT] HEALTHSPHERE EMERGENCY SOS: This is an authorized TEST signal triggered by ${sender}. No actual emergency exists. Location: ${locationLink}. Time: ${timeStr}.`;
  }

  return `HEALTHSPHERE SOS ALERT: ${sender} has triggered an urgent emergency signal. Location: ${locationLink}. Time: ${timeStr}. Please check on them immediately or call emergency services (112 / 911).`;
}

/**
 * Dispatches a single SMS via Twilio Programmable Messaging REST API
 */
async function sendTwilioMessage({ to, body, callbackUrl }) {
  const config = getTwilioConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      status: 'unconfigured',
      error: 'Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are not configured on the server.',
    };
  }

  const e164Check = formatE164(to);
  if (!e164Check.valid) {
    return {
      success: false,
      status: 'failed',
      error: e164Check.error,
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  const authHeader = `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`;

  const params = new URLSearchParams();
  params.append('To', e164Check.e164);
  params.append('From', config.phoneNumber);
  params.append('Body', body);

  const effectiveCallback = callbackUrl || config.statusCallbackUrl;
  if (effectiveCallback) {
    params.append('StatusCallback', effectiveCallback);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let friendlyError = data.message || `Twilio API error HTTP ${response.status}`;
      if (data.code === 21608) {
        friendlyError = `Twilio Trial Restriction: Recipient ${e164Check.e164} is not a verified Caller ID. On Twilio trial accounts, numbers must be verified in the Twilio Console before receiving SMS.`;
      } else if (data.code === 21211) {
        friendlyError = `Twilio Error: Phone number "${e164Check.e164}" is not a valid SMS recipient.`;
      } else if (data.code === 20003) {
        friendlyError = 'Twilio Authentication Error: Invalid Account SID or Auth Token in server/.env.';
      }

      logger.warn('[Twilio SMS Dispatch Error]', {
        status: response.status,
        code: data.code,
        message: friendlyError,
        to: e164Check.e164,
      });

      return {
        success: false,
        status: 'failed',
        errorCode: data.code ? String(data.code) : String(response.status),
        error: friendlyError,
      };
    }

    logger.info('[Twilio SMS Dispatched Successfully]', {
      sid: data.sid,
      to: data.to,
      status: data.status,
    });

    return {
      success: true,
      messageSid: data.sid,
      status: data.status || 'queued',
      to: data.to,
      dateCreated: data.date_created,
    };
  } catch (err) {
    logger.error('[Twilio Network Exception]', { error: err.message, to: e164Check.e164 });
    return {
      success: false,
      status: 'failed',
      error: err.name === 'AbortError' ? 'Twilio request timed out after 10s' : err.message,
    };
  }
}

/**
 * Validates Twilio webhook X-Twilio-Signature header using HMAC-SHA1
 */
function validateTwilioWebhookSignature({ url, params, signature, authToken }) {
  if (!signature || !authToken || !url) {
    return false;
  }

  try {
    const sortedKeys = Object.keys(params || {}).sort();
    let data = url;
    for (const key of sortedKeys) {
      data += `${key}${params[key]}`;
    }

    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(Buffer.from(data, 'utf-8'))
      .digest('base64');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Dispatches emergency SMS to an array of contacts and collects individual delivery records
 */
async function dispatchEmergencySmsBatch({ contacts, userName, latitude, longitude, callbackUrl, isTestMode }) {
  const config = getTwilioConfig();
  const body = buildEmergencyMessageText({ userName, latitude, longitude, isTestMode });

  const records = [];

  for (const contact of contacts) {
    const contactId = String(contact._id || contact.id || '');
    const contactName = contact.name || 'Emergency Contact';
    const rawPhone = contact.phone || '';

    if (!config.isConfigured) {
      records.push({
        contactId,
        contactName,
        phone: rawPhone,
        channel: 'sms',
        status: 'unconfigured',
        messageSid: null,
        errorMessage: 'Twilio credentials not configured in environment variables.',
        updatedAt: new Date(),
      });
      continue;
    }

    const e164Check = formatE164(rawPhone);
    if (!e164Check.valid) {
      records.push({
        contactId,
        contactName,
        phone: rawPhone,
        channel: 'sms',
        status: 'failed',
        messageSid: null,
        errorMessage: e164Check.error,
        updatedAt: new Date(),
      });
      continue;
    }

    const sendRes = await sendTwilioMessage({
      to: e164Check.e164,
      body,
      callbackUrl,
    });

    records.push({
      contactId,
      contactName,
      phone: e164Check.e164,
      channel: 'sms',
      status: sendRes.status || (sendRes.success ? 'queued' : 'failed'),
      messageSid: sendRes.messageSid || null,
      errorCode: sendRes.errorCode ? String(sendRes.errorCode) : null,
      errorMessage: sendRes.error || null,
      updatedAt: new Date(),
    });
  }

  const effectiveCallback = callbackUrl || config.statusCallbackUrl;

  return {
    isConfigured: config.isConfigured,
    isStatusCallbackConfigured: Boolean(effectiveCallback),
    isTestMode: Boolean(isTestMode),
    records,
    totalAttempted: contacts.length,
    queuedCount: records.filter((r) => r.status === 'queued' || r.status === 'sent').length,
    failedCount: records.filter((r) => r.status === 'failed').length,
    unconfiguredCount: records.filter((r) => r.status === 'unconfigured').length,
  };
}

module.exports = {
  getTwilioConfig,
  formatE164,
  buildEmergencyMessageText,
  sendTwilioMessage,
  validateTwilioWebhookSignature,
  dispatchEmergencySmsBatch,
};
