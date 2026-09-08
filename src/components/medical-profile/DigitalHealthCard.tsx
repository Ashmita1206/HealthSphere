import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  QrCode,
  Printer,
  Download,
  Phone,
  Heart,
  User,
  Activity,
} from 'lucide-react';
import type { MedicalProfileData } from '@/services/medicalProfileService';

interface DigitalHealthCardProps {
  profile?: MedicalProfileData | null;
}

export const DigitalHealthCard: React.FC<DigitalHealthCardProps> = ({ profile }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const fullName = profile?.fullName || 'HealthSphere Patient';
  const healthId = profile?.healthId || 'HS-2026-000123';
  const bloodGroup = profile?.bloodGroup && profile.bloodGroup !== 'Unknown' ? profile.bloodGroup : 'O+';
  const primaryContact = profile?.emergencyContacts?.find((c) => c.isPrimary) || profile?.emergencyContacts?.[0];
  const emergencyPhone = primaryContact ? `${primaryContact.name} · ${primaryContact.phone}` : 'Not Specified';
  const organDonor = profile?.organDonor ? 'YES' : 'NO';
  const allergies = profile?.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None Reported';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Printable ID Card Container */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-teal-500/30"
      >
        {/* Background Decorative Circles */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Card Header: Branding & Chip */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-widest uppercase font-heading text-teal-300">
                  HealthSphere
                </span>
                <span className="text-[10px] font-bold text-teal-100/70 bg-teal-500/20 px-1.5 py-0.2 rounded">
                  DIGITAL ID
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Lifelong Universal Health Identifier</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED PATIENT</span>
          </div>
        </div>

        {/* Card Body: User Info & QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6 items-center">
          {/* Avatar & Personal Details */}
          <div className="sm:col-span-2 flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <User className="w-8 h-8 text-teal-300/80" />
            </div>

            <div className="space-y-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-extrabold text-white truncate font-heading">
                {fullName}
              </h3>
              <p className="font-mono text-xs font-bold text-teal-300 tracking-wider">
                {healthId}
              </p>

              <div className="flex items-center gap-3 pt-1 flex-wrap text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">DOB:</span>{' '}
                  <strong className="text-white">{profile?.dateOfBirth || '—'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">Gender:</span>{' '}
                  <strong className="text-white capitalize">{profile?.gender || '—'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Graphic Placeholder */}
          <div className="flex flex-col items-center justify-center sm:items-end">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-slate-200">
              <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-slate-900" />
            </div>
            <span className="text-[9px] text-teal-300/80 font-mono mt-1 font-bold">
              SCAN TO VIEW
            </span>
          </div>
        </div>

        {/* Critical Vitals Banner Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-4 text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Group</span>
            <span className="text-sm font-black text-rose-400 font-heading">{bloodGroup}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Organ Donor</span>
            <span className="text-sm font-bold text-teal-300">{organDonor}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 sm:col-span-2">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Emergency SOS</span>
            <span className="text-xs font-semibold text-white truncate block">{emergencyPhone}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex-1 text-xs font-bold gap-2 h-10 rounded-xl"
        >
          <Printer className="w-4 h-4" />
          <span>Print Card</span>
        </Button>
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex-1 text-xs font-bold gap-2 h-10 rounded-xl"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </Button>
      </div>
    </div>
  );
};
