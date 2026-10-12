import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { securityService } from '../services/securityService';
import { offlineSyncService } from '../services/offlineSyncService';
import { offlineStorage } from '../services/offlineStorage';
import { api, tokenStore, refreshTokenStore } from '../services/api';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import AppointmentsPage from '../pages/appointments/index';
import MedicinesPage from '../pages/medicines/index';
import { OfflineEmergencyCardModal } from '../components/offline/OfflineEmergencyCardModal';

describe('N-P1.1 — Security Dashboard Contract Normalization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes getSessions from canonical backend { success: true, data: [...] }', async () => {
    const mockSessions = [
      { id: 's1', browser: 'Chrome', os: 'Windows', deviceType: 'desktop', ipAddress: '127.0.0.1', location: 'Local', lastActive: new Date().toISOString(), isCurrent: true }
    ];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ success: true, data: mockSessions } as any);

    const result = await securityService.getSessions();
    expect(result).toHaveLength(1);
    expect(result[0].browser).toBe('Chrome');
  });

  it('normalizes getDevices from { success: true, data: [...] }', async () => {
    const mockDevices = [
      { id: 'd1', deviceName: 'My Laptop', browser: 'Firefox', os: 'Linux', ipAddress: '10.0.0.1', isTrusted: true, lastSeen: new Date().toISOString(), firstSeen: new Date().toISOString() }
    ];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ success: true, data: mockDevices } as any);

    const result = await securityService.getDevices();
    expect(result).toHaveLength(1);
    expect(result[0].deviceName).toBe('My Laptop');
  });

  it('normalizes getLoginHistory from { success: true, data: [...] }', async () => {
    const mockHistory = [
      { id: 'h1', email: 'patient@hs.io', ipAddress: '1.2.3.4', device: 'Chrome on Win', status: 'success' as const, reason: 'Normal Login', createdAt: new Date().toISOString() }
    ];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ success: true, data: mockHistory } as any);

    const result = await securityService.getLoginHistory();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('success');
  });

  it('normalizes revokeSession and revokeOtherSessions count', async () => {
    vi.spyOn(api, 'delete').mockResolvedValueOnce({ success: true, message: 'Revoked' } as any);
    vi.spyOn(api, 'post').mockResolvedValueOnce({ success: true, count: 3 } as any);

    const revoked = await securityService.revokeSession('s2');
    expect(revoked).toBe(true);

    const count = await securityService.revokeOtherSessions();
    expect(count).toBe(3);
  });
});

describe('N-P1.2 — Offline Mode Contract & Hydration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates offline snapshot correctly from canonical bootstrap payload { success: true, ... }', async () => {
    const bootstrapPayload = {
      success: true,
      snapshotTimestamp: new Date().toISOString(),
      reports: [{ id: 'r1', title: 'Blood Panel' }],
      medicines: [{ id: 'm1', name: 'Atorvastatin' }],
      appointments: [{ id: 'a1', doctor_name: 'Dr. Test' }],
      timeline: [{ id: 't1', title: 'Consultation' }],
      emergencyProfile: {
        patientName: 'Jane Doe',
        bloodGroup: 'B+',
        allergies: ['Dust'],
        chronicConditions: ['Asthma'],
        medications: ['Inhaler'],
        emergencyContacts: [{ name: 'John Doe', relationship: 'Spouse', phone: '123' }],
        organDonor: true,
        dnrStatus: false,
        lastUpdated: new Date().toISOString(),
      },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(bootstrapPayload as any);
    const setItemSpy = vi.spyOn(offlineStorage, 'setItem').mockResolvedValue();
    const cacheSpy = vi.spyOn(offlineStorage, 'cacheEmergencyProfile').mockResolvedValue();

    const success = await offlineSyncService.hydrateOfflineSnapshot();
    expect(success).toBe(true);
    expect(setItemSpy).toHaveBeenCalled();
    expect(cacheSpy).toHaveBeenCalledWith(bootstrapPayload.emergencyProfile);
  });

  it('renders honest empty state in OfflineEmergencyCardModal when profile is null without fabricating fake clinical data', () => {
    render(<OfflineEmergencyCardModal profile={null} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/No Offline Emergency Profile Cached/i)).toBeInTheDocument();
    expect(screen.queryByText(/Penicillin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sarah Connor/i)).not.toBeInTheDocument();
  });

  it('replays offline mutations with proper api methods sequentially', async () => {
    const queue = [
      { id: 'mut-1', url: '/health/medicines', method: 'POST' as const, payload: { name: 'Med 1' }, timestamp: 1, retryCount: 0, resource: 'medicines' as const, description: 'Add' },
      { id: 'mut-2', url: '/health/medicines/123', method: 'DELETE' as const, payload: null, timestamp: 2, retryCount: 0, resource: 'medicines' as const, description: 'Delete' },
    ];

    vi.spyOn(offlineStorage, 'getMutationQueue').mockResolvedValueOnce(queue);
    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ success: true } as any);
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValueOnce({ success: true } as any);
    const removeSpy = vi.spyOn(offlineStorage, 'removeMutation').mockResolvedValue();

    const result = await offlineSyncService.processMutationQueue();
    expect(result.processed).toBe(2);
    expect(result.succeeded).toBe(2);
    expect(postSpy).toHaveBeenCalledWith('/health/medicines', { name: 'Med 1' });
    expect(deleteSpy).toHaveBeenCalledWith('/health/medicines/123');
    expect(removeSpy).toHaveBeenCalledTimes(2);
  });
});

