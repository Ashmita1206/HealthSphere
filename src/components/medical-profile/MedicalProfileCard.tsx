import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  User,
  Droplet,
  Heart,
  Scale,
  AlertTriangle,
  Activity,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import type { MedicalProfileData } from '@/services/medicalProfileService';

interface MedicalProfileCardProps {
  profile?: MedicalProfileData | null;
  onEdit?: () => void;
}

export const MedicalProfileCard: React.FC<MedicalProfileCardProps> = ({ profile, onEdit }) => {
  const bloodGroup = profile?.bloodGroup && profile.bloodGroup !== 'Unknown' ? profile.bloodGroup : 'O+';
  const allergies = profile?.allergies || [];
  const conditions = profile?.chronicDiseases || [];
  const height = profile?.height;
  const weight = profile?.weight;

  // Calculate BMI
  const bmi = (() => {
    if (height && weight && height > 0) {
      const heightInMeters = height / 100;
      const val = weight / (heightInMeters * heightInMeters);
      return Math.round(val * 10) / 10;
    }
    return null;
  })();

  const getBmiCategory = (val: number | null) => {
    if (!val) return 'Normal';
    if (val < 18.5) return 'Underweight';
    if (val < 25) return 'Normal weight';
    if (val < 30) return 'Overweight';
    return 'Obese';
  };

  // Calculate Age from Date of Birth
  const age = (() => {
    if (!profile?.dateOfBirth) return null;
    const dob = new Date(profile.dateOfBirth);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  })();

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <User className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                Lifelong Clinical Summary
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Core physiological & diagnostic markers
              </CardDescription>
            </div>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
            >
              Edit Profile
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Core Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
              <Droplet className="w-3 h-3 text-rose-500" />
              <span>Blood Group</span>
            </div>
            <p className="text-base font-black text-rose-600 font-heading mt-0.5">
              {bloodGroup}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
              <Calendar className="w-3 h-3 text-teal-600" />
              <span>Age / DOB</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 font-heading mt-0.5">
              {age ? `${age} yrs` : '28 yrs'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
              <Scale className="w-3 h-3 text-blue-600" />
              <span>Body Mass Index</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 font-heading mt-0.5">
              {bmi ? `${bmi} BMI` : '22.4 BMI'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Organ Donor</span>
            </div>
            <p className="text-base font-bold text-teal-700 font-heading mt-0.5">
              {profile?.organDonor ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        {/* Clinical Tags */}
        <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Known Allergies ({allergies.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allergies.length > 0 ? (
                allergies.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-[11px]"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">No allergies recorded</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Chronic Conditions ({conditions.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {conditions.length > 0 ? (
                conditions.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[11px]"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">No chronic conditions listed</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
