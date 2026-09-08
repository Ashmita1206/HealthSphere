import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import type { ActivityTrendPoint } from '@/services/analyticsService';

interface ActivityTrendProps {
  trendData?: ActivityTrendPoint[];
}

export const ActivityTrend: React.FC<ActivityTrendProps> = ({ trendData }) => {
  const defaultData: ActivityTrendPoint[] = [
    { day: 'Mon', activity: 4, adherence: 100, events: 2 },
    { day: 'Tue', activity: 3, adherence: 95, events: 1 },
    { day: 'Wed', activity: 5, adherence: 100, events: 3 },
    { day: 'Thu', activity: 4, adherence: 90, events: 2 },
    { day: 'Fri', activity: 6, adherence: 100, events: 3 },
    { day: 'Sat', activity: 3, adherence: 95, events: 1 },
    { day: 'Sun', activity: 5, adherence: 100, events: 2 },
  ];

  const chartData = trendData && trendData.length > 0 ? trendData : defaultData;

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden flex flex-col justify-between">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                Weekly Health Activity & Adherence
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                7-day adherence vs care actions completed
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <div className="flex items-center gap-1.5 text-teal-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              <span>Adherence %</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Care Actions</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="h-48 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="adherence"
                name="Adherence %"
                stroke="#0f766e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adherenceGradient)"
              />
              <Area
                type="monotone"
                dataKey="activity"
                name="Care Actions"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#activityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
