import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveAlertsBanner, EmergencyIncidentData } from '@/components/emergency/ActiveAlertsBanner';
import { LiveRiskCards, DEFAULT_LIVE_RISK_METRICS } from '@/components/emergency/LiveRiskCards';
import { IncidentHistoryTable, DEFAULT_INCIDENT_HISTORY } from '@/components/emergency/IncidentHistoryTable';
import { EmergencyTimeline } from '@/components/emergency/EmergencyTimeline';
import { EmergencyDashboard } from '@/components/emergency/EmergencyDashboard';

describe('F28 — Emergency Center UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ActiveAlertsBanner when active incidents are present', () => {
    const mockIncidents: EmergencyIncidentData[] = [
      {
        id: 'INC-101',
        severity: 'CRITICAL',
        triggerReason: 'Ventricular tachycardia detected (HR 145 bpm)',
        status: 'active',
        createdAt: '2 mins ago',
        assignedDoctor: {
          name: 'Anita Verma',
          specialization: 'Emergency Medicine',
          phone: '+1-555-0199',
        },
      },
    ];

    const handleResolve = vi.fn();
    const handleCallDoctor = vi.fn();

    render(
      <ActiveAlertsBanner
        incidents={mockIncidents}
        onResolve={handleResolve}
        onCallAssignedDoctor={handleCallDoctor}
      />
    );

    expect(screen.getByTestId('active-alerts-banner')).toBeInTheDocument();
    expect(screen.getByText(/CRITICAL EMERGENCY ALERT/i)).toBeInTheDocument();
    expect(screen.getByText(/Ventricular tachycardia detected/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dr. Anita Verma/i).length).toBeGreaterThan(0);

    const resolveBtn = screen.getByText(/Resolve Alert/i);
    fireEvent.click(resolveBtn);
    expect(handleResolve).toHaveBeenCalledWith('INC-101');

    const callBtn = screen.getByText(/Call Dr. Anita Verma/i);
    fireEvent.click(callBtn);
    expect(handleCallDoctor).toHaveBeenCalledWith('+1-555-0199');
  });

  it('renders "ALL CLEAR" state in ActiveAlertsBanner when no incidents are active', () => {
    render(<ActiveAlertsBanner incidents={[]} />);
    expect(screen.getByTestId('no-active-alerts')).toBeInTheDocument();
    expect(screen.getByText(/No Active Emergencies Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/ALL CLEAR/i)).toBeInTheDocument();
  });

  it('renders LiveRiskCards telemetry with vital thresholds and statuses', () => {
    render(<LiveRiskCards metrics={DEFAULT_LIVE_RISK_METRICS} />);
    expect(screen.getByTestId('live-risk-cards')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('138/88')).toBeInTheDocument();
    expect(screen.getByText('Blood Oxygen (SpO2)')).toBeInTheDocument();
    expect(screen.getByText('Blood Glucose')).toBeInTheDocument();
    expect(screen.getByText('Core Temperature')).toBeInTheDocument();
  });

  it('renders IncidentHistoryTable with searchable filter and export action', () => {
    render(<IncidentHistoryTable incidents={DEFAULT_INCIDENT_HISTORY} />);
    expect(screen.getByTestId('incident-history-table')).toBeInTheDocument();
    expect(screen.getByText(/Emergency Incident History & Audit Log/i)).toBeInTheDocument();
    expect(screen.getByText(/INC-2026-081/i)).toBeInTheDocument();
    expect(screen.getByText(/INC-2026-054/i)).toBeInTheDocument();

    // Search filter test
    const input = screen.getByPlaceholderText(/Filter incidents.../i);
    fireEvent.change(input, { target: { value: 'glucose' } });
    expect(screen.getByText(/INC-2026-054/i)).toBeInTheDocument();
    expect(screen.queryByText(/INC-2026-081/i)).not.toBeInTheDocument();
  });

  it('renders EmergencyTimeline with event milestones', () => {
    const events = [
      { id: 'ev-1', type: 'sos-triggered' as const, timestamp: '2026-08-14T22:45:00Z', description: 'SOS triggered by patient' },
      { id: 'ev-2', type: 'location-shared' as const, timestamp: '2026-08-14T22:45:05Z', description: 'Live GPS dispatched' },
      { id: 'ev-3', type: 'call-started' as const, timestamp: '2026-08-14T22:45:15Z', description: 'Tele-triage line opened' },
    ];

    render(<EmergencyTimeline events={events} />);
    expect(screen.getByText('Emergency History')).toBeInTheDocument();
    expect(screen.getByText('SOS triggered by patient')).toBeInTheDocument();
    expect(screen.getByText('Live GPS dispatched')).toBeInTheDocument();
  });

  it('renders EmergencyDashboard with readiness status indicators', () => {
    render(
      <EmergencyDashboard
        sosReady={true}
        emergencyContactsCount={3}
        medicalCardComplete={true}
        locationEnabled={true}
      />
    );

    expect(screen.getByText('Emergency Status')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contacts')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Medical ID Status')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });
});
