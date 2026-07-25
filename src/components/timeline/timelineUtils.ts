import {
  TIMELINE_EVENT_CONFIG,
  TIMELINE_FILTER_OPTIONS,
  TIMELINE_PRIORITY_CONFIG,
} from './timelineConstants';
import {
  endOfDay,
  escapeCsvCell,
  getDateFilterBounds,
  getTimelineGroupLabel,
  parseTimelineDate,
  startOfDay,
  timelineEventSearchText,
} from './timelineHelpers';
import type {
  TimelineDateGroupData,
  TimelineEvent,
  TimelineFilterState,
  TimelineSort,
  TimelineStatsData,
} from './timelineTypes';

export const filterTimelineEvents = (
  events: TimelineEvent[] | null | undefined,
  filters: TimelineFilterState,
  referenceDate = new Date(),
): TimelineEvent[] => {
  const safeEvents = Array.isArray(events) ? events : [];
  const { start, end } = getDateFilterBounds(
    filters.dateFilter,
    filters.customRange,
    referenceDate,
  );
  const selectedTypes = TIMELINE_FILTER_OPTIONS.filter((option) =>
    filters.typeFilters.includes(option.value),
  ).flatMap((option) => option.types);
  const query = filters.query.trim().toLowerCase();

  return safeEvents.filter((event) => {
    const eventDate = parseTimelineDate(event.timestamp);
    if (!eventDate) return false;
    if (start && eventDate < start) return false;
    if (end && eventDate > end) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(event.type)) {
      return false;
    }
    if (query && !timelineEventSearchText(event).includes(query)) return false;
    return true;
  });
};

const isUpcoming = (event: TimelineEvent, referenceDate: Date) => {
  if (
    event.status === 'completed' ||
    event.status === 'cancelled' ||
    event.status === 'archived'
  ) {
    return false;
  }
  return (
    event.status === 'upcoming' ||
    (parseTimelineDate(event.timestamp)?.getTime() ?? 0) >
      referenceDate.getTime()
  );
};

export const sortTimelineEvents = (
  events: TimelineEvent[] | null | undefined,
  sort: TimelineSort,
  referenceDate = new Date(),
): TimelineEvent[] => {
  const safeEvents = Array.isArray(events) ? events : [];
  const timestamp = (event: TimelineEvent) =>
    parseTimelineDate(event.timestamp)?.getTime() ?? 0;

  return [...safeEvents].sort((first, second) => {
    if (sort === 'oldest') return timestamp(first) - timestamp(second);
    if (sort === 'critical-first') {
      const priorityScore = (event: TimelineEvent) =>
        event.status === 'critical'
          ? TIMELINE_PRIORITY_CONFIG.critical.rank
          : TIMELINE_PRIORITY_CONFIG[event.priority].rank;
      const priorityDifference = priorityScore(second) - priorityScore(first);
      return priorityDifference || timestamp(second) - timestamp(first);
    }
    if (sort === 'upcoming-first') {
      const firstUpcoming = isUpcoming(first, referenceDate);
      const secondUpcoming = isUpcoming(second, referenceDate);
      if (firstUpcoming !== secondUpcoming) return firstUpcoming ? -1 : 1;
      return firstUpcoming
        ? timestamp(first) - timestamp(second)
        : timestamp(second) - timestamp(first);
    }
    if (sort === 'completed-first') {
      const firstCompleted = first.status === 'completed';
      const secondCompleted = second.status === 'completed';
      if (firstCompleted !== secondCompleted) return firstCompleted ? -1 : 1;
    }
    return timestamp(second) - timestamp(first);
  });
};

export const groupTimelineEvents = (
  events: TimelineEvent[] | null | undefined,
  referenceDate = new Date(),
): TimelineDateGroupData[] => {
  const safeEvents = Array.isArray(events) ? events : [];
  const groups = new Map<TimelineDateGroupData['label'], TimelineEvent[]>();

  safeEvents.forEach((event) => {
    const label = getTimelineGroupLabel(event.timestamp, referenceDate);
    const groupEvents = groups.get(label) ?? [];
    groupEvents.push(event);
    groups.set(label, groupEvents);
  });

  return Array.from(groups, ([label, groupEvents]) => ({
    label,
    events: groupEvents,
  }));
};

