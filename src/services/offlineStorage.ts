/**
 * HealthSphere Offline Database — IndexedDB Storage Engine
 * Stores: reports, medicines, appointments, timeline, notifications, emergency_card, mutation_queue
 */

const DB_NAME = 'HealthSphereOfflineDB';
const DB_VERSION = 1;

export interface QueuedMutation {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload: any;
  timestamp: number;
  retryCount: number;
  resource: 'reports' | 'medicines' | 'appointments' | 'timeline' | 'emergency' | 'general';
  description: string;
}

export interface OfflineEmergencyProfile {
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

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private isSupported = typeof window !== 'undefined' && 'indexedDB' in window;

  public async init(): Promise<IDBDatabase | null> {
    if (!this.isSupported) return null;
    if (this.db) return this.db;

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result as IDBDatabase;

          if (!db.objectStoreNames.contains('reports')) {
            db.createObjectStore('reports', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('medicines')) {
            db.createObjectStore('medicines', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('appointments')) {
            db.createObjectStore('appointments', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('timeline')) {
            db.createObjectStore('timeline', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('notifications')) {
            db.createObjectStore('notifications', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('emergency_card')) {
            db.createObjectStore('emergency_card', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('mutation_queue')) {
            db.createObjectStore('mutation_queue', { keyPath: 'id' });
          }
        };

        request.onsuccess = (event: any) => {
          this.db = event.target.result as IDBDatabase;
          resolve(this.db);
        };

        request.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  }

  public async setItem<T>(storeName: string, id: string, data: T): Promise<void> {
    const db = await this.init();
    if (db) {
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const record = typeof data === 'object' && data !== null ? { ...data, id } : { id, value: data };
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    } else {
      // Fallback
      localStorage.setItem(`hs_${storeName}_${id}`, JSON.stringify(data));
    }
  }

  public async getItem<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.init();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.get(id);
          req.onsuccess = () => {
            const res = req.result;
            resolve(res ? (res.value !== undefined ? res.value : res) : null);
          };
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    } else {
      const raw = localStorage.getItem(`hs_${storeName}_${id}`);
      return raw ? JSON.parse(raw) : null;
    }
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.init();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch {
          resolve([]);
        }
      });
    } else {
      const items: T[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`hs_${storeName}_`)) {
          const raw = localStorage.getItem(key);
          if (raw) items.push(JSON.parse(raw));
        }
      }
      return items;
    }
  }

  public async removeItem(storeName: string, id: string): Promise<void> {
    const db = await this.init();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } else {
      localStorage.removeItem(`hs_${storeName}_${id}`);
    }
  }

  public async clearStore(storeName: string): Promise<void> {
    const db = await this.init();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  }

  // Queue helper methods
  public async queueMutation(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>): Promise<QueuedMutation> {
    const record: QueuedMutation = {
      ...mutation,
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await this.setItem('mutation_queue', record.id, record);
    return record;
  }

  public async getMutationQueue(): Promise<QueuedMutation[]> {
    const all = await this.getAll<QueuedMutation>('mutation_queue');
    return all.sort((a, b) => a.timestamp - b.timestamp);
  }

  public async removeMutation(id: string): Promise<void> {
    await this.removeItem('mutation_queue', id);
  }

  public async cacheEmergencyProfile(profile: OfflineEmergencyProfile): Promise<void> {
    await this.setItem('emergency_card', 'current_profile', profile);
  }

  public async getEmergencyProfile(): Promise<OfflineEmergencyProfile | null> {
    return this.getItem<OfflineEmergencyProfile>('emergency_card', 'current_profile');
  }
}

export const offlineStorage = new OfflineStorage();
