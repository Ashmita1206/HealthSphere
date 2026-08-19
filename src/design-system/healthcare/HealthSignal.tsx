import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';

export interface HealthSignalProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'healthy' | 'attention' | 'critical' | 'info';
  statusText?: string;
  trend?: 'up' | 'down' | 'stable';
  trendDelta?: string;
  icon?: React.ReactNode;
}

export const HealthSignal: React.FC<HealthSignalProps> = ({
  label,
  value,
  unit,
  status = 'healthy',
  statusText,
  trend,
  trendDelta,
  icon,
}) => {
  return (
    <Card variant="base" padding="md" className="space-y-2 hover:border-teal-700/40 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-teal-700">{icon}</span>}
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
        {statusText && <Badge variant={status}>{statusText}</Badge>}
      </div>

      <div className="flex items-baseline gap-1.5 pt-1">
        <span className="text-2xl font-extrabold text-slate-900 tabular-nums font-mono">{value}</span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      {(trend || trendDelta) && (
        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 pt-1 border-t border-slate-100">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
          <span>{trendDelta || (trend === 'stable' ? 'Stable vs baseline' : trend)}</span>
        </div>
      )}
    </Card>
  );
};
