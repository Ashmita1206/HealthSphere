import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  HealthScoreCard,
  InsightsCard,
  WeeklySummary,
  DashboardStats,
  HealthBreakdown,
} from '@/components/analytics';
import type { DashboardAnalyticsData } from '@/services/analyticsService';

const mockAnalyticsData: DashboardAnalyticsData = {
  healthScore: {
    score: 94,
    level: 'Excellent',
    breakdown: {
      medicine: 98,
      appointments: 95,
      vitals: 90,
      reports: 92,
      timeline: 88,
      emergency: 100,
    },
  },
  medicineAdherence: {
    adherenceRate: 98,
    totalMedicines: 4,
    activeMedicines: 3,
    medicinesTakenThisWeek: 14,
    missedThisWeek: 0,
  },
  appointments: {
    total: 3,
    upcomingCount: 1,
    completedCount: 2,
    cancelledCount: 0,
    nextAppointment: {
      doctorName: 'Dr. Emily Vance',
      specialty: 'Cardiology',
      hospital: 'Metro Hospital',
      appointmentDate: '2026-09-15',
    },
  },
  reports: {
    total: 5,
    recentCount: 2,
    highRiskCount: 0,
  },
  timelineCount: 12,
  notificationCount: {
    unread: 2,
    total: 6,
  },
  weeklyActivity: {
    medicinesTaken: 14,
    missedMedicines: 0,
    appointmentsCompleted: 2,
    reportsUploaded: 1,
    healthEvents: 6,
    healthScoreDifference: 9,
  },
  activityTrend: [
    { day: 'Mon', activity: 4, adherence: 100, events: 2 },
    { day: 'Tue', activity: 3, adherence: 95, events: 1 },
  ],
  recentInsights: [
    {
      id: 'ins-test-1',
      type: 'positive',
      priority: 'high',
      category: 'medicine',
      title: 'Medication Adherence on Track',
      message: 'You completed all scheduled medicines this week without missed doses.',
    },
    {
      id: 'ins-test-2',
      type: 'info',
      priority: 'low',
      category: 'appointment',
      title: 'Preventive Care',
      message: 'You have an upcoming appointment scheduled with Dr. Emily Vance.',
    },
  ],
};

describe('F8 Frontend Smart Health Analytics Components Suite', () => {
  it('renders HealthScoreCard with circular radial score and status level', () => {
    render(<HealthScoreCard healthScore={mockAnalyticsData.healthScore} />);

    expect(screen.getByText('Intelligent Health Score')).toBeInTheDocument();
    expect(screen.getByText('94')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument(); // Medicine
  });

  it('renders InsightsCard and allows dismissing an active insight', () => {
    render(<InsightsCard insights={mockAnalyticsData.recentInsights} />);

    expect(screen.getByText('Smart Health Insights')).toBeInTheDocument();
    expect(screen.getByText('Medication Adherence on Track')).toBeInTheDocument();
    expect(screen.getByText('Preventive Care')).toBeInTheDocument();

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss insight/i });
    expect(dismissButtons.length).toBeGreaterThan(0);

    // Dismiss first insight
    fireEvent.click(dismissButtons[0]);
    expect(screen.queryByText('Medication Adherence on Track')).not.toBeInTheDocument();
    expect(screen.getByText('Preventive Care')).toBeInTheDocument();
  });

  it('renders WeeklySummary with 7-day health metrics', () => {
    render(<WeeklySummary summary={mockAnalyticsData.weeklyActivity} />);

    expect(screen.getByText('7-Day Health Activity Summary')).toBeInTheDocument();
    expect(screen.getByText('Medicines Taken')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Score Trend')).toBeInTheDocument();
    expect(screen.getByText('+9 pts')).toBeInTheDocument();
  });

  it('renders DashboardStats quick KPI cards and navigation links', () => {
    render(
      <BrowserRouter>
        <DashboardStats data={mockAnalyticsData} />
      </BrowserRouter>
    );

    expect(screen.getByText('Active Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Visits')).toBeInTheDocument();
    expect(screen.getByText('Timeline Milestones')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders HealthBreakdown with multi-factor weighting bars', () => {
    render(<HealthBreakdown breakdown={mockAnalyticsData.healthScore.breakdown} />);

    expect(screen.getByText('Multi-Factor Health Index Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Medication Adherence')).toBeInTheDocument();
    expect(screen.getByText('Clinical Appointments')).toBeInTheDocument();
    expect(screen.getByText('Vitals & Telemetry')).toBeInTheDocument();
    expect(screen.getByText('Emergency Safety Protocol')).toBeInTheDocument();
  });
});
