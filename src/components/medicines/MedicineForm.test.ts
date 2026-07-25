import { describe, expect, it } from 'vitest';
import {
  validateMedicineForm,
  type MedicineFormData,
} from './MedicineForm';

const validForm: MedicineFormData = {
  name: 'Paracetamol',
  dosage: '500 mg',
  frequency: 'once-daily',
  startDate: '2026-07-25',
  endDate: '2026-07-30',
  remainingPills: 0,
  totalPills: 30,
};

describe('medicine form validation', () => {
  it('accepts a complete form and allows zero remaining pills', () => {
    expect(validateMedicineForm(validForm)).toEqual({});
  });

  it('requires core fields and a positive total', () => {
    const errors = validateMedicineForm({
      ...validForm,
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      totalPills: 0,
    });

    expect(errors).toMatchObject({
      name: expect.any(String),
      dosage: expect.any(String),
      frequency: expect.any(String),
      startDate: expect.any(String),
      totalPills: expect.any(String),
    });
  });

  it('rejects negative pills and an end date before the start date', () => {
    const errors = validateMedicineForm({
      ...validForm,
      remainingPills: -1,
      endDate: '2026-07-24',
    });

    expect(errors.remainingPills).toBeDefined();
    expect(errors.endDate).toBeDefined();
  });
});
