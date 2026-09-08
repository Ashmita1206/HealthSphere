import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Activity, Heart, Flame, Wind, Footprints } from 'lucide-react';

export type MetricType = 'bp' | 'heartRate' | 'glucose' | 'spo2' | 'steps';

export interface HealthTrendChartsProps {
  className?: string;
}

const MOCK_7D_DATA = [
  { day: 'Mon', systolic: 118, diastolic: 78, heartRate: 72, glucose: 95, spo2: 98, steps: 7840 },
  { day: 'Tue', systolic: 122, diastolic: 80, heartRate: 75, glucose: 102, spo2: 99, steps: 8920 },
  { day: 'Wed', systolic: 119, diastolic: 79, heartRate: 70, glucose: 98, spo2: 98, steps: 6540 },
  { day: 'Thu', systolic: 124, diastolic: 82, heartRate: 78, glucose: 110, spo2: 97, steps: 9450 },
  { day: 'Fri', systolic: 120, diastolic: 80, heartRate: 73, glucose: 96, spo2: 98, steps: 8100 },
  { day: 'Sat', systolic: 117, diastolic: 76, heartRate: 68, glucose: 94, spo2: 99, steps: 10230 },
  { day: 'Sun', systolic: 121, diastolic: 81, heartRate: 71, glucose: 99, spo2: 98, steps: 8640 },
];

export const HealthTrendCharts: React.FC<HealthTrendChartsProps> = ({ className = '' }) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('bp');
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D'>('7D');

  const metricsConfig = {
    bp: {
      label: 'Blood Pressure',
      unit: 'mmHg',
      color: '#0D9488',
      secondaryColor: '#0284C7',
      normalRef: 120,
      icon: Activity,
    },
    heartRate: {
      label: 'Heart Rate',
      unit: 'bpm',
      color: '#EF4444',
      normalRef: 75,
      icon: Heart,
    },
    glucose: {
      label: 'Blood Glucose',
      unit: 'mg/dL',
      color: '#F97316',
      normalRef: 100,
      icon: Flame,
    },
    spo2: {
      label: 'Blood Oxygen (SpO2)',
      unit: '%',
      color: '#06B6D4',
      normalRef: 95,
      icon: Wind,
    },
    steps: {
      label: 'Daily Steps',
      unit: 'steps',
      color: '#10B981',
      normalRef: 8000,
      icon: Footprints,
    },
  };

  const currentConfig = metricsConfig[activeMetric];

  return (
    <div
      data-testid="health-trend-charts"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 ${className}`}
    >
      {/* Header: Title & Timeframe controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Longitudinal Health Trends
            </h3>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare biometric trends against clinical target baselines
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
          {(['7D', '30D', '90D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white dark:bg-slate-750 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-100 dark:border-slate-800 pb-3">
        {(Object.keys(metricsConfig) as MetricType[]).map((mKey) => {
          const cfg = metricsConfig[mKey];
          const Icon = cfg.icon;
          const isActive = activeMetric === mKey;
          return (
            <button
              key={mKey}
              onClick={() => setActiveMetric(mKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 dark:bg-teal-950 text-white dark:text-teal-200 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Recharts Area */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_7D_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
              </linearGradient>
              {activeMetric === 'bp' && (
                <linearGradient id="diastolicFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                padding: '8px 12px',
              }}
            />
            <ReferenceLine
              y={currentConfig.normalRef}
              stroke="#94A3B8"
              strokeDasharray="4 4"
              label={{ value: 'Target Baseline', fill: '#94A3B8', fontSize: 10, position: 'insideTopRight' }}
            />

            {activeMetric === 'bp' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic BP"
                  stroke="#0D9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#metricFill)"
                />
                <Area
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic BP"
                  stroke="#0284C7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#diastolicFill)"
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey={activeMetric}
                name={currentConfig.label}
                stroke={currentConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricFill)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
