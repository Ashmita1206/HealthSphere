import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { DoctorCard } from '@/components/doctor/DoctorCard';
import { DoctorDirectory } from '@/components/doctor/DoctorDirectory';
import { SharePermissions } from '@/components/share/SharePermissions';
import { ShareTokenCard } from '@/components/share/ShareTokenCard';
import { AccessExpired } from '@/components/share/AccessExpired';
import { ShareHistory } from '@/components/share/ShareHistory';
import { SharedRecordViewer } from '@/components/share/SharedRecordViewer';
import type { Doctor } from '@/services/doctorService';
import type {
  SharePermissions as PermissionsType,
  MedicalShareItem,
  SharesData,
  SharedPatientData,
} from '@/services/shareService';

const mockDoctor: Doctor = {
  _id: 'doc-001',
  doctorId: 'DOC-882101',
  fullName: 'Dr. Sarah Jenkins, MD',
  email: 'sarah.jenkins@stjude-health.org',
  specialization: 'Cardiology',
  hospital: 'St. Jude Heart & Vascular Institute',
  experience: 14,
  qualification: 'MD, FACC, Harvard Medical School',
  licenseNumber: 'MED-CA-99281',
  availability: ['Monday - Friday: 08:30 - 16:30'],
  verified: true,
};

const mockPermissions: PermissionsType = {
  profile: true,
  reports: true,
  medicines: false,
  appointments: false,
  timeline: false,
  analytics: false,
  emergency: true,
};

const mockShares: SharesData = {
  active: [
    {
      _id: 'share-001',
      patientId: 'pat-1',
      doctorId: mockDoctor,
      shareToken: 'HS_SHARE_a1b2c3d4e5f607182930415263748596',
      expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      permissions: mockPermissions,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  expired: [
    {
      _id: 'share-002',
      patientId: 'pat-1',
      doctorId: mockDoctor,
      shareToken: 'HS_SHARE_pasttoken1234567890abcdef1234',
      expiresAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      permissions: mockPermissions,
      status: 'expired',
      createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
  ],
  revoked: [],
  all: [],
};

describe('F10 Frontend Doctor Portal & Record Sharing Suite', () => {
  it('1. Renders DoctorCard with doctor credentials and Share Records CTA', () => {
    const handleShare = vi.fn();
    render(<DoctorCard doctor={mockDoctor} onShare={handleShare} />);

    expect(screen.getByText('Dr. Sarah Jenkins, MD')).toBeInTheDocument();
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
    expect(screen.getByText('St. Jude Heart & Vascular Institute')).toBeInTheDocument();
    expect(screen.getByText(/14 yrs experience/i)).toBeInTheDocument();

    const shareBtn = screen.getByRole('button', { name: /share records/i });
    expect(shareBtn).toBeInTheDocument();
    fireEvent.click(shareBtn);
    expect(handleShare).toHaveBeenCalledWith(mockDoctor);
  });

  it('2. Renders DoctorDirectory with search filter and doctor listing', () => {
    const handleShare = vi.fn();
    render(
      <DoctorDirectory
        doctors={[mockDoctor]}
        loading={false}
        onShareDoctor={handleShare}
      />
    );

    expect(screen.getByPlaceholderText(/search doctors by name/i)).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Jenkins, MD')).toBeInTheDocument();
  });

  it('3. Renders SharePermissions and handles granular permission toggles', () => {
    const handleChange = vi.fn();
    render(
      <SharePermissions
        permissions={mockPermissions}
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Medical Profile')).toBeInTheDocument();
    expect(screen.getByText('Medications')).toBeInTheDocument();
    expect(screen.getByText('Medical Reports')).toBeInTheDocument();
    expect(screen.getByText('Emergency Information')).toBeInTheDocument();

    // Toggle a checkbox
    const profileItem = screen.getByText('Medical Profile');
    fireEvent.click(profileItem);
    expect(handleChange).toHaveBeenCalled();
  });

  it('4. Renders ShareTokenCard with token, copy link, and expiration date', () => {
    const handleRevoke = vi.fn();
    render(
      <ShareTokenCard
        shareToken="HS_SHARE_test1234567890abcdef"
        shareLink="http://localhost:8081/#/shared/HS_SHARE_test1234567890abcdef"
        doctorName="Dr. Sarah Jenkins, MD"
        hospital="St. Jude Heart"
        expiresAt={new Date(Date.now() + 3600 * 1000).toISOString()}
        onRevoke={handleRevoke}
      />
    );

    expect(screen.getByText('HS_SHARE_test1234567890abcdef')).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Jenkins, MD')).toBeInTheDocument();
    expect(screen.getByText('St. Jude Heart')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();

    const revokeBtn = screen.getByRole('button', { name: /revoke access/i });
    fireEvent.click(revokeBtn);
    expect(handleRevoke).toHaveBeenCalled();
  });

  it('5. Renders AccessExpired for expired and revoked states', () => {
    const { rerender } = render(
      <BrowserRouter>
        <AccessExpired status="expired" message="Link expired" />
      </BrowserRouter>
    );

    expect(screen.getByText(/Medical Share Link Expired/i)).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <AccessExpired status="revoked" message="Access was revoked by the patient." />
      </BrowserRouter>
    );

    expect(screen.getByText(/Access Revoked by Patient/i)).toBeInTheDocument();
  });

  it('6. Renders ShareHistory with active, expired, and revoked tabs', () => {
    const handleRevoke = vi.fn().mockResolvedValue(undefined);
    render(
      <ShareHistory
        shares={mockShares}
        loading={false}
        onRevoke={handleRevoke}
      />
    );

    expect(screen.getByText('Dr. Sarah Jenkins, MD')).toBeInTheDocument();
    expect(screen.getByText(/Active Session/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Revoke$/i })).toBeInTheDocument();
  });

  it('7. Renders SharedRecordViewer strictly projecting permitted resources', () => {
    const sharedData: SharedPatientData = {
      shareToken: 'HS_SHARE_demo123456',
      doctor: mockDoctor,
      patient: { id: 'pat-1', name: 'Alice Walker' },
      permissions: {
        profile: true,
        reports: true,
        medicines: false, // unpermitted
        appointments: false,
        timeline: false,
        analytics: false,
        emergency: false,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      records: {
        profile: {
          fullName: 'Alice Walker',
          bloodGroup: 'A+',
          healthId: 'HS-2026-AB1234',
        },
        reports: [
          {
            title: 'Diagnostic Blood Chemistry',
            riskLevel: 'low',
            summary: 'Normal blood chemistry panel',
          },
        ],
      },
    };

    render(<SharedRecordViewer data={sharedData} />);

    // Permitted records MUST be visible
    expect(screen.getByText(/Patient Medical Record: Alice Walker/i)).toBeInTheDocument();
    expect(screen.getByText('Diagnostic Blood Chemistry')).toBeInTheDocument();
    expect(screen.getByText('HS-2026-AB1234')).toBeInTheDocument();

    // Denied sections must NOT be rendered
    expect(screen.queryByText(/Active Prescriptions & Medication Adherence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Health Journey & Timeline/i)).not.toBeInTheDocument();
  });
});
