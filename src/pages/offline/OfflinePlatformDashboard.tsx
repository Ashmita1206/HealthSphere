import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  ShieldAlert,
  Server,
  DownloadCloud,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { offlineStorage, QueuedMutation, OfflineEmergencyProfile } from '../../services/offlineStorage';
import { offlineSyncService, SyncStats } from '../../services/offlineSyncService';
import { OfflineEmergencyCardModal } from '../../components/offline/OfflineEmergencyCardModal';
import { OfflineDataViewer } from '../../components/offline/OfflineDataViewer';
import { OfflineStatusBar } from '../../components/offline/OfflineStatusBar';

export const OfflinePlatformDashboard: React.FC = () => {
  const [stats, setStats] = useState<SyncStats>(offlineSyncService.getStats());
  const [queue, setQueue] = useState<QueuedMutation[]>([]);
  const [emergencyProfile, setEmergencyProfile] = useState<OfflineEmergencyProfile | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  const loadOfflineState = useCallback(async () => {
    try {
      const [q, ep, r, m, a, t] = await Promise.all([
        offlineStorage.getMutationQueue(),
        offlineStorage.getEmergencyProfile(),
        offlineStorage.getAll<any>('reports'),
        offlineStorage.getAll<any>('medicines'),
        offlineStorage.getAll<any>('appointments'),
        offlineStorage.getAll<any>('timeline'),
      ]);

      setQueue(q);
      setEmergencyProfile(ep);

      // Provide demo items if empty
      setReports(
        r.length > 0
          ? r
          : [
              { id: 'rep-1', title: 'Complete Blood Count (CBC)', category: 'Hematology', summary: 'Normal WBC 6.8, Platelets 240k' },
              { id: 'rep-2', title: 'Lipid Panel', category: 'Biochemistry', summary: 'Total Chol 185 mg/dL, HDL 55' },
            ]
      );

      setMedicines(
        m.length > 0
          ? m
          : [
              { id: 'med-1', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime' },
              { id: 'med-2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in the morning' },
            ]
      );

      setAppointments(
        a.length > 0
          ? a
          : [
              { id: 'apt-1', doctorName: 'Dr. Sarah Jenkins', date: new Date().toISOString(), type: 'Follow-up Cardiology' },
            ]
      );

      setTimeline(
        t.length > 0
          ? t
          : [
              { id: 'tl-1', title: 'Prescription Refilled', eventType: 'medication', date: new Date().toISOString() },
              { id: 'tl-2', title: 'Annual Checkup Completed', eventType: 'appointment', date: new Date().toISOString() },
            ]
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadOfflineState();
    const unsub = offlineSyncService.subscribe((s) => {
      setStats((prev) => ({ ...prev, ...s }));
    });
    return () => unsub();
  }, [loadOfflineState]);

  const handleHydrate = async () => {
    setIsHydrating(true);
    try {
      await offlineSyncService.hydrateOfflineSnapshot();
      await loadOfflineState();
    } finally {
      setIsHydrating(false);
    }
  };

  const handleReplay = async () => {
    setIsReplaying(true);
    try {
      await offlineSyncService.processMutationQueue();
      await loadOfflineState();
    } finally {
      setIsReplaying(false);
    }
  };

  const handleDeleteMutation = async (id: string) => {
    await offlineStorage.removeMutation(id);
    await loadOfflineState();
  };

  const isOffline = stats.status === 'offline';

  return (
    <div className="space-y-6 pb-12">
      <OfflineStatusBar />

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-900/30 to-cyan-950/40 border border-border/40 p-8 backdrop-blur-xl shadow-lg"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              F37 Offline-First PWA Platform
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Offline Healthcare Operating System
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Uninterrupted clinical care during network outages with IndexedDB local storage, background mutation
              queuing, automatic conflict-resolved replay, and offline emergency medical card access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Emergency Card
            </button>

            <button
              onClick={handleHydrate}
              disabled={isHydrating || isOffline}
              className="px-4 py-2 rounded-xl bg-card/60 hover:bg-card border border-border/50 text-foreground text-xs font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${isHydrating ? 'animate-bounce' : ''}`} />
              Hydrate Snapshot
            </button>

            <button
              onClick={handleReplay}
              disabled={isReplaying || isOffline || queue.length === 0}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
              Replay Queue ({queue.length})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Platform Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/40 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Connectivity</span>
            <div className="text-base font-bold text-foreground capitalize flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOffline ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              {stats.status}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground">
            {isOffline ? <WifiOff className="w-5 h-5 text-amber-400" /> : <Wifi className="w-5 h-5 text-emerald-400" />}
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Queued Mutations</span>
            <div className="text-base font-bold text-foreground mt-0.5">{queue.length} Pending</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Replay Success</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{stats.successfulReplays} Applied</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Storage Engine</span>
            <div className="text-base font-bold text-foreground mt-0.5">IndexedDB</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Queued Mutations Table */}
      <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Background Mutation Queue
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {queue.length} operations
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Offline POST/PUT/DELETE API requests queued to be replayed automatically when internet returns
            </p>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No offline mutations queued. All data is fully synchronized with the hospital servers.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground">
                  <th className="pb-2 font-semibold">Method</th>
                  <th className="pb-2 font-semibold">Endpoint</th>
                  <th className="pb-2 font-semibold">Resource</th>
                  <th className="pb-2 font-semibold">Queued At</th>
                  <th className="pb-2 font-semibold">Retries</th>
                  <th className="pb-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold text-[10px]">
                        {item.method}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-foreground">{item.url}</td>
                    <td className="py-2.5 capitalize">{item.resource}</td>
                    <td className="py-2.5 text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5">{item.retryCount}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDeleteMutation(item.id)}
                        className="p-1 rounded-md hover:bg-rose-500/10 text-rose-400"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offline Data Viewer */}
      <OfflineDataViewer
        reports={reports}
        medicines={medicines}
        appointments={appointments}
        timeline={timeline}
      />

      {/* Offline Emergency Card Modal */}
      <OfflineEmergencyCardModal
        profile={emergencyProfile}
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};

export default OfflinePlatformDashboard;
