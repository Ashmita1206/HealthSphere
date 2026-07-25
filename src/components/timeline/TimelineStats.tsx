import { memo } from 'react';
import {
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  FileText,
  Heart,
  ListChecks,
  Pill,
  Siren,
  TestTube,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { TimelineStatsData } from './timelineTypes';

interface TimelineStatsProps {
  stats: TimelineStatsData;
}

export const TimelineStats = memo(function TimelineStats({
  stats,
}: TimelineStatsProps) {
  const items: Array<{
    label: string;
    value: number | string;
    icon: LucideIcon;
    className: string;
  }> = [
    {
      label: 'Total Records',
      value: stats.totalRecords ?? stats.total,
      icon: ListChecks,
      className: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      label: 'Appointments',
      value: stats.appointments ?? 0,
      icon: CalendarDays,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Medicines',
      value: stats.medicines ?? 0,
      icon: Pill,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Reports',
      value: stats.reports ?? 0,
      icon: FileText,
      className: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      label: 'Doctors',
      value: stats.doctors ?? 0,
      icon: UserCheck,
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      label: 'Hospitals',
      value: stats.hospitals ?? 0,
      icon: Building2,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      label: 'Lab Tests',
      value: stats.labTests ?? 0,
      icon: TestTube,
      className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      label: 'Emergency Visits',
      value: stats.emergencyVisits ?? 0,
      icon: Siren,
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      label: 'This Month',
      value: stats.thisMonth ?? 0,
      icon: Calendar,
      className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Upcoming Appts',
      value: stats.upcomingAppointments ?? stats.upcoming,
      icon: CalendarClock,
      className: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      label: 'Health Score',
      value: `${stats.healthScore ?? 85}/100`,
      icon: Heart,
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  return (
    <section
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11"
      aria-label="Timeline statistics"
    >
      {items.map((item) => (
        <Card
          key={item.label}
          className="group rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
        >
          <CardContent className="flex flex-col items-center p-3.5 text-center">
            <div
              className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl border ${item.className} transition-transform group-hover:scale-110`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">
              {item.label}
            </p>
            <p className="mt-0.5 text-base font-extrabold font-heading text-slate-900 truncate max-w-full">
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
});
