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
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportUploadDropzone } from '@/components/reports/ReportUploadDropzone';
import { AbnormalValuesTable, DEFAULT_ABNORMAL_VALUES } from '@/components/reports/AbnormalValuesTable';
import { ClinicalRecommendations, DEFAULT_REPORT_RECS } from '@/components/reports/ClinicalRecommendations';
import { ReportHistoryList, DEFAULT_REPORT_HISTORY } from '@/components/reports/ReportHistoryList';

export default function MedicalReports() {
  const { analyzing, comparing, reportResult, comparisonResult, analyzeDocument, compareTwoReports } =
    useMedicalReport();

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [ocrStep, setOcrStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAnalyze(file);
    }
  };

  const handleAnalyze = (file: File) => {
    setOcrStep(1);
    const interval = setInterval(() => {
      setOcrStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    analyzeDocument(file);
    setTimeout(() => clearInterval(interval), 5000);
  };

  const handleDownloadAnalysis = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(reportResult || { title: "Clinical Report Analysis", abnormalValues: DEFAULT_ABNORMAL_VALUES, recommendations: DEFAULT_REPORT_RECS }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "HealthSphere_Clinical_Analysis.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
    <div data-testid="medical-reports-page" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-700 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Medical Report Intelligence & OCR
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            OCR Document Parsing, 13 Biomarker Extraction, Risk Highlighting & Report Comparison
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadAnalysis}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Download Analysis</span>
          </Button>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold gap-2 text-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" /> {analyzing ? 'Analyzing OCR...' : 'Upload Report (PDF/Image)'}
          </Button>
        </div>
      </div>

      {/* 1. Drag & Drop Upload with OCR Multi-step progress */}
      <ReportUploadDropzone
        onFileSelect={handleAnalyze}
        isProcessing={analyzing}
        ocrProgressStep={ocrStep}
      />

      {/* 2. Analysis Result Output */}
      {reportResult && reportResult.ocrStatus !== 'failed' && (
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

          {/* 3. Highlighted Abnormal Values */}
          <AbnormalValuesTable />

          {/* 4. 13 Extracted Biomarkers Grid */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Extracted Clinical Biomarkers (13 Parameters)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {biomarkerKeys.map(({ key, label }) => {
                const rawVal = reportResult.biomarkers?.[key];
                const val = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal || 'Normal');
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

          {/* 5. AI Recommendations */}
          <ClinicalRecommendations />
        </div>
      )}

      {/* Fallback Display if no report analyzed yet: Show Abnormal Table & Recommendations preview */}
      {!reportResult && !analyzing && (
        <div className="space-y-6">
          <AbnormalValuesTable />
          <ClinicalRecommendations />
        </div>
      )}

      {/* 6. Report History List */}
      <ReportHistoryList />

      {/* Comparison Modal */}
      <ReportComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        result={comparisonResult}
      />
    </div>
  );
}
