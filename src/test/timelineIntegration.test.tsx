import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { adaptTimelineRecords, timelineAdapters } from '@/components/timeline/timelineAdapters';
import { Timeline } from '@/components/timeline/Timeline';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { TimelinePreviewWidget } from '@/pages/dashboard/components/TimelinePreviewWidget';
import type { TimelineEventRecord } from '@/services/timelineService';

const mockTimelineEvents: TimelineEventRecord[] = [
  {
    id: 'evt-1',
    _id: 'evt-1',
    userId: 'u1',
    eventType: 'medicine',
    category: 'medicine',
    title: 'Medication: Metformin 500mg',
    description: 'Prescription active - daily with meals.',
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  },
  {
    id: 'evt-2',
    _id: 'evt-2',
    userId: 'u1',
    eventType: 'appointment',
    category: 'appointment',
    title: 'Dr. Sarah Smith Appointment',
    description: 'Cardiology consultation at Central Hospital.',
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  },
  {
    id: 'evt-3',
    _id: 'evt-3',
    userId: 'u1',
    eventType: 'emergency',
    category: 'emergency',
    title: 'Emergency SOS Triggered',
    description: 'Alert dispatched to nearest responder.',
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  },
];

describe('Timeline Backend Integration & Data Adapters', () => {
  it('correctly maps raw backend records to structured TimelineEvents', () => {
    const rawMeds = [
      { id: 'm1', name: 'Metformin', dosage: '500mg', frequency: 'Daily', is_active: true, created_at: '2026-08-20T10:00:00.000Z' },
    ];
    const rawAppts = [
      { id: 'a1', doctor_name: 'Sarah Jenkins', specialty: 'Cardiology', hospital: 'St. Jude Hospital', appointment_date: '2026-08-28T09:00:00.000Z', status: 'scheduled' },
    ];
    const rawReports = [
      { id: 'r1', title: 'Comprehensive Lipid Panel', summary: 'Cholesterol levels within normal range', category: 'Lipid', ocr_status: 'completed', risk_level: 'low', created_at: '2026-08-15T08:00:00.000Z' },
    ];
    const rawLogs = [
      { _id: 'l1', symptoms: ['Mild headache'], notes: 'BP 120/80', date: '2026-08-24T18:00:00.000Z' },
    ];

    const adaptedMeds = adaptTimelineRecords(
      rawMeds.map((m) => ({
        id: m.id,
        title: `Medication: ${m.name}`,
        description: `Dosage: ${m.dosage} (${m.frequency})`,
        timestamp: m.created_at,
        status: m.is_active ? 'active' : 'completed',
        priority: 'normal',
      })),
      timelineAdapters.medicines
    );

    const adaptedAppts = adaptTimelineRecords(
      rawAppts.map((a) => ({
        id: a.id,
        title: `Appointment: Dr. ${a.doctor_name}`,
        description: `${a.specialty} · ${a.hospital}`,
        timestamp: a.appointment_date,
        status: a.status === 'scheduled' ? 'upcoming' : 'completed',
        priority: 'high',
      })),
      timelineAdapters.appointments
    );

    const adaptedReports = adaptTimelineRecords(
      rawReports.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.summary,
        timestamp: r.created_at,
        status: r.ocr_status === 'failed' ? 'overdue' : 'completed',
        priority: r.risk_level === 'high' ? 'critical' : 'normal',
      })),
      timelineAdapters.reports
    );

    const adaptedLogs = adaptTimelineRecords(
      rawLogs.map((l) => ({
        id: l._id,
        title: 'Vitals & Telemetry Logged',
        description: `Symptoms: ${l.symptoms.join(', ')}`,
        timestamp: l.date,
        status: 'completed',
        priority: 'normal',
      })),
      timelineAdapters.analytics
    );

    const combined = [...adaptedMeds, ...adaptedAppts, ...adaptedReports, ...adaptedLogs];

    expect(combined).toHaveLength(4);
    expect(combined[0].title).toBe('Medication: Metformin');
    expect(combined[1].title).toBe('Appointment: Dr. Sarah Jenkins');
    expect(combined[2].title).toBe('Comprehensive Lipid Panel');
    expect(combined[3].title).toBe('Vitals & Telemetry Logged');
  });

  it('handles empty response gracefully resulting in 0 events', () => {
    const emptyMeds = adaptTimelineRecords([], timelineAdapters.medicines);
    const emptyAppts = adaptTimelineRecords([], timelineAdapters.appointments);
    const emptyReports = adaptTimelineRecords([], timelineAdapters.reports);
    const emptyLogs = adaptTimelineRecords([], timelineAdapters.analytics);

    const combined = [...emptyMeds, ...emptyAppts, ...emptyReports, ...emptyLogs];
    expect(combined).toHaveLength(0);
  });
});

describe('Timeline Component Rendering & States', () => {
  it('renders Timeline with grouped date headers and items', () => {
    render(<Timeline events={mockTimelineEvents} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Medication: Metformin 500mg')).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Smith Appointment')).toBeInTheDocument();
    expect(screen.getByText('Emergency SOS Triggered')).toBeInTheDocument();
  });

  it('renders Timeline empty state when no events exist', () => {
    render(<Timeline events={[]} />);

    expect(screen.getByText('No Health Events Found')).toBeInTheDocument();
  });

  it('renders TimelineItem with category badge and description', () => {
    render(<TimelineItem event={mockTimelineEvents[0]} />);

    expect(screen.getByText('Medicine')).toBeInTheDocument();
    expect(screen.getByText('Medication: Metformin 500mg')).toBeInTheDocument();
    expect(screen.getByText('Prescription active - daily with meals.')).toBeInTheDocument();
  });

  it('renders TimelinePreviewWidget on dashboard with recent activities', () => {
    render(
      <BrowserRouter>
        <TimelinePreviewWidget
          events={mockTimelineEvents.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            timestamp: e.timestamp,
            type: e.eventType,
          }))}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Recent Clinical Timeline')).toBeInTheDocument();
    expect(screen.getByText('View Full Timeline')).toBeInTheDocument();
    expect(screen.getByText('Medication: Metformin 500mg')).toBeInTheDocument();
  });
});
