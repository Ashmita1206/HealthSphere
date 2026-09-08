import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  analyticsService,
  type DashboardAnalyticsData,
  type HealthScoreData,
  type WeeklySummaryData,
} from '@/services/analyticsService';

export interface AnalyticsContextType {
  dashboardData: DashboardAnalyticsData | null;
  loading: boolean;
  healthScore: HealthScoreData | null;
  weeklySummary: WeeklySummaryData | null;
  refreshAnalytics: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [dashboardData, setDashboardData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshAnalytics = useCallback(async () => {
    if (!userId) {
      setDashboardData(null);
      return;
    }

    setLoading(true);
    try {
      const data = await analyticsService.getDashboardAnalytics();
      if (data) {
        setDashboardData(data);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshAnalytics();
    } else {
      setDashboardData(null);
    }
  }, [userId, refreshAnalytics]);

  const healthScore = dashboardData?.healthScore || null;
  const weeklySummary = dashboardData?.weeklyActivity || null;

  return (
    <AnalyticsContext.Provider
      value={{
        dashboardData,
        loading,
        healthScore,
        weeklySummary,
        refreshAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
