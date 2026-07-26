import { describe, expect, it } from 'vitest';
import {
  getMedicineExpiryStatus,
  getMedicinesForDate,
  normalizeMedicine,
} from './medicineUtils';
import type { Medicine } from './medicineTypes';

const medicine = (overrides: Partial<Medicine> = {}): Medicine => ({
  id: 'medicine-1',
  name: 'Paracetamol',
  dosage: '500 mg',
  frequency: 'once-daily',
  status: 'active',
  ...overrides,
});

describe('medicine utilities', () => {
  it('normalizes current API medicine fields', () => {
    expect(
      normalizeMedicine(
        {
          id: '1',
          name: 'Paracetamol',
          dosage: '500 mg',
          frequency: 'once-daily',
          is_active: true,
          adherence_rate: 95,
        },
        'fallback',
      ),
    ).toMatchObject({
      id: '1',
      status: 'active',
      adherence: 95,
    });
  });

  it.each([
    ['2026-07-24', 'Expired'],
    ['2026-08-10', 'Expires Soon'],
    ['2026-09-10', 'Safe'],
  ] as const)('labels %s as %s', (endDate, label) => {
    expect(
      getMedicineExpiryStatus(endDate, new Date(2026, 6, 25))?.label,
    ).toBe(label);
  });

  it('computes scheduled medicines for a selected day', () => {
    const medicines = [
      medicine({
        id: 'daily',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
      }),
      medicine({
        id: 'future',
        startDate: '2026-08-01',
      }),
      medicine({
        id: 'archived',
        status: 'archived',
      }),
    ];

    expect(
      getMedicinesForDate(medicines, new Date(2026, 6, 25)).map(
        (item) => item.id,
      ),
    ).toEqual(['daily']);
  });
});
