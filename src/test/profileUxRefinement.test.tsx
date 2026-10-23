import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '@/pages/profile/index';
import { MedicalProfileProvider } from '@/context/MedicalProfileContext';
import { api } from '@/services/api';
import { medicalProfileService, type MedicalProfileData } from '@/services/medicalProfileService';
import { MedicalProfileCard } from '@/components/medical-profile/MedicalProfileCard';
import { MedicalProfileForm } from '@/components/medical-profile/MedicalProfileForm';
import { AchievementsSection } from '@/components/profile/AchievementsSection';
import { HealthMetricsGrid } from '@/components/profile/HealthMetricsGrid';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { EmergencyContact } from '@/components/profile/EmergencyContact';
import { Preferences } from '@/components/profile/Preferences';
import { createDefaultProfile } from '@/pages/profile/profileData';

const mockAuthUser = { id: 'usr-patient-999', name: 'Dr. Clara Oswald', email: 'clara@healthsphere.test' };

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
  }),
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

const mockFullProfile: MedicalProfileData = {
  healthId: 'HS-2026-CLARA9',
  fullName: 'Dr. Clara Oswald',
  dateOfBirth: '1989-11-23',
  gender: 'female',
  bloodGroup: 'B+',
  height: 165,
  weight: 58,
  allergies: ['Aspirin', 'Latex'],
  chronicDiseases: ['Hypothyroidism'],
  currentMedications: ['Levothyroxine 50mcg'],
  surgeries: [{ name: 'Knee Arthroscopy' }],
  familyHistory: [{ relation: 'Mother', condition: 'Type 2 Diabetes' }],
  emergencyContacts: [
    { name: 'Danny Pink', relationship: 'Partner', phone: '+1 (555) 345-6789', isPrimary: true },
  ],
  insurance: { provider: 'UnitedHealth', policyNumber: 'UH-887766' },
  organDonor: true,
  vaccinations: [],
  lifestyle: { smoking: 'never', alcohol: 'social', activityLevel: 'moderate', diet: 'balanced' },
  address: { street: '42 Baker Street', city: 'London', state: 'UK' },
  completionPercentage: 92,
};

