import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AIHealthScoreCircle } from '@/pages/dashboard/components/AIHealthScoreCircle';
import { HealthSubScoreGrid } from '@/pages/dashboard/components/HealthSubScoreGrid';
import { EmergencyBanner } from '@/pages/dashboard/components/EmergencyBanner';
import { QuickActionsBar } from '@/pages/dashboard/components/QuickActionsBar';
import { AIRecommendationsCard } from '@/pages/dashboard/components/AIRecommendationsCard';
import { RiskAlertsPanel } from '@/pages/dashboard/components/RiskAlertsPanel';
import { HealthTrendCharts } from '@/pages/dashboard/components/HealthTrendCharts';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('F24 — AI Health Dashboard UI Suite', () => {
  it('1. AIHealthScoreCircle renders score, confidence, trend delta, and triggers explore callback', () => {
    const handleExplore = vi.fn();
    render(
      <AIHealthScoreCircle
        score={88}
        confidence={94}
        trendDelta={4.5}
        statusLabel="Optimal Standing"
        onExploreBreakdown={handleExplore}
      />
    );

    expect(screen.getByTestId('ai-health-score-circle')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('Optimal Standing')).toBeInTheDocument();
    expect(screen.getByText('+4.5% vs last week')).toBeInTheDocument();
    expect(screen.getByText(/94% AI Confidence/i)).toBeInTheDocument();

    const exploreBtn = screen.getByRole('button', { name: /explore 10 sub-scores/i });
    fireEvent.click(exploreBtn);
    expect(handleExplore).toHaveBeenCalledTimes(1);
  });

  it('2. HealthSubScoreGrid renders all 10 clinical dimensions with metrics', () => {
    render(<HealthSubScoreGrid />);

    expect(screen.getByTestId('health-sub-score-grid')).toBeInTheDocument();
    expect(screen.getByText(/10 Clinical Dimension Sub-Scores/i)).toBeInTheDocument();

    // Verify all 10 dimensions are rendered
    expect(screen.getByText('Cardiovascular Health')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Stability')).toBeInTheDocument();
    expect(screen.getByText('Respiratory Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Medication Adherence')).toBeInTheDocument();
    expect(screen.getByText('Sleep & Recovery')).toBeInTheDocument();
    expect(screen.getByText('Physical Activity')).toBeInTheDocument();
    expect(screen.getByText('Nutritional Balance')).toBeInTheDocument();
    expect(screen.getByText('Autonomic & Stress')).toBeInTheDocument();
    expect(screen.getByText('Biomarkers & Labs')).toBeInTheDocument();
    expect(screen.getByText('Preventive Screening')).toBeInTheDocument();
  });

  it('3. EmergencyBanner renders active alarm and handles action and dismiss events', () => {
    const handleSOS = vi.fn();
    const handleDismiss = vi.fn();

    render(
      <EmergencyBanner
        alert={{
          id: 'test-emergency',
          title: 'Acute Tachycardia Alarm',
          message: 'Resting pulse spiked above safe clinical threshold.',
          severity: 'critical',
        }}
        onOpenEmergency={handleSOS}
        onDismiss={handleDismiss}
      />
    );

    expect(screen.getByTestId('emergency-banner')).toBeInTheDocument();
    expect(screen.getByText('Acute Tachycardia Alarm')).toBeInTheDocument();
    expect(screen.getByText('Critical Anomaly Alarm')).toBeInTheDocument();

    const sosBtn = screen.getByRole('button', { name: /emergency center/i });
    fireEvent.click(sosBtn);
    expect(handleSOS).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(closeBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('4. QuickActionsBar renders all 5 rapid clinical operations', () => {
    const handleLogVitals = vi.fn();
    render(
      <BrowserRouter>
        <QuickActionsBar onLogVitals={handleLogVitals} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('quick-actions-bar')).toBeInTheDocument();
    expect(screen.getByText('Log Vitals')).toBeInTheDocument();
    expect(screen.getByText('Upload Report')).toBeInTheDocument();
    expect(screen.getByText('Ask AI Copilot')).toBeInTheDocument();
    expect(screen.getByText('Book Consult')).toBeInTheDocument();
    expect(screen.getByText('Emergency SOS')).toBeInTheDocument();

    const vitalsBtn = screen.getByText('Log Vitals');
    fireEvent.click(vitalsBtn);
    expect(handleLogVitals).toHaveBeenCalledTimes(1);
  });

  it('5. AIRecommendationsCard displays clinically grounded recommendations with impact tiers', () => {
    render(
      <BrowserRouter>
        <AIRecommendationsCard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('ai-recommendations-card')).toBeInTheDocument();
    expect(screen.getByText(/AI Clinical Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText('Post-Meal 10-Minute Walk')).toBeInTheDocument();
    expect(screen.getByText('Maintain Consistent Morning Timing')).toBeInTheDocument();
    expect(screen.getAllByText('High Impact').length).toBeGreaterThanOrEqual(1);
  });

  it('6. RiskAlertsPanel renders risk items and allows interactive dismissal', async () => {
    render(
      <BrowserRouter>
        <RiskAlertsPanel />
      </BrowserRouter>
    );

    expect(screen.getByTestId('risk-alerts-panel')).toBeInTheDocument();
    expect(screen.getByText('Elevated Evening Blood Pressure Trend')).toBeInTheDocument();

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss alert/i });
    expect(dismissButtons.length).toBeGreaterThanOrEqual(1);

    // Dismiss first alert
    fireEvent.click(dismissButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Elevated Evening Blood Pressure Trend')).not.toBeInTheDocument();
    });
  });

  it('7. HealthTrendCharts renders switchable metric tabs and timeframe buttons', () => {
    render(<HealthTrendCharts />);

    expect(screen.getByTestId('health-trend-charts')).toBeInTheDocument();
    expect(screen.getByText('Longitudinal Health Trends')).toBeInTheDocument();

    // Metric tabs
    expect(screen.getByRole('button', { name: /blood pressure/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heart rate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /blood glucose/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /blood oxygen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /daily steps/i })).toBeInTheDocument();

    // Timeframe selector
    expect(screen.getByRole('button', { name: '7D' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30D' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90D' })).toBeInTheDocument();

    // Switch metric to Heart Rate
    const hrBtn = screen.getByRole('button', { name: /heart rate/i });
    fireEvent.click(hrBtn);
  });
});