export const calculateTimelineStats = (
  events: TimelineEvent[] | null | undefined,
  referenceDate = new Date(),
): TimelineStatsData => {
  const safeEvents = Array.isArray(events) ? events : [];
  const todayStart = startOfDay(referenceDate);
  const todayEnd = endOfDay(referenceDate);
  const recentStart = new Date(todayStart);
  recentStart.setDate(recentStart.getDate() - 7);

  const thisMonthStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  );
  const thisMonthEnd = endOfDay(
    new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0),
  );

  const inRange = (event: TimelineEvent, start: Date, end: Date) => {
    const date = parseTimelineDate(event.timestamp);
    return Boolean(date && date >= start && date <= end);
  };

  const doctorsSet = new Set<string>();
  const hospitalsSet = new Set<string>();

  safeEvents.forEach((event) => {
    if (event.metadata.doctor) doctorsSet.add(event.metadata.doctor);
    if (event.metadata.hospital) hospitalsSet.add(event.metadata.hospital);
  });

  const appointmentsCount = safeEvents.filter(
    (e) => e.type === 'appointment',
  ).length;
  const medicinesCount = safeEvents.filter(
    (e) => e.type === 'medicine',
  ).length;
  const reportsCount = safeEvents.filter((e) => e.type === 'report').length;
  const labTestsCount = safeEvents.filter(
    (e) => e.type === 'lab-test' || e.type === 'report',
  ).length;
  const emergencyVisitsCount = safeEvents.filter(
    (e) => e.type === 'emergency',
  ).length;
  const thisMonthCount = safeEvents.filter((e) =>
    inRange(e, thisMonthStart, thisMonthEnd),
  ).length;
  const upcomingAppointmentsCount = safeEvents.filter(
    (e) => e.type === 'appointment' && isUpcoming(e, referenceDate),
  ).length;

  const completedEventsCount = safeEvents.filter(
    (e) => e.status === 'completed',
  ).length;
  const completionRate =
    safeEvents.length > 0 ? completedEventsCount / safeEvents.length : 0;
  const healthScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        completionRate * 60 +
          (emergencyVisitsCount === 0 ? 30 : Math.max(0, 30 - emergencyVisitsCount * 10)) +
          10,
      ),
    ),
  );

  return {
    total: safeEvents.length,
    totalRecords: safeEvents.length,
    appointments: appointmentsCount,
    medicines: medicinesCount,
    reports: reportsCount,
    doctors: doctorsSet.size,
    hospitals: hospitalsSet.size,
    labTests: labTestsCount,
    emergencyVisits: emergencyVisitsCount,
    thisMonth: thisMonthCount,
    upcomingAppointments: upcomingAppointmentsCount,
    healthScore,
    today: safeEvents.filter((event) => inRange(event, todayStart, todayEnd))
      .length,
    upcoming: safeEvents.filter((event) => isUpcoming(event, referenceDate))
      .length,
    completed: completedEventsCount,
    critical: safeEvents.filter(
      (event) =>
        event.status === 'critical' || event.priority === 'critical',
    ).length,
    recent: safeEvents.filter((event) =>
      inRange(event, recentStart, todayEnd),
    ).length,
  };
};

export const createTimelineCsv = (
  events: TimelineEvent[] | null | undefined,
): string => {
  const safeEvents = Array.isArray(events) ? events : [];
  const headers = [
    'Date',
    'Time',
    'Category',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Linked Module',
  ];
  const rows = safeEvents.map((event) => {
    const date = parseTimelineDate(event.timestamp);
    return [
      date?.toLocaleDateString() ?? '',
      date?.toLocaleTimeString() ?? '',
      TIMELINE_EVENT_CONFIG[event.type].label,
      event.title,
      event.description,
      event.status,
      event.priority,
      event.linkedModule ?? '',
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\n');
};

export const downloadTimelineCsv = (events: TimelineEvent[]) => {
  const blob = new Blob([`\uFEFF${createTimelineCsv(events)}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `health-timeline-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
