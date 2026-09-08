import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Pill,
  AlertCircle,
  CalendarCheck,
  FileCheck2,
  Activity,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import type { WeeklySummaryData } from '@/services/analyticsService';

interface WeeklySummaryProps {
  summary?: WeeklySummaryData | null;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ summary }) => {
  const data = summary || {
    medicinesTaken: 14,
    missedMedicines: 0,
    appointmentsCompleted: 1,
    reportsUploaded: 2,
    healthEvents: 5,
    healthScoreDifference: 9,
  };

  const metricCards = [
    {
      title: 'Medicines Taken',
      value: data.medicinesTaken,
      subtitle: 'Doses completed',
      icon: Pill,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200/80',
    },
    {
      title: 'Missed Doses',
      value: data.missedMedicines,
      subtitle: data.missedMedicines === 0 ? 'Zero missed' : 'Needs attention',
      icon: AlertCircle,
      textColor: data.missedMedicines === 0 ? 'text-slate-700' : 'text-rose-700',
      bgColor: data.missedMedicines === 0 ? 'bg-slate-50' : 'bg-rose-50',
      borderColor: data.missedMedicines === 0 ? 'border-slate-200/80' : 'border-rose-200/80',
    },
    {
      title: 'Appointments',
      value: data.appointmentsCompleted,
      subtitle: 'Visits attended',
      icon: CalendarCheck,
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200/80',
    },
    {
      title: 'Reports Uploaded',
      value: data.reportsUploaded,
      subtitle: 'AI diagnostic scans',
      icon: FileCheck2,
      textColor: 'text-violet-700',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200/80',
    },
    {
      title: 'Health Events',
      value: data.healthEvents,
      subtitle: 'Timeline milestones',
      icon: Activity,
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200/80',
    },
    {
      title: 'Score Trend',
      value: `+${data.healthScoreDifference} pts`,
      subtitle: 'vs previous period',
      icon: TrendingUp,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200/80',
    },
  ];

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                7-Day Health Activity Summary
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Weekly longitudinal health metrics & adherence tracking
              </CardDescription>
            </div>
          </div>
          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Last 7 Days
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`p-3.5 rounded-xl border ${card.borderColor} ${card.bgColor} flex flex-col justify-between space-y-2 transition-transform hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${card.textColor}`} />
                </div>
                <div>
                  <p className={`text-lg sm:text-xl font-extrabold font-heading ${card.textColor}`}>
                    {card.value}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
