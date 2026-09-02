import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  timelineService,
  type TimelineEventRecord,
  type TimelineEventPayload,
  type TimelineCategory,
} from '@/services/timelineService';

export interface TimelineContextType {
  events: TimelineEventRecord[];
  loading: boolean;
  filters: TimelineCategory;
  setFilters: (category: TimelineCategory) => void;
  fetchTimeline: (categoryFilter?: TimelineCategory) => Promise<void>;
  addEvent: (payload: TimelineEventPayload) => Promise<TimelineEventRecord | null>;
  removeEvent: (id: string) => Promise<boolean>;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [events, setEvents] = useState<TimelineEventRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<TimelineCategory>('all');

  const fetchTimeline = useCallback(
    async (categoryFilter?: TimelineCategory) => {
      if (!userId) {
        setEvents([]);
        return;
      }

      setLoading(true);
      try {
        const cat = categoryFilter ?? filters;
        const data = await timelineService.getTimeline({
          category: cat !== 'all' ? cat : undefined,
        });
        setEvents(data);
      } finally {
        setLoading(false);
      }
    },
    [userId, filters]
  );

  useEffect(() => {
    if (userId) {
      fetchTimeline();
    } else {
      setEvents([]);
    }
  }, [userId, fetchTimeline]);

  const setFilters = useCallback(
    (category: TimelineCategory) => {
      setFiltersState(category);
      fetchTimeline(category);
    },
    [fetchTimeline]
  );

  const addEvent = useCallback(
    async (payload: TimelineEventPayload): Promise<TimelineEventRecord | null> => {
      const created = await timelineService.createTimelineEvent(payload);
      if (created) {
        setEvents((prev) => [created, ...prev]);
      }
      return created;
    },
    []
  );

  const removeEvent = useCallback(async (id: string): Promise<boolean> => {
    const success = await timelineService.deleteTimelineEvent(id);
    if (success) {
      setEvents((prev) => prev.filter((e) => e.id !== id && e._id !== id));
    }
    return success;
  }, []);

  return (
    <TimelineContext.Provider
      value={{
        events,
        loading,
        filters,
        setFilters,
        fetchTimeline,
        addEvent,
        removeEvent,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};
