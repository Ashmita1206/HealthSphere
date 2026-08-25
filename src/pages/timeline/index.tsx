import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { TimelineCalendar } from '@/components/timeline/TimelineCalendar';
import { TimelineContainer } from '@/components/timeline/TimelineContainer';
import { TimelineDrawer } from '@/components/timeline/TimelineDrawer';
import { TimelineEmptyState } from '@/components/timeline/TimelineEmptyState';
import { TimelineFilters } from '@/components/timeline/TimelineFilters';
import { TimelineHeader } from '@/components/timeline/TimelineHeader';
import { TimelineInsights } from '@/components/timeline/TimelineInsights';
import { TimelineSearch } from '@/components/timeline/TimelineSearch';
import { TimelineSkeleton } from '@/components/timeline/TimelineSkeleton';
import { TimelineStats } from '@/components/timeline/TimelineStats';
import { TimelineSummary } from '@/components/timeline/TimelineSummary';
import { TimelineViewToggle } from '@/components/timeline/TimelineViewToggle';
import { api } from '@/services/api';
import { adaptTimelineRecords, timelineAdapters } from '@/components/timeline/timelineAdapters';
import { createPlaceholderTimelineEvents } from '@/components/timeline/timelineData';
import {
  calculateTimelineStats,
  filterTimelineEvents,
  groupTimelineEvents,
  sortTimelineEvents,
} from '@/components/timeline/timelineUtils';
import { useDebouncedValue } from '@/components/timeline/useDebouncedValue';
import type {
  TimelineCustomRange,
  TimelineDateFilter,
  TimelineEmptyReason,
  TimelineEvent,
  TimelineFilterCategory,
  TimelineFilterState,
  TimelineSort,
  TimelineViewMode,
} from '@/components/timeline/timelineTypes';
import { Activity, BarChart3, CalendarDays, Layers, ListTree } from 'lucide-react';

type PageTab = 'timeline' | 'calendar' | 'insights' | 'dashboard';

