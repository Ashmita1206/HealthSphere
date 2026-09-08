import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShieldAlert, Check, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface RiskAlertItem {
  id: string;
  severity: 'critical' | 'moderate' | 'low';
  title: string;
  message: string;
  timestamp: string;
  route?: string;
  actionText?: string;
}

export interface RiskAlertsPanelProps {
  initialAlerts?: RiskAlertItem[];
  className?: string;
}

export const DEFAULT_RISK_ALERTS: RiskAlertItem[] = [
  {
    id: 'alert-bp',
    severity: 'moderate',
    title: 'Elevated Evening Blood Pressure Trend',
    message: 'Your average systolic pressure was 134 mmHg over the last 3 days. Monitor dietary sodium and rest before logging.',
    timestamp: 'Today, 2:30 PM',
    route: '/profile',
    actionText: 'Review Vitals',
  },
  {
    id: 'alert-glucose',
    severity: 'low',
    title: 'Fasting Glucose Baseline Stable',
    message: 'Fasting blood glucose readings have remained in the safe target zone (95–105 mg/dL).',
    timestamp: 'Yesterday',
  },
];

export const RiskAlertsPanel: React.FC<RiskAlertsPanelProps> = ({
  initialAlerts = DEFAULT_RISK_ALERTS,
  className = '',
}) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<RiskAlertItem[]>(initialAlerts);

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div
      data-testid="risk-alerts-panel"
      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Clinical Risk Alerts & Warnings
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {alerts.length} Active
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="py-6 text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Clinical Risk Flags</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            All evaluated biometric and medication metrics are within normal bounds.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {alerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isModerate = alert.severity === 'moderate';

              const badgeColor = isCritical
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                : isModerate
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300';

              const borderAccent = isCritical
                ? 'border-l-4 border-l-rose-500'
                : isModerate
                ? 'border-l-4 border-l-amber-500'
                : 'border-l-4 border-l-teal-500';

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 ${borderAccent} flex items-start justify-between gap-3 group`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                        {alert.severity}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{alert.title}</h4>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium ml-auto sm:ml-0">
                        • {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                      {alert.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {alert.actionText && alert.route && (
                      <button
                        onClick={() => navigate(alert.route!)}
                        className="px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100/70 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{alert.actionText}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      aria-label="Dismiss alert"
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
