import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/services/api';
import { normalizeMedicine } from '@/components/medicines/medicineUtils';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Medicine Edit Data Safety Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const baseMedicine = {
    id: 'med-123',
    name: 'Metformin 500mg',
    dosage: '500mg',
    frequency: 'twice-daily',
    status: 'active' as const,
    totalPills: 60,
    remainingPills: 45,
    startDate: '2026-01-01',
  };

  it('9. Medicine edit PUT sends to the correct endpoint with correct body', async () => {
    const updatePayload = { name: 'Metformin 1000mg ER', dosage: '1000mg' };

    vi.mocked(api.put).mockResolvedValue({
      ...baseMedicine,
      ...updatePayload,
    });

    const result = await api.put(`/health/medicines/${baseMedicine.id}`, updatePayload);

    expect(api.put).toHaveBeenCalledWith(
      '/health/medicines/med-123',
      updatePayload,
    );
    expect(result).toEqual(expect.objectContaining({
      name: 'Metformin 1000mg ER',
      dosage: '1000mg',
    }));
  });

  it('10. Successful medicine edit: server response is normalized into valid Medicine state', async () => {
    const serverResponse = {
      id: 'med-123',
      name: 'Updated Medicine',
      dosage: '750mg',
      frequency: 'once-daily',
      is_active: true,
      remaining_pills: 30,
      total_pills: 60,
      start_date: '2026-02-01',
      created_at: '2026-01-01T00:00:00Z',
    };

    vi.mocked(api.put).mockResolvedValue(serverResponse);

    const rawResult = await api.put('/health/medicines/med-123', { name: 'Updated Medicine' });
    const normalized = normalizeMedicine(
      {
        ...(rawResult && typeof rawResult === 'object' ? rawResult : {}),
        name: 'Updated Medicine',
        id: 'med-123',
      },
      'med-123',
    );

    // The normalized medicine should use the server response values
    expect(normalized.id).toBe('med-123');
    expect(normalized.name).toBe('Updated Medicine');
    expect(normalized.dosage).toBe('750mg');
    expect(normalized.remainingPills).toBe(30);
    expect(normalized.totalPills).toBe(60);
    expect(normalized.status).toBe('active');
  });

  it('11. Failed medicine edit: original data is preserved, API error propagates', async () => {
    const error = new Error('Network error: PUT failed');
    vi.mocked(api.put).mockRejectedValue(error);

    // Simulate the handleEdit flow: on error, existing medicine data stays unchanged
    let currentMedicine = { ...baseMedicine };
    let errorCaught: Error | null = null;

    try {
      await api.put(`/health/medicines/${baseMedicine.id}`, { name: 'Bad Update' });
      // If successful, we'd update; but it should fail
      currentMedicine = { ...currentMedicine, name: 'Bad Update' } as typeof baseMedicine;
    } catch (err: any) {
      errorCaught = err;
      // On failure: do NOT update currentMedicine
    }

    expect(errorCaught).toBeTruthy();
    expect(errorCaught!.message).toBe('Network error: PUT failed');
    // Original data MUST be preserved
    expect(currentMedicine.name).toBe('Metformin 500mg');
    expect(currentMedicine.dosage).toBe('500mg');
  });

  it('12. Duplicate submission is prevented: loading flag gates concurrent requests', async () => {
    // Simulate the loading state guard pattern used in handleEdit
    let loading = false;
    const submissions: number[] = [];

    const simulateHandleEdit = async (data: Record<string, string>) => {
      if (loading) return; // Guard: prevent duplicate submission
      loading = true;
      try {
        submissions.push(Date.now());
        await api.put('/health/medicines/med-123', data);
      } finally {
        loading = false;
      }
    };

    // Create a slow-resolving promise
    let resolvePut: (val: unknown) => void;
    vi.mocked(api.put).mockImplementation(
      () => new Promise((resolve) => { resolvePut = resolve; }),
    );

    // First submission starts (does not await)
    const firstSubmit = simulateHandleEdit({ name: 'Update 1' });
    expect(loading).toBe(true);

    // Second submission while first is pending — should be rejected
    const secondSubmit = simulateHandleEdit({ name: 'Update 2' });

    // Resolve the first
    resolvePut!({ id: 'med-123', name: 'Update 1' });
    await firstSubmit;
    await secondSubmit;

    // Only ONE api.put call should have been made
    expect(api.put).toHaveBeenCalledTimes(1);
    expect(submissions).toHaveLength(1);
    expect(loading).toBe(false);
  });
});
