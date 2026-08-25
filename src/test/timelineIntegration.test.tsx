import { describe, it, expect } from 'vitest';
import { adaptTimelineRecords, timelineAdapters } from '@/components/timeline/timelineAdapters';

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
