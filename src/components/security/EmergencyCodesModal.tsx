import React, { useState } from 'react';
import { Key, Copy, Download, Check, AlertTriangle, X } from 'lucide-react';

interface EmergencyCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  codes: string[];
}

export const EmergencyCodesModal: React.FC<EmergencyCodesModalProps> = ({ isOpen, onClose, codes }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || codes.length === 0) return null;

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `HEALTHSPHERE EMERGENCY RECOVERY CODES\nGenerated: ${new Date().toISOString()}\n\nKeep these codes safe. Each code can be used once if you lose your phone:\n\n${codes.join('\n')}\n`;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'healthsphere-recovery-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            Emergency Recovery Codes
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              Store these single-use recovery codes in a secure password manager or offline safe. You will not be able to view them again after closing this window.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            {codes.map((code, idx) => (
              <div key={idx} className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 text-center py-1.5 px-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                {code}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyAll}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy All'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              I Have Saved My Codes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
