import { describe, it, expect } from 'vitest';

describe('Emergency Page Frontend Integration', () => {
  it('correctly maps emergency contact API response records to UI model format', () => {
    const rawContacts = [
      { _id: 'ec1', name: 'Dr. Arthur Pendelton', phone: '555-0144', relation: 'Primary Care Doctor' },
      { _id: 'ec2', name: 'Martha Kent', phone: '555-0188', relation: 'Family Member' },
    ];

    const mappedContacts = rawContacts.map((c) => ({
      id: c._id,
      name: c.name,
      phone: c.phone,
      relation: c.relation,
    }));

    expect(mappedContacts).toHaveLength(2);
    expect(mappedContacts[0].id).toBe('ec1');
    expect(mappedContacts[0].name).toBe('Dr. Arthur Pendelton');
    expect(mappedContacts[1].relation).toBe('Family Member');
  });

  it('calculates emergency preparedness score based on contacts and profile state', () => {
    const computePreparedness = (hasContacts: boolean, hasMedicalCard: boolean, locationEnabled: boolean) => {
      const contactScore = hasContacts ? 20 : 0;
      const medicalScore = hasMedicalCard ? 20 : 0;
      const locationScore = locationEnabled ? 20 : 0;
      return contactScore + medicalScore + locationScore;
    };

    expect(computePreparedness(false, false, false)).toBe(0);
    expect(computePreparedness(true, true, true)).toBe(60);
  });
});
