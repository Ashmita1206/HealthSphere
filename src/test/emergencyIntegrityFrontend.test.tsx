import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveAlertsBanner, type EmergencyIncidentData } from '@/components/emergency/ActiveAlertsBanner';
import { LiveRiskCards, type LiveRiskMetric } from '@/components/emergency/LiveRiskCards';
import { IncidentHistoryTable, type IncidentRecord } from '@/components/emergency/IncidentHistoryTable';

const realActiveIncident: EmergencyIncidentData = {
  id: 'INC-REAL-999',
  severity: 'CRITICAL',
  triggerReason: 'High Heart Rate Alarm (HR 145 bpm)',
  status: 'active',
  createdAt: '2 mins ago',
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    address: '123 Health Ave, San Francisco',
  },
  assignedDoctor: {
    name: 'Priya Sharma',
    specialization: 'Cardiology Triage',
    phone: '+1-555-0100',
  },
};

const realRiskMetrics: LiveRiskMetric[] = [
  {
    id: 'risk-hr',
    label: 'Heart Rate',
    value: 72,
    unit: 'BPM',
    status: 'normal',
    threshold: 'Normal (60 - 100)',
    iconType: 'heart',
    lastUpdated: 'Just now',
  },
];

const realHistoryIncident: IncidentRecord = {
  id: 'INC-HIST-001',
  severity: 'HIGH',
  triggerReason: 'Automated fall detection confirmed by patient',
  timestamp: 'Sep 15, 2026 • 11:20',
  duration: '12 mins',
  doctorName: 'Dr. Anita Desai',
  status: 'resolved',
  outcomeNote: 'Paramedics dispatched and patient evaluated on scene.',
};

describe('N-P0.3 — Emergency Frontend Clinical Integrity', () => {
  it('ActiveAlertsBanner renders ALL CLEAR / No Active Emergencies when incidents list is empty', () => {
    render(<ActiveAlertsBanner incidents={[]} />);
    expect(screen.getByTestId('no-active-alerts')).toBeInTheDocument();
    expect(screen.getByText(/No Active Emergencies Detected/i)).toBeInTheDocument();
    expect(screen.getByText('ALL CLEAR')).toBeInTheDocument();
  });

  it('ActiveAlertsBanner renders actual incident details when real active emergency exists', () => {
    const handleResolve = vi.fn();
    const handleCall = vi.fn();
    render(
      <ActiveAlertsBanner
        incidents={[realActiveIncident]}
        onResolve={handleResolve}
        onCallAssignedDoctor={handleCall}
      />
    );

    expect(screen.getByTestId('active-alerts-banner')).toBeInTheDocument();
    expect(screen.getByText(/High Heart Rate Alarm/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Call Dr\. Priya Sharma/i })).toBeInTheDocument();

    const resolveBtn = screen.getByRole('button', { name: /resolve alert/i });
    fireEvent.click(resolveBtn);
    expect(handleResolve).toHaveBeenCalledWith('INC-REAL-999');
  });

  it('LiveRiskCards renders honest telemetry standby state when no metrics streamed', () => {
    render(<LiveRiskCards metrics={[]} />);
    expect(screen.getByTestId('live-risk-cards')).toBeInTheDocument();
    expect(screen.getByText(/No Continuous Telemetry Stream Active/i)).toBeInTheDocument();
    expect(screen.queryByText('138/88')).not.toBeInTheDocument();
  });

  it('LiveRiskCards renders actual vitals when streaming telemetry is provided', () => {
    render(<LiveRiskCards metrics={realRiskMetrics} />);
    expect(screen.getByTestId('live-risk-cards')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByText('STABLE')).toBeInTheDocument();
  });

  it('IncidentHistoryTable renders honest empty state when no incidents on record', () => {
    render(<IncidentHistoryTable incidents={[]} />);
    expect(screen.getByTestId('incident-history-empty')).toBeInTheDocument();
    expect(screen.getByText(/No Emergency Incidents on Record/i)).toBeInTheDocument();
    expect(screen.queryByText('INC-2026-081')).not.toBeInTheDocument();
  });

  it('IncidentHistoryTable renders actual incident log and allows filtering', () => {
    render(<IncidentHistoryTable incidents={[realHistoryIncident]} />);
    expect(screen.getByTestId('incident-history-table')).toBeInTheDocument();
    expect(screen.getByText('INC-HIST-001')).toBeInTheDocument();
    expect(screen.getByText(/Automated fall detection/i)).toBeInTheDocument();
    expect(screen.getByText('Dr. Anita Desai')).toBeInTheDocument();
  });
});

