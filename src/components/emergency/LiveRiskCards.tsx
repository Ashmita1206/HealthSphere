import React from 'react';
import { Heart, Activity, Droplets, Wind, Thermometer, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface LiveRiskMetric {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  threshold: string;
  iconType: 'heart' | 'bp' | 'spo2' | 'glucose' | 'temp';
  lastUpdated: string;
}

export interface LiveRiskCardsProps {
  metrics?: LiveRiskMetric[];
  className?: string;
}

// Retained for test fixture typing only; never used as a component default
export const DEFAULT_LIVE_RISK_METRICS: LiveRiskMetric[] = [];

export const LiveRiskCards: React.FC<LiveRiskCardsProps> = ({
  metrics = [],
  className = '',
}) => {
  const getIcon = (type: LiveRiskMetric['iconType']) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'bp':
        return <Activity className="w-5 h-5 text-indigo-500" />;
      case 'spo2':
        return <Wind className="w-5 h-5 text-cyan-500" />;
      case 'glucose':
        return <Droplets className="w-5 h-5 text-amber-500" />;
      case 'temp':
        return <Thermometer className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: LiveRiskMetric['status']) => {
    switch (status) {
      case 'critical':
        return (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
            ELEVATED
          </span>
        );
      case 'normal':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> STABLE
          </span>
        );
    }
  };

  if (!metrics || metrics.length === 0) {
    return (
      <div data-testid="live-risk-cards" className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Live Risk Telemetry & Vitals Thresholds
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Telemetry Standby</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Continuous Telemetry Stream Active</p>
          <p className="text-[11px] text-slate-500 max-w-lg mx-auto">
            Biometric devices and continuous vitals monitors are currently offline. Emergency SOS triggers remain fully armed via manual dispatch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="live-risk-cards" className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Live Risk Telemetry & Vitals Thresholds
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Connected to Emergency Engine
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div
            key={m.id}
            data-testid={`metric-card-${m.id}`}
            className={`p-4 rounded-2xl border transition-all bg-white dark:bg-slate-900 shadow-xs space-y-2.5 ${
              m.status === 'critical'
                ? 'border-rose-400 dark:border-rose-700 ring-2 ring-rose-500/20'
                : m.status === 'warning'
                ? 'border-amber-300 dark:border-amber-800'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                {getIcon(m.iconType)}
              </div>
              {getStatusBadge(m.status)}
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {m.label}
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {m.value}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{m.unit}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="truncate">{m.threshold}</span>
              <span className="shrink-0">{m.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
