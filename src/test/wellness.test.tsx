import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WellnessWidget, WellnessMetric } from '@/pages/dashboard/components/WellnessWidget';

describe('WellnessWidget Component', () => {
  it('renders honest empty state when no vitals telemetry metrics exist', () => {
    render(<WellnessWidget initialMetrics={[]} />);
    expect(screen.getByText('No Vitals Recorded Today')).toBeInTheDocument();
    expect(screen.getByText('Log your daily telemetry to view progress metrics.')).toBeInTheDocument();
  });

  it('renders metric progress rows cleanly when telemetry data is provided', () => {
    const mockMetrics: WellnessMetric[] = [
      { metric: 'Heart Rate', value: 72, max: 100, unit: 'bpm' },
      { metric: 'Fasting Glucose', value: 95, max: 140, unit: 'mg/dL' },
    ];

    render(<WellnessWidget initialMetrics={mockMetrics} />);
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
    expect(screen.getByText('72 / 100 bpm')).toBeInTheDocument();
    expect(screen.getByText('Fasting Glucose')).toBeInTheDocument();
    expect(screen.getByText('95 / 140 mg/dL')).toBeInTheDocument();
  });
});
