import { describe, expect, it } from 'vitest';
import {
  createDefaultProfile,
  normalizeProfileData,
} from './profileData';

describe('profile data normalization', () => {
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
});
