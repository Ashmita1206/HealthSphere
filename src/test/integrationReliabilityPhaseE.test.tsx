import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { api, ApiError, tokenStore, refreshTokenStore } from '@/services/api';
import { SOSButton } from '@/components/emergency/SOSButton';
import AppointmentsPage from '@/pages/appointments';
import MedicinesPage from '@/pages/medicines';
import ReportsPage from '@/pages/Reports';

// Stable user object to prevent infinite re-render loops from reference changes
const MOCK_USER = { id: 'usr-100', email: 'patient@healthsphere.test', name: 'Neeraj Patient' };

// Mock contexts and hooks
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: MOCK_USER,
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/context/AnalyticsContext', () => ({
  useAnalytics: () => ({
    dashboardData: {
      healthScore: { score: 85, level: 'Optimal Standing' },
      recentInsights: [],
    },
    loading: false,
  }),
}));

vi.mock('@/context/MedicalProfileContext', () => ({
  useMedicalProfile: () => ({
    profile: { id: 'med-100', blood_type: 'O+' },
  }),
}));

vi.mock('@/context/ShareContext', () => ({
  useMedicalShare: () => ({
    shares: { active: [], expired: [], revoked: [], all: [] },
    loading: false,
    activeCount: 0,
    fetchShares: vi.fn(),
  }),
}));

