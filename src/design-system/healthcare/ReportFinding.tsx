import React from 'react';
import { Badge } from '../primitives/Badge';

export interface ReportFindingProps {
  testName: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  status: 'healthy' | 'attention' | 'critical';
  statusLabel: string;
  onSelect?: () => void;
}

export const ReportFinding: React.FC<ReportFindingProps> = ({
  testName,
  value,
  unit,
  referenceRange,
  status,
  statusLabel,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 px-4 rounded-xl border border-slate-200/80 bg-white hover:border-teal-700/40 transition-colors gap-2 cursor-pointer"
    >
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold text-slate-900">{testName}</h4>
        <p className="text-[11px] text-slate-500 font-medium">Ref Range: {referenceRange}</p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4">
        <div className="text-right">
          <span className="text-sm font-extrabold text-slate-900 tabular-nums font-mono">{value}</span>
          <span className="text-xs text-slate-500 font-medium ml-1">{unit}</span>
        </div>
        <Badge variant={status} className="py-0.5 text-[10px]">
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
};
