import React from 'react';
import { Activity, Heart, ShieldCheck, Zap } from 'lucide-react';

export interface ECGMetrics {
  heartRate: number;
  rhythm: string;
  prInterval: number; // ms
  qrsDuration: number; // ms
  qtc: number; // ms
}

export const DEFAULT_ECG: ECGMetrics = {
  heartRate: 72,
  rhythm: 'Normal Sinus Rhythm (NSR)',
  prInterval: 154,
  qrsDuration: 88,
  qtc: 412,
};

export const LiveECGStrip: React.FC<{ metrics?: ECGMetrics; className?: string }> = ({
  metrics = DEFAULT_ECG,
  className = '',
}) => {
  return (
    <div
      data-testid="live-ecg-strip"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Lead-I Ambulatory ECG Rhythm Strip
              </h3>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {metrics.rhythm}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Calibrated 25 mm/s, 10 mm/mV single-lead optical plethysmography & electrode signal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300">
            {metrics.heartRate} BPM
          </span>
        </div>
      </div>

      {/* Visual ECG Canvas Strip (SVG grid with classic P-Q-R-S-T wave repetition) */}
      <div className="relative h-28 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center">
        {/* ECG Grid Lines */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* ECG Wave SVG path */}
        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path
            d="
              M 0 50 L 50 50
              L 65 44 L 75 50
              L 85 50 L 95 62 L 105 10 L 115 85 L 125 50
              L 145 50 L 165 38 L 185 50
              L 250 50
              L 265 44 L 275 50
              L 285 50 L 295 62 L 305 10 L 315 85 L 325 50
              L 345 50 L 365 38 L 385 50
              L 450 50
              L 465 44 L 475 50
              L 485 50 L 495 62 L 505 10 L 515 85 L 525 50
              L 545 50 L 565 38 L 585 50
              L 650 50
              L 665 44 L 675 50
              L 685 50 L 695 62 L 705 10 L 715 85 L 725 50
              L 745 50 L 765 38 L 785 50
              L 850 50
              L 865 44 L 875 50
              L 885 50 L 895 62 L 905 10 L 915 85 L 925 50
              L 945 50 L 965 38 L 985 50
              L 1000 50
            "
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Interval Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase">PR Interval</p>
          <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
            {metrics.prInterval} ms
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Normal (120-200)</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase">QRS Duration</p>
          <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
            {metrics.qrsDuration} ms
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Normal (80-120)</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase">QTc Interval</p>
          <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
            {metrics.qtc} ms
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Normal (&lt; 440)</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Arrhythmia Detection</p>
          <p className="text-sm font-black text-emerald-600 font-mono mt-0.5">
            0 Events
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">No Afib detected</span>
        </div>
      </div>
    </div>
  );
};
