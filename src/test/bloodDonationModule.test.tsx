import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BloodRequestCard, BloodRequest } from '@/components/bloodDonation/BloodRequestCard';
import { DonorCard, Donor } from '@/components/bloodDonation/DonorCard';
import { DonationStats } from '@/components/bloodDonation/DonationStats';
import { evaluateEligibility, ELIGIBILITY_DISCLAIMER } from '@/components/bloodDonation/eligibilityRules';

describe('HealthSphere Blood & Organ Donation Module Comprehensive Test Suite', () => {
  const sampleRequest: BloodRequest = {
    id: 'req-101',
    patientName: 'Jane Doe',
    bloodGroup: 'B+',
    componentType: 'platelets',
    hospital: 'Apex Heart & Trauma Center',
    approximateArea: 'South Zone, New Delhi',
    unitsRequired: 2,
    requiredDate: '2026-11-15T10:00:00.000Z',
    urgency: 'critical',
    status: 'active',
    isOwner: true,
  };

  const sampleDonor: Donor = {
    id: 'donor-201',
    name: 'Rahul (Volunteer Donor)',
    bloodGroup: 'O+',
    city: 'New Delhi',
    approximateArea: 'Central Delhi',
    availability: 'available',
    lastDonation: '2026-05-10T00:00:00.000Z',
    contactPreference: 'in-app',
  };

  it('1. BloodRequestCard renders without crashing and formats defensive dates correctly', () => {
    const { container } = render(
      <BloodRequestCard
        request={sampleRequest}
        index={0}
        onDelete={() => {}}
        onCancel={() => {}}
        onFulfill={() => {}}
        onEdit={() => {}}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeDefined();
    expect(screen.getByText('B+')).toBeDefined();
    expect(screen.getByText('Apex Heart & Trauma Center')).toBeDefined();
    expect(screen.getByText(/Platelets/i)).toBeDefined();
    expect(screen.getByText(/2 units/i)).toBeDefined();
    expect(screen.getByText(/critical/i)).toBeDefined();

    // Verify no "Invalid Date"
    expect(container.textContent).not.toContain('Invalid Date');
  });

  it('2. BloodRequestCard handles invalid or missing date defensively', () => {
    const invalidDateRequest: BloodRequest = {
      ...sampleRequest,
      requiredDate: 'invalid-date-string',
    };

    const { container } = render(
      <BloodRequestCard
        request={invalidDateRequest}
        index={0}
        onDelete={() => {}}
        onCancel={() => {}}
        onFulfill={() => {}}
        onEdit={() => {}}
        onClick={() => {}}
      />
    );

    expect(container.textContent).not.toContain('Invalid Date');
    expect(container.textContent).toContain('Date as scheduled');
  });

  it('3. BloodRequestCard provides owner-specific actions for request owners', () => {
    render(
      <BloodRequestCard
        request={sampleRequest}
        index={0}
        onDelete={() => {}}
        onCancel={() => {}}
        onFulfill={() => {}}
        onEdit={() => {}}
        onClick={() => {}}
      />
    );

    expect(screen.getByTitle('Edit Request')).toBeDefined();
    expect(screen.getByTitle('Mark as Fulfilled')).toBeDefined();
    expect(screen.getByTitle('Cancel Request')).toBeDefined();
    expect(screen.getByTitle('Delete Request')).toBeDefined();
  });

  it('4. DonorCard does not leak unconsented phone numbers or emails', () => {
    const { container } = render(
      <DonorCard
        donor={sampleDonor}
        index={0}
        onContact={() => {}}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Rahul (Volunteer Donor)')).toBeDefined();
    expect(screen.getByText('O+')).toBeDefined();
    expect(screen.getByText(/Ready for Donation/i)).toBeDefined();

    // Ensure raw contact credentials do not appear in public card markup
    expect(container.textContent).not.toContain('@');
    expect(container.textContent).not.toMatch(/\+91\d{10}/);
  });

  it('5. DonationStats accurately calculates metrics and does not count cancelled/fulfilled requests as open', () => {
    const donors = [
      { id: '1', availability: 'available' },
      { id: '2', availability: 'available' },
      { id: '3', availability: 'unavailable' },
    ];

    const requests = [
      { id: 'r1', status: 'active', urgency: 'critical' },
      { id: 'r2', status: 'active', urgency: 'normal' },
      { id: 'r3', status: 'fulfilled', urgency: 'critical' },
      { id: 'r4', status: 'cancelled', urgency: 'high' },
    ];

    const myDonations = [{ id: 'd1' }, { id: 'd2' }];

    render(
      <DonationStats
        donors={donors}
        requests={requests}
        myDonations={myDonations}
      />
    );

    // Total donors = 3, Available = 2, Open Requests = 2, My Donations = 2
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getAllByText('2').length).toBe(3);

    // Active requests = 2 (not 4)
    // Critical active requests = 1 (not 2, since r3 is fulfilled)
    expect(screen.getByText('Open Requests')).toBeDefined();
    expect(screen.getByText(/1 Critical Blood Request/i)).toBeDefined();
  });

  it('6. DonationStats displays error state with retry when data load fails', () => {
    let retried = false;
    render(
      <DonationStats
        donors={[]}
        requests={[]}
        myDonations={[]}
        error="Network timeout communicating with health service"
        onRetry={() => {
          retried = true;
        }}
      />
    );

    expect(screen.getByText(/Dashboard Metrics Unavailable/i)).toBeDefined();
    expect(screen.getByText(/Network timeout/i)).toBeDefined();
  });

  it('7. Clinical Eligibility disclaimer is prominent and accurate', () => {
    expect(ELIGIBILITY_DISCLAIMER).toContain('Preliminary screening guide only');
    expect(ELIGIBILITY_DISCLAIMER).toContain('HealthSphere cannot certify clinical eligibility');
  });
});
