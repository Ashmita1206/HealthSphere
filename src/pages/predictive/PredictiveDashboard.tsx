import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DiseaseProgressionChart } from './components/DiseaseProgressionChart';
import { HospitalizationRiskGauge } from './components/HospitalizationRiskGauge';
import { ExplainableAIPanel } from './components/ExplainableAIPanel';
import { WellnessPlanCards } from './components/WellnessPlanCards';
import { WeeklyReportSummary } from './components/WeeklyReportSummary';
import { Sparkles, Brain, Cpu, TrendingUp } from 'lucide-react';

export default function PredictiveDashboard() {
  return (
    <div data-testid="predictive-dashboard-page" className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-700 text-white">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Predictive AI & Longitudinal Health Modeling
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Machine-learned 5-year progression trajectories, acute ER hospitalization risk, and explainable SHAP biomarkers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>AI Model Calibration: v4.2 DeepTwin</span>
          </div>
        </div>
      </div>

      {/* 1. Weekly Predictive Intelligence Summary */}
      <WeeklyReportSummary />

      {/* 2. Disease Progression Chart & Hospitalization Risk Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DiseaseProgressionChart />
        </div>
        <div className="lg:col-span-1">
          <HospitalizationRiskGauge />
        </div>
      </div>

      {/* 3. Explainable AI SHAP Attribution & Wellness Prescription */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExplainableAIPanel />
        <WellnessPlanCards />
      </div>
    </div>
  );
}
