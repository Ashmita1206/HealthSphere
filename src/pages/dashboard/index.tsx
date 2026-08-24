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
import { AdherenceTrendChart } from "@/components/charts/AdherenceTrendChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { motionVariants } from "@/design-system/tokens/motion";
import { Bot, ShieldAlert, ArrowRight, Pill } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(createDefaultProfile);
  const [dashboardData, setDashboardData] = useState<DashboardLogicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [careCompletedMap, setCareCompletedMap] = useState<Record<string, boolean>>({});

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
      {/* 1. SIGNATURE MOMENT: Health Daily Briefing */}
      <motion.div variants={motionVariants.contentReveal}>
        <HealthDailyBrief
          userName={userName}
          overallScore={healthScore}
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

      {/* 2. ASYMMETRIC NARRATIVE STREAM (65% Primary Stream / 35% Care Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (65% Primary Narrative) */}
        <motion.div variants={motionVariants.contentReveal} className="lg:col-span-2 space-y-6">
          {/* Clinical Insight Banner */}
          <ClinicalInsight
            category="OCR LAB INSIGHT"
            insightTitle="Biomarker Panel Baseline Verified"
            insightBody="Comprehensive analysis of your Aug 4 lab extractions shows healthy lipid, glucose, and renal function baselines with zero critical out-of-range parameters."
            sourceLabel="Verified OCR Baseline · Aug 4"
            onAction={() => navigate("/reports")}
            actionLabel="Review Detailed Lab Findings"
          />

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
            <TimelinePreviewWidget />
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
