import { describe, expect, it } from 'vitest';
import { createPlaceholderTimelineEvents } from './timelineData';
import {
  calculateTimelineStats,
  createTimelineCsv,
  filterTimelineEvents,
  groupTimelineEvents,
  sortTimelineEvents,
} from './timelineUtils';
import type { TimelineFilterState } from './timelineTypes';

const referenceDate = new Date(2026, 6, 25, 12);
const events = createPlaceholderTimelineEvents(referenceDate);
const allTimeFilters: TimelineFilterState = {
  dateFilter: 'all-time',
  customRange: { start: '', end: '' },
  typeFilters: [],
  query: '',
};

describe('timeline utilities', () => {
  it('supports every required timeline event type', () => {
    expect(new Set(events.map((event) => event.type))).toEqual(
      new Set([
        'medicine',
        'appointment',
        'report',
        'health-log',
        'blood-donation',
        'emergency',
        'vital',
        'bmi',
        'weight',
        'reminder',
        'note',
        'vaccination',
        'lab-test',
        'custom',
      ]),
    );
  });

  it('searches titles, descriptions, doctor, hospital, medicine, reports, and keywords', () => {
    const searches = [
      ['cardiology', 'timeline-appointment-1'],
      ['Ananya Rao', 'timeline-appointment-1'],
      ['CityCare Diagnostics', 'timeline-report-1'],
      ['Metformin', 'timeline-medicine-1'],
      ['Lipid Profile', 'timeline-report-1'],
      ['cholesterol', 'timeline-report-1'],
    ] as const;

    searches.forEach(([query, expectedId]) => {
      const result = filterTimelineEvents(
        events,
        { ...allTimeFilters, query },
        referenceDate,
      );
      expect(result.some((event) => event.id === expectedId)).toBe(true);
    });
  });

  it('combines multi-select event filters without duplicating logic', () => {
    const result = filterTimelineEvents(
      events,
      {
        ...allTimeFilters,
        typeFilters: ['medicines', 'appointments', 'reports'],
      },
      referenceDate,
    );

    expect(result.map((event) => event.type).sort()).toEqual([
      'appointment',
      'medicine',
      'report',
    ]);
  });

  it('filters frontend-only custom date ranges inclusively', () => {
    const result = filterTimelineEvents(
      events,
      {
        ...allTimeFilters,
        dateFilter: 'custom',
        customRange: { start: '2026-07-24', end: '2026-07-24' },
      },
      referenceDate,
    );

    expect(result.map((event) => event.id)).toEqual(['timeline-report-1']);
  });

  it('supports every requested sort order', () => {
    expect(sortTimelineEvents(events, 'newest', referenceDate)[0].id).toBe(
      'timeline-appointment-1',
    );
    expect(sortTimelineEvents(events, 'oldest', referenceDate)[0].id).toBe(
      'timeline-custom-1',
    );
    expect(
      sortTimelineEvents(events, 'critical-first', referenceDate)[0].id,
    ).toBe('timeline-emergency-1');
    expect(
      sortTimelineEvents(events, 'upcoming-first', referenceDate)[0].id,
    ).toBe('timeline-appointment-1');
    expect(
      sortTimelineEvents(events, 'completed-first', referenceDate)[0].status,
    ).toBe('completed');
  });

  it('groups events into professional date buckets', () => {
    const labels = groupTimelineEvents(
      sortTimelineEvents(events, 'newest', referenceDate),
      referenceDate,
    ).map((group) => group.label);

    expect(labels).toEqual(
      expect.arrayContaining([
        'Upcoming',
        'Today',
        'Yesterday',
        'Last Week',
        'Last Month',
        'Earlier',
      ]),
    );
  });

  it('calculates dynamic timeline statistics', () => {
    expect(calculateTimelineStats(events, referenceDate)).toMatchObject({
      total: 14,
      totalRecords: 14,
      appointments: 1,
      medicines: 1,
      reports: 1,
      doctors: 3,
      hospitals: 4,
      labTests: 2,
      emergencyVisits: 1,
      today: 3,
      upcoming: 1,
      completed: 8,
      critical: 1,
      recent: 8,
    });
  });

  it('creates a CSV-safe export for visible events', () => {
    const csv = createTimelineCsv(events.slice(0, 2));

    expect(csv).toContain('"Category"');
    expect(csv).toContain('"Morning vitals recorded"');
    expect(csv).toContain('"Medicine"');
  });
});
