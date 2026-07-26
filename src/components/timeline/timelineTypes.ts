export type TimelineEventType =
  | 'medicine'
  | 'appointment'
  | 'report'
  | 'health-log'
  | 'blood-donation'
  | 'emergency'
  | 'vital'
  | 'bmi'
  | 'weight'
  | 'reminder'
  | 'note'
  | 'vaccination'
  | 'lab-test'
  | 'custom';

export type TimelineStatus =
  | 'completed'
  | 'pending'
  | 'upcoming'
  | 'missed'
  | 'critical'
  | 'archived'
  | 'cancelled';

export type TimelinePriority = 'low' | 'normal' | 'high' | 'critical';

export type TimelineColor =
  | 'teal'
  | 'blue'
  | 'violet'
  | 'cyan'
  | 'rose'
  | 'red'
  | 'emerald'
  | 'indigo'
  | 'amber'
  | 'orange'
  | 'slate'
  | 'fuchsia';

export type TimelineDateFilter =
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'this-month'
  | 'last-month'
  | 'last-6-months'
  | 'all-time'
  | 'custom';

export type TimelineFilterCategory =
  | 'medicines'
  | 'appointments'
  | 'reports'
  | 'vitals'
  | 'emergency'
  | 'vaccinations'
  | 'hospital'
  | 'lab'
  | 'blood-donation'
  | 'reminders'
  | 'notes'
  | 'custom';

export type TimelineSort =
  | 'newest'
  | 'oldest'
  | 'critical-first'
  | 'upcoming-first'
  | 'completed-first';

export type TimelineViewMode = 'vertical' | 'compact' | 'cards';

export type TimelineEmptyReason =
  | 'no-events'
  | 'search'
  | 'filter'
  | 'date-range';

export type TimelineGroupLabel =
  | 'Upcoming'
  | 'Today'
  | 'Yesterday'
  | 'Last Week'
  | 'Last Month'
  | 'Earlier'
  | string;

export type TimelineMetadataValue = string | number | boolean | null;

export interface TimelineAttachment {
  name: string;
  url?: string;
  type?: string;
  size?: string;
}

export interface TimelineMetadata {
  doctor?: string;
  hospital?: string;
  medicine?: string;
  report?: string;
  location?: string;
  value?: string;
  unit?: string;
  [key: string]: TimelineMetadataValue | undefined;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  subtitle?: string;
  description: string;
  timestamp: string;
  status: TimelineStatus;
  priority: TimelinePriority;
  category: string;
  icon: TimelineEventType;
  color: TimelineColor;
  metadata: TimelineMetadata;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  linkedModule?: string;
  keywords?: string[];
  tags?: string[];
  attachments?: TimelineAttachment[];
}

export type TimelineEventInput = Omit<
  TimelineEvent,
  'category' | 'icon' | 'color' | 'createdAt' | 'updatedAt'
> &
  Partial<
    Pick<
      TimelineEvent,
      'category' | 'icon' | 'color' | 'createdAt' | 'updatedAt'
    >
  >;

export interface TimelineCustomRange {
  start: string;
  end: string;
}

export interface TimelineFilterState {
  dateFilter: TimelineDateFilter;
  customRange: TimelineCustomRange;
  typeFilters: TimelineFilterCategory[];
  query: string;
}

export interface TimelineStatsData {
  total: number;
  totalRecords: number;
  appointments: number;
  medicines: number;
  reports: number;
  doctors: number;
  hospitals: number;
  labTests: number;
  emergencyVisits: number;
  thisMonth: number;
  upcomingAppointments: number;
  healthScore: number;
  today: number;
  upcoming: number;
  completed: number;
  critical: number;
  recent: number;
}

export interface TimelineDateGroupData {
  label: TimelineGroupLabel;
  events: TimelineEvent[];
}

export interface TimelineAdapter<T> {
  source: string;
  adapt: (record: T) => TimelineEvent;
}
