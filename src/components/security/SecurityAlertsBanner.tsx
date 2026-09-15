import React from 'react';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { SecurityAlert } from '../../services/securityService';

interface SecurityAlertsBannerProps {
  alerts: SecurityAlert[];
}

export const SecurityAlertsBanner: React.FC<SecurityAlertsBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isWarning = alert.level === 'warning';
        const isCritical = alert.level === 'critical';

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              isCritical
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                : isWarning
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
            }`}
          >
            {isCritical ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            )}

            <div className="flex-1">
              <h4 className="text-sm font-semibold">{alert.title}</h4>
              <p className="text-xs mt-0.5 opacity-90">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
