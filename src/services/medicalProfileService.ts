import { api } from './api';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

export interface SurgeryRecord {
  name: string;
  date?: string;
  hospital?: string;
  notes?: string;
}

export interface FamilyHistoryRecord {
  relation: string;
  condition: string;
}

export interface VaccinationRecord {
  vaccineName: string;
  dateGiven?: string;
  dose?: string;
}

export interface InsuranceInfo {
  provider?: string;
  policyNumber?: string;
  groupNumber?: string;
  expiryDate?: string;
}

export interface LifestyleInfo {
  smoking?: string;
  alcohol?: string;
  activityLevel?: string;
  diet?: string;
}

export interface AddressInfo {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface MedicalProfileData {
  id?: string;
  _id?: string;
  userId?: string;
  healthId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup: string;
  height?: number | null;
  weight?: number | null;
  allergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  surgeries: SurgeryRecord[];
  familyHistory: FamilyHistoryRecord[];
  emergencyContacts: EmergencyContact[];
  insurance: InsuranceInfo;
  organDonor: boolean;
  vaccinations: VaccinationRecord[];
  lifestyle: LifestyleInfo;
  address: AddressInfo;
  notes?: string;
  qrData?: string;
  completionPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export const medicalProfileService = {
  getMedicalProfile: async (): Promise<MedicalProfileData | null> => {
    try {
      const res = await api.get<{ success: boolean; data: MedicalProfileData }>(
        '/profile/medical'
      );
      return res?.data || (res as unknown as MedicalProfileData) || null;
    } catch (_err) {
      return null;
    }
  },

  saveMedicalProfile: async (
    data: Partial<MedicalProfileData>
  ): Promise<MedicalProfileData | null> => {
    try {
      const res = await api.post<{ success: boolean; data: MedicalProfileData }>(
        '/profile/medical',
        data
      );
      return res?.data || (res as unknown as MedicalProfileData) || null;
    } catch (_err) {
      return null;
    }
  },

  updateMedicalProfile: async (
    data: Partial<MedicalProfileData>
  ): Promise<MedicalProfileData | null> => {
    try {
      const res = await api.put<{ success: boolean; data: MedicalProfileData }>(
        '/profile/medical',
        data
      );
      return res?.data || (res as unknown as MedicalProfileData) || null;
    } catch (_err) {
      return null;
    }
  },

  deleteMedicalProfile: async (): Promise<boolean> => {
    try {
      await api.delete<{ success: boolean }>('/profile/medical');
      return true;
    } catch (_err) {
      return false;
    }
  },

  getPublicProfileByHealthId: async (
    healthId: string
  ): Promise<Partial<MedicalProfileData> | null> => {
    try {
      const res = await api.get<{ success: boolean; data: Partial<MedicalProfileData> }>(
        `/profile/medical/public/${healthId}`
      );
      return res?.data || null;
    } catch (_err) {
      return null;
    }
  },
};
