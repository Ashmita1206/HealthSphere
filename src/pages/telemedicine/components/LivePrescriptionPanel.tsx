import React from 'react';
import { Pill, CheckCircle, Download, Clock } from 'lucide-react';

export interface TelemedicinePrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface LivePrescriptionPanelProps {
  prescriptions?: TelemedicinePrescriptionItem[];
  isSigned?: boolean;
  onDownload?: () => void;
  className?: string;
}

// Retained for test fixture typing only; never used as component default
export const DEFAULT_TELEMED_RX: TelemedicinePrescriptionItem[] = [];

export const LivePrescriptionPanel: React.FC<LivePrescriptionPanelProps> = ({
  prescriptions = [],
  isSigned = false,
  onDownload,
  className = '',
}) => {
  const hasPrescriptions = prescriptions && prescriptions.length > 0;

  return (
    <div
      data-testid="live-prescription-panel"
      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Live Digital Prescription
            </h4>
            <p className="text-[11px] text-slate-500">Real-time synchronized physician order</p>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
            isSigned
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {isSigned ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
          <span>{isSigned ? 'Digitally Signed' : 'Drafting In Call'}</span>
        </span>
      </div>

      {/* Empty State */}
      {!hasPrescriptions ? (
        <div
          data-testid="live-prescription-empty"
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Pill className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Prescriptions Drafted</p>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Doctor-prescribed medications and dosage instructions will synchronize in real-time once issued during this consultation.
          </p>
        </div>
      ) : (
        /* Medication list */
        <div className="space-y-2.5">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">{rx.name}</h5>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100/70 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                  {rx.dosage}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {rx.frequency} • {rx.duration}
              </p>
              {rx.instructions && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Instructions: {rx.instructions}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Download Action (only when signed & prescriptions exist) */}
      {onDownload && isSigned && hasPrescriptions && (
        <button
          onClick={onDownload}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-teal-950 dark:hover:bg-teal-900 text-white dark:text-teal-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Signed Rx (PDF)</span>
        </button>
      )}
    </div>
  );
};
