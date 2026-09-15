import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Droplet,
  AlertTriangle,
  Heart,
  Phone,
  User,
  X,
  CheckCircle,
  FileBadge,
} from 'lucide-react';
import { OfflineEmergencyProfile } from '../../services/offlineStorage';

interface OfflineEmergencyCardModalProps {
  profile: OfflineEmergencyProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineEmergencyCardModal: React.FC<OfflineEmergencyCardModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const p: OfflineEmergencyProfile = profile || {
    patientName: 'Local Patient (Offline Cache)',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg'],
    emergencyContacts: [
      { name: 'Sarah Connor', relationship: 'Spouse', phone: '+1 (555) 234-5678' },
    ],
    organDonor: true,
    dnrStatus: false,
    lastUpdated: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border-2 border-rose-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-sm">Offline Emergency Medical Card</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  CRITICAL ER
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Cached in IndexedDB • Zero Connectivity Access</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patient Identity & Blood Type */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/30">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold block">
              Patient Name
            </span>
            <h4 className="text-base font-bold text-foreground">{p.patientName}</h4>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold block">
              Blood Group
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-black text-sm border border-rose-500/40">
              <Droplet className="w-4 h-4 fill-rose-500" />
              {p.bloodGroup}
            </div>
          </div>
        </div>

        {/* Medical Alerts: Allergies & Chronic Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              Known Allergies
            </div>
            <p className="text-foreground/90 font-medium">{p.allergies?.join(', ') || 'No known allergies'}</p>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-blue-300">
              <Heart className="w-3.5 h-3.5" />
              Chronic Conditions
            </div>
            <p className="text-foreground/90 font-medium">
              {p.chronicConditions?.join(', ') || 'None recorded'}
            </p>
          </div>
        </div>

        {/* Active Medications */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-xs space-y-1">
          <div className="font-semibold text-muted-foreground">Active Daily Medications:</div>
          <p className="text-foreground font-medium">{p.medications?.join(', ') || 'None'}</p>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-2 text-xs">
          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
            Emergency Contacts
          </span>
          <div className="space-y-1.5">
            {p.emergencyContacts?.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/30 bg-muted/20"
              >
                <div>
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <span className="text-muted-foreground ml-2">({c.relationship})</span>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {c.phone}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Badges: DNR & Organ Donor */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-0.5 rounded-md font-semibold ${
                p.organDonor ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
              }`}
            >
              Organ Donor: {p.organDonor ? 'YES' : 'NO'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md font-semibold ${
                p.dnrStatus ? 'bg-rose-500/20 text-rose-300' : 'bg-muted text-muted-foreground'
              }`}
            >
              DNR: {p.dnrStatus ? 'FULL DNR' : 'FULL CODE'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-card border border-border/40 text-foreground text-xs font-semibold hover:bg-muted"
          >
            Close Card
          </button>
        </div>
      </motion.div>
    </div>
  );
};
