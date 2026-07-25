import { TIMELINE_EVENT_CONFIG } from './timelineConstants';
import type {
  TimelineAdapter,
  TimelineEvent,
  TimelineEventInput,
  TimelineEventType,
  TimelineMetadata,
  TimelinePriority,
  TimelineStatus,
} from './timelineTypes';

interface ExternalTimelineRecord {
  id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  timestamp?: string;
  date?: string;
  status?: TimelineStatus;
  priority?: TimelinePriority;
  metadata?: TimelineMetadata;
}

export const createTimelineEvent = (
  input: TimelineEventInput,
): TimelineEvent => {
  const visual = TIMELINE_EVENT_CONFIG[input.type];
  const now = new Date().toISOString();

  return {
    ...input,
    category: input.category ?? visual.label,
    icon: input.icon ?? input.type,
    color: input.color ?? visual.color,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? input.createdAt ?? now,
  };
};

export const createTimelineAdapter = <T,>(
  source: string,
  mapper: (record: T) => TimelineEventInput,
): TimelineAdapter<T> => ({
  source,
  adapt: (record) => createTimelineEvent(mapper(record)),
});

export const adaptTimelineRecords = <T,>(
  records: T[] | null | undefined,
  adapter: TimelineAdapter<T>,
): TimelineEvent[] => {
  const safeRecords = Array.isArray(records) ? records : [];
  return safeRecords.map(adapter.adapt);
};

const moduleAdapter = (
  source: string,
  type: TimelineEventType,
  fallbackTitle: string,
) =>
  createTimelineAdapter<ExternalTimelineRecord>(source, (record) => ({
    id: String(record.id ?? `${source}-${Date.now()}`),
    type,
    title: record.title ?? record.name ?? fallbackTitle,
    description:
      record.description ?? `Imported ${TIMELINE_EVENT_CONFIG[type].label}`,
    timestamp: record.timestamp ?? record.date ?? new Date().toISOString(),
    status: record.status ?? 'completed',
    priority: record.priority ?? 'normal',
    metadata: record.metadata ?? {},
    linkedModule: source,
  }));

export const timelineAdapters = {
  // TODO: Backend Integration — map medicine API records through this adapter.
  medicines: moduleAdapter('Medicines', 'medicine', 'Medicine activity'),
  // TODO: Backend Integration — map appointment API records through this adapter.
  appointments: moduleAdapter(
    'Appointments',
    'appointment',
    'Appointment activity',
  ),
  // TODO: Backend Integration — map report API records through this adapter.
  reports: moduleAdapter('Medical Reports', 'report', 'Medical report'),
  // TODO: Backend Integration — map emergency API records through this adapter.
  emergency: moduleAdapter('Emergency', 'emergency', 'Emergency event'),
  // TODO: Backend Integration — map donation API records through this adapter.
  bloodDonation: moduleAdapter(
    'Blood & Organ',
    'blood-donation',
    'Blood donation activity',
  ),
  // TODO: Backend Integration — map reminder API records through this adapter.
  reminders: moduleAdapter('Reminders', 'reminder', 'Reminder activity'),
  // TODO: Backend Integration — map AI score records without changing Timeline UI.
  aiHealthScore: moduleAdapter(
    'AI Health Score',
    'vital',
    'Health score update',
  ),
  // TODO: Backend Integration — map analytics events through this adapter.
  analytics: moduleAdapter('Analytics', 'health-log', 'Health analytics update'),
  // TODO: Backend Integration — map user-defined records through this adapter.
  custom: moduleAdapter('Custom Events', 'custom', 'Custom health event'),
};
