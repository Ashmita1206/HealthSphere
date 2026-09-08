import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pill, Calendar, Heart, FileText, ShieldAlert, Activity, Sliders } from 'lucide-react';
import type { HealthScoreBreakdown } from '@/services/analyticsService';

interface HealthBreakdownProps {
  breakdown?: HealthScoreBreakdown | null;
}

export const HealthBreakdown: React.FC<HealthBreakdownProps> = ({ breakdown }) => {
  const data = breakdown || {
    medicine: 95,
    appointments: 90,
    vitals: 88,
    reports: 92,
    timeline: 85,
    emergency: 100,
  };

  const categories = [
    {
      name: 'Medication Adherence',
      weight: '35% weight',
      score: data.medicine,
      icon: Pill,
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
    },
    {
      name: 'Clinical Appointments',
      weight: '20% weight',
      score: data.appointments,
      icon: Calendar,
      barColor: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    {
      name: 'Vitals & Telemetry',
      weight: '15% weight',
      score: data.vitals,
      icon: Heart,
      barColor: 'bg-rose-500',
      textColor: 'text-rose-700',
    },
    {
      name: 'Lab & Diagnostic Reports',
      weight: '10% weight',
      score: data.reports,
      icon: FileText,
      barColor: 'bg-violet-500',
      textColor: 'text-violet-700',
    },
    {
      name: 'Timeline & Care Milestones',
      weight: '10% weight',
      score: data.timeline,
      icon: Activity,
      barColor: 'bg-teal-500',
      textColor: 'text-teal-700',
    },
    {
      name: 'Emergency Safety Protocol',
      weight: '10% weight',
      score: data.emergency,
      icon: ShieldAlert,
      barColor: 'bg-amber-500',
      textColor: 'text-amber-700',
    },
  ];

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                Multi-Factor Health Index Breakdown
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Weighted scoring components contributing to your overall health score
              </CardDescription>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Weighted Total: 100%
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${cat.textColor}`} />
                  <span className="font-bold text-slate-800">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({cat.weight})</span>
                </div>
                <span className="font-extrabold text-slate-900 font-heading">{cat.score}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cat.barColor}`}
                  style={{ width: `${Math.min(Math.max(cat.score, 0), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
