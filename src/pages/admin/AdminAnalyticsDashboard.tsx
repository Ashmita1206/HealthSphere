import React, { useState } from 'react';
import { BarChart3, Download, Calendar, RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PopulationKPIStrip, DEFAULT_ADMIN_KPIS } from './components/PopulationKPIStrip';
import { DiseaseDistributionChart, DEFAULT_DISEASE_DATA } from './components/DiseaseDistributionChart';
import { PopulationRiskHeatmap, DEFAULT_HEATMAP_DATA } from './components/PopulationRiskHeatmap';
import { DoctorPerformanceTable, DEFAULT_DOCTORS_METRICS } from './components/DoctorPerformanceTable';

export default function AdminAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');

  const handleExportData = () => {
    const exportPayload = {
      timestamp: new Date().toISOString(),
      kpis: DEFAULT_ADMIN_KPIS,
      diseasePrevalence: DEFAULT_DISEASE_DATA,
      riskStratification: DEFAULT_HEATMAP_DATA,
      doctorPerformance: DEFAULT_DOCTORS_METRICS,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HealthSphere_Admin_Analytics_${timeRange}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div data-testid="admin-analytics-page" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-700 text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Population Health & Clinical Operations Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cohort risk stratifications, chronic disease registries, physician productivity metrics, and admission avoidance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            {(['30d', '90d', '1y'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all uppercase cursor-pointer ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button
            onClick={handleExportData}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export Registry Data</span>
          </Button>
        </div>
      </div>

      {/* 1. Population KPI Strip */}
      <PopulationKPIStrip />

      {/* 2. Disease Distribution & Risk Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiseaseDistributionChart />
        <PopulationRiskHeatmap />
      </div>

      {/* 3. Doctor Performance Table */}
      <DoctorPerformanceTable />
    </div>
  );
}
