import React from 'react';
import { Database, ShieldCheck, Clock, HardDrive, CheckCircle } from 'lucide-react';
import { DiagnosticsData } from '../../services/monitoringService';

interface BackupStatusCardProps {
  backup: DiagnosticsData['backup'];
}

export const BackupStatusCard: React.FC<BackupStatusCardProps> = ({ backup }) => {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Database Disaster Recovery & Backup Status
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {backup.status}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">Automated snapshot replication with AES-256 client-side encryption</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1">
          <span className="text-muted-foreground">Last Successful Snapshot</span>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {new Date(backup.lastBackupAt).toLocaleString()}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1">
          <span className="text-muted-foreground">Snapshot Frequency</span>
          <div className="font-semibold text-foreground">{backup.backupFrequency}</div>
        </div>

        <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1">
          <span className="text-muted-foreground">Target RPO / RTO</span>
          <div className="font-semibold text-emerald-400">
            RPO: {backup.rpoHours}h • RTO: {backup.rtoMinutes}m
          </div>
        </div>

        <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1">
          <span className="text-muted-foreground">Backup Cloud Vault</span>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {backup.backupStorage}
          </div>
        </div>
      </div>
    </div>
  );
};
