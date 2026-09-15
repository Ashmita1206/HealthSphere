import React, { useState } from 'react';
import { Lock, Download, ShieldCheck, FileCheck, Check } from 'lucide-react';

export const PrivacyCenterCard: React.FC = () => {
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [breakGlassAllowed, setBreakGlassAllowed] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExportData = () => {
    setExporting(true);
    setTimeout(() => {
      const dummyExport = {
        exportDate: new Date().toISOString(),
        format: 'HIPAA-CCDA-JSON-v3',
        patientConsent: true,
        encryption: 'AES-256-GCM',
        telemetry: {
          vitalsExported: true,
          consultationNotesExported: true,
          prescriptionsExported: true,
        },
      };

      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(dummyExport, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `healthsphere-medical-record-${Date.now()}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 600);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Patient Privacy Center & Data Sovereignty
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Exercise your HIPAA & GDPR data sovereignty rights and control clinical data access.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Emergency Break-Glass Protocol
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Allow verified trauma/ER doctors temporary 2-hour access during life-threatening events.
            </p>
          </div>
          <input
            type="checkbox"
            checked={breakGlassAllowed}
            onChange={(e) => setBreakGlassAllowed(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Anonymized Research Telemetry
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Share de-identified vitals trends with federated medical learning networks.
            </p>
          </div>
          <input
            type="checkbox"
            checked={telemetryEnabled}
            onChange={(e) => setTelemetryEnabled(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
          />
        </div>

        <div className="p-4 rounded-xl border border-teal-100 dark:border-teal-950 bg-teal-50/50 dark:bg-teal-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Complete Health Record Export</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Download all your records, prescriptions, and timeline events in encrypted JSON.</p>
            </div>
          </div>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shrink-0 shadow-xs"
          >
            {exported ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
            {exporting ? 'Generating...' : exported ? 'Exported!' : 'Export Records'}
          </button>
        </div>
      </div>
    </div>
  );
};
