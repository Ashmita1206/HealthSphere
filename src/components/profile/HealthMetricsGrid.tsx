import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Scale,
  Heart,
  Moon,
  Droplets,
  Zap,
  TrendingDown,
  PlusCircle,
  Activity,
} from 'lucide-react';
import type { Profile } from '@/pages/profile/profileData';

interface HealthMetricsGridProps {
  profile: Profile;
  onRecordMetric?: (metricKey: string) => void;
}

export const HealthMetricsGrid = memo(function HealthMetricsGrid({
  profile,
  onRecordMetric,
}: HealthMetricsGridProps) {
  // BMI Calculations
  const bmi =
    profile.bmi ||
    (profile.height && profile.weight && profile.height > 0
      ? Number((profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1))
      : undefined);

  const getBMICategory = (val?: number) => {
    if (val === undefined)
      return {
        category: 'Not Recorded',
        color: 'text-slate-600',
        bg: 'bg-slate-100 border-slate-200',
      };
    if (val < 18.5)
      return {
        category: 'Underweight',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
      };
    if (val <= 24.9)
      return {
        category: 'Normal Range',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
      };
    if (val <= 29.9)
      return {
        category: 'Overweight',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
      };
    return {
      category: 'High Range',
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
    };
  };

  const bmiMeta = getBMICategory(bmi);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
            Vital Health Metrics & Indicators
          </h3>
          <p className="text-xs text-slate-500">
            Biometric telemetry, longitudinal physiological markers, and lifestyle records.
          </p>
        </div>
        <Badge className="bg-teal-50 text-teal-800 border-teal-200/80 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3 text-teal-600" />
          <span>Biometric Log</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. BMI Card */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
          <CardContent className="p-4 sm:p-5 space-y-3 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Scale className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Body Mass Index (BMI)</span>
              </div>
              <Badge className={`text-[10px] font-bold uppercase border ${bmiMeta.bg} ${bmiMeta.color}`}>
                {bmiMeta.category}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                  {bmi ?? '--'}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Height: {profile.height ? `${profile.height} cm` : 'Not recorded'} • Weight:{' '}
                  {profile.weight ? `${profile.weight} kg` : 'Not recorded'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Progress
                value={bmi !== undefined ? Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100)) : 0}
                className="h-2 bg-slate-100"
              />
              {onRecordMetric && (
                <button
                  type="button"
                  onClick={() => onRecordMetric('vitals')}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>{bmi !== undefined ? 'Update Height/Weight' : 'Record Height & Weight'}</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Recorded Weight Card */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
          <CardContent className="p-4 sm:p-5 space-y-3 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Recorded Weight</span>
              </div>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                {profile.weight ? 'Recorded' : 'Not recorded'}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                  {profile.weight ?? '--'}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    {profile.weight ? 'kg' : ''}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {profile.weight ? 'Most recently recorded weight' : 'Track weight for clinical trends'}
                </p>
              </div>
            </div>

            <div className="pt-1">
              {onRecordMetric && (
                <button
                  type="button"
                  onClick={() => onRecordMetric('vitals')}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>{profile.weight ? 'Update Weight' : 'Log Weight'}</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Blood Pressure Card */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
          <CardContent className="p-4 sm:p-5 space-y-3 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Blood Pressure</span>
              </div>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                {profile.blood_pressure_sys && profile.blood_pressure_dia
                  ? 'Recorded'
                  : 'Not recorded'}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                  {profile.blood_pressure_sys && profile.blood_pressure_dia
                    ? `${profile.blood_pressure_sys}/${profile.blood_pressure_dia}`
                    : '--'}
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    {profile.blood_pressure_sys ? 'mmHg' : ''}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {profile.blood_pressure_sys
                    ? 'Systolic / Diastolic reading'
                    : 'Log blood pressure to monitor cardiovascular health'}
                </p>
              </div>
            </div>

            <div className="pt-1">
              {onRecordMetric && (
                <button
                  type="button"
                  onClick={() => onRecordMetric('vitals')}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>
                    {profile.blood_pressure_sys ? 'Update Blood Pressure' : 'Log Blood Pressure'}
                  </span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Fasting Blood Sugar Card */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
          <CardContent className="p-4 sm:p-5 space-y-3 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Fasting Blood Sugar</span>
              </div>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                {profile.blood_sugar_fasting ? 'Recorded' : 'Not recorded'}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                  {profile.blood_sugar_fasting ?? '--'}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    {profile.blood_sugar_fasting ? 'mg/dL' : ''}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {profile.blood_sugar_fasting
                    ? 'Standard Fasting: 70–99 mg/dL'
                    : 'Fasting glucose measurement unrecorded'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Progress
                value={
                  profile.blood_sugar_fasting
                    ? Math.min(100, Math.max(0, ((profile.blood_sugar_fasting - 60) / 60) * 100))
                    : 0
                }
                className="h-2 bg-slate-100"
              />
              {onRecordMetric && (
                <button
                  type="button"
                  onClick={() => onRecordMetric('vitals')}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>{profile.blood_sugar_fasting ? 'Update Glucose' : 'Log Blood Sugar'}</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5. Sleep Duration Card */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
          <CardContent className="p-4 sm:p-5 space-y-3 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Moon className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Sleep Duration</span>
              </div>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                {profile.sleep_hours ? 'Tracked' : 'Not recorded'}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                  {profile.sleep_hours ?? '--'}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    {profile.sleep_hours ? 'hrs/night' : ''}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {profile.sleep_hours ? 'Clinical rest goal: 7–9 hrs' : 'Daily sleep hours unrecorded'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Progress
                value={profile.sleep_hours ? Math.min(100, (profile.sleep_hours / 9) * 100) : 0}
                className="h-2 bg-slate-100"
              />
              {onRecordMetric && (
                <button
                  type="button"
                  onClick={() => onRecordMetric('lifestyle')}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>{profile.sleep_hours ? 'Update Sleep' : 'Log Sleep'}</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 6. Daily Hydration Card */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
          <CardContent className="p-4 sm:p-5 space-y-3 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Droplets className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Daily Hydration</span>
              </div>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                Not recorded
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                  -- <span className="text-xs font-normal text-slate-500">Liters</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Recommended target: 2.5–3.0 Liters daily
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Progress value={0} className="h-2 bg-slate-100" />
              {onRecordMetric && (
                <button
                  type="button"
                  onClick={() => onRecordMetric('lifestyle')}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Log Fluid Intake</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
