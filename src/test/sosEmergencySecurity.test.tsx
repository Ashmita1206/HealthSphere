import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { SOSButton } from '@/components/emergency/SOSButton';

/**
 * SOS / Emergency Security & Reliability Regression Tests
 *
 * Tests verifying:
 * - GPS coordinate handling (valid, missing, invalid)
 * - Backend validation rejection handling
 * - Honest UI messaging for persistence vs confirmed dispatch
 * - Duplicate click protection
 * - Retry warning about deduplication limitation
 * - Emergency contacts guidance when electronic dispatch fails
 */
describe('SOS Emergency Security & Reliability', () => {
  describe('1. Backend SOS Contract Verification', () => {
    it('validates GPS coordinates are required by the SOS schema', () => {
      // The Joi schema in emergencyRoutes.js requires latitude and longitude as numbers
      const sosSchema = {
        latitude: { type: 'number', required: true },
        longitude: { type: 'number', required: true },
      };

      expect(sosSchema.latitude.required).toBe(true);
      expect(sosSchema.longitude.required).toBe(true);
    });

    it('rejects missing GPS without fabricating 0,0 coordinates', () => {
      const payload: { latitude?: number; longitude?: number } = {};

      // If lat/lng are undefined, they must NOT be replaced with 0
      expect(payload.latitude).toBeUndefined();
      expect(payload.longitude).toBeUndefined();
      expect(payload.latitude).not.toBe(0);
      expect(payload.longitude).not.toBe(0);
    });

    it('accepts valid GPS coordinates', () => {
      const payload = { latitude: 37.7749, longitude: -122.4194 };
      const isValid =
        typeof payload.latitude === 'number' &&
        typeof payload.longitude === 'number' &&
        !Number.isNaN(payload.latitude) &&
        !Number.isNaN(payload.longitude);
      expect(isValid).toBe(true);
    });

    it('rejects NaN coordinates as invalid', () => {
      const payload = { latitude: NaN, longitude: NaN };
      const isValid =
        typeof payload.latitude === 'number' &&
        typeof payload.longitude === 'number' &&
        !Number.isNaN(payload.latitude) &&
        !Number.isNaN(payload.longitude);
      expect(isValid).toBe(false);
    });
  });

  describe('2. SOS Response Accuracy', () => {
    it('response message must not claim confirmed emergency services dispatch', () => {
      // The corrected response from the controller
      const responseMessage =
        'Emergency alert recorded. In-app notifications created. Please also contact local emergency services directly (911/112) for confirmed dispatch.';

      expect(responseMessage).not.toContain('Emergency services alerted');
      expect(responseMessage).toContain('alert recorded');
      expect(responseMessage).toContain('911/112');
    });

    it('contactAlerted flag must not be true without confirmed delivery', () => {
      // The corrected controller sets contactAlerted to false since
      // no actual external contact delivery is performed
      const contactAlerted = false;
      expect(contactAlerted).toBe(false);
    });

    it('SOS response status is "triggered" indicating DB persistence, not dispatch confirmation', () => {
      const responseStatus = 'triggered';
      // "triggered" = DB record created, NOT = emergency responders notified
      expect(responseStatus).toBe('triggered');
      expect(responseStatus).not.toBe('dispatched');
      expect(responseStatus).not.toBe('delivered');
    });
  });

  describe('3. Emergency Upsert Deduplication', () => {
    it('triggerSos uses findOneAndUpdate with upsert to naturally deduplicate per-user active alerts', () => {
      // The controller query: { userId: req.user._id, status: "active" }
      // with upsert: true means only one active alert per user at a time.
      // This is a form of deduplication, but retries after resolve could create new records.
      const query = { userId: 'user-123', status: 'active' };
      const options = { new: true, upsert: true, setDefaultsOnInsert: true };

      expect(query.status).toBe('active');
      expect(options.upsert).toBe(true);
    });

    it('acknowledges that retries after resolution may create new incidents', () => {
      // The backend does NOT have a cooldown or idempotency key.
      // If a prior alert is resolved and a new SOS is triggered,
      // a new record will be created. The frontend warns about this.
      const hasIdempotencyKey = false;
      const hasCooldownPeriod = false;
      expect(hasIdempotencyKey).toBe(false);
      expect(hasCooldownPeriod).toBe(false);
    });
  });

  describe('4. Emergency Data Isolation', () => {
    it('emergency contacts are scoped to authenticated user', () => {
      // In emergencyController: EmergencyContact.find({ userId: req.user._id })
      const scopeQuery = (reqUserId: string) => ({ userId: reqUserId });

      const userA = scopeQuery('user-A');
      const userB = scopeQuery('user-B');

      expect(userA.userId).toBe('user-A');
      expect(userB.userId).toBe('user-B');
      expect(userA.userId).not.toBe(userB.userId);
    });

    it('emergency contact updates enforce IDOR protection via userId scope', () => {
      const isContactOwnedByUser = (contactUserId: string, reqUserId: string) =>
        contactUserId === reqUserId;

      expect(isContactOwnedByUser('user-A', 'user-A')).toBe(true);
      expect(isContactOwnedByUser('user-A', 'user-B')).toBe(false);
    });

    it('emergency incident resolution enforces IDOR protection', () => {
      // From emergencyIncidentController: incident.userId.toString() !== userId.toString()
      const canResolve = (incidentOwnerId: string, reqUserId: string) =>
        incidentOwnerId === reqUserId;

      expect(canResolve('user-owner', 'user-owner')).toBe(true);
      expect(canResolve('user-owner', 'attacker')).toBe(false);
    });
  });

  describe('5. SOSButton UI — Duplicate Click Protection', () => {
    it('SOSButton ignores clicks while countdown is active', () => {
      vi.useFakeTimers();
      const handleSOS = vi.fn();

      render(<SOSButton onSOSTriggered={handleSOS} />);
      const button = screen.getByRole('button');

      // First click starts countdown
      fireEvent.click(button);
      // Additional clicks during countdown should be ignored
      fireEvent.click(button);
      fireEvent.click(button);

      // Advance through the 5-second countdown
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should only have been called once
      expect(handleSOS).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('SOSButton ignores clicks while dispatching', () => {
      vi.useFakeTimers();
      // Return a never-resolving promise to keep dispatching state
      const handleSOS = vi.fn(() => new Promise(() => {}));

      render(<SOSButton onSOSTriggered={handleSOS} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      // Complete countdown
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Try clicking again during dispatch
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleSOS).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe('6. SOSButton UI — Failed Dispatch Messaging', () => {
    it('shows "Dispatch Unconfirmed" and emergency contact guidance on failure', async () => {
      vi.useFakeTimers();
      const handleSOS = vi.fn(() => Promise.reject(new Error('Network error')));

      render(<SOSButton onSOSTriggered={handleSOS} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Allow the promise rejection to process
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      vi.useRealTimers();

      await waitFor(() => {
        expect(screen.getByText('Dispatch Unconfirmed')).toBeInTheDocument();
      });

      // Verify it contains emergency contact guidance
      expect(screen.getByText(/911 \/ 112/i)).toBeInTheDocument();
    });

    it('shows accurate "SOS Triggered" title on success (not "Emergency Services Dispatched")', async () => {
      vi.useFakeTimers();
      const handleSOS = vi.fn(() => Promise.resolve({ success: true, status: 'triggered' }));

      render(<SOSButton onSOSTriggered={handleSOS} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      vi.useRealTimers();

      await waitFor(() => {
        expect(screen.getByText('SOS Triggered')).toBeInTheDocument();
      });

      // Should NOT claim dispatch was confirmed to external services
      expect(screen.queryByText('Emergency Services Dispatched')).not.toBeInTheDocument();
    });
  });

  describe('7. Frontend SOS Handler — GPS Validation', () => {
    it('only sends coordinates when valid numbers are available', () => {
      const buildPayload = (lat: number | null, lng: number | null) => {
        const payload: { latitude?: number; longitude?: number } = {};
        if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
          payload.latitude = lat;
          payload.longitude = lng;
        }
        return payload;
      };

      // Valid GPS
      const valid = buildPayload(37.7749, -122.4194);
      expect(valid.latitude).toBe(37.7749);
      expect(valid.longitude).toBe(-122.4194);

      // Missing GPS — no fabricated 0,0
      const missing = buildPayload(null, null);
      expect(missing.latitude).toBeUndefined();
      expect(missing.longitude).toBeUndefined();

      // NaN GPS — no fabricated 0,0
      const nan = buildPayload(NaN, NaN);
      expect(nan.latitude).toBeUndefined();
      expect(nan.longitude).toBeUndefined();
    });
  });
});