vi.mock('@/context/DoctorContext', () => ({
  useDoctor: () => ({
    doctors: [],
    loading: false,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('PHASE E — API Reliability, Patient Workflows & Production Hardening Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Shared API Client & Error Contract Hardening', () => {
    it('1.1 ApiError class accurately retains HTTP status, message, and error payload', () => {
      const err = new ApiError('Forbidden resource', 403, { code: 'E_FORBIDDEN' }, 'Forbidden');
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('ApiError');
      expect(err.status).toBe(403);
      expect(err.message).toBe('Forbidden resource');
      expect((err.data as any).code).toBe('E_FORBIDDEN');
      expect(err.statusText).toBe('Forbidden');
    });

    it('1.2 tokenStore and refreshTokenStore sanitize null and undefined string literals', () => {
      localStorage.setItem('healthsphere_token', 'null');
      expect(tokenStore.get()).toBeNull();

      localStorage.setItem('healthsphere_token', 'undefined');
      expect(tokenStore.get()).toBeNull();

      localStorage.setItem('healthsphere_token', '  valid-jwt-token  ');
      expect(tokenStore.get()).toBe('valid-jwt-token');

      localStorage.setItem('healthsphere_refresh_token', 'null');
      expect(refreshTokenStore.get()).toBeNull();

      localStorage.setItem('healthsphere_refresh_token', 'valid-refresh-token');
      expect(refreshTokenStore.get()).toBe('valid-refresh-token');
    });

    it('1.3 api.get and api.post accept optional RequestInit parameters including signal', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true }),
      } as Response);

      const controller = new AbortController();
      await api.get('/test/endpoint', { signal: controller.signal, headers: { 'X-Custom': '1' } });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/test/endpoint'),
        expect.objectContaining({
          signal: controller.signal,
          headers: expect.objectContaining({ 'X-Custom': '1' }),
        })
      );
      fetchSpy.mockRestore();
    });

    it('1.4 Empty response body (status 204 or empty string) safely returns undefined without JSON error', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => '',
      } as Response);

      const result = await api.delete('/test/delete-item');
      expect(result).toBeUndefined();
      fetchSpy.mockRestore();
    });
  });

  describe('2. Appointments Workflow: Failure Recovery & Submission Idempotency', () => {
    it('2.1 Renders honest error recovery card when fetching appointments fails, avoiding false empty state', async () => {
      // Mock all api.get calls: first one (appointments) fails, subsequent ones return empty
      const getSpy = vi.spyOn(api, 'get').mockRejectedValue(new Error('500 Internal Server Error'));

      render(
        <BrowserRouter>
          <AppointmentsPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('appointments-error-state')).toBeInTheDocument();
      });

      expect(screen.getByText(/Unable to Load Appointments/i)).toBeInTheDocument();
      expect(screen.queryByText(/No appointments found/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
      getSpy.mockRestore();
    });

    it('2.2 Clicking Retry Connection re-initiates fetch and renders appointments upon success', async () => {
      const getSpy = vi.spyOn(api, 'get')
        .mockRejectedValueOnce(new Error('Network disconnected'))
        .mockResolvedValue([
          {
            id: 'apt-1',
            doctor_name: 'Dr. Sarah Connor',
            specialty: 'Cardiology',
            hospital: 'Metro Hospital',
            appointment_date: '2026-10-15T10:00:00Z',
            status: 'confirmed',
          },
        ]);

      render(
        <BrowserRouter>
          <AppointmentsPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('appointments-error-state')).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /Retry Connection/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Connor')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('appointments-error-state')).not.toBeInTheDocument();
      getSpy.mockRestore();
    });
  });

  describe('3. Prescriptions Workflow: Honest Failure & Duplicate Prevention', () => {
    it('3.1 Renders honest error recovery state when medicines endpoint fails', async () => {
      // Mock all api.get calls to reject so no unmocked calls hit the network
      const getSpy = vi.spyOn(api, 'get').mockRejectedValue(new Error('Gateway Timeout 504'));

      render(
        <BrowserRouter>
          <MedicinesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('medicines-error-state')).toBeInTheDocument();
      });

      expect(screen.getByText(/Unable to Load Prescriptions/i)).toBeInTheDocument();
      expect(screen.queryByText(/No Active Prescriptions/i)).not.toBeInTheDocument();
      getSpy.mockRestore();
    });

    it('3.2 Re-initiating fetch via Retry restores medicine cabinet on network recovery', async () => {
      const getSpy = vi.spyOn(api, 'get')
        .mockRejectedValueOnce(new Error('Connection dropped'))
        .mockResolvedValue([
          {
            id: 'med-1',
            name: 'Atorvastatin',
            dosage: '20mg',
            frequency: 'Daily',
            isActive: true,
          },
        ]);

      render(
        <BrowserRouter>
          <MedicinesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('medicines-error-state')).toBeInTheDocument();
      });

      // Use within() to scope button query to the error container, avoiding calendar button ambiguity
      const errorContainer = screen.getByTestId('medicines-error-state');
      const retryBtn = within(errorContainer).getByRole('button', { name: /Retry Connection/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Atorvastatin')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('medicines-error-state')).not.toBeInTheDocument();
      getSpy.mockRestore();
    });
  });

  describe('4. Medical Reports Workflow: Failure Recovery', () => {
    it('4.1 Reports page displays error recovery state when reports query fails', async () => {
      const getSpy = vi.spyOn(api, 'get').mockRejectedValue(new Error('Report service unavailable'));

      render(
        <BrowserRouter>
          <ReportsPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to Load Medical Reports/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/No Medical Reports Found/i)).not.toBeInTheDocument();
      getSpy.mockRestore();
    });
  });

  describe('5. Emergency SOS: Honest Server Confirmation & Failure Protection', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('5.1 SOSButton renders Dispatch Unconfirmed and does NOT display false success when mutation fails', async () => {
      vi.useFakeTimers();
      const failingSOSTrigger = vi.fn().mockRejectedValue(new Error('500 Emergency Service Unreachable'));

      render(<SOSButton onSOSTriggered={failingSOSTrigger} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Advance through 5 seconds of countdown one tick at a time for React 18 state batching
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      // Allow the rejected promise to propagate through microtask queue
      await act(async () => {
        // Flush microtasks by yielding to the event loop
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(failingSOSTrigger).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Dispatch Unconfirmed/i)).toBeInTheDocument();
      expect(screen.queryByText(/Emergency alert has been sent to your contacts/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry SOS/i })).toBeInTheDocument();
    });

    it('5.2 SOSButton renders confirmed success screen only when mutation confirms success', async () => {
      vi.useFakeTimers();
      const successfulSOSTrigger = vi.fn().mockResolvedValue({ success: true, incidentId: 'inc-99' });

      render(<SOSButton onSOSTriggered={successfulSOSTrigger} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Advance through 5 seconds of countdown one tick at a time
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      // Allow the resolved promise to propagate
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(successfulSOSTrigger).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Emergency alert has been sent to your contacts/i)).toBeInTheDocument();
    });
  });

  describe('6. Dashboard State: Error Recovery Banner & Resilience', () => {
    it('6.1 Dashboard renders error sync banner when dashboard AI intelligence fails', async () => {
      // Dynamically import the dashboard and its AI dependency to mock them properly
      const { aiService } = await import('@/services/ai/aiService');

      const logicSpy = vi.spyOn(aiService, 'getDashboardLogic').mockRejectedValueOnce(new Error('AI Service offline'));
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ full_name: 'Neeraj Patient' });

      // Lazy import dashboard to ensure mocks are in place
      const { default: DashboardPage } = await import('@/pages/dashboard');

      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-error-banner')).toBeInTheDocument();
      }, { timeout: 10000 });

      expect(screen.getByText(/Could not retrieve AI health intelligence summary/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Sync/i })).toBeInTheDocument();

      logicSpy.mockRestore();
      getSpy.mockRestore();
    }, 60000);
  });
});
