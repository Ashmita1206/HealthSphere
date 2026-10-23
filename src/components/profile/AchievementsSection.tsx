import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Pill, CalendarCheck, Trophy, Award } from 'lucide-react';
import type { Profile } from '@/pages/profile/profileData';

interface AchievementsSectionProps {
  profile: Profile;
}

export const AchievementsSection = memo(function AchievementsSection({
  profile,
}: AchievementsSectionProps) {
  const hasStreak = typeof profile.health_streak === 'number' && profile.health_streak > 0;
  const hasMedRate = typeof profile.medicine_adherence_rate === 'number';
  const hasApptRate = typeof profile.appointment_completion_rate === 'number';

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
                Health Consistency & Engagement
              </h3>
              <p className="text-xs text-slate-500">
                Adherence tracking across medication, vitals logging, and clinical appointments.
              </p>
            </div>
          </div>
          <Badge className="bg-amber-50 text-amber-900 border-amber-200/80 text-[10px] font-bold uppercase tracking-wider">
            {hasStreak ? `${profile.health_streak} Day Streak` : 'Consistency'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {/* 1. Streak Card */}
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-600" />
                <span>Active Streak</span>
              </span>
              <Award className="h-4 w-4 text-amber-600/70" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              {hasStreak ? profile.health_streak : '--'}{' '}
              <span className="text-xs font-normal text-slate-500">
                {hasStreak ? 'Days' : 'No streak recorded'}
              </span>
            </p>
            <p className="text-[11px] text-amber-800/90 font-medium">
              {hasStreak
                ? 'Recorded vitals and medications regularly'
                : 'Log daily health metrics to begin tracking streak'}
            </p>
          </div>

          {/* 2. Medicine Adherence */}
          <div className="rounded-xl border border-teal-200/70 bg-teal-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Pill className="h-4 w-4 text-teal-600" />
                <span>Dose Adherence</span>
              </span>
              <Award className="h-4 w-4 text-teal-600/70" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              {hasMedRate ? (
                <>
                  {profile.medicine_adherence_rate}
                  <span className="text-xs font-normal text-slate-500">%</span>
                </>
              ) : (
                '--'
              )}
            </p>
            <p className="text-[11px] text-teal-800/90 font-medium">
              {hasMedRate
                ? 'Based on recorded dosage completions'
                : 'No prescription adherence recorded yet'}
            </p>
          </div>

          {/* 3. Appointment Completion */}
          <div className="rounded-xl border border-blue-200/70 bg-blue-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4 text-blue-600" />
                <span>Appointments</span>
              </span>
              <Award className="h-4 w-4 text-blue-600/70" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              {hasApptRate ? (
                <>
                  {profile.appointment_completion_rate}
                  <span className="text-xs font-normal text-slate-500">%</span>
                </>
              ) : (
                '--'
              )}
            </p>
            <p className="text-[11px] text-blue-800/90 font-medium">
              {hasApptRate
                ? 'Based on scheduled checkups and visits'
                : 'No appointment completion recorded yet'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
