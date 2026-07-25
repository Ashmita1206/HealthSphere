import type { Medicine, MedicineStatus } from './medicineTypes';

const validStatuses: MedicineStatus[] = [
  'active',
  'completed',
  'missed',
  'expired',
  'archived',
];

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asOptionalString = (value: unknown): string | undefined => {
  const stringValue = asString(value).trim();
  return stringValue || undefined;
};

const asOptionalNonNegativeNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined;

const isMedicineStatus = (value: unknown): value is MedicineStatus =>
  typeof value === 'string' && validStatuses.includes(value as MedicineStatus);

export const normalizeMedicine = (
  value: unknown,
  fallbackId: string,
): Medicine => {
  const data =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const status = isMedicineStatus(data.status)
    ? data.status
    : data.is_active === false
      ? 'completed'
      : 'active';

  return {
    id: asString(data.id ?? data._id, fallbackId),
    name: asString(data.name, 'Unnamed medicine'),
    dosage: asString(data.dosage),
    frequency: asString(data.frequency, 'once-daily'),
    strength: asOptionalString(data.strength),
    timing: asOptionalString(data.timing),
    remainingPills: asOptionalNonNegativeNumber(
      data.remainingPills ?? data.remaining_pills,
    ),
    totalPills: asOptionalNonNegativeNumber(
      data.totalPills ?? data.total_pills,
    ),
    startDate: asOptionalString(data.startDate ?? data.start_date),
    endDate: asOptionalString(data.endDate ?? data.end_date),
    doctorName: asOptionalString(data.doctorName ?? data.doctor_name),
    status,
    adherence: asOptionalNonNegativeNumber(
      data.adherence ?? data.adherence_rate,
    ),
    description: asOptionalString(data.description),
    instructions: asOptionalString(data.instructions),
    notes: asOptionalString(data.notes),
    createdAt: asOptionalString(data.createdAt ?? data.created_at),
  };
};

export const parseMedicineDate = (value?: string): Date | null => {
  if (!value) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const parsedDate = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export interface ExpiryStatus {
  label: 'Safe' | 'Expires Soon' | 'Expired';
  className: string;
}

export const getMedicineExpiryStatus = (
  endDate?: string,
  referenceDate = new Date(),
): ExpiryStatus | null => {
  const expiryDate = parseMedicineDate(endDate);
  if (!expiryDate) return null;

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysUntilExpiry = Math.round(
    (startOfDay(expiryDate).getTime() - startOfDay(referenceDate).getTime()) /
      millisecondsPerDay,
  );

  if (daysUntilExpiry < 0) {
    return {
      label: 'Expired',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  if (daysUntilExpiry <= 30) {
    return {
      label: 'Expires Soon',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  return {
    label: 'Safe',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
};

export const isMedicineScheduledForDate = (
  medicine: Medicine,
  date: Date,
): boolean => {
  if (medicine.status === 'archived') return false;

  const targetDate = startOfDay(date);
  const startDate = parseMedicineDate(medicine.startDate);
  const endDate = parseMedicineDate(medicine.endDate);

  if (startDate && targetDate < startOfDay(startDate)) return false;
  if (endDate && targetDate > startOfDay(endDate)) return false;

  const frequency = medicine.frequency.toLowerCase();
  if (frequency.includes('as-needed')) return false;

  if (!startDate) {
    return medicine.status === 'active';
  }

  if (frequency.includes('weekly')) {
    return targetDate.getDay() === startDate.getDay();
  }

  if (frequency.includes('monthly')) {
    return targetDate.getDate() === startDate.getDate();
  }

  return true;
};

export const getMedicinesForDate = (
  medicines: Medicine[] | null | undefined,
  date: Date,
): Medicine[] => {
  const safeMedicines = Array.isArray(medicines) ? medicines : [];
  return safeMedicines.filter((medicine) =>
    isMedicineScheduledForDate(medicine, date),
  );
};

export const getTimingLabels = (timing?: string): string[] => {
  if (!timing?.trim()) return [];

  const safeLabels = timing
    .split(/[,/|]+/)
    .map((label) => label.trim())
    .filter(Boolean);

  return safeLabels;
};
