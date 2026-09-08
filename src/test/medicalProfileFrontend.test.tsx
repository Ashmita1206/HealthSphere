import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DigitalHealthCard } from '@/components/medical-profile/DigitalHealthCard';
import { QRCodeCard } from '@/components/medical-profile/QRCodeCard';
import { EmergencyCard } from '@/components/medical-profile/EmergencyCard';
import { ProfileCompletion } from '@/components/medical-profile/ProfileCompletion';
import { MedicalProfileCard } from '@/components/medical-profile/MedicalProfileCard';
import { MedicalProfileForm } from '@/components/medical-profile/MedicalProfileForm';
import type { MedicalProfileData } from '@/services/medicalProfileService';

const mockProfile: MedicalProfileData = {
  healthId: 'HS-2026-AB1234',
  fullName: 'Alice Walker',
  dateOfBirth: '1992-04-12',
  gender: 'female',
  bloodGroup: 'A+',
  height: 168,
  weight: 62,
  allergies: ['Penicillin', 'Dust'],
  chronicDiseases: ['Mild Asthma'],
  currentMedications: ['Montelukast 10mg'],
  surgeries: [],
  familyHistory: [],
  emergencyContacts: [
    { name: 'Bob Walker', relationship: 'Brother', phone: '+1 555-4321', isPrimary: true },
  ],
  insurance: { provider: 'BlueCross', policyNumber: 'BC-12345' },
  organDonor: true,
  vaccinations: [],
  lifestyle: { smoking: 'never', alcohol: 'social', activityLevel: 'moderate', diet: 'balanced' },
  address: { city: 'Boston', state: 'MA' },
  completionPercentage: 100,
};

describe('F9 Frontend Medical Profile & Digital Health ID UI Suite', () => {
  it('renders DigitalHealthCard with patient name, Health ID, and blood group', () => {
    render(<DigitalHealthCard profile={mockProfile} />);

    expect(screen.getByText('Alice Walker')).toBeInTheDocument();
    expect(screen.getByText('HS-2026-AB1234')).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
    expect(screen.getByText(/VERIFIED PATIENT/i)).toBeInTheDocument();
    expect(screen.getByText('Print Card')).toBeInTheDocument();
  });

  it('renders QRCodeCard with scannable SVG and copy link action', () => {
    render(
      <QRCodeCard
        healthId="HS-2026-AB1234"
        fullName="Alice Walker"
        bloodGroup="A+"
      />
    );

    expect(screen.getByText(/Emergency Health QR Code/i)).toBeInTheDocument();
    expect(screen.getByText('HS-2026-AB1234')).toBeInTheDocument();
    expect(screen.getByText('Copy Emergency Link')).toBeInTheDocument();
  });

  it('renders EmergencyCard with prominent blood group and direct call action', () => {
    render(<EmergencyCard profile={mockProfile} />);

    expect(screen.getByText(/Paramedic Emergency Medical Summary/i)).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
    expect(screen.getByText('Penicillin')).toBeInTheDocument();
    expect(screen.getByText('Montelukast 10mg')).toBeInTheDocument();
    expect(screen.getByText('Bob Walker')).toBeInTheDocument();
    expect(screen.getByText('Call Now')).toBeInTheDocument();
  });

  it('renders ProfileCompletion progress and suggestions', () => {
    const onNavigate = vi.fn();
    render(
      <ProfileCompletion
        profile={{ ...mockProfile, bloodGroup: 'Unknown', completionPercentage: 60 }}
        onNavigateToTab={onNavigate}
      />
    );

    expect(screen.getByText(/Medical Profile Completeness/i)).toBeInTheDocument();
    expect(screen.getByText('60% Complete')).toBeInTheDocument();
    expect(screen.getByText(/Set verified Blood Group/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Set verified Blood Group/i));
    expect(onNavigate).toHaveBeenCalledWith('vitals');
  });

  it('renders MedicalProfileCard clinical summary with calculated BMI', () => {
    render(<MedicalProfileCard profile={mockProfile} />);

    expect(screen.getByText(/Lifelong Clinical Summary/i)).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
    expect(screen.getByText(/BMI/i)).toBeInTheDocument();
    expect(screen.getByText('Penicillin')).toBeInTheDocument();
  });

  it('renders MedicalProfileForm tabs and allows saving', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(<MedicalProfileForm initialData={mockProfile} onSave={onSave} />);

    expect(screen.getByText(/Edit Lifelong Medical Profile/i)).toBeInTheDocument();
    expect(screen.getByText('Blood & Vitals')).toBeInTheDocument();
    expect(screen.getByText('Clinical History')).toBeInTheDocument();
    expect(screen.getByText('Emergency & Insurance')).toBeInTheDocument();

    const saveBtn = screen.getByText('Save Medical Profile');
    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalled();
  });
});
