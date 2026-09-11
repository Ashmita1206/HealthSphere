/**
 * HealthSphere Offline Sync Service
 * - Background Sync Engine
 * - Mutation Queue Replay with Conflict Resolution
 * - Automatic Online/Offline State Machine
 * - Full Offline Hydration & Bootstrap
 */

import { api } from './api';
import { offlineStorage, QueuedMutation, OfflineEmergencyProfile } from './offlineStorage';

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

export interface SyncStats {
  status: SyncStatus;
  queuedCount: number;
  lastSyncedAt: string | null;
  successfulReplays: number;
  failedReplays: number;
}

type SyncEventListener = (stats: SyncStats) => void;

class OfflineSyncService {
  private status: SyncStatus = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
  private listeners: Set<SyncEventListener> = new Set();
  private isProcessingQueue = false;
  private lastSyncedAt: string | null = null;
  private successfulReplays = 0;
  private failedReplays = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Periodic queue drain check every 45s when online
      setInterval(() => {
        if (this.status === 'online' && !this.isProcessingQueue) {
          this.processMutationQueue();
        }
      }, 45000);
    }
  }

  public subscribe(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    listener(this.getStats());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const stats = this.getStats();
    for (const listener of this.listeners) {
      listener(stats);
    }
  }

  public getStats(): SyncStats {
    return {
      status: this.status,
      queuedCount: 0, // will be dynamically refreshed
      lastSyncedAt: this.lastSyncedAt,
      successfulReplays: this.successfulReplays,
      failedReplays: this.failedReplays,
    };
  }

  private handleOnline() {
    this.status = 'online';
    this.notify();
    this.processMutationQueue();
  }

  private handleOffline() {
    this.status = 'offline';
    this.notify();
  }

  /**
   * Replays queued mutations sequentially with conflict handling
   */
  public async processMutationQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.isProcessingQueue) return { processed: 0, succeeded: 0, failed: 0 };
    this.isProcessingQueue = true;
    this.status = 'syncing';
    this.notify();

    const queue = await offlineStorage.getMutationQueue();
    let succeeded = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await api({
          method: item.method,
          url: item.url,
          data: item.payload,
          headers: {
            'X-HealthSphere-Offline-Replay': 'true',
            'X-Original-Timestamp': String(item.timestamp),
          },
        });

        await offlineStorage.removeMutation(item.id);
        succeeded++;
        this.successfulReplays++;
      } catch (err: any) {
        // If conflict (409) or validation failure (422), we drop or increment retry
        if (err.response?.status === 409) {
          // Version conflict resolved by server discard
          await offlineStorage.removeMutation(item.id);
          failed++;
        } else if (item.retryCount >= 3) {
          // Give up after 3 retries
          await offlineStorage.removeMutation(item.id);
          failed++;
          this.failedReplays++;
        } else {
          item.retryCount += 1;
          await offlineStorage.setItem('mutation_queue', item.id, item);
          failed++;
        }
      }
    }

    this.isProcessingQueue = false;
    this.status = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
    this.lastSyncedAt = new Date().toISOString();
    this.notify();

    return { processed: queue.length, succeeded, failed };
  }

  /**
   * Pre-fetches and hydrates IndexedDB snapshot for full offline availability
   */
  public async hydrateOfflineSnapshot(): Promise<boolean> {
    try {
      this.status = 'syncing';
      this.notify();

      // Attempt to fetch fresh snapshot from bootstrap endpoint
      const res = await api.get('/sync/bootstrap');
      if (res.data?.success) {
        const { reports, medicines, appointments, timeline, emergencyProfile } = res.data;

        if (Array.isArray(reports)) {
          for (const r of reports) await offlineStorage.setItem('reports', r._id || r.id, r);
        }
        if (Array.isArray(medicines)) {
          for (const m of medicines) await offlineStorage.setItem('medicines', m._id || m.id, m);
        }
        if (Array.isArray(appointments)) {
          for (const a of appointments) await offlineStorage.setItem('appointments', a._id || a.id, a);
        }
        if (Array.isArray(timeline)) {
          for (const t of timeline) await offlineStorage.setItem('timeline', t._id || t.id, t);
        }
        if (emergencyProfile) {
          await offlineStorage.cacheEmergencyProfile(emergencyProfile);
        }

        this.lastSyncedAt = new Date().toISOString();
        this.status = 'online';
        this.notify();
        return true;
      }
      return false;
    } catch {
      this.status = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
      this.notify();
      return false;
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
