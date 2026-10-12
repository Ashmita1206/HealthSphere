import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AIRecommendationsCard } from '@/pages/dashboard/components/AIRecommendationsCard';
import { RiskAlertsPanel } from '@/pages/dashboard/components/RiskAlertsPanel';
import { WeeklyReportSummary } from '@/pages/predictive/components/WeeklyReportSummary';
import { HourlyActivityChart } from '@/pages/wearables/components/HourlyActivityChart';
import { Layout } from '@/components/layout/Layout';
import { SOSButton } from '@/components/emergency/SOSButton';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('PHASE D — Integration & Reliability Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'patient-1', email: 'patient@healthsphere.test', name: 'Alex' },
      loading: false,
    });
  });

  it('1. AIRecommendationsCard renders honest empty state when recommendations are empty', () => {
    render(
      <MemoryRouter>
        <AIRecommendationsCard recommendations={[]} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('ai-recommendations-card')).toBeInTheDocument();
    expect(screen.getByText('No Pending AI Recommendations')).toBeInTheDocument();
    expect(screen.queryByText(/Your adherence is 88%/i)).not.toBeInTheDocument();
  });

  it('2. AIRecommendationsCard renders real recommendations when supplied', () => {
    render(
      <MemoryRouter>
        <AIRecommendationsCard
          recommendations={[
            {
              id: 'rec-custom-1',
              category: 'Medication',
              title: 'Take Prescribed ACE Inhibitor with Water',
              description: 'Morning administration supports sustained arterial relaxation.',
              impact: 'High Impact',
              actionLabel: 'Check Cabinet',
              actionRoute: '/medicines',
            },
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Take Prescribed ACE Inhibitor with Water')).toBeInTheDocument();
    expect(screen.getByText('Check Cabinet')).toBeInTheDocument();
  });

  it('3. RiskAlertsPanel renders honest empty state without fabricating fake BP alert', () => {
    render(
      <MemoryRouter>
        <RiskAlertsPanel initialAlerts={[]} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('risk-alerts-panel')).toBeInTheDocument();
    expect(screen.getByText('No Clinical Risk Flags')).toBeInTheDocument();
    expect(screen.queryByText(/Elevated Evening Blood Pressure Trend/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/134 mmHg/i)).not.toBeInTheDocument();
  });

  it('4. WeeklyReportSummary renders honest pending empty state when report data is absent', () => {
    render(<WeeklyReportSummary />);

    expect(screen.getByTestId('weekly-report-summary')).toBeInTheDocument();
    expect(screen.getByText('PENDING LOGS')).toBeInTheDocument();
    expect(screen.getByText('Insufficient Telemetry for Weekly Predictive Synthesis')).toBeInTheDocument();
    expect(screen.queryByText(/12,480 Longitudinal Patient EHRs/i)).not.toBeInTheDocument();
  });

  it('5. HourlyActivityChart renders honest offline empty state when data is empty', () => {
    render(<HourlyActivityChart data={[]} />);

    expect(screen.getByTestId('hourly-activity-chart')).toBeInTheDocument();
    expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    expect(screen.getByText('No Intraday Telemetry Logged Today')).toBeInTheDocument();
    expect(screen.queryByText('Workout')).not.toBeInTheDocument();
  });

  it('6. Layout renders loading fallback when showSidebar is true and auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<Layout showSidebar={true} />}>
            <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Loading clinical view')).toBeInTheDocument();
    expect(screen.getByText('HealthSphere OS')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument();
  });

  it('7. Layout redirects unauthenticated user to /auth/login after loading finishes', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<Layout showSidebar={true} />}>
            <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
          </Route>
          <Route path="/auth/login" element={<div>Login Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Target')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument();
  });

  it('8. Layout allows public routes without requiring sidebar or blocking on auth loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter initialEntries={['/about']}>
        <Routes>
          <Route element={<Layout showSidebar={false} />}>
            <Route path="/about" element={<div>Public About Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Public About Page')).toBeInTheDocument();
    expect(screen.queryByLabelText('Loading clinical view')).not.toBeInTheDocument();
  });

  it('9. SOSButton executes mutation callback when countdown completes', () => {
    vi.useFakeTimers();
    const handleSOSTriggered = vi.fn();

    render(<SOSButton onSOSTriggered={handleSOSTriggered} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Advance 5 seconds of countdown
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(handleSOSTriggered).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('10. SOSButton does not trigger callback if cancelled before countdown expires', () => {
    vi.useFakeTimers();
    const handleSOSTriggered = vi.fn();

    render(<SOSButton onSOSTriggered={handleSOSTriggered} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Advance 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Advance remaining 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(handleSOSTriggered).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('11. SOSButton rapid clicking does not cause duplicate triggers', () => {
    vi.useFakeTimers();
    const handleSOSTriggered = vi.fn();

    render(<SOSButton onSOSTriggered={handleSOSTriggered} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(handleSOSTriggered).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('12. SOSButton unmounting during countdown cancels execution safely', () => {
    vi.useFakeTimers();
    const handleSOSTriggered = vi.fn();

    const { unmount } = render(<SOSButton onSOSTriggered={handleSOSTriggered} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(handleSOSTriggered).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
