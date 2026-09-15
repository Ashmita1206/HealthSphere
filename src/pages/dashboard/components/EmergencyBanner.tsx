import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, ArrowRight, X } from 'lucide-react';

export interface EmergencyBannerProps {
  alert?: {
    id?: string;
    title: string;
    message: string;
    severity?: 'critical' | 'warning';
  } | null;
  onOpenEmergency?: () => void;
  onDismiss?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  alert,
  onOpenEmergency,
  onDismiss,
}) => {
  if (!alert) return null;

  const isCritical = alert.severity === 'critical';

  return (
    <AnimatePresence>
      <motion.div
        data-testid="emergency-banner"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className={`relative overflow-hidden rounded-2xl border p-4 ${
          isCritical
            ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-100 shadow-sm'
            : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-100 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isCritical
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {isCritical ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                      : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                  }`}
                >
                  {isCritical ? 'Critical Anomaly Alarm' : 'Clinical Risk Alert'}
                </span>
                <h4 className="text-xs font-bold leading-none">{alert.title}</h4>
              </div>
              <p className="text-xs mt-1 text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">
                {alert.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onOpenEmergency && (
              <button
                onClick={onOpenEmergency}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Emergency Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                aria-label="Dismiss Alert"
                className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
