import React from 'react';
import { Heart, Footprints, Moon, Wind, Flame, Activity } from 'lucide-react';

export interface VitalsTelemetryData {
  heartRate: { live: number; resting: number; hrv: number };
  steps: { current: number; goal: number; calories: number; distanceKm: number };
  sleep: { duration: string; score: number; deep: string; rem: string; light: string };
  spo2: { saturation: number; nocturnalAvg: number; desaturations: number };
}

export const DEFAULT_VITALS_TELEMETRY: VitalsTelemetryData = {
  heartRate: { live: 72, resting: 62, hrv: 58 },
  steps: { current: 8740, goal: 10000, calories: 485, distanceKm: 6.2 },
  sleep: { duration: '7h 42m', score: 88, deep: '1h 45m', rem: '2h 10m', light: '3h 47m' },
  spo2: { saturation: 98, nocturnalAvg: 97.4, desaturations: 0 },
};

export const VitalsTelemetryGrid: React.FC<{
  data?: VitalsTelemetryData;
  className?: string;
}> = ({ data = DEFAULT_VITALS_TELEMETRY, className = '' }) => {
  const stepPct = Math.min(Math.round((data.steps.current / data.steps.goal) * 100), 100);

  return (
    <div
      data-testid="vitals-telemetry-grid"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {/* 1. Heart Rate & HRV */}
      <div
        data-testid="card-heart-rate"
        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            CONTINUOUS
          </span>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Heart Rate</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {data.heartRate.live}
            </span>
            <span className="text-xs text-slate-400 font-semibold">BPM</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="text-[10px] text-slate-400">Resting</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.heartRate.resting} BPM</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">HRV (SDNN)</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.heartRate.hrv} ms</p>
          </div>
        </div>
      </div>

      {/* 2. Daily Steps & Activity */}
      <div
        data-testid="card-steps"
        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
            <Footprints className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            {stepPct}% GOAL
          </span>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Steps</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {data.steps.current.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ {data.steps.goal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="text-[10px] text-slate-400">Calories</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.steps.calories} kcal</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Distance</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.steps.distanceKm} km</p>
          </div>
        </div>
      </div>

      {/* 3. Sleep Architecture */}
      <div
        data-testid="card-sleep"
        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            SCORE {data.sleep.score}/100
          </span>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sleep</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {data.sleep.duration}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="text-[10px] text-slate-400">Deep</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.sleep.deep}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">REM</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.sleep.rem}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Light</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.sleep.light}</p>
          </div>
        </div>
      </div>

      {/* 4. Blood Oxygen SpO2 */}
      <div
        data-testid="card-spo2"
        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
            <Wind className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
            OPTIMAL
          </span>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Oxygen (SpO₂)</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {data.spo2.saturation}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="text-[10px] text-slate-400">Nocturnal Avg</p>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.spo2.nocturnalAvg}%</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Desaturations</p>
            <p className="font-mono font-bold text-emerald-600">{data.spo2.desaturations} Events</p>
          </div>
        </div>
      </div>
    </div>
  );
};
