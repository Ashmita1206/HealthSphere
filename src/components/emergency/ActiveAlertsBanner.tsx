import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, CheckCircle2, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmergencyIncidentData {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  triggerReason: string;
  status: 'active' | 'escalated' | 'resolved';
  createdAt: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  assignedDoctor?: {
    name: string;
    specialization: string;
    phone: string;
  };
}

export interface ActiveAlertsBannerProps {
  incidents: EmergencyIncidentData[];
  onResolve?: (id: string) => void;
  onCallAssignedDoctor?: (phone: string) => void;
  className?: string;
}

export const ActiveAlertsBanner: React.FC<ActiveAlertsBannerProps> = ({
  incidents,
  onResolve,
  onCallAssignedDoctor,
  className = '',
}) => {
  if (!incidents || incidents.length === 0) {
    return (
      <div
        data-testid="no-active-alerts"
        className={`p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              No Active Emergencies Detected
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              HealthSphere Live Monitoring is actively evaluating vitals and device telemetry.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
          ALL CLEAR
        </span>
      </div>
    );
  }

  return (
    <div data-testid="active-alerts-banner" className={`space-y-3 ${className}`}>
      {incidents.map((incident) => {
        const isCritical = incident.severity === 'CRITICAL';
        return (
          <div
            key={incident.id}
            data-testid={`active-incident-${incident.id}`}
            className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden transition-all ${
              isCritical
                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
                : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
            }`}
          >
            {/* Top Indicator Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/60 dark:border-rose-900/40">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isCritical ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                    isCritical ? 'bg-rose-600' : 'bg-amber-600'
                  }`} />
                </span>
                <span
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {incident.severity} EMERGENCY ALERT
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Triggered {incident.createdAt}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {incident.assignedDoctor && onCallAssignedDoctor && (
                  <Button
                    size="sm"
                    onClick={() => onCallAssignedDoctor(incident.assignedDoctor!.phone)}
                    className="h-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Dr. {incident.assignedDoctor.name}</span>
                  </Button>
                )}

                {onResolve && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolve(incident.id)}
                    className="h-8 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-white dark:hover:bg-slate-800"
                  >
                    Resolve Alert
                  </Button>
                )}
              </div>
            </div>

            {/* Trigger Reason & Clinical Data */}
            <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{incident.triggerReason}</span>
                </p>
                {incident.location && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>
                      {incident.location.address ||
                        `Lat: ${incident.location.latitude.toFixed(4)}, Lng: ${incident.location.longitude.toFixed(4)}`}
                    </span>
                  </p>
                )}
              </div>

              {incident.assignedDoctor && (
                <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Assigned Tele-Triage Doctor
                    </p>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Dr. {incident.assignedDoctor.name} ({incident.assignedDoctor.specialization})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