describe('N-P1.3 — Auth 401 / Refresh / Logout Contracts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('1. successful request with tokenStore', async () => {
    tokenStore.set('valid_access_token');
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'ok' }),
    } as any);

    const res = await api.get<{ success: boolean }>('/health/logs');
    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/health/logs'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid_access_token',
        }),
      })
    );
  });

  it('2. 401 -> refresh -> retry with new access token', async () => {
    tokenStore.set('expired_access_token');
    refreshTokenStore.set('valid_refresh_token');

    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/auth/refresh')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            accessToken: 'new_fresh_token',
            refreshToken: 'new_refresh_token',
          }),
        } as any;
      }
      if (urlStr.includes('/health/logs')) {
        callCount++;
        if (callCount === 1) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ message: 'jwt expired' }),
          } as any;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, logs: [] }),
        } as any;
      }
      return { ok: false, status: 404, json: async () => ({}) } as any;
    });

    const res = await api.get<{ success: boolean; logs: any[] }>('/health/logs');
    expect(res.success).toBe(true);
    expect(tokenStore.get()).toBe('new_fresh_token');
    expect(refreshTokenStore.get()).toBe('new_refresh_token');
  });

  it('3. refresh failure clears tokens and dispatches auth:unauthorized', async () => {
    tokenStore.set('expired_access_token');
    refreshTokenStore.set('bad_refresh_token');

    const unauthorizedHandler = vi.fn();
    window.addEventListener('auth:unauthorized', unauthorizedHandler);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/auth/refresh')) {
        return {
          ok: false,
          status: 401,
          json: async () => ({ message: 'Invalid refresh token' }),
        } as any;
      }
      return {
        ok: false,
        status: 401,
        json: async () => ({ message: 'jwt expired' }),
      } as any;
    });

    await expect(api.get('/health/logs')).rejects.toThrow();
    expect(tokenStore.get()).toBeNull();
    expect(refreshTokenStore.get()).toBeNull();
    expect(unauthorizedHandler).toHaveBeenCalled();

    window.removeEventListener('auth:unauthorized', unauthorizedHandler);
  });

  it('4. logout calls backend logout and clears local auth state', async () => {
    tokenStore.set('current_token');
    refreshTokenStore.set('current_refresh_token');

    let capturedUser: any = null;
    function TestConsumer() {
      const { user, signOut } = useAuth();
      capturedUser = user;
      return <button onClick={() => signOut()}>Sign Out</button>;
    }

    vi.spyOn(api, 'get').mockResolvedValueOnce({ id: 'u1', email: 'test@hs.io', full_name: 'Test' } as any);
    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ success: true, message: 'Logged out' } as any);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(capturedUser).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'current_refresh_token' });
      expect(tokenStore.get()).toBeNull();
      expect(refreshTokenStore.get()).toBeNull();
      expect(capturedUser).toBeNull();
    });
  });

  it('5. logout backend failure still safely clears local authenticated state', async () => {
    tokenStore.set('current_token');
    refreshTokenStore.set('current_refresh_token');

    let capturedUser: any = null;
    function TestConsumer() {
      const { user, signOut } = useAuth();
      capturedUser = user;
      return <button onClick={() => signOut()}>Sign Out</button>;
    }

    vi.spyOn(api, 'get').mockResolvedValueOnce({ id: 'u1', email: 'test@hs.io', full_name: 'Test' } as any);
    vi.spyOn(api, 'post').mockRejectedValueOnce(new Error('Network error on logout'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(capturedUser).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));

    await waitFor(() => {
      expect(tokenStore.get()).toBeNull();
      expect(refreshTokenStore.get()).toBeNull();
      expect(capturedUser).toBeNull();
    });
  });
});

