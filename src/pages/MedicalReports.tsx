import React, { useState, useRef } from 'react';
import { useMedicalReport } from '@/hooks/ai/useMedicalReport';
import { ReportComparisonModal } from '@/components/ai/ReportComparisonModal';
import {
  FileText,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  Calendar,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MedicalReports() {
  const { analyzing, comparing, reportResult, comparisonResult, analyzeDocument, compareTwoReports } =
    useMedicalReport();

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      analyzeDocument(file);
    }
  };

  // 13 biomarkers extractions list
  const biomarkerKeys = [
    { key: 'cbc', label: 'CBC Summary' },
    { key: 'sugar', label: 'Fasting / Random Sugar' },
    { key: 'hba1c', label: 'HbA1c' },
    { key: 'cholesterol', label: 'Cholesterol Profile' },
    { key: 'liver', label: 'Liver Function (ALT/AST)' },
    { key: 'kidney', label: 'Kidney Function (Creatinine)' },
    { key: 'thyroid', label: 'Thyroid (TSH)' },
    { key: 'vitaminD', label: 'Vitamin D' },
    { key: 'vitaminB12', label: 'Vitamin B12' },
    { key: 'iron', label: 'Serum Iron / Ferritin' },
    { key: 'calcium', label: 'Calcium' },
    { key: 'platelets', label: 'Platelet Count' },
    { key: 'hemoglobin', label: 'Hemoglobin' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-700 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              Medical Report Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            OCR Document Parsing, 13 Biomarker Extraction, Risk Highlighting & Report Comparison
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold gap-2 text-xs"
          >
            <Upload className="w-4 h-4" /> {analyzing ? 'Analyzing OCR...' : 'Upload Report (PDF/Image)'}
          </Button>
        </div>
      </div>

      {/* Main Upload Dropzone Banner if no result */}
      {!reportResult && !analyzing && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-white dark:bg-slate-900 text-center cursor-pointer transition-all space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
              Drop your Lab Report or Prescription Here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              HealthSphere OCR instantly extracts CBC, Sugar, HbA1c, Cholesterol, Liver, Kidney, Thyroid, Vitamins, Iron, Calcium, Platelets, and Hemoglobin values.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Result Output */}
      {reportResult && (
        <div className="space-y-6">
          {/* Summary & Risk Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  {reportResult.category}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                  {reportResult.reportTitle}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Risk Level:</span>
                  <span
                    className={`uppercase font-extrabold ${
                      reportResult.riskLevel === 'High' || reportResult.riskLevel === 'Critical'
                        ? 'text-rose-600'
                        : reportResult.riskLevel === 'Moderate'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {reportResult.riskLevel}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    compareTwoReports(reportResult, { ...reportResult, reportTitle: 'Historical Baseline' });
                    setIsCompareOpen(true);
                  }}
                  disabled={comparing}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1.5"
                >
                  <ArrowRightLeft className="w-4 h-4 text-teal-600" /> Compare with Previous
                </Button>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {reportResult.summary}
            </p>
          </div>

          {/* Highlight Abnormal Values */}
          {reportResult.abnormalValues && reportResult.abnormalValues.length > 0 && (
            <div className="p-6 rounded-3xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-4">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Abnormal Values Highlighted ({reportResult.abnormalValues.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportResult.abnormalValues.map((ab, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{ab.parameter}</span>
                      <span className="text-rose-600">{ab.value}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Normal Range: {ab.normalRange}</p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">{ab.clinicalNote}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13 Extracted Biomarkers Grid */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Extracted Clinical Biomarkers (13 Parameters)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {biomarkerKeys.map(({ key, label }) => {
                const val = reportResult.biomarkers?.[key] || 'N/A';
                return (
                  <div
                    key={key}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1"
                  >
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-extrabold text-teal-800 dark:text-teal-300 font-mono truncate">{val}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendations */}
          {reportResult.recommendations && reportResult.recommendations.length > 0 && (
            <div className="p-6 rounded-3xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-3">
              <h3 className="font-extrabold text-sm text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                AI Clinical Recommendations
              </h3>
              <div className="space-y-2">
                {reportResult.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison Modal */}
      <ReportComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        result={comparisonResult}
      />
    </div>
  );
}
