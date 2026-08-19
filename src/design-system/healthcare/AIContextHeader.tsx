import React from 'react';
import { FileText, X } from 'lucide-react';

export interface AIContextHeaderProps {
  contextTitle: string;
  onClearContext?: () => void;
}

export const AIContextHeader: React.FC<AIContextHeaderProps> = ({
  contextTitle = 'Aug 4 Blood Report (OCR Baseline)',
  onClearContext,
}) => {
  return (
    <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-[#E6F4F1] border border-[#A7F3D0] text-xs font-semibold text-[#047857]">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#059669] shrink-0" />
        <span>Context Attached: <strong className="font-bold">{contextTitle}</strong></span>
      </div>

      {onClearContext && (
        <button
          onClick={onClearContext}
          className="p-1 rounded-md hover:bg-[#D1FAE5] text-[#047857] transition-colors"
          aria-label="Remove active context"
          title="Remove active context"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