export default function TimelinePage() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PageTab>('timeline');
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '');
  const [dateFilter, setDateFilter] =
    useState<TimelineDateFilter>('all-time');
  const [customRange, setCustomRange] = useState<TimelineCustomRange>({
    start: '',
    end: '',
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);
  const [typeFilters, setTypeFilters] = useState<TimelineFilterCategory[]>([]);
  const [sort, setSort] = useState<TimelineSort>('newest');
  const [viewMode, setViewMode] =
    useState<TimelineViewMode>('vertical');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    let isMounted = true;
    async function loadTimelineData() {
      setLoading(true);
      try {
        const [medsRes, apptsRes, reportsRes, logsRes] = await Promise.allSettled([
          api.get<any[]>('/health/medicines'),
          api.get<any[]>('/health/appointments'),
          api.get<any[]>('/reports'),
          api.get<any[]>('/health/logs'),
        ]);

        const medicinesData = medsRes.status === 'fulfilled' && Array.isArray(medsRes.value.data) ? medsRes.value.data : [];
        const appointmentsData = apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value.data) ? apptsRes.value.data : [];
        const reportsData = reportsRes.status === 'fulfilled' && Array.isArray(reportsRes.value.data) ? reportsRes.value.data : [];
        const logsData = logsRes.status === 'fulfilled' && Array.isArray(logsRes.value.data) ? logsRes.value.data : [];

        const adaptedMeds = adaptTimelineRecords(
          medicinesData.map((m: any) => ({
            id: m.id || m._id,
            title: `Medication: ${m.name || 'Prescription'}`,
            description: `Dosage: ${m.dosage || 'As prescribed'} (${m.frequency || 'Daily'})`,
            timestamp: m.created_at || m.createdAt || new Date().toISOString(),
            status: m.is_active ?? m.isActive ? 'active' : 'completed',
            priority: 'normal',
          })),
          timelineAdapters.medicines
        );

        const adaptedAppointments = adaptTimelineRecords(
          appointmentsData.map((a: any) => ({
            id: a.id || a._id,
            title: `Appointment: Dr. ${a.doctor_name || a.doctorName || 'Specialist'}`,
            description: `${a.specialty || 'General'} · ${a.hospital || 'Medical Center'}`,
            timestamp: a.appointment_date || a.appointmentDate || new Date().toISOString(),
            status: a.status === 'scheduled' ? 'upcoming' : 'completed',
            priority: 'high',
          })),
          timelineAdapters.appointments
        );

        const adaptedReports = adaptTimelineRecords(
          reportsData.map((r: any) => ({
            id: r.id || r._id,
            title: r.title || 'Medical Lab Report',
            description: r.summary || `Category: ${r.category || 'Lab Report'}`,
            timestamp: r.created_at || r.createdAt || new Date().toISOString(),
            status: r.ocr_status === 'failed' ? 'overdue' : 'completed',
            priority: r.risk_level === 'high' || r.risk_level === 'critical' ? 'critical' : 'normal',
          })),
          timelineAdapters.reports
        );

        const adaptedLogs = adaptTimelineRecords(
          logsData.map((l: any) => ({
            id: l._id || l.id,
            title: 'Vitals & Telemetry Logged',
            description: Array.isArray(l.symptoms) && l.symptoms.length ? `Symptoms: ${l.symptoms.join(', ')}` : l.notes || 'Recorded vitals telemetry',
            timestamp: l.date || l.createdAt || new Date().toISOString(),
            status: 'completed',
            priority: 'normal',
          })),
          timelineAdapters.analytics
        );

        const combined = [...adaptedMeds, ...adaptedAppointments, ...adaptedReports, ...adaptedLogs];
        if (isMounted) {
          setEvents(combined);
        }
      } catch {
        if (isMounted) {
          setEvents([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTimelineData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  const filterState = useMemo<TimelineFilterState>(
    () => ({
      dateFilter,
      customRange,
      typeFilters,
      query: debouncedQuery,
    }),
    [customRange, dateFilter, debouncedQuery, typeFilters],
  );

  const filteredEvents = useMemo(
    () => filterTimelineEvents(events, filterState),
    [events, filterState],
  );
  const sortedEvents = useMemo(
    () => sortTimelineEvents(filteredEvents, sort),
    [filteredEvents, sort],
  );
  const groupedEvents = useMemo(
    () => groupTimelineEvents(sortedEvents),
    [sortedEvents],
  );
  const stats = useMemo(
    () => calculateTimelineStats(filteredEvents),
    [filteredEvents],
  );
  const latestEvent = useMemo(
    () => sortTimelineEvents(filteredEvents, 'newest')[0] ?? null,
    [filteredEvents],
  );

  const activeFilterCount =
    typeFilters.length +
    (dateFilter === 'all-time' ? 0 : 1) +
    (debouncedQuery ? 1 : 0) +
    (sort === 'newest' ? 0 : 1);

  const toggleTypeFilter = useCallback(
    (value: TimelineFilterCategory) => {
      setTypeFilters((current) =>
        current.includes(value)
          ? current.filter((filter) => filter !== value)
          : [...current, value],
      );
    },
    [],
  );

  const openEvent = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  }, []);

  const resetAllFilters = useCallback(() => {
    setQuery('');
    setDateFilter('all-time');
    setCustomRange({ start: '', end: '' });
    setSelectedCalendarDate(undefined);
    setTypeFilters([]);
    setSort('newest');
  }, []);

  const clearTypeFilters = useCallback(() => {
    setTypeFilters([]);
  }, []);

  const handleCalendarDateSelect = useCallback((date: Date) => {
    setSelectedCalendarDate(date);
    const dateStr = date.toISOString().slice(0, 10);
    setDateFilter('custom');
    setCustomRange({ start: dateStr, end: dateStr });
  }, []);

  const emptyReason = useMemo<TimelineEmptyReason>(() => {
    if (events.length === 0) return 'no-events';
    if (debouncedQuery) return 'search';
    if (dateFilter === 'custom') return 'date-range';
    if (dateFilter !== 'all-time') return 'date-range';
    return 'filter';
  }, [dateFilter, debouncedQuery, events.length]);

  const handleEmptyReset = useCallback(() => {
    if (emptyReason === 'no-events') {
      // TODO: Backend Integration — refresh connected module sources here.
      setEvents(createPlaceholderTimelineEvents());
      return;
    }
    if (emptyReason === 'search') {
      setQuery('');
      return;
    }
    resetAllFilters();
  }, [emptyReason, resetAllFilters]);

  return (
    <div
      className="min-w-0 space-y-6 pb-12"
      data-timeline-print-root
    >
      <TimelineHeader
        events={sortedEvents}
        totalRecords={stats.totalRecords}
        upcomingCount={stats.upcomingAppointments}
        healthScore={stats.healthScore}
      />

      {loading ? (
        <TimelineSkeleton />
      ) : (
        <>
          <TimelineSummary
            latestEvent={latestEvent}
            visibleCount={sortedEvents.length}
            activeFilterCount={activeFilterCount}
          />

          <TimelineStats stats={stats} />

          {/* Navigation View Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2" data-timeline-no-print>
            <div
              className="flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-slate-100/80 p-1.5"
              role="tablist"
              aria-label="Timeline module sections"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'timeline'}
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  activeTab === 'timeline'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListTree className="h-4 w-4" aria-hidden="true" />
                Timeline Events
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'calendar'}
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  activeTab === 'calendar'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Monthly Calendar
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'insights'}
                onClick={() => setActiveTab('insights')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  activeTab === 'insights'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                Health Insights
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
                All-in-One View
              </button>
            </div>
          </div>

          <div className="space-y-4" data-timeline-no-print>
            <TimelineFilters
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
              typeFilters={typeFilters}
              onTypeFilterToggle={toggleTypeFilter}
              onClearTypeFilters={clearTypeFilters}
              sort={sort}
              onSortChange={setSort}
            />

            <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
              <TimelineSearch value={query} onChange={setQuery} />
              <TimelineViewToggle
                value={viewMode}
                onChange={setViewMode}
              />
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Showing {sortedEvents.length} filtered records
                </span>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="font-bold text-teal-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                >
                  Reset all timeline filters
                </button>
              </div>
            )}
          </div>

          {/* Render Active View Tab */}
          {activeTab === 'timeline' && (
            sortedEvents.length === 0 ? (
              <TimelineEmptyState
                reason={emptyReason}
                onReset={handleEmptyReset}
              />
            ) : (
              <TimelineContainer
                groups={groupedEvents}
                viewMode={viewMode}
                onOpenEvent={openEvent}
              />
            )
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <TimelineCalendar
                events={events}
                onDateSelect={handleCalendarDateSelect}
                selectedDate={selectedCalendarDate}
              />
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-teal-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {selectedCalendarDate
                      ? `Events on ${selectedCalendarDate.toLocaleDateString()}`
                      : 'Select a date on calendar to inspect activity'}
                  </h3>
                </div>
                <TimelineContainer
                  groups={groupedEvents}
                  viewMode={viewMode}
                  onOpenEvent={openEvent}
                />
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <TimelineInsights events={filteredEvents} />
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <TimelineContainer
                  groups={groupedEvents}
                  viewMode={viewMode}
                  onOpenEvent={openEvent}
                />
                <div className="space-y-6">
                  <TimelineCalendar
                    events={events}
                    onDateSelect={handleCalendarDateSelect}
                    selectedDate={selectedCalendarDate}
                  />
                </div>
              </div>
              <TimelineInsights events={filteredEvents} />
            </div>
          )}
        </>
      )}

      <TimelineDrawer
        event={selectedEvent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
