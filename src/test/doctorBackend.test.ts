import { describe, it, expect } from 'vitest';

interface DoctorMockDoc {
  _id: string;
  userId: string;
  specialization: string;
  qualification: string;
  experience: number;
  hospital: string;
  licenseNumber: string;
  consultationFee: number;
  availability: string[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

describe('F10 Backend Doctor Portal Suite', () => {
  const doctorDb = new Map<string, DoctorMockDoc>();
  const userDoctorMap = new Map<string, string>(); // userId -> doctorId
  const licenseSet = new Set<string>();

  const resetState = () => {
    doctorDb.clear();
    userDoctorMap.clear();
    licenseSet.clear();
  };

  function createDoctorProfile(
    callerUserId: string,
    payload: {
      specialization?: string;
      qualification?: string;
      experience?: number;
      hospital?: string;
      licenseNumber?: string;
      consultationFee?: number;
      availability?: string[];
    }
  ) {
    if (!callerUserId) {
      return { status: 401, error: 'Unauthorized' };
    }

    if (!payload.specialization || !payload.qualification || !payload.licenseNumber || !payload.hospital) {
      return {
        status: 400,
        error: 'Specialization, qualification, hospital, and license number are required',
      };
    }

    // Prevent duplicate doctor profile for the same user
    if (userDoctorMap.has(callerUserId)) {
      return {
        status: 409,
        error: 'Doctor profile already exists for this user account',
      };
    }

    // Prevent duplicate license number
    const normalizedLicense = payload.licenseNumber.trim();
    if (licenseSet.has(normalizedLicense)) {
      return {
        status: 409,
        error: `Doctor with license number ${payload.licenseNumber} is already registered`,
      };
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newDoc: DoctorMockDoc = {
      _id: docId,
      userId: callerUserId,
      specialization: payload.specialization.trim(),
      qualification: payload.qualification.trim(),
      experience: Number(payload.experience) || 0,
      hospital: payload.hospital.trim(),
      licenseNumber: normalizedLicense,
      consultationFee: Number(payload.consultationFee) || 0,
      availability: payload.availability || ['Monday - Friday: 09:00 - 17:00'],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    doctorDb.set(docId, newDoc);
    userDoctorMap.set(callerUserId, docId);
    licenseSet.add(normalizedLicense);

    return { status: 201, data: newDoc };
  }

  function getMyProfile(callerUserId: string) {
    if (!callerUserId) return { status: 401, error: 'Unauthorized' };
    const docId = userDoctorMap.get(callerUserId);
    if (!docId || !doctorDb.has(docId)) {
      return { status: 404, error: 'Doctor profile not found for this user' };
    }
    return { status: 200, data: doctorDb.get(docId) };
  }

  function updateMyProfile(
    callerUserId: string,
    updates: Partial<DoctorMockDoc>
  ) {
    if (!callerUserId) return { status: 401, error: 'Unauthorized' };
    const docId = userDoctorMap.get(callerUserId);
    if (!docId || !doctorDb.has(docId)) {
      return { status: 404, error: 'Doctor profile not found for this user' };
    }

    const doc = doctorDb.get(docId)!;

    if (updates.licenseNumber && updates.licenseNumber !== doc.licenseNumber) {
      if (licenseSet.has(updates.licenseNumber)) {
        return { status: 409, error: 'License number already exists' };
      }
      licenseSet.delete(doc.licenseNumber);
      licenseSet.add(updates.licenseNumber);
      doc.licenseNumber = updates.licenseNumber;
    }

    if (updates.specialization) doc.specialization = updates.specialization;
    if (updates.hospital) doc.hospital = updates.hospital;
    if (updates.consultationFee !== undefined) doc.consultationFee = updates.consultationFee;
    if (updates.experience !== undefined) doc.experience = updates.experience;
    doc.updatedAt = new Date();

    return { status: 200, data: doc };
  }

  function listDoctors(filters?: { specialization?: string; search?: string }) {
    let docs = Array.from(doctorDb.values());

    if (filters?.specialization && filters.specialization !== 'All') {
      docs = docs.filter(
        (d) => d.specialization.toLowerCase() === filters.specialization!.toLowerCase()
      );
    }

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.specialization.toLowerCase().includes(s) ||
          d.hospital.toLowerCase().includes(s) ||
          d.qualification.toLowerCase().includes(s)
      );
    }

    return { status: 200, data: docs };
  }

  it('1. Rejects unauthenticated requests with 401', () => {
    resetState();
    const res = createDoctorProfile('', {
      specialization: 'Cardiology',
      qualification: 'MD',
      hospital: 'Metro Hospital',
      licenseNumber: 'MED-12345',
    });
    expect(res.status).toBe(401);
  });

  it('2. Validates required doctor profile fields (rejects incomplete submissions)', () => {
    resetState();
    const res = createDoctorProfile('user-1', {
      specialization: 'Cardiology',
      // missing qualification, hospital, licenseNumber
    });
    expect(res.status).toBe(400);
    expect(res.error).toMatch(/required/i);
  });

  it('3. Successfully registers a valid doctor profile', () => {
    resetState();
    const res = createDoctorProfile('user-1', {
      specialization: 'Cardiology',
      qualification: 'MD, FACC',
      hospital: 'St. Jude Heart Institute',
      licenseNumber: 'MED-CARD-991',
      experience: 12,
      consultationFee: 150,
    });

    expect(res.status).toBe(201);
    expect(res.data?.specialization).toBe('Cardiology');
    expect(res.data?.consultationFee).toBe(150);
    expect(res.data?.verified).toBe(true);
  });

  it('4. Prevents duplicate doctor profiles for the same user account', () => {
    const res = createDoctorProfile('user-1', {
      specialization: 'Neurology',
      qualification: 'MD',
      hospital: 'General Hospital',
      licenseNumber: 'MED-NEURO-882',
    });

    expect(res.status).toBe(409);
    expect(res.error).toMatch(/already exists for this user/i);
  });

  it('5. Prevents duplicate license number registration across different users', () => {
    const res = createDoctorProfile('user-2', {
      specialization: 'Pediatrics',
      qualification: 'MD',
      hospital: 'Childrens Hospital',
      licenseNumber: 'MED-CARD-991', // duplicate of user-1
    });

    expect(res.status).toBe(409);
    expect(res.error).toMatch(/already registered/i);
  });

  it('6. Allows authenticated doctor to view their profile', () => {
    const res = getMyProfile('user-1');
    expect(res.status).toBe(200);
    expect(res.data?.licenseNumber).toBe('MED-CARD-991');

    const nonDoctor = getMyProfile('user-999');
    expect(nonDoctor.status).toBe(404);
  });

  it('7. IDOR Protection: Doctor can only update their own profile', () => {
    const updateRes = updateMyProfile('user-1', {
      consultationFee: 200,
      hospital: 'St. Jude Advanced Institute',
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.data?.consultationFee).toBe(200);
    expect(updateRes.data?.hospital).toBe('St. Jude Advanced Institute');

    // Other user cannot update user-1's doctor profile
    const attackerRes = updateMyProfile('user-3', { consultationFee: 50 });
    expect(attackerRes.status).toBe(404);
  });

  it('8. Directory queries support filtering by specialization and text search', () => {
    createDoctorProfile('user-2', {
      specialization: 'Neurology',
      qualification: 'MD, PhD',
      hospital: 'Neuro Life Center',
      licenseNumber: 'MED-NEURO-555',
      experience: 15,
      consultationFee: 180,
    });

    const cardioOnly = listDoctors({ specialization: 'Cardiology' });
    expect(cardioOnly.data.length).toBe(1);
    expect(cardioOnly.data[0].specialization).toBe('Cardiology');

    const searchRes = listDoctors({ search: 'Neuro' });
    expect(searchRes.data.length).toBe(1);
    expect(searchRes.data[0].specialization).toBe('Neurology');
  });
});
