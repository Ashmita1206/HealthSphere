import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { api, ApiError, tokenStore } from '@/services/api';
import { SOSButton } from '@/components/emergency/SOSButton';
import EmergencyPage from '@/pages/emergency';
import DashboardPage from '@/pages/dashboard';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useMedicalProfile } from '@/context/MedicalProfileContext';

// Mock Patient User Profiles for Account Switching Tests
const PATIENT_ALICE = { id: 'usr-alice-101', email: 'alice@healthsphere.test', name: 'Alice Smith' };
const PATIENT_BOB = { id: 'usr-bob-202', email: 'bob@healthsphere.test', name: 'Bob Jones' };

let mockCurrentUser: { id: string; email: string; name?: string } | null = PATIENT_ALICE;
let mockGeoLocation: { latitude: number; longitude: number } | null = null;
let toastSpy = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
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
  useToast: () => ({ toast: toastSpy }),
}));

describe('PHASE H — Security Regression, Emergency Lifecycle & Data Isolation Suite (Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockCurrentUser = PATIENT_ALICE;
    mockGeoLocation = null;
    toastSpy = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. SOS Response Contract Validation & Safety', () => {
    it('1.1 SOSButton accepts documented backend response { status: "triggered", incidentId: "..." } as confirmed', async () => {
      vi.useFakeTimers();
      const mockSOSTrigger = vi.fn().mockResolvedValue({
        status: 'triggered',
        incidentId: 'inc-h-999',
        nearestHelp: 'City General Hospital',
      });

      render(<SOSButton onSOSTriggered={mockSOSTrigger} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Advance through 5s countdown
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
      expect(screen.queryByText(/Dispatch Unconfirmed/i)).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    it('1.2 SOSButton rejects undefined, null, arbitrary objects, and false as dispatch confirmation', async () => {
      vi.useFakeTimers();

      const invalidResponses = [
        undefined,
        null,
        false,
        { randomField: true },
        { status: 'pending' },
        { success: false },
      ];

      for (const invalidRes of invalidResponses) {
        const mockSOSTrigger = vi.fn().mockResolvedValue(invalidRes);
        const { unmount } = render(<SOSButton onSOSTriggered={mockSOSTrigger} />);

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
        expect(screen.getByText(/Dispatch Unconfirmed/i)).toBeInTheDocument();
        expect(screen.queryByText(/Emergency alert has been sent to your contacts/i)).not.toBeInTheDocument();

        unmount();
      }

      vi.useRealTimers();
    });

    it('1.3 SOS API rejection or network timeout displays honest unconfirmed failure state with manual emergency advice', async () => {
      vi.useFakeTimers();
      const mockSOSTrigger = vi.fn().mockRejectedValue(new ApiError('504 Gateway Timeout', 504));

      render(<SOSButton onSOSTriggered={mockSOSTrigger} />);

      fireEvent.click(screen.getByRole('button'));

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(mockSOSTrigger).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Dispatch Unconfirmed/i)).toBeInTheDocument();
      expect(screen.getByText(/911 \/ 112/i)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('1.4 Missing geolocation never fabricates 0,0 coordinates in SOS dispatch payload', async () => {
      mockGeoLocation = null;
      const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({
        status: 'triggered',
        incidentId: 'inc-no-gps-1',
      });
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue([]);

      render(
        <BrowserRouter>
          <EmergencyPage />
        </BrowserRouter>
      );

      const sosButton = await screen.findByLabelText(/emergency sos button/i);

      vi.useFakeTimers();
      fireEvent.click(sosButton);

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const call = postSpy.mock.calls.find((c) => c[0] === '/emergency/sos');
      expect(call).toBeDefined();
      if (call) {
        expect(call[1]).toEqual({});
        expect(call[1].latitude).toBeUndefined();
        expect(call[1].longitude).toBeUndefined();
      }

      vi.useRealTimers();
      postSpy.mockRestore();
      getSpy.mockRestore();
    });

    it('1.5 Rapid repeated SOS submissions dispatch at most once while a request is in flight', async () => {
      let resolveFirstCall: (val: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolveFirstCall = resolve;
      });

      const postSpy = vi.spyOn(api, 'post').mockImplementation((path) => {
        if (path === '/emergency/sos') {
          return delayedPromise;
        }
        return Promise.resolve({});
      });
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue([]);

      render(
        <BrowserRouter>
          <EmergencyPage />
        </BrowserRouter>
      );

      const sosButton = await screen.findByLabelText(/emergency sos button/i);

      vi.useFakeTimers();
      fireEvent.click(sosButton);

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      // While initial request is in flight, rapid repeat clicks are ignored
      fireEvent.click(sosButton);
      fireEvent.click(sosButton);

      const sosCalls = postSpy.mock.calls.filter((c) => c[0] === '/emergency/sos');
      expect(sosCalls.length).toBe(1);

      // Resolve the initial in-flight call
      await act(async () => {
        resolveFirstCall!({ status: 'triggered', incidentId: 'inc-single-dispatch' });
        await vi.advanceTimersByTimeAsync(50);
      });

      vi.useRealTimers();
      postSpy.mockRestore();
      getSpy.mockRestore();
    });

    it('1.6 Retry messaging does NOT claim idempotency and explains that prior attempts may have reached server', async () => {
      vi.useFakeTimers();
      const mockSOSTrigger = vi.fn().mockRejectedValue(new Error('Network timeout'));

      render(<SOSButton onSOSTriggered={mockSOSTrigger} />);

      fireEvent.click(screen.getByRole('button'));

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      // Assert warning regarding duplicate alerts and prior attempt receipt
      expect(screen.getByText(/prior attempt may have reached the server/i)).toBeInTheDocument();
      expect(screen.getByText(/retries are not guaranteed to be deduplicated/i)).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('2. Patient Account Isolation & Cross-Session Race Conditions', () => {
    it('2.1 Logout clears patient dashboard clinical summary and profile data immediately', async () => {
      const getSpy = vi.spyOn(api, 'get').mockImplementation((path: string) => {
        if (path === '/user/profile') {
          return Promise.resolve({ full_name: 'Alice Smith', blood_type: 'A+' });
        }
        if (path === '/ai/dashboard') {
          return Promise.resolve({
            success: true,
            data: {
              todaysSummary: 'Alice confidential clinical status',
              careActions: [{ id: 'action-1', title: 'Take insulin', isCompleted: false }],
            },
          });
        }
        return Promise.resolve({});
      });

      const { rerender } = render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument();
      });

      // Simulate user logout
      mockCurrentUser = null;
      rerender(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Alice Smith/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Alice confidential clinical status/i)).not.toBeInTheDocument();
      });

      getSpy.mockRestore();
    });

    it('2.2 Late response from Alice account cannot overwrite Bob account after rapid switch', async () => {
      let resolveAliceProfile: (val: any) => void;
      const aliceProfilePromise = new Promise((res) => {
        resolveAliceProfile = res;
      });

      const getSpy = vi.spyOn(api, 'get').mockImplementation((path: string) => {
        if (path === '/user/profile') {
          if (mockCurrentUser?.id === PATIENT_ALICE.id) {
            return aliceProfilePromise;
          }
          return Promise.resolve({ full_name: 'Bob Jones', blood_type: 'B+' });
        }
        if (path === '/ai/dashboard') {
          return Promise.resolve({
            success: true,
            data: {
              todaysSummary: `Care summary for ${mockCurrentUser?.name}`,
              careActions: [],
            },
          });
        }
        return Promise.resolve({});
      });

      const { rerender } = render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      // Immediately switch to Bob before Alice's profile resolves
      mockCurrentUser = PATIENT_BOB;
      rerender(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      // Bob's profile resolves
      await waitFor(() => {
        expect(screen.getByText(/Bob Jones/i)).toBeInTheDocument();
      });

      // Now late response from Alice resolves
      await act(async () => {
        resolveAliceProfile!({ full_name: 'Alice Smith', blood_type: 'A+' });
      });

      // Confirm Alice's data did NOT overwrite Bob
      expect(screen.getByText(/Bob Jones/i)).toBeInTheDocument();
      expect(screen.queryByText(/Alice Smith/i)).not.toBeInTheDocument();

      getSpy.mockRestore();
    });
  });

  describe('3. Clinical Missing-Data Fallbacks & Honest Empty States', () => {
    it('3.1 Analytics fallback hook returns null health score and does NOT fabricate 0 or 75', () => {
      let analyticsValue: any = null;
      function TestComponent() {
        analyticsValue = useAnalytics();
        return null;
      }

      render(<TestComponent />);

      expect(analyticsValue).toBeDefined();
      expect(analyticsValue.healthScore).toBeNull();
      expect(analyticsValue.dashboardData).toBeNull();
      expect(analyticsValue.loading).toBe(false);
    });

    it('3.2 MedicalProfile fallback hook returns null profile without fabricated metrics', () => {
      let profileValue: any = null;
      function TestComponent() {
        profileValue = useMedicalProfile();
        return null;
      }

      render(<TestComponent />);

      expect(profileValue).toBeDefined();
      expect(profileValue.profile).toBeNull();
      expect(profileValue.completion.percentage).toBe(0);
    });
  });

  describe('4. API Client Protocol & Token Sanitization', () => {
    it('4.1 Token store treats literal "null" and "undefined" strings as null credentials', () => {
      tokenStore.set('null');
      expect(tokenStore.get()).toBeNull();

      tokenStore.set('undefined');
      expect(tokenStore.get()).toBeNull();

      tokenStore.set('   ');
      expect(tokenStore.get()).toBeNull();

      tokenStore.set('valid.jwt.token');
      expect(tokenStore.get()).toBe('valid.jwt.token');
      tokenStore.clear();
    });

    it('4.2 HTTP 204 No Content and empty text response bodies resolve safely as undefined', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      const res204 = await api.delete('/user/record');
      expect(res204).toBeUndefined();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValueOnce(''),
        headers: new Headers(),
      });

      const resEmpty = await api.get('/user/empty-body');
      expect(resEmpty).toBeUndefined();

      global.fetch = originalFetch;
    });
  });
});
