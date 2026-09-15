import React from 'react';
import { HelpCircle, Brain, ArrowUp, ArrowDown, Info } from 'lucide-react';

export interface SHAPFeature {
  featureName: string;
  patientValue: string;
  impactScore: number; // positive = risk increasing, negative = protective
  category: 'clinical' | 'lifestyle' | 'medication';
}

export const DEFAULT_SHAP_FEATURES: SHAPFeature[] = [
  { featureName: 'HbA1c Glycemic Index', patientValue: '7.8 %', impactScore: 0.24, category: 'clinical' },
  { featureName: 'Systolic Blood Pressure', patientValue: '138 mmHg', impactScore: 0.18, category: 'clinical' },
  { featureName: 'Sleep Architecture (REM deficit)', patientValue: '5.6 hrs/night', impactScore: 0.11, category: 'lifestyle' },
  { featureName: 'Daily Step Activity', patientValue: '8,420 steps/day', impactScore: -0.19, category: 'lifestyle' },
  { featureName: 'Medication Adherence Rate', patientValue: '92.4 %', impactScore: -0.14, category: 'medication' },
  { featureName: 'Resting Heart Rate Stability', patientValue: '68 BPM', impactScore: -0.10, category: 'clinical' },
];

export const ExplainableAIPanel: React.FC<{ features?: SHAPFeature[]; className?: string }> = ({
  features = DEFAULT_SHAP_FEATURES,
  className = '',
}) => {
  const maxScore = Math.max(...features.map((f) => Math.abs(f.impactScore)), 0.3);

  return (
    <div
      data-testid="explainable-ai-panel"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Explainable AI (SHAP Clinical Attribution)
            </h3>
            <p className="text-xs text-slate-500">
              Transparent attribution showing how each biomarker pushes risk higher or offers protection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-rose-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Increases Risk
          </span>
          <span className="flex items-center gap-1 text-emerald-600 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Protective (Lowers Risk)
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {features.map((f) => {
          const isRiskIncreasing = f.impactScore > 0;
          const percentage = (Math.abs(f.impactScore) / maxScore) * 100;

          return (
            <div
              key={f.featureName}
              data-testid={`shap-item-${f.featureName}`}
              className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {f.featureName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {f.patientValue}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono font-extrabold text-xs">
                  {isRiskIncreasing ? (
                    <span className="text-rose-600 flex items-center gap-0.5">
                      <ArrowUp className="w-3.5 h-3.5" /> +{(f.impactScore * 100).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <ArrowDown className="w-3.5 h-3.5" /> {(f.impactScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Attribution Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                {isRiskIncreasing ? (
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  />
                ) : (
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
