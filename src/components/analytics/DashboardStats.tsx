import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pill, Calendar, FileText, Bell, Activity, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardAnalyticsData } from '@/services/analyticsService';

interface DashboardStatsProps {
  data?: DashboardAnalyticsData | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Active Prescriptions',
      value: data?.medicineAdherence?.activeMedicines ?? 3,
      sublabel: `${data?.medicineAdherence?.adherenceRate ?? 95}% adherence`,
      icon: Pill,
      route: '/medicines',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200/80',
    },
    {
      label: 'Upcoming Visits',
      value: data?.appointments?.upcomingCount ?? 1,
      sublabel: `${data?.appointments?.total ?? 3} total visits`,
      icon: Calendar,
      route: '/appointments',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200/80',
    },
    {
      label: 'Medical Reports',
      value: data?.reports?.total ?? 4,
      sublabel: `${data?.reports?.recentCount ?? 2} this month`,
      icon: FileText,
      route: '/reports',
      textColor: 'text-violet-700',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200/80',
    },
    {
      label: 'Notifications',
      value: data?.notificationCount?.unread ?? 0,
      sublabel: `${data?.notificationCount?.total ?? 5} total alerts`,
      icon: Bell,
      route: '/dashboard',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200/80',
    },
    {
      label: 'Timeline Milestones',
      value: data?.timelineCount ?? 8,
      sublabel: 'Longitudinal events',
      icon: Activity,
      route: '/timeline',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            onClick={() => stat.route && navigate(stat.route)}
            className={`p-3.5 rounded-2xl border ${stat.borderColor} ${stat.bgColor} bg-white shadow-xs transition-all hover:shadow-md hover:border-teal-300 cursor-pointer flex flex-col justify-between group`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 transition-colors" />
            </div>

            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black font-heading text-slate-900 block leading-tight">
                {stat.value}
              </span>
              <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">{stat.sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
