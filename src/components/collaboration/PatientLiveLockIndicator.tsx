import React from 'react';
import { Lock, Unlock, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { ChartLock } from '../../services/collaborationService';

interface PatientLiveLockIndicatorProps {
  fieldName: string;
  fieldLabel: string;
  currentUserId?: string;
  activeLock?: ChartLock | null;
  onAcquireLock: (fieldName: string) => void;
  onReleaseLock: (fieldName: string) => void;
  isProcessing?: boolean;
}

export const PatientLiveLockIndicator: React.FC<PatientLiveLockIndicatorProps> = ({
  fieldName,
  fieldLabel,
  currentUserId,
  activeLock,
  onAcquireLock,
  onReleaseLock,
  isProcessing = false,
}) => {
  const isLockedByMe =
    activeLock &&
    (activeLock.lockedBy === currentUserId ||
      activeLock.lockedByName === 'You' ||
      activeLock.lockedBy?.toString() === currentUserId?.toString());

  const isLockedByOther = activeLock && !isLockedByMe;

  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40 border border-border/30 text-xs">
      <div className="flex items-center gap-2">
        {isLockedByOther ? (
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span>
              Locked by <strong>{activeLock.lockedByName}</strong> ({activeLock.userRole})
            </span>
          </div>
        ) : isLockedByMe ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Editing lease active (You hold exclusive chart lock)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Unlock className="w-3.5 h-3.5" />
            <span>Unlocked — Ready for concurrent live editing</span>
          </div>
        )}
      </div>

      <div>
        {isLockedByMe ? (
          <button
            onClick={() => onReleaseLock(fieldName)}
            disabled={isProcessing}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-medium transition-colors"
          >
            {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
            Release Lock
          </button>
        ) : isLockedByOther ? (
          <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Read Only
          </span>
        ) : (
          <button
            onClick={() => onAcquireLock(fieldName)}
            disabled={isProcessing}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 font-medium transition-colors"
          >
            {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
            Lock for Editing
          </button>
        )}
      </div>
    </div>
  );
};
