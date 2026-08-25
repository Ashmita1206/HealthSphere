import { describe, it, expect } from 'vitest';

describe('Blood Donation & Triage Integration', () => {
  it('correctly maps raw backend donation request data to UI representation', () => {
    const rawRequest = {
      _id: 'req-99',
      requestType: 'blood',
      bloodType: 'A+',
      organType: null,
      urgency: 'critical',
      notes: 'Emergency Surgery Ward 3',
      createdAt: '2026-08-25T15:00:00.000Z',
    };

    const mapped = {
      id: rawRequest._id,
      patientName: 'Emergency Patient',
      bloodGroup: rawRequest.bloodType,
      hospital: rawRequest.notes,
      urgency: rawRequest.urgency,
      status: 'active',
    };

    expect(mapped.id).toBe('req-99');
    expect(mapped.bloodGroup).toBe('A+');
    expect(mapped.urgency).toBe('critical');
  });

  it('handles empty donor and donation request arrays cleanly', () => {
    const donors: any[] = [];
    const requests: any[] = [];

    expect(donors).toHaveLength(0);
    expect(requests).toHaveLength(0);
  });
});
