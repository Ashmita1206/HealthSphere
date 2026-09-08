import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiseaseProgressionChart } from '@/pages/predictive/components/DiseaseProgressionChart';
import { HospitalizationRiskGauge, DEFAULT_RISK_DRIVERS } from '@/pages/predictive/components/HospitalizationRiskGauge';
import { ExplainableAIPanel, DEFAULT_SHAP_FEATURES } from '@/pages/predictive/components/ExplainableAIPanel';
import { WellnessPlanCards, DEFAULT_WELLNESS_PLANS } from '@/pages/predictive/components/WellnessPlanCards';
import { WeeklyReportSummary, DEFAULT_WEEKLY_REPORT } from '@/pages/predictive/components/WeeklyReportSummary';
import PredictiveDashboard from '@/pages/predictive/PredictiveDashboard';

// Mock ResizeObserver for Recharts ResponsiveContainer
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('F29 — Predictive AI UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DiseaseProgressionChart and switches disease tabs', () => {
    render(<DiseaseProgressionChart />);
    expect(screen.getByTestId('disease-progression-chart')).toBeInTheDocument();
    expect(screen.getByText(/Longitudinal Disease Progression Forecast/i)).toBeInTheDocument();
    expect(screen.getByText(/Type 2 Diabetes/i)).toBeInTheDocument();

    // Switch to hypertension tab
    const hypertensionTab = screen.getByRole('button', { name: /hypertension/i });
    fireEvent.click(hypertensionTab);
    expect(screen.getByText(/Hypertension \(Systolic SBP\)/i)).toBeInTheDocument();
  });

  it('renders HospitalizationRiskGauge with risk score and top drivers', () => {
    render(
      <HospitalizationRiskGauge
        riskScore={18}
        timeframe30Day={4.2}
        timeframe90Day={11.5}
        primaryRiskDrivers={DEFAULT_RISK_DRIVERS}
      />
    );

    expect(screen.getByTestId('hospitalization-risk-gauge')).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument();
    expect(screen.getByText(/LOW RISK/i)).toBeInTheDocument();
    expect(screen.getByText('4.2%')).toBeInTheDocument();
    expect(screen.getAllByText('11.5%').length).toBeGreaterThan(0);
    expect(screen.getByText(/Glycemic Variability/i)).toBeInTheDocument();
  });

  it('renders ExplainableAIPanel with SHAP attribution features', () => {
    render(<ExplainableAIPanel features={DEFAULT_SHAP_FEATURES} />);
    expect(screen.getByTestId('explainable-ai-panel')).toBeInTheDocument();
    expect(screen.getByText(/Explainable AI \(SHAP Clinical Attribution\)/i)).toBeInTheDocument();
    expect(screen.getByText('HbA1c Glycemic Index')).toBeInTheDocument();
    expect(screen.getByText('Daily Step Activity')).toBeInTheDocument();
    expect(screen.getByText(/Increases Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Protective \(Lowers Risk\)/i)).toBeInTheDocument();
  });

  it('renders WellnessPlanCards and toggles plan item completion', () => {
    const handleToggle = vi.fn();
    render(<WellnessPlanCards plans={DEFAULT_WELLNESS_PLANS} onTogglePlan={handleToggle} />);
    expect(screen.getByTestId('wellness-plan-cards')).toBeInTheDocument();
    expect(screen.getByText(/Maintain Mediterranean Glycemic Load/i)).toBeInTheDocument();

    const planItem = screen.getByTestId('plan-item-wp-1');
    fireEvent.click(planItem);
    expect(handleToggle).toHaveBeenCalledWith('wp-1');
  });

  it('renders WeeklyReportSummary with confidence score and trigger download', () => {
    const handleDownload = vi.fn();
    render(<WeeklyReportSummary report={DEFAULT_WEEKLY_REPORT} onDownload={handleDownload} />);
    expect(screen.getByTestId('weekly-report-summary')).toBeInTheDocument();
    expect(screen.getByText(/94.8% AI Confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Week of Aug 25 - Aug 31, 2026/i)).toBeInTheDocument();

    const downloadBtn = screen.getByRole('button', { name: /Download Weekly Report/i });
    fireEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalled();
  });

  it('renders PredictiveDashboard master page layout', () => {
    render(<PredictiveDashboard />);
    expect(screen.getByTestId('predictive-dashboard-page')).toBeInTheDocument();
    expect(screen.getByText(/Predictive AI & Longitudinal Health Modeling/i)).toBeInTheDocument();
    expect(screen.getByTestId('disease-progression-chart')).toBeInTheDocument();
    expect(screen.getByTestId('hospitalization-risk-gauge')).toBeInTheDocument();
    expect(screen.getByTestId('explainable-ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('wellness-plan-cards')).toBeInTheDocument();
  });
});
