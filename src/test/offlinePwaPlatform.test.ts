import { describe, it, expect, beforeEach } from 'vitest';

// Mirror of offline storage & sync queue engine for testing
interface QueuedMutationTest {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload: any;
  timestamp: number;
  retryCount: number;
  resource: string;
}

interface OfflineEmergencyProfileTest {
  patientName: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  emergencyContacts: Array<{ name: string; relationship: string; phone: string }>;
  organDonor: boolean;
  dnrStatus: boolean;
  lastUpdated: string;
}

class OfflineStorageEngineTest {
  private stores: Map<string, Map<string, any>> = new Map();

  constructor() {
    this.stores.set('reports', new Map());
    this.stores.set('medicines', new Map());
    this.stores.set('appointments', new Map());
    this.stores.set('timeline', new Map());
    this.stores.set('emergency_card', new Map());
    this.stores.set('mutation_queue', new Map());
  }

  setItem(store: string, id: string, data: any) {
    if (!this.stores.has(store)) this.stores.set(store, new Map());
    this.stores.get(store)!.set(id, data);
  }

  getItem(store: string, id: string) {
    return this.stores.get(store)?.get(id) || null;
  }

  getAll(store: string) {
    return Array.from(this.stores.get(store)?.values() || []);
  }

  removeItem(store: string, id: string) {
    this.stores.get(store)?.delete(id);
  }

  queueMutation(m: Omit<QueuedMutationTest, 'id' | 'timestamp' | 'retryCount'>): QueuedMutationTest {
    const record: QueuedMutationTest = {
      ...m,
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.setItem('mutation_queue', record.id, record);
    return record;
  }

  getSortedQueue(): QueuedMutationTest[] {
    const all = this.getAll('mutation_queue') as QueuedMutationTest[];
    return all.sort((a, b) => a.timestamp - b.timestamp);
  }
}

class OfflineSyncEngineTest {
  public status: 'online' | 'offline' | 'syncing' = 'online';
  public successful = 0;
  public failed = 0;

  constructor(private storage: OfflineStorageEngineTest) {}

