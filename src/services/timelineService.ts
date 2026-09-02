import { api } from './api';

export type TimelineCategory =
  | 'all'
  | 'medicine'
  | 'appointment'
  | 'report'
  | 'vitals'
  | 'emergency'
  | 'health_goal'
  | 'general';

export interface TimelineEventPayload {
  title: string;
  description: string;
  eventType?: TimelineCategory;
  category?: TimelineCategory;
  metadata?: Record<string, unknown>;
  relatedId?: string | null;
}

export interface TimelineEventRecord {
  id: string;
  _id?: string;
  userId?: string;
  eventType: TimelineCategory;
  category: TimelineCategory;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  relatedId?: string | null;
  createdAt: string;
  updatedAt?: string;
  timestamp: string;
}

export interface TimelineResponse {
  success: boolean;
  data: TimelineEventRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const timelineService = {
  getTimeline: async (params?: {
    category?: string;
    eventType?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<TimelineEventRecord[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category && params.category !== 'all') {
        queryParams.set('category', params.category);
      }
      if (params?.eventType && params.eventType !== 'all') {
        queryParams.set('eventType', params.eventType);
      }
      if (params?.page) {
        queryParams.set('page', String(params.page));
      }
      if (params?.limit) {
        queryParams.set('limit', String(params.limit));
      }
      if (params?.search) {
        queryParams.set('search', params.search);
      }

      const queryString = queryParams.toString();
      const path = `/timeline${queryString ? `?${queryString}` : ''}`;
      const res = await api.get<TimelineResponse>(path);
      if (res && Array.isArray(res.data)) {
        return res.data;
      }
      if (Array.isArray(res)) {
        return res as unknown as TimelineEventRecord[];
      }
      return [];
    } catch (_err) {
      return [];
    }
  },

  createTimelineEvent: async (
    payload: TimelineEventPayload
  ): Promise<TimelineEventRecord | null> => {
    try {
      const res = await api.post<{ success: boolean; data: TimelineEventRecord }>(
        '/timeline',
        payload
      );
      return res?.data || null;
    } catch (_err) {
      return null;
    }
  },

  deleteTimelineEvent: async (id: string): Promise<boolean> => {
    try {
      await api.delete<{ success: boolean; message: string }>(`/timeline/${id}`);
      return true;
    } catch (_err) {
      return false;
    }
  },
};
