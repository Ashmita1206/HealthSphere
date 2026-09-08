import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Building2,
  Clock,
  Award,
  Mail,
  Phone,
  FileBadge,
  Share2,
} from 'lucide-react';
import type { Doctor } from '@/services/doctorService';

interface DoctorProfileProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (doctor: Doctor) => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({
  doctor,
  open,
  onOpenChange,
  onShare,
}) => {
  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden border border-slate-200">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white relative">
          <div className="flex items-start gap-4">
            {doctor.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={doctor.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-teal-700/60 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white/40 shadow-md">
                {doctor.fullName
                  .replace(/^Dr\.\s*/i, '')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white font-heading truncate">
                  {doctor.fullName}
                </h2>
                {doctor.verified && (
                  <Badge className="bg-teal-500/30 text-teal-200 border-teal-400/40 text-[10px] gap-1 shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Provider
                  </Badge>
                )}
              </div>
              <p className="text-teal-200 text-xs font-semibold mt-0.5">
                {doctor.specialization}
              </p>
              <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">
                {doctor.qualification}
              </p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Clinical Experience
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-slate-800 font-bold text-sm">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{doctor.experience} Years Active Practice</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Medical License
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-slate-800 font-mono font-bold text-xs">
                <FileBadge className="w-4 h-4 text-teal-800" />
                <span>{doctor.licenseNumber}</span>
              </div>
            </div>
          </div>

          {/* Affiliation & Hospital */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hospital Affiliation
            </h4>
            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center gap-3 text-xs text-slate-800">
              <Building2 className="w-4 h-4 text-teal-800 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">{doctor.hospital || 'Private Medical Center'}</p>
                <p className="text-[11px] text-slate-500">Accredited Healthcare Partner</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Contact & Inquiries
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.email}</span>
              </div>
              {doctor.phone && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{doctor.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Availability Schedule */}
          {doctor.availability && doctor.availability.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Consultation Schedule
              </h4>
              <div className="space-y-1.5">
                {doctor.availability.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 font-medium"
                  >
                    <Clock className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onShare(doctor);
            }}
            className="bg-teal-800 hover:bg-teal-900 text-white rounded-xl gap-2 font-bold shadow-xs px-5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Medical Records</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
