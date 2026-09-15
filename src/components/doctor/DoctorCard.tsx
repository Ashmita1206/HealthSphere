import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Building2,
  Clock,
  Award,
  Share2,
  FileBadge,
  UserCheck,
} from 'lucide-react';
import type { Doctor } from '@/services/doctorService';

interface DoctorCardProps {
  doctor: Doctor;
  onShare: (doctor: Doctor) => void;
  onViewProfile?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onShare,
  onViewProfile,
}) => {
  return (
    <Card className="rounded-2xl border border-slate-200/90 shadow-xs bg-white hover:shadow-md hover:border-teal-500/50 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        {/* Top Header: Avatar + Info */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            {doctor.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={doctor.fullName}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 font-extrabold text-lg flex items-center justify-center border border-teal-200/60 shadow-2xs">
                {doctor.fullName
                  .replace(/^Dr\.\s*/i, '')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            )}
            {doctor.verified && (
              <span
                className="absolute -bottom-1 -right-1 bg-teal-800 text-white rounded-full p-0.5 shadow-xs border border-white"
                title="Verified Healthcare Provider"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 truncate font-heading group-hover:text-teal-900 transition-colors">
                {doctor.fullName}
              </h3>
            </div>
            <p className="text-xs font-semibold text-teal-800 mt-0.5">
              {doctor.specialization}
            </p>
            {doctor.qualification && (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {doctor.qualification}
              </p>
            )}
          </div>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{doctor.hospital || 'Private Practice'}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{doctor.experience} yrs experience</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              <FileBadge className="w-3 h-3 text-slate-500" />
              <span>{doctor.licenseNumber}</span>
            </span>
          </div>

          {doctor.availability && doctor.availability.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{doctor.availability[0]}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {onViewProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(doctor)}
              className="flex-1 text-xs font-semibold h-9 rounded-xl border-slate-200 hover:bg-slate-50"
            >
              Profile
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onShare(doctor)}
            className="flex-1 text-xs font-bold h-9 rounded-xl bg-teal-800 hover:bg-teal-900 text-white shadow-xs gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Records</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
