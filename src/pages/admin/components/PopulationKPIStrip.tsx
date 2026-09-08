import React from 'react';
import { Users, ShieldAlert, HeartPulse, Clock, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export interface AdminKPIData {
  totalPatients: number;
  patientsDelta: string;
  highRiskCount: number;
  highRiskPct: number;
  admissionAvoidanceRate: number; // e.g. 91.4%
  emergencyAvgResponseTime: string; // e.g. 4.2m
  satisfactionScore: number; // e.g. 4.9
}

export const DEFAULT_ADMIN_KPIS: AdminKPIData = {
  totalPatients: 14820,
  patientsDelta: '+12.4% this quarter',
  highRiskCount: 1420,
  highRiskPct: 9.6,
  admissionAvoidanceRate: 91.4,
  emergencyAvgResponseTime: '4.2 mins',
  satisfactionScore: 4.9,
};

export const PopulationKPIStrip: React.FC<{ data?: AdminKPIData; className?: string }> = ({
  data = DEFAULT_ADMIN_KPIS,
  className = '',
}) => {
  const kpiCards = [
    {
      label: 'Enrolled Population',
      value: data.totalPatients.toLocaleString(),
      subtext: data.patientsDelta,
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      border: 'border-teal-200 dark:border-teal-800',
    },
    {
      label: 'Critical Risk Cohort',
      value: `${data.highRiskCount.toLocaleString()} (${data.highRiskPct}%)`,
      subtext: 'Flagged for proactive intervention',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      border: 'border-rose-200 dark:border-rose-800',
    },
    {
      label: 'Admission Avoidance',
      value: `${data.admissionAvoidanceRate}%`,
      subtext: '280 hospitalizations prevented',
      icon: HeartPulse,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      label: 'Avg SOS Response Time',
      value: data.emergencyAvgResponseTime,
      subtext: 'SOS trigger to tele-triage dispatch',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      border: 'border-purple-200 dark:border-purple-800',
    },
  ];

  return (
    <div
      data-testid="population-kpi-strip"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {kpiCards.map((c) => (
        <div
          key={c.label}
          data-testid={`kpi-card-${c.label}`}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center`}>
              <c.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              HealthSphere OS
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {c.value}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>{c.subtext}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
