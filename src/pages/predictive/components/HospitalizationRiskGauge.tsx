import React from 'react';
import { ShieldAlert, Activity, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export interface HospitalizationRiskProps {
  riskScore?: number; // 0 - 100
  timeframe30Day?: number;
  timeframe90Day?: number;
  primaryRiskDrivers?: { name: string; contribution: string; severity: 'high' | 'medium' | 'low' }[];
  className?: string;
}

export const DEFAULT_RISK_DRIVERS = [
  { name: 'Glycemic Variability (HbA1c > 7.5%)', contribution: '+38% Risk', severity: 'high' as const },
  { name: 'Systolic BP Fluctuations (SBP > 140 mmHg)', contribution: '+26% Risk', severity: 'medium' as const },
  { name: 'Medication Adherence Gap (< 80%)', contribution: '+19% Risk', severity: 'medium' as const },
];

export const HospitalizationRiskGauge: React.FC<HospitalizationRiskProps> = ({
  riskScore = 18,
  timeframe30Day = 4.2,
  timeframe90Day = 11.5,
  primaryRiskDrivers = DEFAULT_RISK_DRIVERS,
  className = '',
}) => {
  const getRiskTier = (score: number) => {
    if (score >= 60) return { label: 'HIGH RISK', color: 'text-rose-600', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (score >= 30) return { label: 'MODERATE RISK', color: 'text-amber-600', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'LOW RISK', color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const tier = getRiskTier(riskScore);
  const strokeDashoffset = 283 - (283 * riskScore) / 100;

  return (
    <div
      data-testid="hospitalization-risk-gauge"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Hospitalization & Acute ER Risk
            </h3>
            <p className="text-xs text-slate-500">
              Machine learning risk estimate calculated from physiological telemetry & lab markers
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${tier.bg}`}>
          {tier.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Gauge Visual */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-200 dark:text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`${riskScore >= 60 ? 'text-rose-500' : riskScore >= 30 ? 'text-amber-500' : 'text-teal-500'} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {riskScore}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Index
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-4 text-center border-t border-slate-200 dark:border-slate-700 pt-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">30-Day ER Prob</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{timeframe30Day}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">90-Day Readmit</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{timeframe90Day}%</p>
            </div>
          </div>
        </div>

        {/* Risk Drivers List */}
        <div className="space-y-3">
          <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Primary Escalation Drivers
          </p>
          <div className="space-y-2">
            {primaryRiskDrivers.map((driver) => (
              <div
                key={driver.name}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${driver.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {driver.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono shrink-0">
                  {driver.contribution}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
            Addressing top two glycemic and BP drivers lowers 90-day hospitalization probability from <strong>11.5%</strong> to <strong>3.2%</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
