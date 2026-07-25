import { describe, expect, it } from 'vitest';
import {
  adaptTimelineRecords,
  timelineAdapters,
} from './timelineAdapters';

describe('timeline event adapters', () => {
  it('adapts future module records into a stable TimelineEvent contract', () => {
    const [event] = adaptTimelineRecords(
      [
        {
          id: 'medicine-42',
          name: 'Paracetamol',
          description: 'Dose completed',
          date: '2026-07-25T08:00:00.000Z',
          status: 'completed' as const,
          metadata: { medicine: 'Paracetamol', value: '500 mg' },
        },
      ],
      timelineAdapters.medicines,
    );

    expect(event).toMatchObject({
      id: 'medicine-42',
      type: 'medicine',
      title: 'Paracetamol',
      category: 'Medicine',
      icon: 'medicine',
      color: 'teal',
      linkedModule: 'Medicines',
    });
  });

  it('handles unavailable record arrays safely', () => {
    expect(
      adaptTimelineRecords(undefined, timelineAdapters.appointments),
    ).toEqual([]);
  });
});