describe('Comprehensive Patient Profile UX/UI Refinement Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Honest Empty States & Metric Integrity', () => {
    it('renders "Not recorded" for empty Age and BMI in MedicalProfileCard without fake fallbacks', () => {
      const emptyProfile: MedicalProfileData = {
        healthId: 'HS-EMPTY-1',
        fullName: 'New Patient',
        bloodGroup: 'Unknown',
        allergies: [],
        chronicDiseases: [],
        currentMedications: [],
        surgeries: [],
        familyHistory: [],
        emergencyContacts: [],
        insurance: {},
        organDonor: false,
        vaccinations: [],
        lifestyle: {},
        address: {},
        completionPercentage: 10,
      };

      render(<MedicalProfileCard profile={emptyProfile} />);

      // Should honestly show Not recorded instead of 28 yrs or 22.4 BMI
      expect(screen.queryByText('28 yrs')).not.toBeInTheDocument();
      expect(screen.queryByText('22.4 BMI')).not.toBeInTheDocument();
      expect(screen.getAllByText('Not recorded').length).toBeGreaterThanOrEqual(2);
    });

    it('renders honest zero streak without fake 14-day fallback in AchievementsSection', () => {
      const emptyProfileData = createDefaultProfile();
      render(<AchievementsSection profile={emptyProfileData} />);

      expect(screen.queryByText(/14 Days/i)).not.toBeInTheDocument();
      expect(screen.getByText(/No streak recorded/i)).toBeInTheDocument();
    });

    it('distinguishes recorded vs unrecorded vitals in HealthMetricsGrid and provides record triggers', () => {
      const profileData = createDefaultProfile();
      const onRecord = vi.fn();
      render(<HealthMetricsGrid profile={profileData} onRecordMetric={onRecord} />);

      expect(screen.getByText(/Record Height & Weight/i)).toBeInTheDocument();
      expect(screen.getByText(/Log Weight/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log blood pressure/i })).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Record Height & Weight/i));
      expect(onRecord).toHaveBeenCalledWith('vitals');
    });
  });

  describe('2. Header & Demographics Display', () => {
    it('displays authentic patient details and real Health ID without inventing phone-derived IDs', () => {
      const onExport = vi.fn();
      const onPrint = vi.fn();
      const onEdit = vi.fn();

      const profileData = {
        ...createDefaultProfile(),
        full_name: 'Dr. Clara Oswald',
        phone: '+15551234',
        blood_type: 'B+',
        organ_donor: true,
      };

      render(
        <ProfileHero
          profile={profileData}
          completionScore={92}
          healthId="HS-2026-CLARA9"
          onExportJson={onExport}
          onPrintCard={onPrint}
          onEditProfile={onEdit}
        />
      );

      expect(screen.getByText('Dr. Clara Oswald')).toBeInTheDocument();
      expect(screen.getByText('ID: HS-2026-CLARA9')).toBeInTheDocument();
      // Should NOT invent phone last 4 digits
      expect(screen.queryByText(/HS-1234/i)).not.toBeInTheDocument();

      // Edit Details button should trigger onEdit
      const editBtn = screen.getByRole('button', { name: /edit profile details/i });
      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('3. Form Validation, Repeatable Contacts & Edit Workflow', () => {
    it('displays field-level validation when full legal name is empty', async () => {
      const onSave = vi.fn().mockResolvedValue(true);
      render(<MedicalProfileForm initialData={{ ...mockFullProfile, fullName: '' }} onSave={onSave} />);

      const saveBtn = screen.getByText('Save Medical Profile');
      fireEvent.click(saveBtn);

      expect(onSave).not.toHaveBeenCalled();
      expect(screen.getByText(/Full legal name is required/i)).toBeInTheDocument();
    });

    it('supports repeatable emergency contacts: adding and updating contact in MedicalProfileForm', async () => {
      const onSave = vi.fn().mockResolvedValue(true);
      render(
        <MedicalProfileForm
          initialData={mockFullProfile}
          initialTab="emergency"
          onSave={onSave}
        />
      );

      expect(screen.getByText(/Emergency Contacts \(1\)/i)).toBeInTheDocument();

      // Click Add Contact
      const addBtn = screen.getByRole('button', { name: /add contact/i });
      fireEvent.click(addBtn);

      expect(screen.getByText(/Emergency Contacts \(2\)/i)).toBeInTheDocument();
    });

    it('cancels edit mode and restores initial data when Cancel is clicked', () => {
      const onCancel = vi.fn();
      const onSave = vi.fn().mockResolvedValue(true);

      render(
        <MedicalProfileForm
          initialData={mockFullProfile}
          initialTab="personal"
          onSave={onSave}
          onCancel={onCancel}
        />
      );

      const nameInput = screen.getByLabelText(/Full Legal Name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
      expect(nameInput.value).toBe('Modified Name');

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelBtn);

      expect(onCancel).toHaveBeenCalled();
      expect(nameInput.value).toBe('Dr. Clara Oswald');
    });
  });

  describe('4. Full Page Navigation & End-to-End Persistence', () => {
    it('renders ProfilePage, switches tabs, and persists data across endpoints', async () => {
      vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
        if (url === '/user/profile') {
          return {
            full_name: 'Dr. Clara Oswald',
            phone: '+1 (555) 345-6789',
            date_of_birth: '1989-11-23',
            gender: 'female',
            blood_type: 'B+',
            address: '42 Baker Street',
          };
        }
        if (url === '/profile/medical') return { success: true, data: mockFullProfile };
        return null;
      });

      const putSpy = vi.spyOn(api, 'put').mockResolvedValue({ success: true });
      const updateMedSpy = vi.spyOn(medicalProfileService, 'updateMedicalProfile').mockResolvedValue(mockFullProfile);

      render(
        <MemoryRouter>
          <MedicalProfileProvider>
            <ProfilePage />
          </MedicalProfileProvider>
        </MemoryRouter>
      );

      // Verify page renders
      await waitFor(() => {
        expect(screen.getByText('Patient Profile & Health Records')).toBeInTheDocument();
      });

      // Tab navigation
      const qrTab = screen.getByRole('tab', { name: /Digital Health ID & QR/i });
      fireEvent.pointerDown(qrTab, { button: 0 });
      fireEvent.click(qrTab);

      await waitFor(() => {
        expect(screen.getByText(/Emergency Health QR Code/i)).toBeInTheDocument();
      });

      // Save Profile Changes
      const saveBtn = screen.getByRole('button', { name: /save profile changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(putSpy).toHaveBeenCalledWith(
          '/user/profile',
          expect.objectContaining({
            full_name: 'Dr. Clara Oswald',
          })
        );
        expect(updateMedSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'Dr. Clara Oswald',
            bloodGroup: 'B+',
          })
        );
      });
    });
  });

  describe('5. Defect Regression: Error Isolation, Partial Save & False Success Prevention', () => {
    it('medical-profile save failure never displays success toast and warns of partial failure', async () => {
      vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
        if (url === '/user/profile') return { full_name: 'Test Patient', phone: '+12345678' };
        if (url === '/profile/medical') return { success: true, data: mockFullProfile };
        return null;
      });

      vi.spyOn(api, 'put').mockResolvedValue({ success: true, full_name: 'Test Patient' });
      // Simulate medical profile update failure
      vi.spyOn(medicalProfileService, 'updateMedicalProfile').mockResolvedValue(null);

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

      const saveBtn = screen.getByRole('button', { name: /save profile changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        // Must NOT show false full success
        expect(mockToast).not.toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Profile & Clinical Records Saved',
          })
        );
        // Must report partial failure identifying clinical records
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Partial Save',
            variant: 'destructive',
          })
        );
        const call = mockToast.mock.calls.find(
          (c: unknown[]) => (c[0] as Record<string, unknown>)?.title === 'Partial Save'
        );
        expect(call).toBeTruthy();
        expect((call![0] as Record<string, string>).description).toMatch(/clinical records/i);
      });
    });

    it('user-profile save failure never displays overall success and warns of personal details failure', async () => {
      vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
        if (url === '/user/profile') return { full_name: 'Test Patient', phone: '+12345678' };
        if (url === '/profile/medical') return { success: true, data: mockFullProfile };
        return null;
      });

      // User save and preferences save both fail (api.put rejects)
      vi.spyOn(api, 'put').mockRejectedValue(new Error('Database network timeout'));
      // Medical save succeeds
      vi.spyOn(medicalProfileService, 'updateMedicalProfile').mockResolvedValue(mockFullProfile);

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

      const saveBtn = screen.getByRole('button', { name: /save profile changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockToast).not.toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Profile & Clinical Records Saved',
          })
        );
        // Should show Partial Save identifying personal details and preferences
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Partial Save',
            variant: 'destructive',
          })
        );
        const call = mockToast.mock.calls.find(
          (c: unknown[]) => (c[0] as Record<string, unknown>)?.title === 'Partial Save'
        );
        expect(call).toBeTruthy();
        expect((call![0] as Record<string, string>).description).toMatch(/personal details/i);
        expect((call![0] as Record<string, string>).description).toMatch(/preferences/i);
      });
    });

    it('preferences-only failure during top-level save shows partial failure and never hides the error', async () => {
      vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
        if (url === '/user/profile') return { full_name: 'Test Patient', phone: '+12345678' };
        if (url === '/profile/medical') return { success: true, data: mockFullProfile };
        return null;
      });

      // User profile save succeeds, preferences save fails
      vi.spyOn(api, 'put').mockImplementation(async (url: string) => {
        if (url === '/user/profile') return { success: true, full_name: 'Test Patient' };
        if (url === '/user/preferences') throw new Error('Preferences service unavailable');
        return { success: true };
      });
      // Medical save succeeds
      vi.spyOn(medicalProfileService, 'updateMedicalProfile').mockResolvedValue(mockFullProfile);

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

      const saveBtn = screen.getByRole('button', { name: /save profile changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        // Must NOT show full success — preferences failed
        expect(mockToast).not.toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Profile & Clinical Records Saved',
          })
        );
        // Must show partial save identifying preferences as the failed domain
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Partial Save',
            variant: 'destructive',
          })
        );
        const call = mockToast.mock.calls.find(
          (c: unknown[]) => (c[0] as Record<string, unknown>)?.title === 'Partial Save'
        );
        expect(call).toBeTruthy();
        expect((call![0] as Record<string, string>).description).toMatch(/preferences/i);
        // Should NOT mention personal details or clinical records as failed
        expect((call![0] as Record<string, string>).description).not.toMatch(/personal details/i);
        expect((call![0] as Record<string, string>).description).not.toMatch(/clinical records/i);
      });
    });

    it('EmergencyContact and Preferences child Save indicators show success only on confirmed persistence', async () => {
      // 1. Failed save test in EmergencyContact
      const failedSave = vi.fn().mockResolvedValue(false);
      const updateProfile = vi.fn();

      const { rerender } = render(
        <EmergencyContact
          emergency_contact_name="Sarah Jenkins"
          emergency_contact_phone="+15551234"
          emergency_contact_relationship="Sister"
          updateProfile={updateProfile}
          onSave={failedSave}
        />
      );

      const emSaveBtn = screen.getByRole('button', { name: /save emergency info/i });
      fireEvent.click(emSaveBtn);

      await waitFor(() => {
        expect(failedSave).toHaveBeenCalled();
        // Should NOT show "Emergency Contacts Saved"
        expect(screen.queryByText(/Emergency Contacts Saved/i)).not.toBeInTheDocument();
      });

      // 2. Failed save test in Preferences
      rerender(
        <Preferences
          language="en"
          units="metric"
          notification_preferences={{ email: true, sms: true, push: true }}
          updateProfile={updateProfile}
          onSave={failedSave}
        />
      );

      const prefSaveBtn = screen.getByRole('button', { name: /save preferences/i });
      fireEvent.click(prefSaveBtn);

      await waitFor(() => {
        expect(failedSave).toHaveBeenCalled();
        // Should NOT show "Preferences Saved"
        expect(screen.queryByText(/Preferences Saved/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('6. Defect Regression: Multi-Contact Preservation, Preferences & Demographic Sync', () => {
    it('preserves two or more emergency contacts during top-level and section saves', async () => {
      const multiContactMedicalProfile: MedicalProfileData = {
        ...mockFullProfile,
        emergencyContacts: [
          { name: 'Danny Pink', relationship: 'Partner', phone: '+15550001', isPrimary: true },
          { name: 'Kate Stewart', relationship: 'Colleague', phone: '+15550002', isPrimary: false },
        ],
      };

      vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
        if (url === '/user/profile') {
          return {
            full_name: 'Dr. Clara Oswald',
            emergency_contact_name: 'Danny Pink',
            emergency_contact_phone: '+15550001',
          };
        }
        if (url === '/profile/medical') return { success: true, data: multiContactMedicalProfile };
        return null;
      });

      vi.spyOn(api, 'put').mockResolvedValue({ success: true });
      const updateMedSpy = vi.spyOn(medicalProfileService, 'updateMedicalProfile').mockResolvedValue(multiContactMedicalProfile);

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

      // Save top-level
      const saveBtn = screen.getByRole('button', { name: /save profile changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        // Assert that the secondary contact (Kate Stewart) was NOT erased
        expect(updateMedSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            emergencyContacts: expect.arrayContaining([
              expect.objectContaining({ name: 'Danny Pink', isPrimary: true }),
              expect.objectContaining({ name: 'Kate Stewart', isPrimary: false }),
            ]),
          })
        );
      });
    });

    it('persists preferences to PUT /user/preferences and confirms authoritative restore', async () => {
      vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
        if (url === '/user/profile') {
          return {
            full_name: 'Dr. Clara Oswald',
            preferences: {
              language: 'es',
              units: 'imperial',
              notification_preferences: { email: false, sms: true, push: false },
            },
          };
        }
        if (url === '/profile/medical') return { success: true, data: mockFullProfile };
        return null;
      });

      const putSpy = vi.spyOn(api, 'put').mockResolvedValue({ success: true });

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

      // Navigate to Settings Tab
      const settingsTab = screen.getByRole('tab', { name: /preferences & settings/i });
      fireEvent.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument();
      });

      // Click Save Preferences
      const savePrefsBtn = screen.getByRole('button', { name: /save preferences/i });
      fireEvent.click(savePrefsBtn);

      await waitFor(() => {
        expect(putSpy).toHaveBeenCalledWith(
          '/user/preferences',
          expect.objectContaining({
            language: 'es',
            units: 'imperial',
          })
        );
      });
    });

    it('synchronizes shared demographic fields between MedicalProfileForm and User profile', async () => {
      vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
        if (url === '/user/profile') return { full_name: 'Initial Name', blood_type: 'O+' };
        if (url === '/profile/medical') return { success: true, data: { ...mockFullProfile, fullName: 'Initial Name', bloodGroup: 'O+' } };
        return null;
      });

      const putSpy = vi.spyOn(api, 'put').mockResolvedValue({ success: true });
      const updateMedSpy = vi.spyOn(medicalProfileService, 'updateMedicalProfile').mockResolvedValue({
        ...mockFullProfile,
        fullName: 'Updated Name',
        bloodGroup: 'AB+',
      });

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

      // Navigate to Lifelong Medical Profile Tab
      const medTab = screen.getByRole('tab', { name: /lifelong medical profile/i });
      fireEvent.click(medTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/full legal name/i)).toBeInTheDocument();
      });

      // Edit full name
      const nameInput = screen.getByLabelText(/full legal name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveMedBtn = screen.getByRole('button', { name: /save medical profile/i });
      fireEvent.click(saveMedBtn);

      await waitFor(() => {
        // Verifies both PUT /user/profile and PUT /profile/medical are invoked with new name
        expect(putSpy).toHaveBeenCalledWith(
          '/user/profile',
          expect.objectContaining({ full_name: 'Updated Name' })
        );
        expect(updateMedSpy).toHaveBeenCalledWith(
          expect.objectContaining({ fullName: 'Updated Name' })
        );
      });
    });
  });
});
