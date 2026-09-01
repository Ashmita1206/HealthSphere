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
  health_score?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  blood_pressure_sys?: number;
  blood_pressure_dia?: number;
  blood_sugar_fasting?: number;
  health_streak?: number;
  medicine_adherence_rate?: number;
  appointment_completion_rate?: number;
  allergies: string[];
  chronic_diseases: string[];
  surgeries: string[];
  family_history: string[];
  smoking: string;
  alcohol: string;
  exercise_level: string;
  sleep_hours?: number;
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

const asNumber = (value: unknown, fallback?: number): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asBoolean = (value: unknown, fallback = false): boolean =>
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
  insurance_provider: '',
  insurance_policy_number: '',
  organ_donor: false,
  primary_physician: '',
  preferred_hospital: '',
  health_score: undefined,
  height: undefined,
  weight: undefined,
  bmi: undefined,
  blood_pressure_sys: undefined,
  blood_pressure_dia: undefined,
  blood_sugar_fasting: undefined,
  health_streak: undefined,
  medicine_adherence_rate: undefined,
  appointment_completion_rate: undefined,
  allergies: [],
  chronic_diseases: [],
  surgeries: [],
  family_history: [],
  smoking: '',
  alcohol: '',
  exercise_level: '',
  sleep_hours: undefined,
  diet_preference: '',
  language: 'en',
  units: 'metric',
  notification_preferences: {
    email: true,
    sms: true,
    push: true,
  },
  documents: [],
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

  const docs = Array.isArray(data.documents)
    ? (data.documents as ProfileDocument[])
    : [];

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
    insurance_provider: asString(data.insurance_provider),
    insurance_policy_number: asString(data.insurance_policy_number),
    organ_donor: asBoolean(data.organ_donor, false),
    primary_physician: asString(data.primary_physician),
    preferred_hospital: asString(data.preferred_hospital),
    health_score: asNumber(data.health_score),
    height: asNumber(data.height),
    weight: asNumber(data.weight),
    bmi: asNumber(data.bmi),
    blood_pressure_sys: asNumber(data.blood_pressure_sys),
    blood_pressure_dia: asNumber(data.blood_pressure_dia),
    blood_sugar_fasting: asNumber(data.blood_sugar_fasting),
    health_streak: asNumber(data.health_streak),
    medicine_adherence_rate: asNumber(data.medicine_adherence_rate),
    appointment_completion_rate: asNumber(data.appointment_completion_rate),
    allergies: normalizeStringArray(data.allergies),
    chronic_diseases: normalizeStringArray(
      data.chronic_diseases ?? data.chronicDiseases,
    ),
    surgeries: normalizeStringArray(data.surgeries),
    family_history: normalizeStringArray(
      data.family_history ?? data.familyHistory,
    ),
    smoking: asString(data.smoking),
    alcohol: asString(data.alcohol),
    exercise_level: asString(data.exercise_level),
    sleep_hours: asNumber(data.sleep_hours),
    diet_preference: asString(data.diet_preference),
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
