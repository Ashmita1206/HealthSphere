import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Card } from '../primitives/Card';

export interface ClinicalInsightProps {
  category?: string;
  insightTitle: string;
  insightBody: string;
  sourceLabel?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const ClinicalInsight: React.FC<ClinicalInsightProps> = ({
  category = 'LAB INSIGHT',
  insightTitle,
  insightBody,
  sourceLabel = 'Verified OCR Lab Baseline · Aug 4, 2026',
  onAction,
  actionLabel = 'Explore Report Findings',
}) => {
  return (
    <Card variant="ai" padding="md" className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">{category}</span>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-800">
          <FileText className="w-3.5 h-3.5" />
          <span>{sourceLabel}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900">{insightTitle}</h4>
        <p className="text-xs text-slate-700 leading-relaxed">{insightBody}</p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#047857] hover:text-teal-900 transition-colors pt-1"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </Card>
  );
};
