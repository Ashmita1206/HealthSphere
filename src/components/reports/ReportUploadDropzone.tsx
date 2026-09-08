import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ReportUploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  ocrProgressStep?: number; // 0 to 4
  className?: string;
}

export const OCR_STEPS = [
  'Preprocessing & De-noising Document',
  'Optical Character Recognition (OCR)',
  'Clinical Biomarker & Entity Extraction',
  'AI Longitudinal Risk Evaluation',
];

export const ReportUploadDropzone: React.FC<ReportUploadDropzoneProps> = ({
  onFileSelect,
  isProcessing = false,
  ocrProgressStep = 1,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      data-testid="report-upload-dropzone"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Drag & Drop Medical Report Upload
          </h3>
          <p className="text-xs text-slate-500">
            Upload blood work, pathology, or radiology reports for instant AI OCR analysis
          </p>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
          PDF, PNG, JPG (up to 15MB)
        </span>
      </div>

      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer ${
          isDragging
            ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
          data-testid="report-file-input"
        />

        <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {selectedFile ? selectedFile.name : 'Click to browse or drop medical report file here'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Automatic OCR extracts biomarkers and normalizes values against clinical ranges
          </p>
        </div>
      </div>

      {/* OCR Multi-step Progress Bar (when processing) */}
      {isProcessing && (
        <div data-testid="ocr-progress" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-1.5 text-teal-600">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AI OCR Processing Pipeline...</span>
            </span>
            <span>Step {ocrProgressStep} of 4</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: `${(ocrProgressStep / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {OCR_STEPS.map((step, idx) => {
              const isCompleted = idx + 1 < ocrProgressStep;
              const isCurrent = idx + 1 === ocrProgressStep;
              return (
                <div key={step} className="space-y-0.5 text-[10px]">
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isCurrent
                        ? 'text-teal-600 dark:text-teal-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : `[${idx + 1}]`}
                    <span>Step {idx + 1}</span>
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-1">{step}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
