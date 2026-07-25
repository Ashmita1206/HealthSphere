export interface ProfileDocument {
  id: string;
  title: string;
  category: 'report' | 'lab' | 'prescription' | 'vaccination' | 'insurance';
  date: string;
  fileSize: string;
  fileType: string;
  url?: string;
}

export interface Profile {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  insurance_provider: string;
  insurance_policy_number: string;
  organ_donor: boolean;
  primary_physician: string;
  preferred_hospital: string;
  health_score: number;
  height: number;
  weight: number;
  bmi: number;
  blood_pressure_sys: number;
  blood_pressure_dia: number;
  blood_sugar_fasting: number;
  health_streak: number;
  medicine_adherence_rate: number;
  appointment_completion_rate: number;
  allergies: string[];
  chronic_diseases: string[];
  surgeries: string[];
  family_history: string[];
  smoking: string;
  alcohol: string;
  exercise_level: string;
  sleep_hours: number;
  diet_preference: string;
  language: string;
  units: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  documents: ProfileDocument[];
}

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

export const normalizeStringArray = (value: unknown): string[] => {
  const safeValues = Array.isArray(value) ? value : [];
  return safeValues.filter((item): item is string => typeof item === 'string');
};

export const createDefaultProfile = (): Profile => ({
  full_name: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  blood_type: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  insurance_provider: 'CareHealth Premier Gold',
  insurance_policy_number: 'CH-98745210',
  organ_donor: true,
  primary_physician: 'Dr. Vikram Malhotra (Internal Medicine)',
  preferred_hospital: 'HealthSphere Specialty Hospital',
  health_score: 85,
  height: 175,
  weight: 70,
  bmi: 22.9,
  blood_pressure_sys: 118,
  blood_pressure_dia: 76,
  blood_sugar_fasting: 94,
  health_streak: 14,
  medicine_adherence_rate: 96,
  appointment_completion_rate: 100,
  allergies: [],
  chronic_diseases: [],
  surgeries: [],
  family_history: [],
  smoking: 'Non-smoker',
  alcohol: 'Occasional',
  exercise_level: 'Moderate',
  sleep_hours: 8,
  diet_preference: 'Balanced Whole Foods',
  language: 'en',
  units: 'metric',
  notification_preferences: {
    email: true,
    sms: true,
    push: true,
  },
  documents: [
    {
      id: 'doc-1',
      title: 'Annual Comprehensive Lipid Panel.pdf',
      category: 'lab',
      date: '2026-06-15',
      fileSize: '1.8 MB',
      fileType: 'PDF',
    },
    {
      id: 'doc-2',
      title: 'Cardiology Consultation Report.pdf',
      category: 'report',
      date: '2026-05-20',
      fileSize: '2.4 MB',
      fileType: 'PDF',
    },
    {
      id: 'doc-3',
      title: 'Metformin & Statin Prescription.png',
      category: 'prescription',
      date: '2026-07-01',
      fileSize: '950 KB',
      fileType: 'PNG',
    },
    {
      id: 'doc-4',
      title: 'COVID-19 & Tdap Booster Certificate.pdf',
      category: 'vaccination',
      date: '2025-11-10',
      fileSize: '1.2 MB',
      fileType: 'PDF',
    },
    {
      id: 'doc-5',
      title: 'Health Insurance Membership Card.pdf',
      category: 'insurance',
      date: '2026-01-01',
      fileSize: '3.1 MB',
      fileType: 'PDF',
    },
  ],
});

export const normalizeProfileData = (value: unknown): Profile => {
  const defaults = createDefaultProfile();
  const data =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const notificationPreferences =
    data.notification_preferences &&
    typeof data.notification_preferences === 'object'
      ? (data.notification_preferences as Record<string, unknown>)
      : {};

  const docs = Array.isArray(data.documents) ? (data.documents as ProfileDocument[]) : defaults.documents;

  return {
    full_name: asString(data.full_name),
    phone: asString(data.phone),
    date_of_birth: asString(data.date_of_birth),
    gender: asString(data.gender),
    blood_type: asString(data.blood_type),
    address: asString(data.address),
    emergency_contact_name: asString(data.emergency_contact_name),
    emergency_contact_phone: asString(data.emergency_contact_phone),
    emergency_contact_relationship: asString(
      data.emergency_contact_relationship,
    ),
    insurance_provider: asString(data.insurance_provider, defaults.insurance_provider),
    insurance_policy_number: asString(data.insurance_policy_number, defaults.insurance_policy_number),
    organ_donor: asBoolean(data.organ_donor, defaults.organ_donor),
    primary_physician: asString(data.primary_physician, defaults.primary_physician),
    preferred_hospital: asString(data.preferred_hospital, defaults.preferred_hospital),
    health_score: asNumber(data.health_score, defaults.health_score),
    height: asNumber(data.height, defaults.height),
    weight: asNumber(data.weight, defaults.weight),
    bmi: asNumber(data.bmi, defaults.bmi),
    blood_pressure_sys: asNumber(data.blood_pressure_sys, defaults.blood_pressure_sys),
    blood_pressure_dia: asNumber(data.blood_pressure_dia, defaults.blood_pressure_dia),
    blood_sugar_fasting: asNumber(data.blood_sugar_fasting, defaults.blood_sugar_fasting),
    health_streak: asNumber(data.health_streak, defaults.health_streak),
    medicine_adherence_rate: asNumber(data.medicine_adherence_rate, defaults.medicine_adherence_rate),
    appointment_completion_rate: asNumber(data.appointment_completion_rate, defaults.appointment_completion_rate),
    allergies: normalizeStringArray(data.allergies),
    chronic_diseases: normalizeStringArray(
      data.chronic_diseases ?? data.chronicDiseases,
    ),
    surgeries: normalizeStringArray(data.surgeries),
    family_history: normalizeStringArray(
      data.family_history ?? data.familyHistory,
    ),
    smoking: asString(data.smoking, defaults.smoking),
    alcohol: asString(data.alcohol, defaults.alcohol),
    exercise_level: asString(data.exercise_level, defaults.exercise_level),
    sleep_hours: asNumber(data.sleep_hours, defaults.sleep_hours),
    diet_preference: asString(data.diet_preference, defaults.diet_preference),
    language: asString(data.language, defaults.language),
    units: asString(data.units, defaults.units),
    notification_preferences: {
      email:
        typeof notificationPreferences.email === 'boolean'
          ? notificationPreferences.email
          : defaults.notification_preferences.email,
      sms:
        typeof notificationPreferences.sms === 'boolean'
          ? notificationPreferences.sms
          : defaults.notification_preferences.sms,
      push:
        typeof notificationPreferences.push === 'boolean'
          ? notificationPreferences.push
          : defaults.notification_preferences.push,
    },
    documents: docs,
  };
};

