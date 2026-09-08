import { api } from './api';
import type { Doctor } from './doctorService';

export interface SharePermissions {
  profile: boolean;
  reports: boolean;
  medicines: boolean;
  appointments: boolean;
  timeline: boolean;
  analytics: boolean;
  emergency: boolean;
}

export interface CreateSharePayload {
  doctorId: string;
  permissions?: Partial<SharePermissions>;
  expiryDuration?: '1h' | '24h' | '7d' | '30d' | string;
}

export interface CreateShareResponse {
  shareId: string;
  shareToken: string;
  shareLink: string;
  expiresAt: string;
  permissions: SharePermissions;
  doctor: Partial<Doctor>;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
}

export interface MedicalShareItem {
  _id: string;
  patientId: string;
  doctorId: Doctor;
  shareToken: string;
  expiresAt: string;
  permissions: SharePermissions;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

export interface SharesData {
  active: MedicalShareItem[];
  expired: MedicalShareItem[];
  revoked: MedicalShareItem[];
  all: MedicalShareItem[];
}

export interface SharedPatientRecords {
  profile?: {
    healthId?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    height?: number;
    weight?: number;
    allergies?: string[];
    chronicDiseases?: string[];
    currentMedications?: string[];
    emergencyContacts?: Array<{ name: string; relationship: string; phone: string; isPrimary?: boolean }>;
    insurance?: { provider?: string; policyNumber?: string };
    organDonor?: boolean;
    lifestyle?: { smoking?: string; alcohol?: string; activityLevel?: string; diet?: string };
    address?: { city?: string; state?: string };
    notes?: string;
    completionPercentage?: number;
  };
  medicines?: Array<{
    _id?: string;
    name: string;
    dosage?: string;
    frequency?: string;
    timing?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    adherenceRate?: number;
    instructions?: string;
    doctorName?: string;
  }>;
  appointments?: Array<{
    _id?: string;
    doctorName: string;
    specialty?: string;
    hospital?: string;
    appointmentDate: string;
    status?: string;
  }>;
  reports?: Array<{
    _id?: string;
    title: string;
    category?: string;
    riskLevel?: 'low' | 'moderate' | 'high' | 'critical';
    summary?: string;
    abnormalValues?: string[];
    biomarkers?: Record<string, unknown>;
    createdAt?: string;
    fileUrl?: string;
  }>;
  timeline?: Array<{
    _id?: string;
    eventType: string;
    title: string;
    description: string;
    category?: string;
    createdAt: string;
  }>;
  analytics?: {
    score: number;
    category: string;
    breakdown: { vitals: number; adherence: number; lifestyle: number; risk: number };
    insights: string[];
  };
  emergency?: {
    bloodGroup?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContacts?: Array<{ name: string; relationship: string; phone: string; isPrimary?: boolean }>;
    organDonor?: boolean;
  };
}

export interface SharedPatientData {
  shareToken: string;
  doctor: Partial<Doctor>;
  patient: {
    id: string;
    name: string;
  };
  permissions: SharePermissions;
  createdAt: string;
  expiresAt: string;
  records: SharedPatientRecords;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  status?: string;
  counts?: { total: number; active: number; expired: number; revoked: number };
  data: T;
  revokedAt?: string;
  expiresAt?: string;
}

export const shareService = {
  /**
   * Generate an expiring medical record share for a doctor
   */
  async createShare(payload: CreateSharePayload): Promise<CreateShareResponse> {
    const res = await api.post<ApiResponse<CreateShareResponse>>('/share/create', payload);
    return res.data;
  },

  /**
   * Retrieve active, expired, and revoked shares for authenticated patient
   */
  async getShares(): Promise<SharesData> {
    const res = await api.get<ApiResponse<SharesData>>('/share');
    return res.data || { active: [], expired: [], revoked: [], all: [] };
  },

  /**
   * Revoke patient's share token immediately
   */
  async revokeShare(token: string): Promise<{ shareToken: string; status: string; revokedAt: string }> {
    const res = await api.post<ApiResponse<{ shareToken: string; status: string; revokedAt: string }>>(
      `/share/${token}/revoke`
    );
    return res.data;
  },

  /**
   * Read-only public access endpoint for doctors/viewers
   */
  async getSharedData(token: string): Promise<SharedPatientData> {
    const res = await api.get<ApiResponse<SharedPatientData>>(`/share/access/${token}`);
    return res.data;
  },
};
