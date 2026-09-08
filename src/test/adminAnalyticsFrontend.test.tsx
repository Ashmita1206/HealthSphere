import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopulationKPIStrip, DEFAULT_ADMIN_KPIS } from '@/pages/admin/components/PopulationKPIStrip';
import { DiseaseDistributionChart, DEFAULT_DISEASE_DATA } from '@/pages/admin/components/DiseaseDistributionChart';
import { PopulationRiskHeatmap, DEFAULT_HEATMAP_DATA } from '@/pages/admin/components/PopulationRiskHeatmap';
import { DoctorPerformanceTable, DEFAULT_DOCTORS_METRICS } from '@/pages/admin/components/DoctorPerformanceTable';
import AdminAnalyticsDashboard from '@/pages/admin/AdminAnalyticsDashboard';

// Mock ResizeObserver for Recharts ResponsiveContainer
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('F31 — Admin Analytics UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PopulationKPIStrip with clinical population metrics', () => {
    render(<PopulationKPIStrip data={DEFAULT_ADMIN_KPIS} />);
    expect(screen.getByTestId('population-kpi-strip')).toBeInTheDocument();
    expect(screen.getByText('Enrolled Population')).toBeInTheDocument();
    expect(screen.getByText('14,820')).toBeInTheDocument();
    expect(screen.getByText('Admission Avoidance')).toBeInTheDocument();
    expect(screen.getByText('91.4%')).toBeInTheDocument();
    expect(screen.getByText('Avg SOS Response Time')).toBeInTheDocument();
    expect(screen.getByText('4.2 mins')).toBeInTheDocument();
  });

  it('renders DiseaseDistributionChart with disease registry breakdown', () => {
    render(<DiseaseDistributionChart data={DEFAULT_DISEASE_DATA} />);
    expect(screen.getByTestId('disease-distribution-chart')).toBeInTheDocument();
    expect(screen.getByText(/Chronic Disease Prevalence Distribution/i)).toBeInTheDocument();
    expect(screen.getByText('Type 2 Diabetes')).toBeInTheDocument();
    expect(screen.getByText('34%')).toBeInTheDocument();
    expect(screen.getByText('Essential Hypertension')).toBeInTheDocument();
    expect(screen.getByText('28%')).toBeInTheDocument();
  });

  it('renders PopulationRiskHeatmap across demographic age cohorts', () => {
    render(<PopulationRiskHeatmap data={DEFAULT_HEATMAP_DATA} />);
    expect(screen.getByTestId('population-risk-heatmap')).toBeInTheDocument();
    expect(screen.getByText(/Cross-Demographic Clinical Risk Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText('18 - 35 Years')).toBeInTheDocument();
    expect(screen.getByText('65+ Years')).toBeInTheDocument();
    expect(screen.getByText('2,840 pts')).toBeInTheDocument();
  });

  it('renders DoctorPerformanceTable and filters physicians', () => {
    render(<DoctorPerformanceTable doctors={DEFAULT_DOCTORS_METRICS} />);
    expect(screen.getByTestId('doctor-performance-table')).toBeInTheDocument();
    expect(screen.getByText(/Physician Analytics & Clinical Performance/i)).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Mitchell')).toBeInTheDocument();
    expect(screen.getByText('Dr. Anita Verma')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search doctors or spec.../i);
    fireEvent.change(searchInput, { target: { value: 'Anita' } });

    expect(screen.getByText('Dr. Anita Verma')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Sarah Mitchell')).not.toBeInTheDocument();
  });

  it('renders AdminAnalyticsDashboard master page layout with time range toggles', () => {
    render(<AdminAnalyticsDashboard />);
    expect(screen.getByTestId('admin-analytics-page')).toBeInTheDocument();
    expect(
      screen.getByText(/Population Health & Clinical Operations Analytics/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Export Registry Data/i)).toBeInTheDocument();
    expect(screen.getByTestId('population-kpi-strip')).toBeInTheDocument();
    expect(screen.getByTestId('disease-distribution-chart')).toBeInTheDocument();
    expect(screen.getByTestId('population-risk-heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('doctor-performance-table')).toBeInTheDocument();
  });
});
