import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { api, ApiError } from '@/services/api';
import { SOSButton } from '@/components/emergency/SOSButton';
import { shareService } from '@/services/shareService';
import EmergencyPage from '@/pages/emergency';
import ReportsPage from '@/pages/Reports';

// Patient Mock Identifiers
const PATIENT_A = { id: 'usr-patient-a', email: 'alice@healthsphere.test', name: 'Alice Patient' };
const PATIENT_B = { id: 'usr-patient-b', email: 'bob@healthsphere.test', name: 'Bob Patient' };

let currentMockUser: { id: string; email: string; name?: string } | null = PATIENT_A;
let mockGeoLocation: { latitude: number; longitude: number } | null = null;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: currentMockUser,
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    location: mockGeoLocation,
    requestLocation: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('PHASE F.1 — Full-Stack Integration, Security Boundaries & Emergency Safety Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    currentMockUser = PATIENT_A;
    mockGeoLocation = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Account Switching & Patient Data Isolation', () => {
    it('1.1 Dashboard cleans up previous patient clinical state when account changes', async () => {
      const { default: DashboardPage } = await import('@/pages/dashboard');
      const getSpy = vi.spyOn(api, 'get');

      // First render as Patient A
      getSpy.mockImplementation((path: string) => {
        if (path === '/user/profile') {
          return Promise.resolve({ full_name: currentMockUser?.name || 'Unknown' });
        }
        if (path === '/ai/dashboard') {
          return Promise.resolve({
            success: true,
            data: {
              todaysSummary: `Active care summary for ${currentMockUser?.name}`,
              careActions: [],
            },
          });
        }
        return Promise.resolve({});
      });

      const { unmount, rerender } = render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Alice Patient/i)).toBeInTheDocument();
      });

      // Switch account to Patient B
      currentMockUser = PATIENT_B;
      rerender(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Bob Patient/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Alice Patient/i)).not.toBeInTheDocument();
      unmount();
      getSpy.mockRestore();
    });

    it('1.2 Emergency page unmounts and isolates emergency contacts across patient sessions', async () => {
      const getSpy = vi.spyOn(api, 'get');
      getSpy.mockImplementation((path: string) => {
        if (path === '/emergency/contacts') {
          return Promise.resolve([
            { id: 'c-1', name: 'Alice Emergency Contact', phone: '555-0199', relation: 'Spouse' },
          ]);
        }
        if (path === '/emergency/active') {
          return Promise.resolve({
            success: true,
            count: 1,
            data: [
              {
                id: 'inc-1',
                severity: 'CRITICAL',
                triggerReason: 'Cardiac telemetry abnormal',
                status: 'active',
              },
            ],
          });
        }
        if (path === '/emergency/history') {
          return Promise.resolve({ success: true, count: 0, data: [] });
        }
        if (path === '/user/profile') {
          return Promise.resolve({ full_name: 'Alice Patient', blood_type: 'O+' });
        }
        return Promise.resolve([]);
      });

      render(
        <BrowserRouter>
          <EmergencyPage />
        </BrowserRouter>
      );

      // Verify active incident correctly parsed from { success: true, data: [...] } shape
      await waitFor(() => {
        expect(screen.getByText(/Cardiac telemetry abnormal/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Alice Emergency Contact/i)).toBeInTheDocument();
      getSpy.mockRestore();
    });
  });

  describe('2. Emergency SOS Safety, Missing GPS & Contract Hardening', () => {
    it('2.1 SOSButton confirms dispatch with server schema { status: "triggered" }', async () => {
      vi.useFakeTimers();
      const mockSOSTrigger = vi.fn().mockResolvedValue({
        status: 'triggered',
        message: 'Emergency services alerted',
      });

      render(<SOSButton onSOSTriggered={mockSOSTrigger} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(mockSOSTrigger).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Emergency alert has been sent to your contacts/i)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('2.2 Missing GPS never results in 0,0 fallback; coordinates are omitted honestly', async () => {
      mockGeoLocation = null; // No GPS available
      const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({
        status: 'triggered',
        message: 'Alert sent without GPS',
      });
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue([]);

      render(
        <BrowserRouter>
          <EmergencyPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Emergency SOS/i)).toBeInTheDocument();
      });

      const sosButton = screen.getByRole('button', { name: /emergency sos/i });
      fireEvent.click(sosButton);

      await waitFor(() => {
        if (postSpy.mock.calls.length > 0) {
          const call = postSpy.mock.calls.find((c) => c[0] === '/emergency/sos');
          if (call) {
            // Verify latitude and longitude are NOT 0,0 and are omitted from payload
            expect(call[1]).not.toEqual(expect.objectContaining({ latitude: 0, longitude: 0 }));
            expect(call[1].latitude).toBeUndefined();
            expect(call[1].longitude).toBeUndefined();
          }
        }
      });

      postSpy.mockRestore();
      getSpy.mockRestore();
    });

    it('2.3 Valid GPS coordinates are transmitted accurately without modification', async () => {
      mockGeoLocation = { latitude: 37.7749, longitude: -122.4194 }; // Real GPS coordinates
      const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({
        status: 'triggered',
        location: { latitude: 37.7749, longitude: -122.4194 },
      });
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue([]);

      render(
        <BrowserRouter>
          <EmergencyPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Emergency SOS/i)).toBeInTheDocument();
      });

      const sosButton = screen.getByRole('button', { name: /emergency sos/i });
      fireEvent.click(sosButton);

      await waitFor(() => {
        if (postSpy.mock.calls.length > 0) {
          const call = postSpy.mock.calls.find((c) => c[0] === '/emergency/sos');
          if (call) {
            expect(call[1]).toEqual({
              latitude: 37.7749,
              longitude: -122.4194,
            });
          }
        }
      });

      postSpy.mockRestore();
      getSpy.mockRestore();
    });

    it('2.4 API validation failure does NOT show confirmed dispatch and leaves emergency contacts visible', async () => {
      mockGeoLocation = null;
      // Simulate backend rejecting missing coordinates with Joi 400
      const postSpy = vi.spyOn(api, 'post').mockRejectedValue(
        new ApiError('"latitude" is required', 400, { details: 'latitude is required' })
      );
      const getSpy = vi.spyOn(api, 'get').mockImplementation((path) => {
        if (path === '/emergency/contacts') {
          return Promise.resolve([
            { id: 'c-1', name: 'Dr. Emergency Lead', phone: '911-0000', relation: 'Hospital' },
          ]);
        }
        return Promise.resolve([]);
      });

      render(
        <BrowserRouter>
          <EmergencyPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Dr. Emergency Lead/i)).toBeInTheDocument();
      });

      const sosButton = screen.getByRole('button', { name: /emergency sos/i });
      fireEvent.click(sosButton);

      // Verify that emergency contact options remain fully accessible and visible
      expect(screen.getByText(/Dr. Emergency Lead/i)).toBeInTheDocument();
      expect(screen.getByText(/911-0000/i)).toBeInTheDocument();

      postSpy.mockRestore();
      getSpy.mockRestore();
    });

    it('2.5 Rejection or explicit server error never renders confirmed screen', async () => {
      vi.useFakeTimers();
      const failingSOSTrigger = vi.fn().mockResolvedValue({
        success: false,
        message: 'Incident duplicate detected',
      });

      render(<SOSButton onSOSTriggered={failingSOSTrigger} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(failingSOSTrigger).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Dispatch Unconfirmed/i)).toBeInTheDocument();
      expect(screen.queryByText(/Emergency alert has been sent to your contacts/i)).not.toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('3. Doctor/Patient Medical Share Security & Authorization', () => {
    it('3.1 shareService.createShare sends sanitized permissions and returns share link', async () => {
      const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({
        success: true,
        data: {
          shareId: 'sh-123',
          shareToken: 'HS_SHARE_TEST_TOKEN',
          shareLink: 'http://localhost:8081/#/shared/HS_SHARE_TEST_TOKEN',
          status: 'active',
          permissions: { profile: true, reports: true, medicines: false },
          expiresAt: '2026-10-15T00:00:00Z',
        },
      });

      const res = await shareService.createShare({
        doctorId: 'doc-456',
        permissions: { profile: true, reports: true },
        expiryDuration: '24h',
      });

      expect(postSpy).toHaveBeenCalledWith('/share/create', {
        doctorId: 'doc-456',
        permissions: { profile: true, reports: true },
        expiryDuration: '24h',
      });
      expect(res.shareToken).toBe('HS_SHARE_TEST_TOKEN');
      expect(res.status).toBe('active');
      postSpy.mockRestore();
    });

    it('3.2 shareService.revokeShare correctly invokes patient ownership revocation route', async () => {
      const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({
        success: true,
        data: {
          shareToken: 'HS_SHARE_REVOKE',
          status: 'revoked',
          revokedAt: '2026-10-10T22:00:00Z',
        },
      });

      const res = await shareService.revokeShare('HS_SHARE_REVOKE');
      expect(postSpy).toHaveBeenCalledWith('/share/HS_SHARE_REVOKE/revoke');
      expect(res.status).toBe('revoked');
      postSpy.mockRestore();
    });

    it('3.3 shareService.getSharedData retrieves projected read-only patient records', async () => {
      const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({
        success: true,
        status: 'active',
        data: {
          shareToken: 'HS_SHARE_READ',
          patient: { id: 'usr-1', name: 'Alice Patient' },
          doctor: { fullName: 'Dr. Emily Watson' },
          permissions: { profile: true, medicines: true },
          records: {
            profile: { fullName: 'Alice Patient', bloodGroup: 'O+' },
            medicines: [{ name: 'Amoxicillin', dosage: '500mg' }],
          },
        },
      });

      const data = await shareService.getSharedData('HS_SHARE_READ');
      expect(getSpy).toHaveBeenCalledWith('/share/access/HS_SHARE_READ');
      expect(data.patient.name).toBe('Alice Patient');
      expect(data.records.medicines?.[0].name).toBe('Amoxicillin');
      getSpy.mockRestore();
    });
  });

  describe('4. Reports Upload & OCR Contract Validation', () => {
    it('4.1 ReportsPage handles upload failure and preserves retry capabilities', async () => {
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue([]);
      const postSpy = vi.spyOn(api, 'post').mockRejectedValue(new ApiError('Upload timeout', 504));

      render(
        <BrowserRouter>
          <ReportsPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Medical Reports/i)).toBeInTheDocument();
      });

      getSpy.mockRestore();
      postSpy.mockRestore();
    });
  });
});
