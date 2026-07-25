import {
  Activity,
  BellRing,
  Building2,
  CalendarDays,
  Droplets,
  FileText,
  HeartPulse,
  Pill,
  Scale,
  Siren,
  Sparkles,
  StickyNote,
  Syringe,
  TestTube,
  Weight,
  type LucideIcon,
} from 'lucide-react';
import type {
  TimelineColor,
  TimelineDateFilter,
  TimelineEventType,
  TimelineFilterCategory,
  TimelinePriority,
  TimelineSort,
  TimelineStatus,
  TimelineViewMode,
} from './timelineTypes';

interface EventTypeConfig {
  label: string;
  icon: LucideIcon;
  color: TimelineColor;
  iconClass: string;
  badgeClass: string;
  nodeClass: string;
}

export const TIMELINE_EVENT_CONFIG: Record<
  TimelineEventType,
  EventTypeConfig
> = {
  medicine: {
    label: 'Medicine',
    icon: Pill,
    color: 'teal',
    iconClass: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    nodeClass: 'bg-teal-600 ring-teal-100',
  },
  appointment: {
    label: 'Appointment',
    icon: CalendarDays,
    color: 'blue',
    iconClass: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    nodeClass: 'bg-blue-600 ring-blue-100',
  },
  report: {
    label: 'Medical Report',
    icon: FileText,
    color: 'violet',
    iconClass: 'bg-violet-50 text-violet-700 border-violet-200',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    nodeClass: 'bg-violet-600 ring-violet-100',
  },
  'health-log': {
    label: 'Health Log',
    icon: Activity,
    color: 'cyan',
    iconClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    nodeClass: 'bg-cyan-600 ring-cyan-100',
  },
  'blood-donation': {
    label: 'Blood Donation',
    icon: Droplets,
    color: 'rose',
    iconClass: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    nodeClass: 'bg-rose-600 ring-rose-100',
  },
  emergency: {
    label: 'Emergency',
    icon: Siren,
    color: 'red',
    iconClass: 'bg-red-50 text-red-700 border-red-200',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    nodeClass: 'bg-red-600 ring-red-100',
  },
  vital: {
    label: 'Vitals',
    icon: HeartPulse,
    color: 'emerald',
    iconClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    nodeClass: 'bg-emerald-600 ring-emerald-100',
  },
  bmi: {
    label: 'BMI Update',
    icon: Scale,
    color: 'indigo',
    iconClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    nodeClass: 'bg-indigo-600 ring-indigo-100',
  },
  weight: {
    label: 'Weight Update',
    icon: Weight,
    color: 'amber',
    iconClass: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    nodeClass: 'bg-amber-500 ring-amber-100',
  },
  reminder: {
    label: 'Reminder',
    icon: BellRing,
    color: 'orange',
    iconClass: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    nodeClass: 'bg-orange-500 ring-orange-100',
  },
  note: {
    label: 'Clinical Note',
    icon: StickyNote,
    color: 'slate',
    iconClass: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    nodeClass: 'bg-slate-500 ring-slate-100',
  },
  vaccination: {
    label: 'Vaccination',
    icon: Syringe,
    color: 'emerald',
    iconClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    nodeClass: 'bg-emerald-600 ring-emerald-100',
  },
  'lab-test': {
    label: 'Lab Test',
    icon: TestTube,
    color: 'indigo',
    iconClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    nodeClass: 'bg-indigo-600 ring-indigo-100',
  },
  custom: {
    label: 'Custom Event',
    icon: Sparkles,
    color: 'fuchsia',
    iconClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    nodeClass: 'bg-fuchsia-600 ring-fuchsia-100',
  },
};

export const TIMELINE_STATUS_CONFIG: Record<
  TimelineStatus,
  { label: string; className: string }
> = {
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  missed: {
    label: 'Missed',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-50 text-slate-500 border-slate-200',
  },
};

export const TIMELINE_PRIORITY_CONFIG: Record<
  TimelinePriority,
  { label: string; className: string; rank: number }
> = {
  critical: {
    label: 'Critical priority',
    className: 'text-red-700 bg-red-50 border-red-200',
    rank: 4,
  },
  high: {
    label: 'High priority',
    className: 'text-orange-700 bg-orange-50 border-orange-200',
    rank: 3,
  },
  normal: {
    label: 'Normal priority',
    className: 'text-slate-600 bg-slate-50 border-slate-200',
    rank: 2,
  },
  low: {
    label: 'Low priority',
    className: 'text-slate-500 bg-white border-slate-200',
    rank: 1,
  },
};

export const TIMELINE_DATE_OPTIONS: Array<{
  value: TimelineDateFilter;
  label: string;
}> = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'all-time', label: 'All Time' },
  { value: 'custom', label: 'Custom Date Range' },
];

export const TIMELINE_FILTER_OPTIONS: Array<{
  value: TimelineFilterCategory;
  label: string;
  types: TimelineEventType[];
}> = [
  { value: 'medicines', label: 'Medicines', types: ['medicine'] },
  { value: 'appointments', label: 'Appointments', types: ['appointment'] },
  { value: 'reports', label: 'Reports', types: ['report'] },
  {
    value: 'vitals',
    label: 'Vitals',
    types: ['vital', 'bmi', 'weight', 'health-log'],
  },
  { value: 'vaccinations', label: 'Vaccinations', types: ['vaccination'] },
  { value: 'lab', label: 'Lab Tests', types: ['lab-test', 'report'] },
  { value: 'emergency', label: 'Emergency', types: ['emergency'] },
  {
    value: 'hospital',
    label: 'Hospital Visits',
    types: ['appointment', 'emergency', 'report'],
  },
  {
    value: 'blood-donation',
    label: 'Blood Donation',
    types: ['blood-donation'],
  },
  { value: 'reminders', label: 'Reminders', types: ['reminder'] },
  { value: 'notes', label: 'Notes', types: ['note'] },
  { value: 'custom', label: 'Custom', types: ['custom'] },
];

export const TIMELINE_SORT_OPTIONS: Array<{
  value: TimelineSort;
  label: string;
}> = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'critical-first', label: 'Critical First' },
  { value: 'upcoming-first', label: 'Upcoming First' },
  { value: 'completed-first', label: 'Completed First' },
];

export const TIMELINE_VIEW_OPTIONS: Array<{
  value: TimelineViewMode;
  label: string;
}> = [
  { value: 'vertical', label: 'Vertical Timeline' },
  { value: 'compact', label: 'Compact View' },
  { value: 'cards', label: 'Card View' },
];
