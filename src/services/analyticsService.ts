import { api } from './api';

export interface HealthScoreBreakdown {
  medicine: number;
  appointments: number;
  vitals: number;
  reports: number;
  timeline: number;
  emergency: number;
}

export interface HealthScoreData {
  score: number;
  level: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  breakdown: HealthScoreBreakdown;
}

export interface WeeklySummaryData {
  medicinesTaken: number;
  missedMedicines: number;
  appointmentsCompleted: number;
  reportsUploaded: number;
  healthEvents: number;
  healthScoreDifference: number;
}

export interface HealthInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  priority: 'high' | 'medium' | 'low';
  category: 'medicine' | 'appointment' | 'report' | 'timeline' | 'health_score' | 'vitals';
  title: string;
  message: string;
}

export interface ActivityTrendPoint {
  day: string;
  activity: number;
  adherence: number;
  events: number;
}

export interface DashboardAnalyticsData {
  healthScore: HealthScoreData;
  medicineAdherence: {
    adherenceRate: number;
    totalMedicines: number;
    activeMedicines: number;
    medicinesTakenThisWeek: number;
    missedThisWeek: number;
  };
  appointments: {
    total: number;
    upcomingCount: number;
    completedCount: number;
    cancelledCount: number;
    nextAppointment: {
      doctorName?: string;
      specialty?: string;
      hospital?: string;
      appointmentDate?: string;
    } | null;
  };
  reports: {
    total: number;
    recentCount: number;
    highRiskCount: number;
  };
  timelineCount: number;
  notificationCount: {
    unread: number;
    total: number;
  };
  weeklyActivity: WeeklySummaryData;
  activityTrend: ActivityTrendPoint[];
  recentInsights: HealthInsight[];
}

export const analyticsService = {
  getDashboardAnalytics: async (): Promise<DashboardAnalyticsData | null> => {
    try {
      const res = await api.get<{ success: boolean; data: DashboardAnalyticsData }>(
        '/analytics/dashboard'
      );
      return res?.data || (res as unknown as DashboardAnalyticsData) || null;
    } catch (_err) {
      return null;
    }
  },

  getHealthScore: async (): Promise<HealthScoreData | null> => {
    try {
      const res = await api.get<{ success: boolean; data: HealthScoreData }>(
        '/analytics/health-score'
      );
      return res?.data || (res as unknown as HealthScoreData) || null;
    } catch (_err) {
      return null;
    }
  },

  getWeeklySummary: async (): Promise<WeeklySummaryData | null> => {
    try {
      const res = await api.get<{ success: boolean; data: WeeklySummaryData }>(
        '/analytics/weekly-summary'
      );
      return res?.data || (res as unknown as WeeklySummaryData) || null;
    } catch (_err) {
      return null;
    }
  },
};
