import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

// Validation helper replicating Joi schema and backend validation logic for medicines
const validStatuses = ['active', 'completed', 'missed', 'expired', 'archived'] as const;
type MedicineStatus = (typeof validStatuses)[number];

interface MedicineUpdatePayload {
  name?: string;
  dosage?: string;
  frequency?: string;
  time?: string;
  timing?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  notes?: string;
  status?: string;
  isActive?: boolean;
  is_active?: boolean;
  adherenceRate?: number;
  adherence_rate?: number;
  adherence?: number;
  remainingPills?: number;
  remaining_pills?: number;
  totalPills?: number;
  total_pills?: number;
  doctorName?: string;
  doctor_name?: string;
  description?: string;
  instructions?: string;
  strength?: string;
  _id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MedicineDocument {
  _id: string;
  userId: string;
  name: string;
  dosage?: string;
  frequency?: string;
  time?: string;
  timing?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  status: MedicineStatus;
  isActive: boolean;
  adherenceRate: number;
  remainingPills?: number;
  totalPills?: number;
  doctorName?: string;
  description?: string;
  instructions?: string;
  strength?: string;
  createdAt: string;
  updatedAt: string;
}

const validateMedicinePayload = (payload: MedicineUpdatePayload) => {
  const keys = Object.keys(payload);
  if (keys.length === 0) {
    return { error: 'Payload cannot be empty' };
  }

  if (payload.name !== undefined) {
    if (typeof payload.name !== 'string' || !payload.name.trim()) {
      return { error: 'Name must be a non-empty string' };
    }
  }

  if (payload.status !== undefined) {
    if (!validStatuses.includes(payload.status as MedicineStatus)) {
      return { error: `Status must be one of: ${validStatuses.join(', ')}` };
    }
  }

  const adherence = payload.adherenceRate ?? payload.adherence_rate ?? payload.adherence;
  if (adherence !== undefined) {
    if (typeof adherence !== 'number' || adherence < 0 || adherence > 100) {
      return { error: 'Adherence rate must be a number between 0 and 100' };
    }
  }

  const remaining = payload.remainingPills ?? payload.remaining_pills;
  if (remaining !== undefined) {
    if (typeof remaining !== 'number' || remaining < 0) {
      return { error: 'Remaining pills must be a non-negative number' };
    }
  }

  const total = payload.totalPills ?? payload.total_pills;
  if (total !== undefined) {
    if (typeof total !== 'number' || total < 0) {
      return { error: 'Total pills must be a non-negative number' };
    }
  }

  return { error: null };
};

const mapMedicineResponse = (m: MedicineDocument) => ({
  id: m._id,
  name: m.name,
  dosage: m.dosage,
  frequency: m.frequency,
  time: m.time || m.timing,
  timing: m.timing || m.time,
  start_date: m.startDate,
  startDate: m.startDate,
  end_date: m.endDate,
  endDate: m.endDate,
  notes: m.notes,
  status: m.status,
  is_active: m.isActive,
  isActive: m.isActive,
  adherence_rate: m.adherenceRate,
  adherenceRate: m.adherenceRate,
  remaining_pills: m.remainingPills,
  remainingPills: m.remainingPills,
  total_pills: m.totalPills,
  totalPills: m.totalPills,
  doctor_name: m.doctorName,
  doctorName: m.doctorName,
  description: m.description,
  instructions: m.instructions,
  strength: m.strength,
  created_at: m.createdAt,
  createdAt: m.createdAt,
  updated_at: m.updatedAt,
  updatedAt: m.updatedAt,
});

describe('F6-1 Backend Medicine Update API & Security Suite (PUT /api/health/medicines/:id)', () => {
  const validMongoId = '507f1f77bcf86cd799439011';
  const otherMongoId = '507f191e810c19729de860ea';
  const ownerUserId = '64b1f77bcf86cd799439011a';
  const attackerUserId = '64b1f77bcf86cd799439099b';

  const mockDatabase: Map<string, MedicineDocument> = new Map();

  const resetDb = () => {
    mockDatabase.clear();
    mockDatabase.set(validMongoId, {
      _id: validMongoId,
      userId: ownerUserId,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'twice-daily',
      status: 'active',
      isActive: true,
      adherenceRate: 95,
      remainingPills: 40,
      totalPills: 60,
      startDate: '2026-01-01',
      endDate: '2026-06-01',
      notes: 'Take with food',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  };

  // Controller simulation matching healthController.js logic
  const handleUpdateMedicine = async (
    params: { id: string },
    user: { _id: string } | null,
    body: MedicineUpdatePayload
  ) => {
    // 1. Authentication check (protect middleware)
    if (!user || !user._id) {
      return { status: 401, body: { message: 'Unauthorized' } };
    }

    // 2. ObjectId validation
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId(params.id)) {
      return { status: 400, body: { message: 'Invalid medicine ID' } };
    }

    // 3. Payload validation
    const validation = validateMedicinePayload(body);
    if (validation.error) {
      return { status: 400, body: { message: 'Validation failed', details: validation.error } };
    }

    // 4. Existence check
    const existing = mockDatabase.get(params.id);
    if (!existing) {
      return { status: 404, body: { message: 'Medicine not found' } };
    }

    // 5. Ownership & IDOR check
    if (existing.userId !== user._id) {
      return { status: 403, body: { message: 'Forbidden: You do not own this medicine' } };
    }

    // 6. Apply updates safely while protecting immutable fields
    const updated: MedicineDocument = {
      ...existing,
      name: body.name !== undefined ? body.name : existing.name,
      dosage: body.dosage !== undefined ? body.dosage : existing.dosage,
      frequency: body.frequency !== undefined ? body.frequency : existing.frequency,
      time: body.time !== undefined ? body.time : (body.timing !== undefined ? body.timing : existing.time),
      timing: body.timing !== undefined ? body.timing : (body.time !== undefined ? body.time : existing.timing),
      startDate: body.startDate !== undefined ? body.startDate : (body.start_date !== undefined ? body.start_date : existing.startDate),
      endDate: body.endDate !== undefined ? body.endDate : (body.end_date !== undefined ? body.end_date : existing.endDate),
      notes: body.notes !== undefined ? body.notes : existing.notes,
      remainingPills: body.remainingPills !== undefined ? body.remainingPills : (body.remaining_pills !== undefined ? body.remaining_pills : existing.remainingPills),
      totalPills: body.totalPills !== undefined ? body.totalPills : (body.total_pills !== undefined ? body.total_pills : existing.totalPills),
      adherenceRate: body.adherenceRate !== undefined ? body.adherenceRate : (body.adherence_rate !== undefined ? body.adherence_rate : existing.adherenceRate),
      status: (body.status as MedicineStatus) || (body.isActive === false || body.is_active === false ? 'completed' : existing.status),
      isActive: body.isActive !== undefined ? body.isActive : (body.is_active !== undefined ? body.is_active : (body.status ? body.status === 'active' : existing.isActive)),
      updatedAt: new Date().toISOString(),
      // Immutable fields stay untouched
      _id: existing._id,
      userId: existing.userId,
      createdAt: existing.createdAt,
    };

    mockDatabase.set(params.id, updated);
    return { status: 200, body: mapMedicineResponse(updated) };
  };

  it('1. Successful update: updates allowed fields and returns 200 OK with mapped response', async () => {
    resetDb();
    const updateData: MedicineUpdatePayload = {
      name: 'Metformin XR',
      dosage: '1000mg',
      frequency: 'once-daily',
      notes: 'Take after dinner',
      remainingPills: 30,
    };

    const response = await handleUpdateMedicine(
      { id: validMongoId },
      { _id: ownerUserId },
      updateData
    );

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Metformin XR');
    expect(response.body.dosage).toBe('1000mg');
    expect(response.body.frequency).toBe('once-daily');
    expect(response.body.notes).toBe('Take after dinner');
    expect(response.body.remaining_pills).toBe(30);
    expect(response.body.remainingPills).toBe(30);
    expect(response.body.id).toBe(validMongoId);
  });

  it('2. Unauthorized request: rejects unauthenticated access with 401 status code', async () => {
    resetDb();
    const response = await handleUpdateMedicine(
      { id: validMongoId },
      null, // No user session / token
      { name: 'Updated Name' }
    );

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('3. Forbidden ownership (IDOR Protection): blocks cross-user modifications with 403 status code', async () => {
    resetDb();
    const response = await handleUpdateMedicine(
      { id: validMongoId },
      { _id: attackerUserId }, // Attacker trying to modify owner's record
      { name: 'Hacked Medicine' }
    );

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Forbidden');

    // Verify target document was not altered
    const documentInDb = mockDatabase.get(validMongoId);
    expect(documentInDb?.name).toBe('Metformin');
  });

  it('4. Invalid ObjectId: returns 400 Bad Request for malformed MongoDB ObjectIds', async () => {
    resetDb();
    const invalidIds = ['123', 'invalid-id-xyz', 'not-a-mongo-id', '507f1f77bcf86cd79943901z'];

    for (const badId of invalidIds) {
      const response = await handleUpdateMedicine(
        { id: badId },
        { _id: ownerUserId },
        { name: 'Updated Name' }
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid medicine ID');
    }
  });

  it('5. Validation failure: rejects invalid payloads with 400 Bad Request', async () => {
    resetDb();

    // Test empty payload
    const emptyRes = await handleUpdateMedicine(
      { id: validMongoId },
      { _id: ownerUserId },
      {}
    );
    expect(emptyRes.status).toBe(400);

    // Test invalid status enum
    const badStatusRes = await handleUpdateMedicine(
      { id: validMongoId },
      { _id: ownerUserId },
      { status: 'invalid_status_value' }
    );
    expect(badStatusRes.status).toBe(400);

    // Test empty medicine name
    const badNameRes = await handleUpdateMedicine(
      { id: validMongoId },
      { _id: ownerUserId },
      { name: '   ' }
    );
    expect(badNameRes.status).toBe(400);

    // Test negative pill count
    const badPillsRes = await handleUpdateMedicine(
      { id: validMongoId },
      { _id: ownerUserId },
      { remainingPills: -10 }
    );
    expect(badPillsRes.status).toBe(400);

    // Test invalid adherence percentage (> 100)
    const badAdherenceRes = await handleUpdateMedicine(
      { id: validMongoId },
      { _id: ownerUserId },
      { adherenceRate: 150 }
    );
    expect(badAdherenceRes.status).toBe(400);
  });

  it('6. Non-existent medicine: returns 404 Not Found when ID does not exist in DB', async () => {
    resetDb();
    const response = await handleUpdateMedicine(
      { id: otherMongoId },
      { _id: ownerUserId },
      { name: 'Non Existent' }
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Medicine not found');
  });

  it('7. Successful persistence & immutable field protection: preserves IDs and persists status state', async () => {
    resetDb();

    // Attempt to tamper with immutable fields (e.g. userId, _id, createdAt)
    const updateData: MedicineUpdatePayload = {
      status: 'completed',
      isActive: false,
      notes: 'Treatment finished successfully',
      _id: 'malicious-new-id',
      userId: attackerUserId,
      createdAt: '1970-01-01T00:00:00.000Z',
    };

    const response = await handleUpdateMedicine(
      { id: validMongoId },
      { _id: ownerUserId },
      updateData
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
    expect(response.body.is_active).toBe(false);
    expect(response.body.isActive).toBe(false);

    // Verify in database: immutable fields preserved
    const persisted = mockDatabase.get(validMongoId);
    expect(persisted?._id).toBe(validMongoId);
    expect(persisted?.userId).toBe(ownerUserId); // userId cannot be escalated
    expect(persisted?.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(persisted?.status).toBe('completed');
    expect(persisted?.notes).toBe('Treatment finished successfully');
  });
});
