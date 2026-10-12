import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ShareProvider, useMedicalShare } from '@/context/ShareContext';
import { DoctorProvider, useDoctor } from '@/context/DoctorContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SharedRecordViewer } from '@/components/share/SharedRecordViewer';
import { DonorDrawer } from '@/components/bloodDonation/DonorDrawer';
import { DonorCard } from '@/components/bloodDonation/DonorCard';
import { VitalsTelemetryGrid } from '@/pages/wearables/components/VitalsTelemetryGrid';
import { LiveECGStrip } from '@/pages/wearables/components/LiveECGStrip';
import { ConnectedDevicesStrip } from '@/pages/wearables/components/ConnectedDevicesStrip';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  tokenStore: {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
  },
  refreshTokenStore: {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('PHASE B — Security & State Isolation Hardening Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ------------------------------------------------------------------------
   * 1 & 2. SHARE CONTEXT & DOCTOR CONTEXT SESSION ISOLATION
   * ------------------------------------------------------------------------ */
  describe('1 & 2. ShareContext & DoctorContext Session Isolation', () => {
    it('clears share and doctor state on logout and isolates data between users', async () => {
      let authContextVal: any;
      let shareContextVal: any;
      let doctorContextVal: any;

      function TestApp() {
        authContextVal = useAuth();
        shareContextVal = useMedicalShare();
        doctorContextVal = useDoctor();
        return (
          <div>
            <span data-testid="user-id">{authContextVal.user?.id || 'none'}</span>
            <span data-testid="share-count">{shareContextVal.shares.all.length}</span>
            <span data-testid="doctor-count">{doctorContextVal.doctors.length}</span>
          </div>
        );
      }

      (api.post as any).mockImplementation((url: string, body: any) => {
        if (url === '/auth/login') {
          if (body.email === 'a@example.com') {
            return Promise.resolve({
              token: 'token-A',
              user: { id: 'user-A', email: 'a@example.com', name: 'User A' },
            });
          }
          if (body.email === 'b@example.com') {
            return Promise.resolve({
              token: 'token-B',
              user: { id: 'user-B', email: 'b@example.com', name: 'User B' },
            });
          }
        }
        if (url === '/auth/logout') {
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: true });
      });

      (api.get as any).mockImplementation((url: string) => {
        if (url === '/share' || url === '/health/shares') {
          if (authContextVal?.user?.id === 'user-A') {
            const itemA: any = {
              _id: 'share-1',
              patientId: 'user-A',
              shareToken: 'token-A',
              status: 'active',
              doctorId: { _id: 'doc-1', fullName: 'Dr. Alice' },
            };
            return Promise.resolve({
              success: true,
              data: {
                active: [itemA],
                expired: [],
                revoked: [],
                all: [itemA],
              },
            });
          }
          if (authContextVal?.user?.id === 'user-B') {
            const itemB: any = {
              _id: 'share-2',
              patientId: 'user-B',
              shareToken: 'token-B',
              status: 'active',
              doctorId: { _id: 'doc-2', fullName: 'Dr. Bob' },
            };
            return Promise.resolve({
              success: true,
              data: {
                active: [itemB],
                expired: [],
                revoked: [],
                all: [itemB],
              },
            });
          }
          return Promise.resolve({
            success: true,
            data: { active: [], expired: [], revoked: [], all: [] },
          });
        }
        if (url === '/doctors' || url.startsWith('/doctors')) {
          return Promise.resolve({
            success: true,
            data: [{ id: 'doc-1', fullName: 'Dr. Alice' }],
          });
        }
        return Promise.resolve({ success: true, data: [] });
      });

      render(
        <AuthProvider>
          <DoctorProvider>
            <ShareProvider>
              <TestApp />
            </ShareProvider>
          </DoctorProvider>
        </AuthProvider>
      );

      // Initially unauthenticated
      expect(screen.getByTestId('user-id')).toHaveTextContent('none');
      expect(screen.getByTestId('share-count')).toHaveTextContent('0');
      expect(screen.getByTestId('doctor-count')).toHaveTextContent('0');

      // A. User A logs in
      await act(async () => {
        await authContextVal.signIn('a@example.com', 'password123');
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-A');
      });

      // User A loads share data
      await act(async () => {
        await shareContextVal.fetchShares();
        await doctorContextVal.fetchDoctors();
      });

      expect(shareContextVal.shares.all.length).toBe(1);
      expect(shareContextVal.shares.all[0]._id).toBe('share-1');
      expect(doctorContextVal.doctors.length).toBe(1);

      // B. User A logs out
      await act(async () => {
        await authContextVal.signOut();
      });

      // C. Share state and doctor state become empty
      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('none');
        expect(screen.getByTestId('share-count')).toHaveTextContent('0');
        expect(doctorContextVal.doctors.length).toBe(0);
      });

      // D. User B logs in
      await act(async () => {
        await authContextVal.signIn('b@example.com', 'password123');
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-B');
      });

      await act(async () => {
        await shareContextVal.fetchShares();
      });

      // E. User B cannot see User A's share state
      expect(shareContextVal.shares.all.length).toBe(1);
      expect(shareContextVal.shares.all[0]._id).toBe('share-2');
      expect(shareContextVal.shares.all.find((s: any) => s._id === 'share-1')).toBeUndefined();
    });
  });

  /* ------------------------------------------------------------------------
   * 3. SHARED RECORD VIEWER SYNTHETIC HEALTH ID
   * ------------------------------------------------------------------------ */
  describe('3. SharedRecordViewer Synthetic Health ID Removal', () => {
    it('displays honest "Not assigned" when healthId is omitted and never "HS-2026-PATIENT"', () => {
      const mockSharedData: any = {
        shareToken: 'test-token-123',
        doctor: { fullName: 'Dr. Sarah Connor', hospital: 'General Hospital' },
        patient: { id: 'pat-1', name: 'John Doe' },
        permissions: { profile: true, emergency: false },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        records: {
          profile: {
            bloodGroup: 'O+',
            dateOfBirth: '1985-05-15',
            gender: 'Male',
          },
        },
      };

      render(<SharedRecordViewer data={mockSharedData} />);
      expect(screen.getByText('Not assigned')).toBeInTheDocument();
      expect(screen.queryByText('HS-2026-PATIENT')).not.toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------------
   * 5. DONOR PRIVACY + CLINICAL INTEGRITY
   * ------------------------------------------------------------------------ */
  describe('5. Donor Privacy & Clinical Integrity', () => {
    it('masks donor phone and email for PII privacy protection', () => {
      const mockDonor: any = {
        id: 'donor-1',
        name: 'Elena Rostova',
        bloodGroup: 'A+',
        age: 29,
        city: 'San Francisco',
        availability: 'available',
        phone: '4155551234',
        email: 'elena.rostova@example.com',
      };

      render(
        <DonorDrawer
          open={true}
          onOpenChange={vi.fn()}
          donor={mockDonor}
          onContact={vi.fn()}
        />
      );

      expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
      expect(screen.getByText('(***) ***-1234')).toBeInTheDocument();
      expect(screen.getByText('e***@example.com')).toBeInTheDocument();
      expect(screen.queryByText('elena.rostova@example.com')).not.toBeInTheDocument();
      expect(screen.queryByText('4155551234')).not.toBeInTheDocument();
    });

    it('displays "Not specified" and "Age not recorded" when data is missing (no O+ / 30 default)', () => {
      const mockDonorNoData: any = {
        id: 'donor-2',
        name: 'Anonymous Donor',
        city: 'Seattle',
        availability: 'available',
      };

      render(
        <DonorCard
          donor={mockDonorNoData}
          index={0}
          onContact={vi.fn()}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText('Not specified')).toBeInTheDocument();
      expect(screen.getByText('Age not recorded')).toBeInTheDocument();
      expect(screen.queryByText('O+')).not.toBeInTheDocument();
      expect(screen.queryByText('30 yrs')).not.toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------------
   * 6. WEARABLES SYNTHETIC BIOMETRICS REMOVAL
   * ------------------------------------------------------------------------ */
  describe('6. Wearables — Remove Synthetic Biometrics', () => {
    it('renders honest disconnected/offline state when no vitals telemetry data is provided', () => {
      render(<VitalsTelemetryGrid data={undefined} />);
      expect(screen.getAllByText('OFFLINE').length).toBe(4);
      expect(screen.getAllByText('No device connected').length).toBe(4);
      expect(screen.queryByText('72')).not.toBeInTheDocument();
      expect(screen.queryByText('8740')).not.toBeInTheDocument();
      expect(screen.queryByText('98%')).not.toBeInTheDocument();
    });

    it('renders real vitals telemetry when data is provided', () => {
      const realData: any = {
        heartRate: { live: 68, resting: 60, hrv: 55 },
        steps: { current: 10450, goal: 10000, calories: 520, distanceKm: 7.8 },
        sleep: { duration: '7h 45m', score: 85, deep: '2h', rem: '2h', light: '3h 45m' },
        spo2: { saturation: 99, nocturnalAvg: 98.2, desaturations: 0 },
      };

      render(<VitalsTelemetryGrid data={realData} />);
      expect(screen.getByText('68')).toBeInTheDocument();
      expect(screen.getByText('10,450')).toBeInTheDocument();
      expect(screen.getByText('99%')).toBeInTheDocument();
    });

    it('renders disconnected state for ECG strip when metrics are omitted', () => {
      render(<LiveECGStrip metrics={null} />);
      expect(screen.getByText('ECG Biosensor Disconnected')).toBeInTheDocument();
      expect(screen.getByText('No active continuous ECG biosensor stream connected.')).toBeInTheDocument();
      expect(screen.queryByText('Lead I • Live Feed')).not.toBeInTheDocument();
    });

    it('renders "No Device Connected" in ConnectedDevicesStrip when device list is empty', () => {
      render(<ConnectedDevicesStrip devices={[]} onPairNew={vi.fn()} onSyncDevice={vi.fn()} />);
      expect(screen.getByText('No Device Connected')).toBeInTheDocument();
      expect(screen.getByText('Pair a sensor to stream live telemetry')).toBeInTheDocument();
      expect(screen.queryByText('Apple Watch Ultra 2')).not.toBeInTheDocument();
    });
  });
});
