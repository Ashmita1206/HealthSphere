import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { aiService, DashboardLogicData } from "@/services/ai/aiService";
import {
  createDefaultProfile,
  normalizeProfileData,
  type Profile,
} from "@/pages/profile/profileData";

import { HealthDailyBrief } from "@/design-system/healthcare/HealthDailyBrief";
import { ClinicalInsight } from "@/design-system/healthcare/ClinicalInsight";
import { CareAction } from "@/design-system/healthcare/CareAction";
import { HealthTrendChart } from "./components/HealthTrendChart";
import { TimelinePreviewWidget } from "./components/TimelinePreviewWidget";
import { DoctorShareWidget } from "./components/DoctorShareWidget";
import { AdherenceTrendChart } from "@/components/charts/AdherenceTrendChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { motionVariants } from "@/design-system/tokens/motion";
import { Bot, ShieldAlert, ArrowRight, Pill } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useMedicalProfile } from "@/context/MedicalProfileContext";
import { ProfileCompletion } from "@/components/medical-profile/ProfileCompletion";
import {
  HealthScoreCard,
  InsightsCard,
  WeeklySummary,
  DashboardStats,
  ActivityTrend,
  HealthBreakdown,
} from "@/components/analytics";
import { QrCode } from "lucide-react";
import { AIHealthScoreCircle } from "./components/AIHealthScoreCircle";
import { HealthSubScoreGrid } from "./components/HealthSubScoreGrid";
import { EmergencyBanner } from "./components/EmergencyBanner";
import { QuickActionsBar } from "./components/QuickActionsBar";
import { AIRecommendationsCard } from "./components/AIRecommendationsCard";
import { RiskAlertsPanel } from "./components/RiskAlertsPanel";
import { HealthTrendCharts } from "./components/HealthTrendCharts";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dashboardData: analyticsData, loading: analyticsLoading } = useAnalytics();
  const { profile: medicalProfile } = useMedicalProfile();
  const [profile, setProfile] = useState<Profile>(createDefaultProfile);
  const [dashboardData, setDashboardData] = useState<DashboardLogicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [careCompletedMap, setCareCompletedMap] = useState<Record<string, boolean>>({});
  const [emergencyAlert, setEmergencyAlert] = useState<{
    id: string;
    title: string;
    message: string;
    severity: 'critical' | 'warning';
  } | null>({
    id: 'telemetry-status',
    title: 'Wearable Telemetry Stream Active',
    message: 'HealthSphere AI is continuously monitoring blood pressure, SpO2, and medication adherence for acute clinical breaches.',
    severity: 'warning',
  });

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);

      const [profileResult, dashboardResult] = await Promise.allSettled([
        api.get<unknown>("/user/profile"),
        aiService.getDashboardLogic(),
      ]);

      if (!active) return;

      if (profileResult.status === "fulfilled") {
        setProfile(normalizeProfileData(profileResult.value));
      }

      if (
        dashboardResult.status === "fulfilled" &&
        dashboardResult.value?.success &&
        dashboardResult.value.data
      ) {
        const data = dashboardResult.value.data;
        setDashboardData(data);

        if (data.careActions && data.careActions.length > 0) {
          const initialMap: Record<string, boolean> = {};
          data.careActions.forEach((action) => {
            initialMap[action.id] = !!action.isCompleted;
          });
          setCareCompletedMap(initialMap);
          if (data.careActions[0]) {
            setTaskCompleted(!!data.careActions[0].isCompleted);
          }
        }
      }

      setLoading(false);
    }

    void fetchData();

    return () => {
      active = false;
    };
  }, []);

  const handleToggleCareAction = async (actionId: string, medicineName?: string) => {
    const currentCompleted = !!careCompletedMap[actionId];
    const nextCompleted = !currentCompleted;

    // Optimistically update UI
    setCareCompletedMap((prev) => ({ ...prev, [actionId]: nextCompleted }));

    try {
      await aiService.toggleDose({
        careActionId: actionId,
        completed: nextCompleted,
        medicineName: medicineName || "Medication",
      });

      // Refresh dashboard logic to sync 7-day adherence calculations dynamically
      const refreshed = await aiService.getDashboardLogic();
      if (refreshed.success && refreshed.data) {
        setDashboardData(refreshed.data);
      }
    } catch (err) {
      console.error("Failed to persist dose completion:", err);
      // Revert state on API failure
      setCareCompletedMap((prev) => ({ ...prev, [actionId]: currentCompleted }));
    }
  };

  const healthScore =
    typeof dashboardData?.healthScore === "number"
      ? dashboardData.healthScore
      : typeof profile.health_score === "number"
      ? profile.health_score
      : undefined;

  const userName = dashboardData?.userName || profile.full_name || undefined;

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <span className="sr-only">Loading HealthSphere narrative dashboard</span>
        <Skeleton className="h-56 rounded-2xl bg-slate-200/70 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl bg-slate-200/70 animate-pulse" />
          <Skeleton className="h-96 rounded-2xl bg-slate-200/70 animate-pulse" />
        </div>
      </div>
    );
  }

  const careActionsList = dashboardData?.careActions || [];
  const adherenceRate =
    typeof dashboardData?.adherenceRate === "number"
      ? dashboardData.adherenceRate
      : typeof profile.medicine_adherence_rate === "number"
      ? profile.medicine_adherence_rate
      : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={motionVariants.staggerContainer}
      className="space-y-8 pb-12"
    >
      {/* 0. EMERGENCY BANNER & QUICK ACTIONS */}
      <motion.div variants={motionVariants.contentReveal} className="space-y-4">
        <EmergencyBanner
          alert={emergencyAlert}
          onOpenEmergency={() => navigate('/emergency')}
          onDismiss={() => setEmergencyAlert(null)}
        />
        <QuickActionsBar onLogVitals={() => navigate('/profile')} />
      </motion.div>

      {/* 1. SIGNATURE AI DIGITAL TWIN HEALTH SCORE CIRCLE */}
      <motion.div variants={motionVariants.contentReveal}>
        <AIHealthScoreCircle
          score={analyticsData?.healthScore?.score ?? healthScore ?? 84}
          confidence={92}
          trendDelta={3.2}
          statusLabel={healthScore !== undefined ? "Optimal Standing" : "Calibrated"}
          onExploreBreakdown={() => navigate('/ai-health-score')}
        />
      </motion.div>

      {/* 2. 10 CLINICAL HEALTH SUB SCORE CARDS */}
      <motion.div variants={motionVariants.contentReveal}>
        <HealthSubScoreGrid />
      </motion.div>

      {/* 3. SIGNATURE MOMENT: Health Daily Briefing */}
      <motion.div variants={motionVariants.contentReveal}>
        <HealthDailyBrief
          userName={userName}
          overallScore={analyticsData?.healthScore?.score ?? healthScore}
          statusLabel={healthScore !== undefined ? "Active Standing" : "Pending Data"}
          oneThingToKnow={
            dashboardData?.oneThingToKnow || {
              title: "No Clinical Data Recorded Yet",
              subtitle: "Log daily vitals or upload lab reports to generate personalized health insights.",
            }
          }
          oneThingToDo={{
            title:
              dashboardData?.oneThingToDo?.title || "No Care Actions Scheduled",
            subtitle:
              dashboardData?.oneThingToDo?.subtitle ||
              "Add prescriptions or dose reminders to track daily care compliance.",
            isCompleted: careActionsList.length > 0 ? !!careCompletedMap[careActionsList[0].id] : taskCompleted,
            onComplete: () => {
              if (careActionsList.length > 0) {
                void handleToggleCareAction(careActionsList[0].id, careActionsList[0].medicineName);
              } else {
                setTaskCompleted(!taskCompleted);
              }
            },
          }}
          oneThingToExplore={
            dashboardData?.oneThingToExplore || {
              title: "AI Health Intelligence",
              subtitle:
                "Synthesize lab reports, active prescriptions, and continuous telemetry.",
              actionLabel: "Explore AI Insights",
              onExplore: () => navigate("/ai-chat"),
            }
          }
        />
      </motion.div>

      {/* 4. SMART HEALTH ANALYTICS: Core KPI Metrics */}
      <motion.div variants={motionVariants.contentReveal}>
        <DashboardStats data={analyticsData} />
      </motion.div>

      {/* 5. HEALTH SCORE & DETERMINISTIC AI INSIGHTS */}
      <motion.div variants={motionVariants.contentReveal} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HealthScoreCard
          healthScore={analyticsData?.healthScore}
          loading={analyticsLoading}
        />
        <InsightsCard
          insights={analyticsData?.recentInsights}
        />
      </motion.div>

      {/* 6. 7-DAY WEEKLY ACTIVITY SUMMARY */}
      <motion.div variants={motionVariants.contentReveal}>
        <WeeklySummary summary={analyticsData?.weeklyActivity} />
      </motion.div>

      {/* 7. ASYMMETRIC NARRATIVE STREAM (65% Primary Stream / 35% Care Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (65% Primary Narrative) */}
        <motion.div variants={motionVariants.contentReveal} className="lg:col-span-2 space-y-6">
          {/* Health Trend Recharts with multi-metric toggles */}
          <HealthTrendCharts />

          {/* AI Clinical Recommendations Card */}
          <AIRecommendationsCard />

          {/* Clinical Risk Alerts Panel */}
          <RiskAlertsPanel />

          {/* Activity Trend Chart */}
          <ActivityTrend trendData={analyticsData?.activityTrend} />

          {/* Health Index Breakdown */}
          <HealthBreakdown breakdown={analyticsData?.healthScore?.breakdown} />

          {/* Clinical Insight Banner (Render only if real report insight exists) */}
          {dashboardData?.clinicalInsight ? (
            <ClinicalInsight
              category={dashboardData.clinicalInsight.category}
              insightTitle={dashboardData.clinicalInsight.insightTitle}
              insightBody={dashboardData.clinicalInsight.insightBody}
              sourceLabel={dashboardData.clinicalInsight.sourceLabel}
              onAction={() => navigate("/reports")}
              actionLabel="Review Detailed Lab Findings"
            />
          ) : (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Clinical Insight
              </span>
              <h3 className="text-xs font-bold text-slate-800">No Clinical Report Findings Yet</h3>
              <p className="text-xs text-slate-500">
                Upload your medical lab reports to extract biomarker baselines and clinical insights.
              </p>
            </div>
          )}

          {/* Health Trends Visualization */}
          <HealthTrendChart
            title="Vitals & Telemetry Baseline"
            description="Continuous vitals trends logged by patient"
            vitalsData={dashboardData?.vitalsData}
            dataKey="weight"
            color="#0F766E"
            unit="kg"
          />

          {/* Recent Timeline Stream Preview */}
          <div className="space-y-3 pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Patient Journey
              </h3>
              <button
                onClick={() => navigate("/timeline")}
                className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1 transition-colors"
              >
                <span>View Full Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <TimelinePreviewWidget events={dashboardData?.timelineEvents} />
          </div>
        </motion.div>

        {/* Right Column (35% Supporting Context & Today's Care) */}
        <motion.div variants={motionVariants.contentReveal} className="space-y-4">
          {/* Today's Care Schedule */}
          <Card variant="base" padding="md" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-800" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Today's Care Actions
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                {careActionsList.length} Items
              </span>
            </div>

            {careActionsList.length > 0 ? (
              <div className="space-y-2.5">
                {careActionsList.map((action) => (
                  <CareAction
                    key={action.id}
                    title={action.title}
                    timeText={action.timeText}
                    contextNote={action.contextNote}
                    isCompleted={!!careCompletedMap[action.id]}
                    onToggle={() => void handleToggleCareAction(action.id, action.medicineName)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 font-medium">
                No care actions scheduled for today.
              </div>
            )}
          </Card>

          {/* Medication Adherence Chart */}
          <AdherenceTrendChart
            data={dashboardData?.adherenceData || []}
            adherenceRate={adherenceRate}
            height={160}
          />

          {/* AI Contextual Intelligence Prompt Tile */}
          <Card variant="ai" padding="md" className="space-y-3">
            <div className="flex items-center gap-2 text-[#047857]">
              <Bot className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">HealthSphere Copilot</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {adherenceRate !== null ? (
                <>
                  Your medication adherence rate is <strong>{adherenceRate}%</strong>. Would you like me to summarize potential drug-nutrient interactions for your active prescriptions?
                </>
              ) : (
                <>
                  Connect your prescriptions and log daily vitals to receive contextual AI guidance and interaction alerts.
                </>
              )}
            </p>

            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => navigate("/ai-chat")}
            >
              <span>Ask HealthSphere AI</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Card>

          {/* Profile Completion Widget */}
          <ProfileCompletion
            profile={medicalProfile}
            onNavigateToTab={() => navigate("/profile")}
          />

          {/* Secure Record Sharing & Doctor Portal Widget */}
          <DoctorShareWidget />

          {/* Digital Health ID Quick Access Tile */}
          <div
            onClick={() => navigate("/profile")}
            className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white border border-teal-500/30 flex items-center justify-between gap-3 shadow-xs cursor-pointer hover:border-teal-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                  Digital Health ID & QR
                </h4>
                <p className="text-[10px] text-slate-300 font-mono">
                  {medicalProfile?.healthId || "HS-2026-000123"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Emergency SOS Access Tile */}
          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-red-900">Need Immediate Help?</h4>
              <p className="text-[11px] text-red-700">Access 24/7 emergency contacts & nearest ER route.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => navigate("/emergency")}
              className="shrink-0 text-xs font-bold gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
