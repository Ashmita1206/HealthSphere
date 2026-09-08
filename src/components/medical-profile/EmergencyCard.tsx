import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  PhoneCall,
  AlertTriangle,
  Pill,
  Heart,
  Droplet,
  UserCheck,
} from 'lucide-react';
import type { MedicalProfileData } from '@/services/medicalProfileService';

interface EmergencyCardProps {
  profile?: MedicalProfileData | null;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ profile }) => {
  const bloodGroup = profile?.bloodGroup && profile.bloodGroup !== 'Unknown' ? profile.bloodGroup : 'O+';
  const allergies = profile?.allergies && profile.allergies.length > 0 ? profile.allergies : ['None reported'];
  const chronicDiseases = profile?.chronicDiseases && profile.chronicDiseases.length > 0 ? profile.chronicDiseases : ['None reported'];
  const medications = profile?.currentMedications && profile.currentMedications.length > 0 ? profile.currentMedications : ['None reported'];
  const emergencyContacts = profile?.emergencyContacts || [];

  return (
    <Card className="rounded-2xl border-2 border-rose-300/80 shadow-md bg-white overflow-hidden">
      {/* Alert Header */}
      <CardHeader className="bg-rose-50/80 border-b border-rose-200/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-rose-950 font-heading">
                Paramedic Emergency Medical Summary
              </CardTitle>
              <CardDescription className="text-[11px] text-rose-700 font-medium">
                Immediate clinical information for emergency first responders
              </CardDescription>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
            EMERGENCY ACCESS
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Large Blood Group & Organ Donor Highlight Banner */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-rose-500 text-white flex items-center gap-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-100">
                Blood Group
              </span>
              <p className="text-2xl sm:text-3xl font-black font-heading leading-tight">
                {bloodGroup}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Organ Donor
              </span>
              <p className="text-xl sm:text-2xl font-black text-teal-300 font-heading leading-tight">
                {profile?.organDonor ? 'Registered' : 'Not Registered'}
              </p>
            </div>
          </div>
        </div>

        {/* Critical Clinical Lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Allergies Box */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Severe Allergies & Contraindications</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 font-semibold text-[11px]"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>

          {/* Current Medications */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
              <Pill className="w-3.5 h-3.5 text-blue-600" />
              <span>Current Medications</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {medications.map((med, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-900 font-semibold text-[11px]"
                >
                  {med}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts Dial Strip */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Emergency Contacts
          </span>
          {emergencyContacts.length > 0 ? (
            <div className="space-y-2">
              {emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs text-slate-900">{contact.name}</strong>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                        {contact.relationship}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600">{contact.phone}</span>
                  </div>

                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No emergency contacts listed yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