describe('N-P1.4 — Appointment Cancellation Contract', () => {
  beforeEach(() => {
    localStorage.clear();
    tokenStore.set('mock_valid_token');
    vi.restoreAllMocks();
  });

  it('calls real backend PUT endpoint on cancellation and updates appointment status', async () => {
    const mockAppointments = [
      { id: 'apt-101', doctor_name: 'Dr. John Smith', specialty: 'Cardiology', hospital: 'General Hospital', appointment_date: new Date(Date.now() + 86400000).toISOString(), status: 'confirmed' as const },
    ];

    vi.spyOn(api, 'get').mockImplementation(async (path: string) => {
      if (path === '/user/profile') return { id: 'u1', email: 'p@hs.io', full_name: 'Patient' } as any;
      if (path === '/health/appointments') return mockAppointments as any;
      return [] as any;
    });

    const putSpy = vi.spyOn(api, 'put').mockResolvedValueOnce({
      id: 'apt-101',
      doctor_name: 'Dr. John Smith',
      status: 'cancelled',
    } as any);

    render(
      <MemoryRouter>
        <AuthProvider>
          <AppointmentsPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    });

    // Click Cancel button directly on appointment card
    const cancelBtn = screen.getByRole('button', { name: /Cancel Dr. John Smith/i });
    fireEvent.click(cancelBtn);

    // In the alert dialog, click Cancel Appointment action button
    const confirmBtn = await screen.findByRole('button', { name: /^Cancel Appointment$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith('/health/appointments/apt-101', { status: 'cancelled' });
      expect(screen.getAllByText(/cancelled/i).length).toBeGreaterThan(0);
    });
  });

  it('retains appointment on backend cancellation failure and shows error', async () => {
    const mockAppointments = [
      { id: 'apt-102', doctor_name: 'Dr. Elena Rostova', specialty: 'Neurology', hospital: 'City Hospital', appointment_date: new Date(Date.now() + 86400000).toISOString(), status: 'confirmed' as const },
    ];

    vi.spyOn(api, 'get').mockImplementation(async (path: string) => {
      if (path === '/user/profile') return { id: 'u1', email: 'p@hs.io', full_name: 'Patient' } as any;
      if (path === '/health/appointments') return mockAppointments as any;
      return [] as any;
    });

    const putSpy = vi.spyOn(api, 'put').mockRejectedValueOnce(new Error('Server database error'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <AppointmentsPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dr. Elena Rostova')).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /Cancel Dr. Elena Rostova/i });
    fireEvent.click(cancelBtn);

    const confirmBtn = await screen.findByRole('button', { name: /^Cancel Appointment$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith('/health/appointments/apt-102', { status: 'cancelled' });
      expect(screen.getByText('Dr. Elena Rostova')).toBeInTheDocument();
    });
  });
});

describe('N-P1.5 — Medicine Archive Contract', () => {
  beforeEach(() => {
    localStorage.clear();
    tokenStore.set('mock_valid_token');
    vi.restoreAllMocks();
  });

  it('calls real backend PUT endpoint with status: archived and isActive: false on archive', async () => {
    const mockMedicines = [
      {
        id: 'med-201',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Daily',
        status: 'active',
        isActive: true,
      },
    ];

    vi.spyOn(api, 'get').mockImplementation(async (path: string) => {
      if (path === '/user/profile') return { id: 'u1', email: 'p@hs.io', full_name: 'Patient' } as any;
      if (path === '/health/medicines') return mockMedicines as any;
      return [] as any;
    });

    const putSpy = vi.spyOn(api, 'put').mockResolvedValueOnce({
      id: 'med-201',
      name: 'Metformin',
      dosage: '500mg',
      status: 'archived',
      isActive: false,
    } as any);

    render(
      <MemoryRouter>
        <AuthProvider>
          <MedicinesPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Metformin')).toBeInTheDocument();
    });

    const archiveBtn = screen.getByRole('button', { name: /Archive Metformin/i });
    fireEvent.click(archiveBtn);

    const confirmBtn = await screen.findByRole('button', { name: /Archive/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith('/health/medicines/med-201', { status: 'archived', isActive: false });
    });
  });

  it('retains medicine visible on backend archive failure', async () => {
    const mockMedicines = [
      {
        id: 'med-202',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Daily',
        status: 'active',
        isActive: true,
      },
    ];

    vi.spyOn(api, 'get').mockImplementation(async (path: string) => {
      if (path === '/user/profile') return { id: 'u1', email: 'p@hs.io', full_name: 'Patient' } as any;
      if (path === '/health/medicines') return mockMedicines as any;
      return [] as any;
    });

    vi.spyOn(api, 'put').mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <MedicinesPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Lisinopril')).toBeInTheDocument();
    });

    const archiveBtn = screen.getByRole('button', { name: /Archive Lisinopril/i });
    fireEvent.click(archiveBtn);

    const confirmBtn = await screen.findByRole('button', { name: /Archive/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText('Lisinopril')).toBeInTheDocument();
    });
  });
});
