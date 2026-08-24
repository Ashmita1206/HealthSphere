import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Pill, CalendarCheck, Trophy, Sparkles, Award } from 'lucide-react';
import type { Profile } from '@/pages/profile/profileData';

interface AchievementsSectionProps {
  profile: Profile;
}

export const AchievementsSection = memo(function AchievementsSection({ profile }: AchievementsSectionProps) {
  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-slate-900">
                Health Streak & Achievements
              </h3>
              <p className="text-xs text-slate-500">
                Consistency milestones across medication, vitals logging, and checkups.
              </p>
            </div>
          </div>
          <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-[10px] font-extrabold uppercase">
            Level 4 Master
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Streak Card */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500 animate-bounce" /> Active Streak
              </span>
              <Award className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold font-heading text-slate-900">
              {profile.health_streak || 14} <span className="text-xs font-normal text-slate-600">Days</span>
            </p>
            <p className="text-[10px] text-amber-800 font-medium">Logged vitals & medications daily</p>
          </div>

          {/* Medicine Adherence */}
          <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-emerald-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-900 flex items-center gap-1">
                <Pill className="h-4 w-4 text-teal-600" /> Dose Adherence
              </span>
              <Award className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-3xl font-extrabold font-heading text-slate-900">
              {typeof profile.medicine_adherence_rate === 'number' ? profile.medicine_adherence_rate : '—'}<span className="text-xs font-normal text-slate-600">{typeof profile.medicine_adherence_rate === 'number' ? '%' : ''}</span>
            </p>
            <p className="text-[10px] text-teal-800 font-medium">{typeof profile.medicine_adherence_rate === 'number' ? 'Based on recorded dose completions' : 'No adherence data recorded yet'}</p>
          </div>

          {/* Appointment Completion */}
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                <CalendarCheck className="h-4 w-4 text-blue-600" /> Appointments
              </span>
              <Award className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold font-heading text-slate-900">
              {typeof profile.appointment_completion_rate === 'number' ? profile.appointment_completion_rate : '—'}<span className="text-xs font-normal text-slate-600">{typeof profile.appointment_completion_rate === 'number' ? '%' : ''}</span>
            </p>
            <p className="text-[10px] text-blue-800 font-medium">{typeof profile.appointment_completion_rate === 'number' ? 'Based on scheduled appointments' : 'No appointment data recorded yet'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
