import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AIHealthScoreCircle } from '@/pages/dashboard/components/AIHealthScoreCircle';
import { HealthSubScoreGrid } from '@/pages/dashboard/components/HealthSubScoreGrid';
import { HealthScoreCard } from '@/components/analytics/HealthScoreCard';
import { HealthBreakdown } from '@/components/analytics/HealthBreakdown';
import { HospitalizationRiskGauge } from '@/pages/predictive/components/HospitalizationRiskGauge';
import { LiveChatPanel } from '@/pages/telemedicine/components/LiveChatPanel';
import { CareNetworkWidget } from '@/pages/dashboard/components/CareNetworkWidget';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('PHASE C — Clinical Intelligence & Honest Empty States Regression Suite', () => {
  it('1. AIHealthScoreCircle renders honest pending state when score is undefined (no 84 fallback)', () => {
    render(<AIHealthScoreCircle />);

    expect(screen.getByTestId('ai-health-score-circle')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getAllByText('Data Pending').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('84')).not.toBeInTheDocument();
    expect(screen.getByText(/Score calculation pending sufficient clinical logs/i)).toBeInTheDocument();
  });

  it('2. HealthSubScoreGrid renders all 10 dimensions with Pending status and no fake vitals when uncalibrated', () => {
    render(<HealthSubScoreGrid />);

    expect(screen.getByTestId('health-sub-score-grid')).toBeInTheDocument();
    expect(screen.getByText('Cardiovascular Health')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Stability')).toBeInTheDocument();
    expect(screen.queryByText('118/78 mmHg')).not.toBeInTheDocument();
    expect(screen.queryByText('88%')).not.toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBe(10);
    expect(screen.getAllByText('Pending').length).toBe(10);
  });

  it('3. HealthScoreCard renders honest pending state when healthScore is null without fabricating 92 score', () => {
    render(<HealthScoreCard healthScore={null} />);

    expect(screen.getByText('Intelligent Health Score')).toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBeGreaterThanOrEqual(5); // Main score + 4 sub-metrics
    expect(screen.getByText('Data Pending')).toBeInTheDocument();
    expect(screen.queryByText('92')).not.toBeInTheDocument();
    expect(screen.queryByText('Excellent')).not.toBeInTheDocument();
  });

  it('4. HealthBreakdown renders honest uncalibrated state when breakdown is missing', () => {
    render(<HealthBreakdown breakdown={null} />);

    expect(screen.getByText('Multi-Factor Health Index Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Medication Adherence')).toBeInTheDocument();
    expect(screen.queryByText('95%')).not.toBeInTheDocument();
    expect(screen.queryByText('88%')).not.toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBe(6);
  });

  it('5. HospitalizationRiskGauge renders honest pending state when riskScore is undefined', () => {
    render(<HospitalizationRiskGauge />);

    expect(screen.getByTestId('hospitalization-risk-gauge')).toBeInTheDocument();
    expect(screen.getByText(/Insufficient Telemetry for Acute Risk Calculation/i)).toBeInTheDocument();
    expect(screen.getByText('PENDING LOGS')).toBeInTheDocument();
    expect(screen.queryByText('18%')).not.toBeInTheDocument();
  });

  it('6. LiveChatPanel defaults to session initialization without fabricating fake patient dialogue', () => {
    render(<LiveChatPanel />);

    expect(screen.getByTestId('live-chat-panel')).toBeInTheDocument();
    expect(screen.getByText(/Encrypted consultation channel established/i)).toBeInTheDocument();
    expect(screen.queryByText(/Aarav Sharma/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/slight headache around 9 PM/i)).not.toBeInTheDocument();
  });

  it('7. CareNetworkWidget renders honest empty state when events list is empty', () => {
    render(
      <BrowserRouter>
        <CareNetworkWidget bloodType="O+" events={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Timeline Preview')).toBeInTheDocument();
    expect(screen.getByText('No recent timeline events recorded yet.')).toBeInTheDocument();
    expect(screen.queryByText(/Morning vitals recorded/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Metformin/i)).not.toBeInTheDocument();
  });

  it('8. HealthBreakdown preserves genuine 0% scores when explicitly provided', () => {
    render(
      <HealthBreakdown
        breakdown={{
          medicine: 0,
          appointments: 80,
          vitals: 0,
          reports: 50,
          timeline: 0,
          emergency: 100,
        }}
      />
    );

    expect(screen.getByText('Multi-Factor Health Index Breakdown')).toBeInTheDocument();
    // 3 categories have 0%, which must be rendered as 0% rather than --
    const zeroScores = screen.getAllByText('0%');
    expect(zeroScores.length).toBe(3);
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByText('--')).not.toBeInTheDocument();
  });

  it('9. HealthScoreCard preserves genuine 0 score and renders appropriate status', () => {
    render(
      <HealthScoreCard
        healthScore={{
          score: 0,
          level: 'Needs Attention',
          breakdown: {
            medicine: 0,
            appointments: 0,
            vitals: 0,
            reports: 0,
          },
        }}
      />
    );

    expect(screen.getByText('Intelligent Health Score')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('out of 100')).toBeInTheDocument();
    expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    const zeroBreakdown = screen.getAllByText('0%');
    expect(zeroBreakdown.length).toBe(4);
    expect(screen.queryByText('--')).not.toBeInTheDocument();
  });

  it('10. HealthSubScoreGrid distinguishes genuine 0 score from missing dimensions', () => {
    render(
      <HealthSubScoreGrid
        customScores={{
          cardiovascular: 0,
          metabolic: 90,
        }}
      />
    );

    // Cardiovascular has score 0 -> should render '0%', 'At Risk', and '0% Calibrated'
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0% Calibrated')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();

    // Metabolic has score 90 -> '90%', 'Optimal', '90% Calibrated'
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('Optimal')).toBeInTheDocument();

    // The remaining 8 dimensions should remain '--' and 'Pending'
    expect(screen.getAllByText('--').length).toBe(8);
    expect(screen.getAllByText('Pending').length).toBe(8);
  });

  it('11. AIHealthScoreCircle preserves genuine 0 score and renders Critical Risk', () => {
    render(<AIHealthScoreCircle score={0} trendDelta={-5.0} />);

    expect(screen.getByTestId('ai-health-score-circle')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Critical Risk')).toBeInTheDocument();
    expect(screen.getByText(/vs last week/i)).toBeInTheDocument();
    expect(screen.queryByText('--')).not.toBeInTheDocument();
  });
});

