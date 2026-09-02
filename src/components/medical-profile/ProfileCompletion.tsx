import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User,
  Heart,
  Droplet,
  Phone,
  Shield,
  Sparkles,
} from 'lucide-react';
import type { MedicalProfileData } from '@/services/medicalProfileService';

interface ProfileCompletionProps {
  profile?: MedicalProfileData | null;
  onNavigateToTab?: (tab: string) => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  profile,
  onNavigateToTab,
}) => {
  const completion = profile?.completionPercentage ?? 60;

  // Evaluate missing fields
  const suggestions: Array<{ label: string; tab: string; icon: React.ComponentType<{ className?: string }> }> = [];

  if (!profile?.bloodGroup || profile.bloodGroup === 'Unknown') {
    suggestions.push({ label: 'Set verified Blood Group', tab: 'vitals', icon: Droplet });
  }
  if (!profile?.emergencyContacts || profile.emergencyContacts.length === 0) {
    suggestions.push({ label: 'Add Emergency Contacts', tab: 'emergency', icon: Phone });
  }
  if (!profile?.allergies || profile.allergies.length === 0) {
    suggestions.push({ label: 'Document Allergies & Reactions', tab: 'clinical', icon: Heart });
  }
  if (!profile?.insurance?.provider) {
    suggestions.push({ label: 'Add Health Insurance Details', tab: 'insurance', icon: Shield });
  }
  if (!profile?.height || !profile?.weight) {
    suggestions.push({ label: 'Record Height & Weight for BMI', tab: 'vitals', icon: User });
  }

  const getStatusColor = (pct: number) => {
    if (pct >= 90) return { stroke: '#059669', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (pct >= 60) return { stroke: '#0f766e', text: 'text-teal-700', bg: 'bg-teal-50' };
    return { stroke: '#d97706', text: 'text-amber-700', bg: 'bg-amber-50' };
  };

  const status = getStatusColor(completion);

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                Medical Profile Completeness
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Enhances AI accuracy and emergency medical response
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-black font-heading text-teal-800">
            {completion}% Complete
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
            <span>Basic Setup</span>
            <span>Comprehensive Medical ID</span>
          </div>
        </div>

        {/* Missing Suggestions */}
        {suggestions.length > 0 ? (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Recommended to Complete ({suggestions.length} items)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.slice(0, 4).map((sug) => {
                const Icon = sug.icon;
                return (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => onNavigateToTab && onNavigateToTab(sug.tab)}
                    className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-teal-50 hover:border-teal-200 transition-colors flex items-center justify-between gap-2 text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">
                        {sug.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All essential lifelong medical profile sections are complete!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
