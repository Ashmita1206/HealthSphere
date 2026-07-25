import type {
  TimelineCustomRange,
  TimelineDateFilter,
  TimelineEvent,
  TimelineGroupLabel,
} from './timelineTypes';

export const parseTimelineDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const startOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const result = startOfDay(date);
  result.setDate(result.getDate() + mondayOffset);
  return result;
};

const endOfWeek = (date: Date): Date => {
  const start = startOfWeek(date);
  const result = new Date(start);
  result.setDate(result.getDate() + 6);
  return endOfDay(result);
};

const parseDateInput = (value: string, end = false): Date | null => {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return end ? endOfDay(date) : startOfDay(date);
};

export const getDateFilterBounds = (
  filter: TimelineDateFilter,
  customRange: TimelineCustomRange,
  referenceDate = new Date(),
): { start: Date | null; end: Date | null } => {
  const todayStart = startOfDay(referenceDate);
  const todayEnd = endOfDay(referenceDate);

  switch (filter) {
    case 'today':
      return { start: todayStart, end: todayEnd };
    case 'yesterday': {
      const yesterday = new Date(todayStart);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
    case 'this-week':
      return { start: startOfWeek(referenceDate), end: endOfWeek(referenceDate) };
    case 'this-month':
      return {
        start: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
        end: endOfDay(
          new Date(
            referenceDate.getFullYear(),
            referenceDate.getMonth() + 1,
            0,
          ),
        ),
      };
    case 'last-month':
      return {
        start: new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth() - 1,
          1,
        ),
        end: endOfDay(
          new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0),
        ),
      };
    case 'last-6-months':
      return {
        start: new Date(
          referenceDate.getFullYear(),
          referenceDate.getMonth() - 6,
          referenceDate.getDate(),
        ),
        end: todayEnd,
      };
    case 'custom':
      return {
        start: parseDateInput(customRange.start),
        end: parseDateInput(customRange.end, true),
      };
    case 'all-time':
    default:
      return { start: null, end: null };
  }
};

export const getTimelineGroupLabel = (
  timestamp: string,
  referenceDate = new Date(),
): TimelineGroupLabel => {
  const eventDate = parseTimelineDate(timestamp);
  if (!eventDate) return 'Earlier';

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const difference = Math.round(
    (startOfDay(referenceDate).getTime() - startOfDay(eventDate).getTime()) /
      millisecondsPerDay,
  );

  if (difference < 0) return 'Upcoming';
  if (difference === 0) return 'Today';
  if (difference === 1) return 'Yesterday';
  if (difference <= 7) return 'Last Week';
  if (difference <= 31) return 'Last Month';
  return 'Earlier';
};

export const formatTimelineDate = (timestamp: string): string => {
  const date = parseTimelineDate(timestamp);
  return date
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
    : 'Unknown date';
};

export const formatTimelineTime = (timestamp: string): string => {
  const date = parseTimelineDate(timestamp);
  return date
    ? new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)
    : 'Unknown time';
};

export const timelineEventSearchText = (event: TimelineEvent): string => {
  const metadataValues = Object.values(event.metadata)
    .filter((value) => value !== null && value !== undefined)
    .map(String);
  const keywords = Array.isArray(event.keywords) ? event.keywords : [];
  const tags = Array.isArray(event.tags) ? event.tags : [];
  const attachmentNames = Array.isArray(event.attachments)
    ? event.attachments.map((a) => a.name)
    : [];

  return [
    event.title,
    event.subtitle ?? '',
    event.description,
    event.category,
    event.status,
    event.notes ?? '',
    event.linkedModule ?? '',
    ...metadataValues,
    ...keywords,
    ...tags,
    ...attachmentNames,
  ]
    .join(' ')
    .toLowerCase();
};

export const escapeCsvCell = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export const createTimelineJson = (
  events: TimelineEvent[] | null | undefined,
): string => {
  const safeEvents = Array.isArray(events) ? events : [];
  return JSON.stringify(safeEvents, null, 2);
};

export const downloadTimelineJson = (events: TimelineEvent[]) => {
  const blob = new Blob([createTimelineJson(events)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `health-timeline-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
