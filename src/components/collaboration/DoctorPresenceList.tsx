import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Stethoscope, Radio, Activity, CheckCircle2, Clock, PhoneCall } from 'lucide-react';
import { StaffPresence } from '../../services/collaborationService';

interface DoctorPresenceListProps {
  presenceList: StaffPresence[];
  currentStatus: string;
  onStatusChange: (status: string) => void;
  isLoading?: boolean;
}

export const DoctorPresenceList: React.FC<DoctorPresenceListProps> = ({
  presenceList,
  currentStatus,
  onStatusChange,
  isLoading = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'in_consultation':
        return {
          label: 'In Consultation',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          dot: 'bg-blue-400',
        };
      case 'rounding':
        return {
          label: 'Ward Rounding',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400',
        };
      case 'busy':
        return {
          label: 'In Surgery / Busy',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          dot: 'bg-rose-400',
        };
      default:
        return {
          label: 'Offline',
          color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          dot: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Clinical Care Team Presence
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <Radio className="w-3 h-3 mr-1 animate-pulse" /> Live
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">Real-time doctor, specialist & nurse hospital availability</p>
          </div>
        </div>

        {/* My Status Switcher */}
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border/40 text-xs">
          <span className="text-muted-foreground px-2">My Status:</span>
          {(['available', 'rounding', 'in_consultation', 'busy'] as const).map((st) => (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentStatus === st
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st === 'in_consultation' ? 'Consulting' : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Synchronizing care team telemetry...</div>
      ) : presenceList.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No other active clinicians currently broadcasted on hospital network.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presenceList.map((doc, idx) => {
            const badge = getStatusBadge(doc.status);
            return (
              <motion.div
                key={doc.userId || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-card/60 hover:bg-card/90 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-xs text-primary">
                      {doc.name ? doc.name.slice(0, 2).toUpperCase() : 'DR'}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${badge.dot}`}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">{doc.department || 'Clinical Specialist'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <button
                    title="Direct Page / Call"
                    className="p-1.5 rounded-lg border border-border/40 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
