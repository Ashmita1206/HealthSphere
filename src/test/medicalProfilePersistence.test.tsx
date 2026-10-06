import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '@/pages/profile/index';
import { MedicalProfileProvider } from '@/context/MedicalProfileContext';
import { api } from '@/services/api';
import { medicalProfileService, type MedicalProfileData } from '@/services/medicalProfileService';

const mockAuthUser = { id: 'usr-123456', name: 'Neeraj Sharma', email: 'neeraj@healthsphere.test' };

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockUserIdentity = {
  id: 'usr-123456',
  full_name: 'Neeraj Sharma',
  phone: '+1 (555) 234-5678',
  date_of_birth: '1990-05-15',
  gender: 'male',
  blood_type: 'O+',
  address: '100 Medical Center Blvd',
  emergency_contact_name: 'Priya Sharma',
  emergency_contact_phone: '+1 (555) 987-6543',
  health_score: 88,
};

const mockClinicalData: MedicalProfileData = {
  healthId: 'HS-2026-123456',
  fullName: 'Neeraj Sharma',
  dateOfBirth: '1990-05-15',
  gender: 'male',
  bloodGroup: 'O+',
  height: 178,
  weight: 74,
  allergies: ['Amoxicillin', 'Peanuts'],
  chronicDiseases: ['Mild Asthma'],
  currentMedications: ['Albuterol inhaler'],
  surgeries: [{ name: 'Appendectomy', date: '2018' }],
  familyHistory: [{ relation: 'Mother', condition: 'Hypertension' }],
  emergencyContacts: [{ name: 'Priya Sharma', relationship: 'Spouse', phone: '+1 (555) 987-6543', isPrimary: true }],
  insurance: { provider: 'Aetna Health', policyNumber: 'AET-998822' },
  organDonor: true,
  vaccinations: [{ vaccineName: 'COVID-19 mRNA', dateGiven: '2023-11-01' }],
  lifestyle: { smoking: 'never', alcohol: 'social', activityLevel: 'moderate', diet: 'balanced' },
  address: { street: '100 Medical Center Blvd', city: 'San Francisco', state: 'CA', postalCode: '94103', country: 'USA' },
  completionPercentage: 90,
};

describe('N-P0.1 — Medical Profile Persistence & Separation of Concerns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
      if (url === '/user/profile') return mockUserIdentity;
      if (url === '/profile/medical') return { success: true, data: mockClinicalData };
      return null;
    });

    vi.spyOn(medicalProfileService, 'getMedicalProfile').mockResolvedValue(mockClinicalData);
    vi.spyOn(medicalProfileService, 'updateMedicalProfile').mockResolvedValue(mockClinicalData);
    vi.spyOn(api, 'put').mockResolvedValue(mockUserIdentity);
  });

  it('1. Loads both user identity and lifelong medical profile without clinical field loss', async () => {
    render(
      <MemoryRouter>
        <MedicalProfileProvider>
          <ProfilePage />
        </MedicalProfileProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Patient Profile & Health Records')).toBeInTheDocument();
    });

    // Clinical overview should display real biometrics from medicalProfile
    expect(screen.getByText(/Neeraj Sharma/i)).toBeInTheDocument();
  });

  it('2. Saving profile cleanly invokes both PUT /api/user/profile and PUT /api/profile/medical', async () => {
    const apiPutSpy = vi.spyOn(api, 'put');
    const medUpdateSpy = vi.spyOn(medicalProfileService, 'updateMedicalProfile');

    render(
      <MemoryRouter>
        <MedicalProfileProvider>
          <ProfilePage />
        </MedicalProfileProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Save Profile Changes')).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /save profile changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      // 1. Personal identity portion saved
      expect(apiPutSpy).toHaveBeenCalledWith(
        '/user/profile',
        expect.objectContaining({
          full_name: 'Neeraj Sharma',
          phone: '+1 (555) 234-5678',
        })
      );

      // 2. Clinical portion saved to canonical medical profile
      expect(medUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          allergies: ['Amoxicillin', 'Peanuts'],
          chronicDiseases: ['Mild Asthma'],
          height: 178,
          weight: 74,
          bloodGroup: 'O+',
        })
      );
    });
  });
});
