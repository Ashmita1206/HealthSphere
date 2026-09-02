import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Activity, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';
import type { HealthScoreData } from '@/services/analyticsService';

interface HealthScoreCardProps {
  healthScore?: HealthScoreData | null;
  loading?: boolean;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ healthScore, loading }) => {
  const score = healthScore?.score ?? 92;
  const level = healthScore?.level ?? 'Excellent';
  const breakdown = healthScore?.breakdown ?? {
    medicine: 95,
    appointments: 90,
    vitals: 88,
    reports: 92,
    timeline: 85,
    emergency: 100,
  };

  const getLevelTheme = (lvl: string) => {
    switch (lvl) {
      case 'Excellent':
        return {
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          strokeColor: '#059669',
          badge: 'bg-emerald-100 text-emerald-800',
        };
      case 'Good':
        return {
          textColor: 'text-teal-700',
          bgColor: 'bg-teal-50',
          borderColor: 'border-teal-200',
          strokeColor: '#0f766e',
          badge: 'bg-teal-100 text-teal-800',
        };
      case 'Fair':
        return {
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          strokeColor: '#d97706',
          badge: 'bg-amber-100 text-amber-800',
        };
      default:
        return {
          textColor: 'text-rose-700',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          strokeColor: '#e11d48',
          badge: 'bg-rose-100 text-rose-800',
        };
    }
  };

  const theme = getLevelTheme(level);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden flex flex-col justify-between">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                Intelligent Health Score
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Multi-factor longitudinal wellness assessment
              </CardDescription>
            </div>
          </div>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${theme.badge}`}>
            {level}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-around">
          {/* Circular Progress Radial Gauge */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-100 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={theme.strokeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-2xl font-black font-heading ${theme.textColor}`}>
                {score}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto flex-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-semibold block">Medicine</span>
              <span className="text-xs font-bold text-slate-900">{breakdown.medicine}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-semibold block">Visits</span>
              <span className="text-xs font-bold text-slate-900">{breakdown.appointments}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-semibold block">Vitals</span>
              <span className="text-xs font-bold text-slate-900">{breakdown.vitals}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-semibold block">Reports</span>
              <span className="text-xs font-bold text-slate-900">{breakdown.reports}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
