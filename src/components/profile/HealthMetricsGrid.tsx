import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Heart,
  Scale,
  Moon,
  Droplets,
  Zap,
  TrendingDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { Profile } from '@/pages/profile/profileData';

interface HealthMetricsGridProps {
  profile: Profile;
}

export const HealthMetricsGrid = memo(function HealthMetricsGrid({ profile }: HealthMetricsGridProps) {
  // BMI Calculations
  const bmi = profile.bmi || (profile.height && profile.weight ? Number((profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)) : 22.9);
  
  const getBMICategory = (val: number) => {
    if (val < 18.5) return { category: 'Underweight', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    if (val <= 24.9) return { category: 'Healthy Weight', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    if (val <= 29.9) return { category: 'Overweight', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    return { category: 'Obese', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
  };

  const bmiMeta = getBMICategory(bmi);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold font-heading text-slate-900">
            Vital Health Metrics & Trends
          </h3>
          <p className="text-xs text-slate-500">
            Biometric telemetry and longitudinal clinical indicators.
          </p>
        </div>
        <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-[10px] font-bold uppercase">
          Live Sync
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. BMI Card */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white hover:border-teal-300 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Scale className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Body Mass Index (BMI)</span>
              </div>
              <Badge className={`text-[10px] font-extrabold uppercase border ${bmiMeta.bg} ${bmiMeta.color}`}>
                {bmiMeta.category}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-3xl font-extrabold font-heading text-slate-900">{bmi}</p>
                <p className="text-[10px] text-slate-500 font-medium">Height: {profile.height || 175}cm • Weight: {profile.weight || 70}kg</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Optimal Target
              </span>
            </div>

            <Progress value={Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100))} className="h-2 bg-slate-100" />
          </CardContent>
        </Card>

        {/* 2. Weight Trend Card */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white hover:border-teal-300 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <TrendingDown className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Weight Trend (6 Mo)</span>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                -2.5 kg
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-3xl font-extrabold font-heading text-slate-900">
                  {profile.weight || 70} <span className="text-xs font-normal text-slate-500">kg</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Target: 68.0 kg (Maintainable)</p>
              </div>
            </div>

            {/* Visual Mini Bar Chart */}
            <div className="flex items-end gap-1.5 h-8 pt-1">
              {[72.5, 72.0, 71.2, 71.0, 70.4, profile.weight || 70].map((w, idx) => (
                <div key={idx} className="flex-1 bg-blue-100 rounded-t-sm relative group overflow-hidden" style={{ height: `${(w / 75) * 100}%` }}>
                  <div className="absolute inset-0 bg-blue-600 rounded-t-sm transition-all" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Blood Pressure Card */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white hover:border-teal-300 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <Heart className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-slate-800">Blood Pressure</span>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold uppercase">
                Normal
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-3xl font-extrabold font-heading text-slate-900">
                  {profile.blood_pressure_sys}/{profile.blood_pressure_dia}
                  <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Recorded today at 8:30 AM</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-2 border border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Systolic & Diastolic:</span>
              <span className="font-bold text-teal-800">120/80 Target</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Blood Sugar Card */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white hover:border-teal-300 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Fasting Blood Sugar</span>
              </div>
              <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-[10px] font-bold">
                Fasting
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-3xl font-extrabold font-heading text-slate-900">
                  {profile.blood_sugar_fasting} <span className="text-xs font-normal text-slate-500">mg/dL</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Normal Fasting: 70–99 mg/dL</p>
              </div>
            </div>

            <Progress value={((profile.blood_sugar_fasting - 60) / 60) * 100} className="h-2 bg-slate-100" />
          </CardContent>
        </Card>

        {/* 5. Sleep Monitor Card */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white hover:border-teal-300 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                  <Moon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Sleep Duration</span>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold">
                Restful
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-3xl font-extrabold font-heading text-slate-900">
                  {profile.sleep_hours} <span className="text-xs font-normal text-slate-500">hrs/night</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Deep Sleep: 2h 15m (28%)</p>
              </div>
            </div>

            <Progress value={(profile.sleep_hours / 9) * 100} className="h-2 bg-slate-100" />
          </CardContent>
        </Card>

        {/* 6. Hydration Monitor Card */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-xs bg-white hover:border-teal-300 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Droplets className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Daily Hydration</span>
              </div>
              <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px] font-bold">
                80% Reached
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-3xl font-extrabold font-heading text-slate-900">
                  2.4 <span className="text-xs font-normal text-slate-500">/ 3.0 Liters</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Remaining: 600ml before 10 PM</p>
              </div>
            </div>

            <Progress value={80} className="h-2 bg-slate-100" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