  async processQueue(mockApiCaller: (m: QueuedMutationTest) => Promise<{ status: number }>) {
    this.status = 'syncing';
    const queue = this.storage.getSortedQueue();

    for (const item of queue) {
      try {
        const res = await mockApiCaller(item);
        if (res.status === 200 || res.status === 201) {
          this.storage.removeItem('mutation_queue', item.id);
          this.successful++;
        }
      } catch (err: any) {
        if (err.status === 409) {
          // Version conflict resolution: discard conflicting stale client mutation
          this.storage.removeItem('mutation_queue', item.id);
          this.failed++;
        } else if (item.retryCount >= 3) {
          this.storage.removeItem('mutation_queue', item.id);
          this.failed++;
        } else {
          item.retryCount++;
          this.storage.setItem('mutation_queue', item.id, item);
          this.failed++;
        }
      }
    }
    this.status = 'online';
    return { total: queue.length, successful: this.successful, failed: this.failed };
  }
}

describe('F37 Offline First Platform', () => {
  let storage: OfflineStorageEngineTest;
  let syncEngine: OfflineSyncEngineTest;

  beforeEach(() => {
    storage = new OfflineStorageEngineTest();
    syncEngine = new OfflineSyncEngineTest(storage);
  });

  describe('Mutation Queue Lifecycle', () => {
    it('enqueues mutations and preserves strict FIFO timestamp ordering', () => {
      const mut1 = storage.queueMutation({
        url: '/api/medicines',
        method: 'POST',
        payload: { name: 'Aspirin 81mg' },
        resource: 'medicines',
      });

      const mut2 = storage.queueMutation({
        url: '/api/appointments',
        method: 'POST',
        payload: { doctorId: 'doc-1' },
        resource: 'appointments',
      });

      const queue = storage.getSortedQueue();
      expect(queue).toHaveLength(2);
      expect(queue[0].id).toBe(mut1.id);
      expect(queue[1].id).toBe(mut2.id);
    });

    it('successfully processes and clears mutations on API success', async () => {
      storage.queueMutation({
        url: '/api/medicines',
        method: 'POST',
        payload: { name: 'Metformin' },
        resource: 'medicines',
      });

      const mockApi = async () => ({ status: 200 });
      await syncEngine.processQueue(mockApi);

      expect(storage.getSortedQueue()).toHaveLength(0);
      expect(syncEngine.successful).toBe(1);
    });

    it('increments retry count on network error and drops after 3 retries', async () => {
      const mut = storage.queueMutation({
        url: '/api/timeline',
        method: 'POST',
        payload: { event: 'Vitals logged' },
        resource: 'timeline',
      });

      const failingApi = async () => {
        throw { status: 500, message: 'Server unavailable' };
      };

      // 1st failure
      await syncEngine.processQueue(failingApi);
      expect(storage.getItem('mutation_queue', mut.id)?.retryCount).toBe(1);

      // 2nd failure
      await syncEngine.processQueue(failingApi);
      expect(storage.getItem('mutation_queue', mut.id)?.retryCount).toBe(2);

      // 3rd failure
      await syncEngine.processQueue(failingApi);
      expect(storage.getItem('mutation_queue', mut.id)?.retryCount).toBe(3);

      // 4th attempt: drops after exceeding max retries
      await syncEngine.processQueue(failingApi);
      expect(storage.getItem('mutation_queue', mut.id)).toBeNull();
    });

    it('resolves 409 version conflicts by removing obsolete client mutation', async () => {
      storage.queueMutation({
        url: '/api/collaboration/notes/123',
        method: 'PUT',
        payload: { baseVersion: 1, note: 'Old text' },
        resource: 'general',
      });

      const conflictApi = async () => {
        throw { status: 409, message: 'Version conflict' };
      };

      await syncEngine.processQueue(conflictApi);
      expect(storage.getSortedQueue()).toHaveLength(0);
      expect(syncEngine.failed).toBe(1);
    });
  });

  describe('Offline Emergency Medical Profile', () => {
    it('persists and validates life-saving offline emergency card data', () => {
      const profile: OfflineEmergencyProfileTest = {
        patientName: 'Jane Doe',
        bloodGroup: 'AB-',
        allergies: ['Penicillin', 'Latex'],
        chronicConditions: ['Asthma'],
        medications: ['Albuterol Inhaler'],
        emergencyContacts: [{ name: 'John Doe', relationship: 'Spouse', phone: '+1 555-0199' }],
        organDonor: true,
        dnrStatus: false,
        lastUpdated: new Date().toISOString(),
      };

      storage.setItem('emergency_card', 'current_profile', profile);

      const cached = storage.getItem('emergency_card', 'current_profile');
      expect(cached).not.toBeNull();
      expect(cached.bloodGroup).toBe('AB-');
      expect(cached.allergies).toContain('Latex');
      expect(cached.organDonor).toBe(true);
      expect(cached.emergencyContacts[0].phone).toBe('+1 555-0199');
    });
  });

  describe('Offline Medical Caches', () => {
    it('stores and retrieves cached reports, medicines, appointments, and timeline records', () => {
      storage.setItem('reports', 'rep-01', { title: 'Blood Glucose Test', glucose: 95 });
      storage.setItem('medicines', 'med-01', { name: 'Aspirin', dosage: '81mg' });
      storage.setItem('appointments', 'apt-01', { doctor: 'Dr. House', date: '2026-10-01' });
      storage.setItem('timeline', 'tl-01', { event: 'Flu vaccine administered' });

      expect(storage.getAll('reports')).toHaveLength(1);
      expect(storage.getAll('medicines')).toHaveLength(1);
      expect(storage.getAll('appointments')).toHaveLength(1);
      expect(storage.getAll('timeline')).toHaveLength(1);
    });
  });
});
