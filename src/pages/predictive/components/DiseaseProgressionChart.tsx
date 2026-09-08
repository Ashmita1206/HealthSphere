import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, ShieldAlert, Sparkles, Activity } from 'lucide-react';

export interface ProgressionDataPoint {
  timeframe: string;
  currentTrajectory: number;
  optimizedTrajectory: number;
}

export const DISEASE_TRAJECTORIES: Record<string, ProgressionDataPoint[]> = {
  diabetes: [
    { timeframe: 'Current', currentTrajectory: 7.2, optimizedTrajectory: 7.2 },
    { timeframe: '6 Mos', currentTrajectory: 7.6, optimizedTrajectory: 6.9 },
    { timeframe: '1 Year', currentTrajectory: 8.1, optimizedTrajectory: 6.5 },
    { timeframe: '2 Years', currentTrajectory: 8.7, optimizedTrajectory: 6.2 },
    { timeframe: '3 Years', currentTrajectory: 9.3, optimizedTrajectory: 6.0 },
    { timeframe: '5 Years', currentTrajectory: 10.2, optimizedTrajectory: 5.8 },
  ],
  hypertension: [
    { timeframe: 'Current', currentTrajectory: 138, optimizedTrajectory: 138 },
    { timeframe: '6 Mos', currentTrajectory: 142, optimizedTrajectory: 130 },
    { timeframe: '1 Year', currentTrajectory: 146, optimizedTrajectory: 124 },
    { timeframe: '2 Years', currentTrajectory: 152, optimizedTrajectory: 120 },
    { timeframe: '3 Years', currentTrajectory: 158, optimizedTrajectory: 118 },
    { timeframe: '5 Years', currentTrajectory: 165, optimizedTrajectory: 116 },
  ],
  cardio: [
    { timeframe: 'Current', currentTrajectory: 22, optimizedTrajectory: 22 },
    { timeframe: '6 Mos', currentTrajectory: 26, optimizedTrajectory: 19 },
    { timeframe: '1 Year', currentTrajectory: 31, optimizedTrajectory: 16 },
    { timeframe: '2 Years', currentTrajectory: 38, optimizedTrajectory: 13 },
    { timeframe: '3 Years', currentTrajectory: 46, optimizedTrajectory: 11 },
    { timeframe: '5 Years', currentTrajectory: 58, optimizedTrajectory: 9 },
  ],
};

export const DiseaseProgressionChart: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedDisease, setSelectedDisease] = useState<'diabetes' | 'hypertension' | 'cardio'>('diabetes');

  const getMetricDetails = () => {
    switch (selectedDisease) {
      case 'diabetes':
        return { name: 'Type 2 Diabetes (HbA1c %)', unit: '%', target: '< 6.5%' };
      case 'hypertension':
        return { name: 'Hypertension (Systolic SBP)', unit: 'mmHg', target: '< 120 mmHg' };
      case 'cardio':
        return { name: '10-Year ASCVD Risk Score', unit: '%', target: '< 10%' };
    }
  };

  const currentDetails = getMetricDetails();
  const data = DISEASE_TRAJECTORIES[selectedDisease];

  return (
    <div
      data-testid="disease-progression-chart"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Longitudinal Disease Progression Forecast
              </h3>
              <p className="text-xs text-slate-500">
                5-Year deep predictive modeling comparing passive trajectory vs active AI intervention
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          {(['diabetes', 'hypertension', 'cardio'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDisease(key)}
              className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all capitalize cursor-pointer ${
                selectedDisease === key
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Metric: <strong>{currentDetails.name}</strong></span>
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800">
          Target: {currentDetails.target}
        </span>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="timeframe" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
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
            <Area
              type="monotone"
              dataKey="currentTrajectory"
              name="Passive Status Quo"
              stroke="#ef4444"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorCurrent)"
            />
            <Area
              type="monotone"
              dataKey="optimizedTrajectory"
              name="With HealthSphere AI Plan"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorOptimized)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
