import React, { useState, useRef } from 'react';
import { useAIVision } from '@/hooks/ai/useAIVision';
import {
  Eye,
  Upload,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  FileCheck,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIVision() {
  const { analyzing, visionResult, analyzeImage } = useAIVision();

  const [selectedCategory, setSelectedCategory] = useState('Prescription');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { name: 'Prescription', desc: 'Scan handwriting & medication dosages' },
    { name: 'Blood Report', desc: 'Visual lab report metric extraction' },
    { name: 'Medicine Strip', desc: 'Identify brand, formula & expiry' },
    { name: 'Pill Detection', desc: 'Color, shape & pill mark identification' },
    { name: 'Skin Disease', desc: 'Dermatological rash & lesion assessment' },
    { name: 'X-Ray', desc: 'Bone structure & thoracic radiology scan' },
    { name: 'MRI', desc: 'Soft tissue & neurological scan analysis' },
    { name: 'ECG', desc: 'Rhythm strip & cardiac wave interpretation' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);

      analyzeImage(selectedCategory, file);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-700 text-white">
            <Eye className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            AI Vision Intelligence
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Multimodal Diagnostic Analysis: Prescription, Medicine Strips, Skin Diseases, X-Rays, MRIs & ECGs
        </p>
      </div>

      {/* Category Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedCategory === cat.name
                ? 'bg-teal-700 text-white border-teal-700 shadow-md scale-[1.02]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-500'
            }`}
          >
            <p className="text-xs font-bold font-heading">{cat.name}</p>
            <p className={`text-[10px] truncate mt-0.5 ${selectedCategory === cat.name ? 'text-teal-100' : 'text-slate-400'}`}>
              {cat.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Selected Scan Target: <span className="text-teal-600 dark:text-teal-400">{selectedCategory}</span>
              </h3>
              <p className="text-xs text-slate-500">Upload a clear photo or digital scan for instant Gemini Multimodal vision interpretation.</p>
            </div>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold gap-2 text-xs w-full md:w-auto"
          >
            <Upload className="w-4 h-4" /> {analyzing ? 'Scanning Vision AI...' : `Upload ${selectedCategory} Image`}
          </Button>
        </div>

        {/* Image Preview & Output */}
        {imagePreview && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <img src={imagePreview} alt="Scan preview" className="max-h-64 rounded-2xl border border-slate-200 shadow-md object-contain" />
          </div>
        )}
      </div>

      {/* Vision Results */}
      {visionResult && (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                  AI Vision Summary
                </h3>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                Confidence: {visionResult.confidenceScore}%
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {visionResult.summary}
            </p>
          </div>

          {/* Key Findings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" /> Clinical Visual Findings
            </h3>
            <ul className="space-y-2">
              {visionResult.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings */}
          {visionResult.warnings && visionResult.warnings.length > 0 && (
            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Safety Warnings & Alerts
              </h3>
              <ul className="space-y-1.5">
                {visionResult.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    &bull; {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions for Doctor */}
          {visionResult.questionsForDoctor && visionResult.questionsForDoctor.length > 0 && (
            <div className="p-6 rounded-3xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 space-y-3">
              <h3 className="font-extrabold text-sm text-sky-900 dark:text-sky-200 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-600" /> Recommended Questions for Your Doctor
              </h3>
              <ul className="space-y-2">
                {visionResult.questionsForDoctor.map((q, i) => (
                  <li key={i} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-900/40 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    &ldquo;{q}&rdquo;
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
