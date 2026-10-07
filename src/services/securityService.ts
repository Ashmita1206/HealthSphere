/**
 * HealthSphere Security API Client
 */

import { api } from './api';

export interface ActiveSession {
  id: string;
  browser: string;
  os: string;
  deviceType: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  isTrusted: boolean;
  lastSeen: string;
  firstSeen: string;
}

export interface LoginHistoryItem {
  id: string;
  email: string;
  ipAddress: string;
  device: string;
  status: 'success' | 'failed' | 'locked';
  reason: string;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

export interface TwoFactorSetupData {
  secret: string;
  otpauthUrl: string;
  instructions: string;
}

export const securityService = {
  async getSessions(): Promise<ActiveSession[]> {
    const res = await api.get<{ success: boolean; data: ActiveSession[] }>('/security/sessions');
    return res?.data || [];
  },

  async revokeSession(id: string): Promise<boolean> {
    const res = await api.delete<{ success: boolean; message?: string }>(`/security/sessions/${id}`);
    return Boolean(res?.success);
  },

  async revokeOtherSessions(): Promise<number> {
    const res = await api.post<{ success: boolean; count?: number }>('/security/sessions/revoke-others');
    return res?.count || 0;
  },

  async getDevices(): Promise<TrustedDevice[]> {
    const res = await api.get<{ success: boolean; data: TrustedDevice[] }>('/security/devices');
    return res?.data || [];
  },

  async untrustDevice(id: string): Promise<boolean> {
    const res = await api.delete<{ success: boolean; message?: string }>(`/security/devices/${id}`);
    return Boolean(res?.success);
  },

  async getLoginHistory(): Promise<LoginHistoryItem[]> {
    const res = await api.get<{ success: boolean; data: LoginHistoryItem[] }>('/security/login-history');
    return res?.data || [];
  },

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const res = await api.get<{ success: boolean; data: SecurityAlert[] }>('/security/alerts');
    return res?.data || [];
  },

  async generate2fa(): Promise<TwoFactorSetupData> {
    const res = await api.post<{ success: boolean; data: TwoFactorSetupData }>('/security/2fa/generate');
    return res?.data;
  },

  async verifyAndEnable2fa(secret: string, token: string): Promise<{ emergencyCodes: string[] }> {
    const res = await api.post<{ success: boolean; message?: string; emergencyCodes?: string[] }>('/security/2fa/verify', { secret, token });
    return { emergencyCodes: res?.emergencyCodes || [] };
  },

  async disable2fa(): Promise<boolean> {
    const res = await api.post<{ success: boolean; message?: string }>('/security/2fa/disable');
    return Boolean(res?.success);
  },

  async createEmergencyToken(patientId: string, reason: string): Promise<{ emergencyToken: string; expiresAt: string }> {
    const res = await api.post<{ success: boolean; message?: string; data: { emergencyToken: string; expiresAt: string } }>('/security/emergency-token', { patientId, reason });
    return res?.data;
  },
};
