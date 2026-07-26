import { api } from '@/services/api';

export interface MedicalReportAnalysis {
  reportTitle: string;
  category: string;
  summary: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  abnormalValues: Array<{
    parameter: string;
    value: string;
    normalRange: string;
    severity: string;
    clinicalNote: string;
  }>;
  biomarkers: Record<string, string>;
  recommendations: string[];
}

export interface ReportComparisonResult {
  overallTrend: string;
  keyChanges: Array<{
    metric: string;
    previousValue: string;
    currentValue: string;
    status: string;
    explanation: string;
  }>;
  summary: string;
  actionableAdvice: string[];
}

export interface VisionAnalysisResult {
  category: string;
  summary: string;
  findings: string[];
  warnings: string[];
  questionsForDoctor: string[];
  confidenceScore: number;
}

export interface HealthScoreData {
  overallHealthScore: number;
  scores: Record<string, { score: number; why: string; trend: string; recommendation: string }>;
}

export interface PredictionsData {
  diabetesRisk: { level: string; probability: number; preventiveAction: string };
  hypertensionRisk: { level: string; probability: number; preventiveAction: string };
  heartDiseaseRisk: { level: string; probability: number; preventiveAction: string };
  vitaminDeficiencyRisk: { level: string; probability: number; preventiveAction: string };
  lifestyleRisk: { level: string; probability: number; preventiveAction: string };
  medicationNonAdherence: { level: string; probability: number; preventiveAction: string };
}

export interface DashboardLogicData {
  todaysSummary: string;
  weeklySummary: string;
  aiInsights: string[];
  riskAlerts: Array<{ title: string; detail: string }>;
  recommendations: string[];
  wellnessTrends: { labels: string[]; scores: number[] };
  dailyGoals: Array<{ title: string; completed: boolean; current?: string }>;
}

export interface GlobalSearchResult {
  type: string;
  title: string;
  subtitle: string;
  id: string;
  link: string;
}

export interface WellnessCoachData {
  morningBrief: string;
  eveningSummary: string;
  exercise: string;
  hydration: string;
  nutrition: string;
  sleep: string;
  stressAdvice: string;
}

export const aiService = {
  analyzeReport: (payload: { mimeType?: string; base64Data?: string; textContent?: string }) =>
    api.post<{ success: boolean; data: MedicalReportAnalysis }>('/ai/report/analyze', payload),

  compareReports: (reportA: object, reportB: object) =>
    api.post<{ success: boolean; data: ReportComparisonResult }>('/ai/report/compare', { reportA, reportB }),

  analyzeVision: (payload: { category: string; mimeType: string; base64Data: string }) =>
    api.post<{ success: boolean; data: VisionAnalysisResult }>('/ai/vision/analyze', payload),

  getHealthScores: () =>
    api.get<{ success: boolean; data: HealthScoreData }>('/ai/health-scores'),

  getPredictions: () =>
    api.get<{ success: boolean; data: PredictionsData }>('/ai/predictions'),

  getDashboardLogic: () =>
    api.get<{ success: boolean; data: DashboardLogicData }>('/ai/dashboard'),

  searchGlobal: (query: string) =>
    api.get<{ success: boolean; data: GlobalSearchResult[] }>(`/ai/search?query=${encodeURIComponent(query)}`),

  getWellnessCoach: () =>
    api.get<{ success: boolean; data: WellnessCoachData }>('/ai/wellness-coach'),
};
