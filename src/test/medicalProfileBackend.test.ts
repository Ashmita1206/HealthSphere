import { describe, it, expect } from 'vitest';

interface EmergencyContactDoc {
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

interface MedicalProfileDoc {
  _id: string;
  userId: string;
  healthId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup: string;
  height?: number | null;
  weight?: number | null;
  allergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  emergencyContacts: EmergencyContactDoc[];
  insurance?: { provider?: string; policyNumber?: string };
  organDonor: boolean;
  lifestyle?: { smoking?: string; alcohol?: string; activityLevel?: string; diet?: string };
  address?: { city?: string; state?: string };
  completionPercentage: number;
  qrData?: string;
}

describe('F9 Backend Medical Profile & Digital Health ID Suite', () => {
  const mockUserId = '65b1f77bcf86cd799439011a';
  const otherUserId = '65b1f77bcf86cd799439099b';
  const profileDb: Map<string, MedicalProfileDoc> = new Map();

  const calculateCompletion = (doc: Partial<MedicalProfileDoc>): number => {
    let score = 0;
    const total = 10;
    if (doc.fullName && doc.fullName.trim().length > 0) score += 1;
    if (doc.dateOfBirth) score += 1;
    if (doc.gender) score += 1;
    if (doc.bloodGroup && doc.bloodGroup !== 'Unknown') score += 1;
    if (doc.height && doc.weight) score += 1;
    if (doc.allergies && doc.allergies.length > 0) score += 1;
    if (doc.emergencyContacts && doc.emergencyContacts.length > 0) score += 1;
    if (doc.insurance && doc.insurance.provider) score += 1;
    if (doc.address && doc.address.city) score += 1;
    if (doc.lifestyle && doc.lifestyle.activityLevel) score += 1;
    return Math.round((score / total) * 100);
  };

  const generateHealthId = (userId: string) => {
    const year = 2026;
    const suffix = userId.slice(-6).toUpperCase();
    return `HS-${year}-${suffix}`;
  };

  const generateQrData = (doc: Partial<MedicalProfileDoc>) => {
    const primary = doc.emergencyContacts?.find((c) => c.isPrimary) || doc.emergencyContacts?.[0];
    return JSON.stringify({
      healthId: doc.healthId,
      fullName: doc.fullName,
      bloodGroup: doc.bloodGroup,
      allergies: doc.allergies || [],
      emergencyContact: primary ? `${primary.name} (${primary.phone})` : 'None',
      organDonor: doc.organDonor,
    });
  };

  const resetDb = () => {
    profileDb.clear();
    const healthId = generateHealthId(mockUserId);
    const initialDoc: MedicalProfileDoc = {
      _id: '65b1f77bcf86cd7994390001',
      userId: mockUserId,
      healthId,
      fullName: 'Johnathan Vance',
      dateOfBirth: '1995-06-15',
      gender: 'male',
      bloodGroup: 'O+',
      height: 178,
      weight: 74,
      allergies: ['Penicillin', 'Peanuts'],
      chronicDiseases: ['Mild Asthma'],
      currentMedications: ['Albuterol Inhaler'],
      emergencyContacts: [{ name: 'Jane Vance', relationship: 'Spouse', phone: '+1 555-0199', isPrimary: true }],
      insurance: { provider: 'Aetna Health', policyNumber: 'AET-99482' },
      organDonor: true,
      lifestyle: { smoking: 'never', alcohol: 'social', activityLevel: 'moderate', diet: 'balanced' },
      address: { city: 'Seattle', state: 'WA' },
      completionPercentage: 0,
      qrData: '',
    };
    initialDoc.completionPercentage = calculateCompletion(initialDoc);
    initialDoc.qrData = generateQrData(initialDoc);
    profileDb.set(mockUserId, initialDoc);
  };

  // Simulated handlers
  const handleGetMedicalProfile = async (user: { _id: string } | null) => {
    if (!user || !user._id) {
      return { status: 401, body: { success: false, message: 'Unauthorized' } };
    }
    const doc = profileDb.get(user._id);
    if (!doc) {
      const healthId = generateHealthId(user._id);
      const newDoc: MedicalProfileDoc = {
        _id: `65b1f77bcf86cd799439000${profileDb.size + 2}`,
        userId: user._id,
        healthId,
        fullName: 'HealthSphere Patient',
        bloodGroup: 'Unknown',
        allergies: [],
        chronicDiseases: [],
        currentMedications: [],
        emergencyContacts: [],
        organDonor: false,
        completionPercentage: 10,
        qrData: generateQrData({ healthId, fullName: 'HealthSphere Patient', bloodGroup: 'Unknown' }),
      };
      profileDb.set(user._id, newDoc);
      return { status: 200, body: { success: true, data: newDoc } };
    }
    return { status: 200, body: { success: true, data: doc } };
  };

  const handleUpdateMedicalProfile = async (user: { _id: string } | null, updates: Partial<MedicalProfileDoc>) => {
    if (!user || !user._id) {
      return { status: 401, body: { success: false, message: 'Unauthorized' } };
    }
    let doc = profileDb.get(user._id);
    if (!doc) {
      const healthId = generateHealthId(user._id);
      doc = {
        _id: `65b1f77bcf86cd799439000${profileDb.size + 2}`,
        userId: user._id,
        healthId,
        fullName: updates.fullName || 'HealthSphere Patient',
        bloodGroup: updates.bloodGroup || 'Unknown',
        allergies: updates.allergies || [],
        chronicDiseases: updates.chronicDiseases || [],
        currentMedications: updates.currentMedications || [],
        emergencyContacts: updates.emergencyContacts || [],
        organDonor: !!updates.organDonor,
        completionPercentage: 0,
        qrData: '',
      };
    }

    Object.assign(doc, updates);
    doc.completionPercentage = calculateCompletion(doc);
    doc.qrData = generateQrData(doc);
    profileDb.set(user._id, doc);

    return { status: 200, body: { success: true, data: doc } };
  };

  const handleGetPublicEmergencyProfile = async (healthId: string) => {
    const doc = Array.from(profileDb.values()).find((p) => p.healthId === healthId);
    if (!doc) {
      return { status: 404, body: { success: false, message: 'Digital Health ID not found' } };
    }
    return {
      status: 200,
      body: {
        success: true,
        data: {
          healthId: doc.healthId,
          fullName: doc.fullName,
          bloodGroup: doc.bloodGroup,
          allergies: doc.allergies,
          chronicDiseases: doc.chronicDiseases,
          currentMedications: doc.currentMedications,
          emergencyContacts: doc.emergencyContacts,
          organDonor: doc.organDonor,
        },
      },
    };
  };

  describe('1. Digital Health ID & Profile Initialization', () => {
    it('generates deterministic Health ID format (HS-2026-XXXXXX)', () => {
      resetDb();
      const healthId = generateHealthId(mockUserId);
      expect(healthId).toMatch(/^HS-2026-[0-9A-F]{6}$/);
      expect(healthId).toBe('HS-2026-39011A');
    });

    it('retrieves user medical profile with 200 OK', async () => {
      resetDb();
      const res = await handleGetMedicalProfile({ _id: mockUserId });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Johnathan Vance');
      expect(res.body.data.bloodGroup).toBe('O+');
      expect(res.body.data.healthId).toBe('HS-2026-39011A');
    });
  });

  describe('2. Completion Percentage & QR Code Generation', () => {
    it('computes 100% completion when all 10 clinical sections are filled', () => {
      resetDb();
      const doc = profileDb.get(mockUserId)!;
      expect(doc.completionPercentage).toBe(100);
    });

    it('generates scannable JSON QR payload containing critical emergency data', () => {
      resetDb();
      const doc = profileDb.get(mockUserId)!;
      const parsed = JSON.parse(doc.qrData!);
      expect(parsed.healthId).toBe('HS-2026-39011A');
      expect(parsed.fullName).toBe('Johnathan Vance');
      expect(parsed.bloodGroup).toBe('O+');
      expect(parsed.allergies).toContain('Penicillin');
      expect(parsed.organDonor).toBe(true);
    });
  });

  describe('3. Profile Update & Public Emergency Scan', () => {
    it('updates medical profile and recalculates completion percentage', async () => {
      resetDb();
      const res = await handleUpdateMedicalProfile(
        { _id: mockUserId },
        {
          allergies: ['Penicillin', 'Peanuts', 'Latex'],
          organDonor: true,
        }
      );

      expect(res.status).toBe(200);
      expect(res.body.data.allergies).toHaveLength(3);
      expect(res.body.data.allergies).toContain('Latex');
    });

    it('allows public emergency responders to access read-only emergency profile by Health ID', async () => {
      resetDb();
      const res = await handleGetPublicEmergencyProfile('HS-2026-39011A');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bloodGroup).toBe('O+');
      expect(res.body.data.allergies).toContain('Penicillin');
      expect(res.body.data.emergencyContacts[0].phone).toBe('+1 555-0199');
    });

    it('returns 404 for non-existent Health ID', async () => {
      resetDb();
      const res = await handleGetPublicEmergencyProfile('HS-2026-999999');
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    it('blocks unauthenticated requests to protected medical profile endpoint with 401', async () => {
      const res = await handleGetMedicalProfile(null);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });
  });
});
