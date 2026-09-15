import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Activity } from 'lucide-react';

export interface HourlyPoint {
  time: string;
  steps: number;
  avgHeartRate: number;
}

export const DEFAULT_HOURLY_DATA: HourlyPoint[] = [
  { time: '06:00', steps: 120, avgHeartRate: 64 },
  { time: '08:00', steps: 1450, avgHeartRate: 88 },
  { time: '10:00', steps: 890, avgHeartRate: 74 },
  { time: '12:00', steps: 1200, avgHeartRate: 80 },
  { time: '14:00', steps: 780, avgHeartRate: 72 },
  { time: '16:00', steps: 1100, avgHeartRate: 78 },
  { time: '18:00', steps: 2400, avgHeartRate: 118 }, // Workout
  { time: '20:00', steps: 650, avgHeartRate: 70 },
  { time: '22:00', steps: 150, avgHeartRate: 66 },
];

export const HourlyActivityChart: React.FC<{
  data?: HourlyPoint[];
  className?: string;
}> = ({ data = DEFAULT_HOURLY_DATA, className = '' }) => {
  return (
    <div
      data-testid="hourly-activity-chart"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Intraday Hourly Activity & Exertion Load
            </h3>
            <p className="text-xs text-slate-500">
              Hourly step distribution correlated with heart rate exertion metrics
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="steps" name="Step Count" fill="#0d9488" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avgHeartRate" name="Avg HR (BPM)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
