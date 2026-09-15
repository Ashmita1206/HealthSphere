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
    const res = await api.get('/security/sessions');
    return res.data?.data || [];
  },

  async revokeSession(id: string): Promise<boolean> {
    const res = await api.delete(`/security/sessions/${id}`);
    return res.data?.success;
  },

  async revokeOtherSessions(): Promise<number> {
    const res = await api.post('/security/sessions/revoke-others');
    return res.data?.count || 0;
  },

  async getDevices(): Promise<TrustedDevice[]> {
    const res = await api.get('/security/devices');
    return res.data?.data || [];
  },

  async untrustDevice(id: string): Promise<boolean> {
    const res = await api.delete(`/security/devices/${id}`);
    return res.data?.success;
  },

  async getLoginHistory(): Promise<LoginHistoryItem[]> {
    const res = await api.get('/security/login-history');
    return res.data?.data || [];
  },

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const res = await api.get('/security/alerts');
    return res.data?.data || [];
  },

  async generate2fa(): Promise<TwoFactorSetupData> {
    const res = await api.post('/security/2fa/generate');
    return res.data?.data;
  },

  async verifyAndEnable2fa(secret: string, token: string): Promise<{ emergencyCodes: string[] }> {
    const res = await api.post('/security/2fa/verify', { secret, token });
    return res.data;
  },

  async disable2fa(): Promise<boolean> {
    const res = await api.post('/security/2fa/disable');
    return res.data?.success;
  },

  async createEmergencyToken(patientId: string, reason: string): Promise<{ emergencyToken: string; expiresAt: string }> {
    const res = await api.post('/security/emergency-token', { patientId, reason });
    return res.data?.data;
  },
};
