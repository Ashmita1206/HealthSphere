/**
 * HealthSphere Enterprise Cryptography Utilities
 * - AES-256-GCM authenticated encryption/decryption
 * - RFC 6238 TOTP (Two-Factor Authentication) implementation with zero dependencies
 * - Break-glass emergency tokens & recovery codes
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits auth tag
const MASTER_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'healthsphere-secure-enterprise-encryption-key-32')
  .digest();

/**
 * Encrypt sensitive health telemetry or PII with AES-256-GCM
 */
function encrypt(plaintext, customKey = MASTER_KEY) {
  if (plaintext === null || plaintext === undefined) return null;
  const text = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, customKey, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted,
    combined: `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`,
  };
}

/**
 * Decrypt AES-256-GCM encrypted payload
 */
function decrypt(encryptedInput, customKey = MASTER_KEY) {
  if (!encryptedInput) return null;

  let ivHex, authTagHex, encryptedHex;

  if (typeof encryptedInput === 'string' && encryptedInput.includes(':')) {
    const parts = encryptedInput.split(':');
    ivHex = parts[0];
    authTagHex = parts[1];
    encryptedHex = parts[2];
  } else if (typeof encryptedInput === 'object') {
    ivHex = encryptedInput.iv;
    authTagHex = encryptedInput.authTag;
    encryptedHex = encryptedInput.encryptedData;
  } else {
    return null;
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, customKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch (_e) {
    return decrypted;
  }
}

// ----------------------------------------------------
// RFC 6238 / RFC 4226 TOTP Two-Factor Authentication
// ----------------------------------------------------

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generates a random Base32 TOTP secret key
 */
function generateTotpSecret(length = 20) {
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32];
  }
  return secret;
}

/**
 * Decodes base32 to buffer
 */
function base32ToBuffer(base32) {
  const cleaned = base32.replace(/=+$/, '').toUpperCase();
  let bits = '';
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Generates 6-digit TOTP token for given time counter
 */
function generateTotpToken(secret, timeStep = Math.floor(Date.now() / 1000 / 30)) {
  const key = base32ToBuffer(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binaryCode % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verifies TOTP token with time window tolerance (+/- 1 step)
 */
function verifyTotpToken(secret, token, window = 1) {
  if (!secret || !token) return false;
  const sanitizedToken = String(token).trim();
  const currentStep = Math.floor(Date.now() / 1000 / 30);

  for (let i = -window; i <= window; i++) {
    const expected = generateTotpToken(secret, currentStep + i);
    if (crypto.timingSafeEqual(Buffer.from(sanitizedToken), Buffer.from(expected))) {
      return true;
    }
  }
  return false;
}

/**
 * Generates a set of single-use emergency recovery codes
 */
function generateEmergencyRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = `${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    codes.push(code);
  }
  return codes;
}

/**
 * Generates an expirable Break-Glass emergency access token for trauma/ER
 */
function generateEmergencyAccessToken(patientId, doctorId, reason, expiresInHours = 2) {
  const expiresAt = Date.now() + expiresInHours * 3600 * 1000;
  const payload = {
    type: 'EMERGENCY_BREAK_GLASS',
    patientId,
    doctorId,
    reason,
    issuedAt: Date.now(),
    expiresAt,
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const encrypted = encrypt(payload);
  return {
    emergencyToken: encrypted.combined,
    expiresAt: new Date(expiresAt).toISOString(),
    patientId,
    doctorId,
    reason,
  };
}

module.exports = {
  encrypt,
  decrypt,
  generateTotpSecret,
  generateTotpToken,
  verifyTotpToken,
  generateEmergencyRecoveryCodes,
  generateEmergencyAccessToken,
};
