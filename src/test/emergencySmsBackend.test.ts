import { describe, it, expect, vi, beforeEach } from 'vitest';

const twilioService = require('../../server/services/twilioMessagingService');

describe('Twilio Messaging Service & Emergency SMS Backend Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
    delete process.env.TWILIO_STATUS_CALLBACK_URL;
  });

  describe('formatE164', () => {
    it('validates and preserves standard E.164 phone numbers', () => {
      const res = twilioService.formatE164('+15551234567');
      expect(res.valid).toBe(true);
      expect(res.e164).toBe('+15551234567');
    });

    it('converts 10-digit local US numbers to E.164 (+1...)', () => {
      const res = twilioService.formatE164('(555) 234-5678');
      expect(res.valid).toBe(true);
      expect(res.e164).toBe('+15552345678');
    });

    it('converts 11-digit numbers starting with 1 to E.164', () => {
      const res = twilioService.formatE164('1-555-345-6789');
      expect(res.valid).toBe(true);
      expect(res.e164).toBe('+15553456789');
    });

    it('rejects invalid or too short phone numbers', () => {
      const res1 = twilioService.formatE164('123');
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain('Invalid phone number format');

      const res2 = twilioService.formatE164('');
      expect(res2.valid).toBe(false);
      expect(res2.error).toContain('Phone number is required');
    });
  });

  describe('buildEmergencyMessageText (Non-PHI Compliance)', () => {
    it('generates urgent SOS message without exposing Protected Health Information', () => {
      const msg = twilioService.buildEmergencyMessageText({
        userName: 'Alex Johnson',
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(msg).toContain('HEALTHSPHERE SOS ALERT');
      expect(msg).toContain('Alex Johnson has triggered an urgent emergency signal');
      expect(msg).toContain('https://maps.google.com/?q=37.77490,-122.41940');
      expect(msg).toContain('112 / 911');

      // PHI verification: Ensure no medical diagnosis, disease, allergy, or blood group is exposed in SMS
      expect(msg).not.toContain('blood');
      expect(msg).not.toContain('allergy');
      expect(msg).not.toContain('diagnosis');
      expect(msg).not.toContain('hypertension');
    });

    it('gracefully handles missing coordinates in message body', () => {
      const msg = twilioService.buildEmergencyMessageText({
        userName: 'Jane Doe',
      });
      expect(msg).toContain('GPS coordinates unavailable');
    });
  });

  describe('getTwilioConfig', () => {
    it('returns isConfigured: false when environment variables are empty', () => {
      const config = twilioService.getTwilioConfig();
      expect(config.isConfigured).toBe(false);
    });

    it('returns isConfigured: false when placeholder values are used', () => {
      process.env.TWILIO_ACCOUNT_SID = 'your_account_sid';
      process.env.TWILIO_AUTH_TOKEN = 'your_auth_token';
      process.env.TWILIO_PHONE_NUMBER = '+15550000000';
      const config = twilioService.getTwilioConfig();
      expect(config.isConfigured).toBe(false);
    });

    it('returns isConfigured: true when valid Twilio credentials are provided', () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC_TEST_MOCK_ACCOUNT_SID_VALID_99';
      process.env.TWILIO_AUTH_TOKEN = 'valid_auth_token_secret_123';
      process.env.TWILIO_PHONE_NUMBER = '+15551234567';
      const config = twilioService.getTwilioConfig();
      expect(config.isConfigured).toBe(true);
      expect(config.accountSid).toBe('AC_TEST_MOCK_ACCOUNT_SID_VALID_99');
    });
  });

  describe('dispatchEmergencySmsBatch', () => {
    it('returns unconfigured status records when Twilio credentials are missing', async () => {
      const contacts = [
        { _id: 'c1', name: 'Dr. Evelyn Reed', phone: '+15550101' },
        { _id: 'c2', name: 'Mark Johnson', phone: '+15550102' },
      ];

      const res = await twilioService.dispatchEmergencySmsBatch({
        contacts,
        userName: 'Alex Johnson',
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(res.isConfigured).toBe(false);
      expect(res.totalAttempted).toBe(2);
      expect(res.unconfiguredCount).toBe(2);
      expect(res.queuedCount).toBe(0);
      expect(res.records[0].status).toBe('unconfigured');
      expect(res.records[0].contactName).toBe('Dr. Evelyn Reed');
      expect(res.records[0].errorMessage).toContain('Twilio credentials not configured');
    });

    it('dispatches SMS through Twilio REST API when credentials are provided', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC_TEST_MOCK_ACCOUNT_SID_VALID_99';
      process.env.TWILIO_AUTH_TOKEN = 'mock_auth_token';
      process.env.TWILIO_PHONE_NUMBER = '+15551234567';

      const mockFetch = vi.spyOn(globalThis, 'fetch').mockImplementation((() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({
            sid: 'SM_TEST_MOCK_SID_123',
            to: '+15550101',
            status: 'queued',
            date_created: new Date().toISOString(),
          }),
        } as Response)) as any);

      try {
        const contacts = [{ _id: 'c1', name: 'Dr. Evelyn Reed', phone: '+15551234567' }];
        const res = await twilioService.dispatchEmergencySmsBatch({
          contacts,
          userName: 'Alex Johnson',
          latitude: 37.7749,
          longitude: -122.4194,
        });

        expect(res.isConfigured).toBe(true);
        expect(res.records[0].status).toBe('queued');
        expect(res.records[0].messageSid).toBe('SM_TEST_MOCK_SID_123');
        expect(res.queuedCount).toBe(1);
        expect(mockFetch).toHaveBeenCalled();

        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toBe('https://api.twilio.com/2010-04-01/Accounts/AC_TEST_MOCK_ACCOUNT_SID_VALID_99/Messages.json');
        expect(options.method).toBe('POST');
        expect(options.headers.Authorization).toContain('Basic ');
      } finally {
        mockFetch.mockRestore();
      }
    });

    it('tracks provider API errors honestly without fake success', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC_TEST_MOCK_ACCOUNT_SID_VALID_99';
      process.env.TWILIO_AUTH_TOKEN = 'mock_auth_token';
      process.env.TWILIO_PHONE_NUMBER = '+15551234567';

      const mockFetch = vi.spyOn(globalThis, 'fetch').mockImplementation((() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({
            code: 21211,
            message: 'The \'To\' number is not a valid phone number.',
          }),
        } as Response)) as any);

      try {
        const contacts = [{ _id: 'c1', name: 'Invalid Contact', phone: '+15559999999' }];
        const res = await twilioService.dispatchEmergencySmsBatch({
          contacts,
          userName: 'Alex Johnson',
          latitude: 37.7749,
          longitude: -122.4194,
        });

        expect(res.failedCount).toBe(1);
        expect(res.queuedCount).toBe(0);
        expect(res.records[0].status).toBe('failed');
        expect(res.records[0].errorCode).toBe('21211');
        expect(res.records[0].errorMessage).toContain('not a valid SMS recipient');
      } finally {
        mockFetch.mockRestore();
      }
    });

    it('translates Twilio trial restriction code 21608 into clear actionable error', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC_TEST_MOCK_ACCOUNT_SID_VALID_99';
      process.env.TWILIO_AUTH_TOKEN = 'mock_auth_token';
      process.env.TWILIO_PHONE_NUMBER = '+15551234567';

      const mockFetch = vi.spyOn(globalThis, 'fetch').mockImplementation((() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({
            code: 21608,
            message: 'The number +15559876543 is unverified. Trial accounts cannot send messages to unverified numbers.',
          }),
        } as Response)) as any);

      try {
        const contacts = [{ _id: 'c1', name: 'Unverified Trial Contact', phone: '+15559876543' }];
        const res = await twilioService.dispatchEmergencySmsBatch({
          contacts,
          userName: 'Alex Johnson',
          latitude: 37.7749,
          longitude: -122.4194,
        });

        expect(res.failedCount).toBe(1);
        expect(res.records[0].status).toBe('failed');
        expect(res.records[0].errorCode).toBe('21608');
        expect(res.records[0].errorMessage).toContain('is not a verified Caller ID');
        expect(res.records[0].errorMessage).toContain('Twilio Trial Restriction');
      } finally {
        mockFetch.mockRestore();
      }
    });

    it('formats authorized test alerts with [TEST ALERT] prefix and records isTestMode', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC_TEST_MOCK_ACCOUNT_SID_VALID_99';
      process.env.TWILIO_AUTH_TOKEN = 'mock_auth_token';
      process.env.TWILIO_PHONE_NUMBER = '+15551234567';

      let sentBody = '';
      const mockFetch = vi.spyOn(globalThis, 'fetch').mockImplementation(((url: string, options: any) => {
        const params = new URLSearchParams(typeof options.body === 'string' ? options.body : '');
        sentBody = params.get('Body') || '';
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({
            sid: 'SM_TEST_VALID_SID',
            status: 'queued',
          }),
        } as Response);
      }) as any);

      try {
        const contacts = [{ _id: 'c1', name: 'Authorized Test Phone', phone: '+15551234567' }];
        const res = await twilioService.dispatchEmergencySmsBatch({
          contacts,
          userName: 'Alex Johnson',
          latitude: 37.7749,
          longitude: -122.4194,
          isTestMode: true,
        });

        expect(res.isTestMode).toBe(true);
        expect(res.records[0].status).toBe('queued');
        expect(sentBody).toContain('[TEST ALERT]');
        expect(sentBody).toContain('This is an authorized TEST signal');
      } finally {
        mockFetch.mockRestore();
      }
    });
  });

  describe('validateTwilioWebhookSignature', () => {
    it('validates authentic webhook requests signed with auth token', () => {
      const crypto = require('crypto');
      const authToken = 'secret_auth_token_xyz_123';
      const url = 'https://healthsphere.org/api/emergency/twilio/status-callback';
      const params = {
        MessageSid: 'SM123456789',
        MessageStatus: 'delivered',
      };

      // Construct expected signature as Twilio does
      const sortedKeys = Object.keys(params).sort();
      let data = url;
      for (const key of sortedKeys) {
        data += `${key}${params[key]}`;
      }
      const validSignature = crypto
        .createHmac('sha1', authToken)
        .update(Buffer.from(data, 'utf-8'))
        .digest('base64');

      const isValid = twilioService.validateTwilioWebhookSignature({
        url,
        params,
        signature: validSignature,
        authToken,
      });

      expect(isValid).toBe(true);
    });

    it('rejects tampered signatures or mismatched auth tokens', () => {
      const isValid = twilioService.validateTwilioWebhookSignature({
        url: 'https://healthsphere.org/api/emergency/twilio/status-callback',
        params: { MessageSid: 'SM123456789' },
        signature: 'invalid_forged_signature_base64==',
        authToken: 'secret_auth_token_xyz_123',
      });

      expect(isValid).toBe(false);
    });

    it('rejects calls with missing signature or missing parameters', () => {
      expect(
        twilioService.validateTwilioWebhookSignature({
          url: 'https://example.com',
          params: {},
          signature: '',
          authToken: 'tok',
        })
      ).toBe(false);

      expect(
        twilioService.validateTwilioWebhookSignature({
          url: '',
          params: {},
          signature: 'sig',
          authToken: 'tok',
        })
      ).toBe(false);
    });
  });
});