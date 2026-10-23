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
  current_medications: string[];
  surgeries: string[];
  family_history: string[];
  emergency_contacts: Array<{ name: string; phone: string; relationship: string; isPrimary?: boolean }>;
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
  emergency_contacts: [],
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
  current_medications: [],
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

  const prefData =
    data.preferences && typeof data.preferences === 'object'
      ? (data.preferences as Record<string, unknown>)
      : data;
  const rawNotif =
    prefData.notification_preferences ??
    prefData.notificationPreferences ??
    data.notification_preferences;
  const notificationPreferences =
    rawNotif && typeof rawNotif === 'object'
      ? (rawNotif as Record<string, unknown>)
      : {};

  const docs = Array.isArray(data.documents)
    ? (data.documents as ProfileDocument[])
    : [];

  return {
    full_name: asString(data.full_name ?? data.name),
    phone: asString(data.phone),
    date_of_birth: asString(data.date_of_birth ?? data.dateOfBirth),
    gender: asString(data.gender),
    blood_type: asString(data.blood_type ?? data.bloodType),
    address: asString(data.address),
    emergency_contact_name: asString(data.emergency_contact_name ?? data.emergencyContactName),
    emergency_contact_phone: asString(data.emergency_contact_phone ?? data.emergencyContactPhone),
    emergency_contact_relationship: asString(
      data.emergency_contact_relationship ?? data.emergencyContactRelationship
    ),
    emergency_contacts: Array.isArray(data.emergency_contacts ?? data.emergencyContacts)
      ? ((data.emergency_contacts ?? data.emergencyContacts) as Array<{
          name: string;
          phone: string;
          relationship: string;
          isPrimary?: boolean;
        }>)
      : [],
    insurance_provider: asString(data.insurance_provider),
    insurance_policy_number: asString(data.insurance_policy_number),
    organ_donor: asBoolean(data.organ_donor, false),
    primary_physician: asString(data.primary_physician ?? data.primaryPhysician),
    preferred_hospital: asString(data.preferred_hospital ?? data.preferredHospital),
    health_score: asNumber(data.health_score ?? data.healthScore),
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
      data.chronic_diseases ?? data.chronicDiseases
    ),
    current_medications: normalizeStringArray(
      data.current_medications ?? data.currentMedications ?? data.medications
    ),
    surgeries: normalizeStringArray(data.surgeries),
    family_history: normalizeStringArray(
      data.family_history ?? data.familyHistory
    ),
    smoking: asString(data.smoking),
    alcohol: asString(data.alcohol),
    exercise_level: asString(data.exercise_level),
    sleep_hours: asNumber(data.sleep_hours),
    diet_preference: asString(data.diet_preference),
    language: asString(prefData.language ?? data.language, defaults.language),
    units: asString(prefData.units ?? data.units, defaults.units),
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

export const mergeProfileAndMedicalData = (
  userData: unknown,
  medData?: {
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    height?: number | null;
    weight?: number | null;
    allergies?: string[];
    chronicDiseases?: string[];
    currentMedications?: string[];
    surgeries?: Array<{ name: string } | string>;
    familyHistory?: Array<{ relation: string; condition: string } | string>;
    emergencyContacts?: Array<{ name: string; phone: string; relationship?: string; isPrimary?: boolean }>;
    insurance?: { provider?: string; policyNumber?: string };
    organDonor?: boolean;
    primaryPhysician?: string;
    preferredHospital?: string;
    lifestyle?: { smoking?: string; alcohol?: string; activityLevel?: string; diet?: string };
    address?: { street?: string; city?: string; state?: string; postalCode?: string; country?: string } | string;
  } | null
): Profile => {
  const base = normalizeProfileData(userData);
  if (!medData) return base;

  const surgeries = medData.surgeries?.length
    ? medData.surgeries.map((s) => (typeof s === 'string' ? s : s.name))
    : base.surgeries;

  const familyHistory = medData.familyHistory?.length
    ? medData.familyHistory.map((f) =>
        typeof f === 'string' ? f : `${f.relation}: ${f.condition}`
      )
    : base.family_history;

  const primaryContact =
    medData.emergencyContacts?.find((c) => c.isPrimary) ||
    medData.emergencyContacts?.[0];

  const medAddress = typeof medData.address === 'string' ? medData.address : medData.address?.street;

  return {
    ...base,
    full_name: (medData.fullName && medData.fullName !== 'HealthSphere Patient' ? medData.fullName : '') || base.full_name || medData.fullName || '',
    date_of_birth: medData.dateOfBirth || base.date_of_birth || '',
    gender: medData.gender || base.gender || '',
    blood_type: (medData.bloodGroup && medData.bloodGroup !== 'Unknown' ? medData.bloodGroup : '') || base.blood_type || '',
    height: typeof medData.height === 'number' ? medData.height : base.height,
    weight: typeof medData.weight === 'number' ? medData.weight : base.weight,
    allergies: medData.allergies?.length ? medData.allergies : base.allergies,
    chronic_diseases: medData.chronicDiseases?.length ? medData.chronicDiseases : base.chronic_diseases,
    current_medications: medData.currentMedications?.length ? medData.currentMedications : base.current_medications,
    surgeries,
    family_history: familyHistory,
    smoking: medData.lifestyle?.smoking || base.smoking,
    alcohol: medData.lifestyle?.alcohol || base.alcohol,
    exercise_level: medData.lifestyle?.activityLevel || base.exercise_level,
    diet_preference: medData.lifestyle?.diet || base.diet_preference,
    insurance_provider: medData.insurance?.provider || base.insurance_provider,
    insurance_policy_number: medData.insurance?.policyNumber || base.insurance_policy_number,
    organ_donor: typeof medData.organDonor === 'boolean' ? medData.organDonor : base.organ_donor,
    primary_physician: medData.primaryPhysician || base.primary_physician || '',
    preferred_hospital: medData.preferredHospital || base.preferred_hospital || '',
    emergency_contact_name: primaryContact?.name || base.emergency_contact_name || '',
    emergency_contact_phone: primaryContact?.phone || base.emergency_contact_phone || '',
    emergency_contact_relationship: primaryContact?.relationship || base.emergency_contact_relationship || '',
    emergency_contacts: (medData.emergencyContacts?.length ? medData.emergencyContacts : base.emergency_contacts) as Array<{
      name: string;
      phone: string;
      relationship: string;
      isPrimary?: boolean;
    }>,
    address: medAddress || base.address || '',
  };
};
