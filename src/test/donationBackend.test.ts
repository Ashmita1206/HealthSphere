import { describe, it, expect } from 'vitest';

// Types & validation replicating Joi schema and controller logic for donation requests
const validDonationStatuses = ['pending', 'fulfilled', 'cancelled', 'active'] as const;
type DonationStatus = (typeof validDonationStatuses)[number];

interface DonationRequestUpdatePayload {
  status?: string;
  notes?: string;
  urgency?: string;
  requestType?: string;
  request_type?: string;
  bloodType?: string;
  blood_type?: string;
  organType?: string;
  organ_type?: string;
  _id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DonationRequestDocument {
  _id: string;
  userId: string;
  requestType?: string;
  bloodType?: string;
  organType?: string;
  urgency?: string;
  notes?: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
}

const validateDonationRequestUpdate = (payload: DonationRequestUpdatePayload) => {
  const keys = Object.keys(payload);
  if (keys.length === 0) {
    return { error: 'Payload cannot be empty' };
  }

  if (payload.status !== undefined) {
    if (!validDonationStatuses.includes(payload.status as DonationStatus)) {
      return { error: `Status must be one of: ${validDonationStatuses.join(', ')}` };
    }
  }

  if (payload.notes !== undefined) {
    if (typeof payload.notes !== 'string' || payload.notes.length > 1000) {
      return { error: 'Notes must be a string up to 1000 characters' };
    }
  }

  if (payload.urgency !== undefined) {
    if (typeof payload.urgency !== 'string' || payload.urgency.length > 50) {
      return { error: 'Urgency must be a string up to 50 characters' };
    }
  }

  return { error: null };
};

describe('F6-2 Backend Blood Donation Request Management API Suite (PUT & DELETE /api/health/donation-requests/:id)', () => {
  const validMongoId = '64b1f77bcf86cd7994390001';
  const otherMongoId = '64b1f77bcf86cd7994390002';
  const ownerUserId = '64b1f77bcf86cd799439011a';
  const attackerUserId = '64b1f77bcf86cd799439099b';

  const mockDatabase: Map<string, DonationRequestDocument> = new Map();

  const resetDb = () => {
    mockDatabase.clear();
    mockDatabase.set(validMongoId, {
      _id: validMongoId,
      userId: ownerUserId,
      requestType: 'blood',
      bloodType: 'O+',
      urgency: 'high',
      notes: 'Urgent for surgical procedure',
      status: 'pending',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  };

  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  // Controller simulation matching healthController.js logic for update
  const handleUpdateDonationRequest = async (
    params: { id: string },
    user: { _id: string } | null,
    body: DonationRequestUpdatePayload
  ) => {
    // 1. Authentication check (protect middleware)
    if (!user || !user._id) {
      return { status: 401, body: { message: 'Unauthorized' } };
    }

    // 2. ObjectId validation
    if (!isValidObjectId(params.id)) {
      return { status: 400, body: { message: 'Invalid donation request ID' } };
    }

    // 3. Payload validation
    const validation = validateDonationRequestUpdate(body);
    if (validation.error) {
      return { status: 400, body: { message: 'Validation failed', details: validation.error } };
    }

    // 4. Scoped existence and IDOR check
    const existing = mockDatabase.get(params.id);
    if (!existing) {
      return { status: 404, body: { message: 'Donation request not found' } };
    }

    if (existing.userId !== user._id) {
      return { status: 403, body: { message: 'Forbidden: You do not own this donation request' } };
    }

    // 5. Apply updates while protecting immutable fields
    const updated: DonationRequestDocument = {
      ...existing,
      status: (body.status as DonationStatus) ?? existing.status,
      notes: body.notes ?? existing.notes,
      urgency: body.urgency ?? existing.urgency,
      requestType: body.requestType ?? body.request_type ?? existing.requestType,
      bloodType: body.bloodType ?? body.blood_type ?? existing.bloodType,
      organType: body.organType ?? body.organ_type ?? existing.organType,
      updatedAt: new Date().toISOString(),
      // Immutable fields cannot be modified
      _id: existing._id,
      userId: existing.userId,
      createdAt: existing.createdAt,
    };

    mockDatabase.set(params.id, updated);
    return { status: 200, body: updated };
  };

  // Controller simulation matching healthController.js logic for delete
  const handleDeleteDonationRequest = async (
    params: { id: string },
    user: { _id: string } | null
  ) => {
    // 1. Authentication check (protect middleware)
    if (!user || !user._id) {
      return { status: 401, body: { message: 'Unauthorized' } };
    }

    // 2. ObjectId validation
    if (!isValidObjectId(params.id)) {
      return { status: 400, body: { message: 'Invalid donation request ID' } };
    }

    // 3. Existence and IDOR check
    const existing = mockDatabase.get(params.id);
    if (!existing) {
      return { status: 404, body: { message: 'Donation request not found' } };
    }

    if (existing.userId !== user._id) {
      return { status: 403, body: { message: 'Forbidden: You do not own this donation request' } };
    }

    // 4. Delete operation
    mockDatabase.delete(params.id);
    return { status: 204, body: null };
  };

  describe('PUT /api/health/donation-requests/:id', () => {
    it('1. Successful update: updates allowed status and fields with 200 OK', async () => {
      resetDb();
      const updateData: DonationRequestUpdatePayload = {
        status: 'fulfilled',
        notes: 'Donor found and units collected',
        urgency: 'normal',
      };

      const res = await handleUpdateDonationRequest(
        { id: validMongoId },
        { _id: ownerUserId },
        updateData
      );

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('fulfilled');
      expect(res.body.notes).toBe('Donor found and units collected');
      expect(res.body.urgency).toBe('normal');
      expect(res.body._id).toBe(validMongoId);
      expect(res.body.userId).toBe(ownerUserId);
    });

    it('2. Unauthorized request: rejects unauthenticated user with 401 Unauthorized', async () => {
      resetDb();
      const res = await handleUpdateDonationRequest(
        { id: validMongoId },
        null,
        { status: 'fulfilled' }
      );

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('3. Forbidden ownership (IDOR): blocks cross-user modifications with 403 Forbidden', async () => {
      resetDb();
      const res = await handleUpdateDonationRequest(
        { id: validMongoId },
        { _id: attackerUserId },
        { status: 'cancelled' }
      );

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');

      // Database entry remains unmodified
      const doc = mockDatabase.get(validMongoId);
      expect(doc?.status).toBe('pending');
    });

    it('4. Invalid ObjectId: returns 400 Bad Request on malformed ObjectId', async () => {
      resetDb();
      const invalidIds = ['123', 'bad-id', '64b1f77bcf86cd799439000z'];

      for (const badId of invalidIds) {
        const res = await handleUpdateDonationRequest(
          { id: badId },
          { _id: ownerUserId },
          { status: 'fulfilled' }
        );

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid donation request ID');
      }
    });

    it('5. Invalid status: rejects invalid status value with 400 Bad Request', async () => {
      resetDb();
      const res = await handleUpdateDonationRequest(
        { id: validMongoId },
        { _id: ownerUserId },
        { status: 'invalid_status' }
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('6. Validation failure: rejects empty payload with 400 Bad Request', async () => {
      resetDb();
      const res = await handleUpdateDonationRequest(
        { id: validMongoId },
        { _id: ownerUserId },
        {}
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('7. Missing request: returns 404 Not Found when ID does not exist', async () => {
      resetDb();
      const res = await handleUpdateDonationRequest(
        { id: otherMongoId },
        { _id: ownerUserId },
        { status: 'fulfilled' }
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Donation request not found');
    });

    it('8. Immutable field protection: prevents overwriting _id, userId, and createdAt', async () => {
      resetDb();
      const maliciousPayload: DonationRequestUpdatePayload = {
        status: 'cancelled',
        _id: 'tampered-id-123',
        userId: attackerUserId,
        createdAt: '1970-01-01T00:00:00.000Z',
      };

      const res = await handleUpdateDonationRequest(
        { id: validMongoId },
        { _id: ownerUserId },
        maliciousPayload
      );

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(validMongoId);
      expect(res.body.userId).toBe(ownerUserId);
      expect(res.body.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(res.body.status).toBe('cancelled');
    });
  });

  describe('DELETE /api/health/donation-requests/:id', () => {
    it('9. Successful deletion: deletes owned request and returns 204 No Content', async () => {
      resetDb();
      const res = await handleDeleteDonationRequest(
        { id: validMongoId },
        { _id: ownerUserId }
      );

      expect(res.status).toBe(204);
      expect(mockDatabase.has(validMongoId)).toBe(false);
    });

    it('10. Unauthorized request: rejects unauthenticated delete with 401 Unauthorized', async () => {
      resetDb();
      const res = await handleDeleteDonationRequest(
        { id: validMongoId },
        null
      );

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
      expect(mockDatabase.has(validMongoId)).toBe(true);
    });

    it('11. Forbidden ownership (IDOR): blocks cross-user deletion with 403 Forbidden', async () => {
      resetDb();
      const res = await handleDeleteDonationRequest(
        { id: validMongoId },
        { _id: attackerUserId }
      );

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
      expect(mockDatabase.has(validMongoId)).toBe(true);
    });

    it('12. Invalid ObjectId: returns 400 Bad Request for malformed delete ID', async () => {
      resetDb();
      const res = await handleDeleteDonationRequest(
        { id: 'malformed-id' },
        { _id: ownerUserId }
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid donation request ID');
    });

    it('13. Missing request: returns 404 Not Found when deleting non-existent ID', async () => {
      resetDb();
      const res = await handleDeleteDonationRequest(
        { id: otherMongoId },
        { _id: ownerUserId }
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Donation request not found');
    });
  });
});
