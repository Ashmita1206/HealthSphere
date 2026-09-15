import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { offlineSyncService, SyncStats } from '../../services/offlineSyncService';
import { offlineStorage } from '../../services/offlineStorage';

export const OfflineStatusBar: React.FC = () => {
  const [stats, setStats] = useState<SyncStats>({
    status: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
    queuedCount: 0,
    lastSyncedAt: null,
    successfulReplays: 0,
    failedReplays: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshQueueCount = async () => {
    try {
      const q = await offlineStorage.getMutationQueue();
      setStats((prev) => ({ ...prev, queuedCount: q.length }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const unsub = offlineSyncService.subscribe((s) => {
      setStats((prev) => ({ ...prev, ...s }));
      refreshQueueCount();
    });

    const interval = setInterval(refreshQueueCount, 5000);
    refreshQueueCount();

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await offlineSyncService.processMutationQueue();
      await refreshQueueCount();
    } finally {
      setIsSyncing(false);
    }
  };

  // Only show bar if offline, or syncing, or if there are items queued
  const isOffline = stats.status === 'offline';
  const hasQueue = stats.queuedCount > 0;

  if (!isOffline && !hasQueue && !isSyncing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50 max-w-md bg-card/95 border border-border/60 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl text-xs flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isOffline
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          </div>

          <div>
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span>{isOffline ? 'Offline Mode Active' : 'Network Restored'}</span>
              {hasQueue && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary font-bold">
                  {stats.queuedCount} queued
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isOffline
                ? 'Mutations cached locally in IndexedDB'
                : 'Ready to replay offline requests'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing || isOffline}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
