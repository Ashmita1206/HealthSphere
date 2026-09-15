import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Wifi, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SyncStatusProps {
  lastSyncTime?: string;
  offlineQueueCount?: number;
  onManualSync?: () => Promise<void> | void;
  className?: string;
}

export const SyncStatusBanner: React.FC<SyncStatusProps> = ({
  lastSyncTime = '12 seconds ago',
  offlineQueueCount = 0,
  onManualSync,
  className = '',
}) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      if (onManualSync) {
        await onManualSync();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      data-testid="sync-status-banner"
      className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
          <CloudUpload className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Continuous Cloud Telemetry Sync
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Auto-Sync Active (60s)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Last bi-directional sync completed <strong>{lastSyncTime}</strong> • {offlineQueueCount} packets queued offline
          </p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleSync}
        disabled={syncing}
        className="h-8 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer shrink-0"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
        <span>{syncing ? 'Synchronizing Sensors...' : 'Sync Now'}</span>
      </Button>
    </div>
  );
};
