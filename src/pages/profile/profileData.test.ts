import { describe, expect, it } from 'vitest';
import {
  createDefaultProfile,
  normalizeProfileData,
} from './profileData';

describe('profile data normalization & integrity', () => {
  it.each([undefined, null, {}, { allergies: null }])(
    'returns safe medical arrays for legacy input %#',
    (value) => {
      const profile = normalizeProfileData(value);

      expect(profile.allergies).toEqual([]);
      expect(profile.chronic_diseases).toEqual([]);
      expect(profile.surgeries).toEqual([]);
      expect(profile.family_history).toEqual([]);
    },
  );

  it('normalizes camel-case legacy medical fields', () => {
    const profile = normalizeProfileData({
      allergies: ['Penicillin'],
      chronicDiseases: ['Diabetes'],
      surgeries: ['Appendectomy'],
      familyHistory: ['Heart disease'],
    });

    expect(profile.allergies).toEqual(['Penicillin']);
    expect(profile.chronic_diseases).toEqual(['Diabetes']);
    expect(profile.surgeries).toEqual(['Appendectomy']);
    expect(profile.family_history).toEqual(['Heart disease']);
  });

  it('initializes every medical collection as an array', () => {
    const profile = createDefaultProfile();

    expect(Array.isArray(profile.allergies)).toBe(true);
    expect(Array.isArray(profile.chronic_diseases)).toBe(true);
    expect(Array.isArray(profile.surgeries)).toBe(true);
    expect(Array.isArray(profile.family_history)).toBe(true);
  });

  it('1. Profile with complete real data renders and normalizes correctly', () => {
    const realData = {
      full_name: 'John Doe',
      insurance_provider: 'National Health Insurance',
      insurance_policy_number: 'NHI-998877',
      primary_physician: 'Dr. Alice Smith',
      height: 180,
      weight: 75,
      bmi: 23.1,
      blood_pressure_sys: 120,
      blood_pressure_dia: 80,
      documents: [{ id: 'doc-1', title: 'Lab Result', category: 'lab', date: '2026-01-01', fileSize: '1MB', fileType: 'PDF' }],
    };

    const profile = normalizeProfileData(realData);
    expect(profile.full_name).toBe('John Doe');
    expect(profile.insurance_provider).toBe('National Health Insurance');
    expect(profile.insurance_policy_number).toBe('NHI-998877');
    expect(profile.primary_physician).toBe('Dr. Alice Smith');
    expect(profile.height).toBe(180);
    expect(profile.weight).toBe(75);
    expect(profile.bmi).toBe(23.1);
    expect(profile.documents).toHaveLength(1);
  });

  it('2. Profile with missing medical data does NOT display fabricated values', () => {
    const profile = normalizeProfileData({});

    expect(profile.insurance_provider).toBe('');
    expect(profile.insurance_policy_number).toBe('');
    expect(profile.primary_physician).toBe('');
    expect(profile.preferred_hospital).toBe('');
    expect(profile.health_score).toBeUndefined();
    expect(profile.height).toBeUndefined();
    expect(profile.weight).toBeUndefined();
    expect(profile.bmi).toBeUndefined();
    expect(profile.documents).toEqual([]);
  });

  it('3. Empty insurance data renders honestly', () => {
    const profile = createDefaultProfile();
    expect(profile.insurance_provider).toBe('');
    expect(profile.insurance_policy_number).toBe('');
  });

  it('4. Empty physician data renders honestly', () => {
    const profile = createDefaultProfile();
    expect(profile.primary_physician).toBe('');
    expect(profile.preferred_hospital).toBe('');
  });

  it('5. Empty vitals render honestly', () => {
    const profile = createDefaultProfile();
    expect(profile.height).toBeUndefined();
    expect(profile.weight).toBeUndefined();
    expect(profile.bmi).toBeUndefined();
    expect(profile.blood_pressure_sys).toBeUndefined();
    expect(profile.blood_pressure_dia).toBeUndefined();
    expect(profile.blood_sugar_fasting).toBeUndefined();
  });

  it('6. Empty documents render honestly', () => {
    const profile = createDefaultProfile();
    expect(profile.documents).toEqual([]);
  });
});
