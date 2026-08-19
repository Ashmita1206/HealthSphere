import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/services/api";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { motionVariants } from "@/design-system/tokens/motion";
import { Bot, ShieldAlert, ArrowRight, Pill } from "lucide-react";

const weightData = [
  { date: "Jan 1", weight: 75 },
  { date: "Jan 8", weight: 74.5 },
  { date: "Jan 15", weight: 74 },
  { date: "Jan 22", weight: 73.8 },
  { date: "Jan 29", weight: 73.5 },
];

interface DashboardAppointment {
  id: string;
  appointment_date: string;
  status?: string;
  doctor_name?: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(createDefaultProfile);
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskCompleted, setTaskCompleted] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);

      const [profileResult, appointmentsResult] = await Promise.allSettled([
        api.get<unknown>("/user/profile"),
        api.get<DashboardAppointment[]>("/health/appointments?status=scheduled"),
      ]);

      if (!active) return;

      setProfile(
        profileResult.status === "fulfilled"
          ? normalizeProfileData(profileResult.value)
          : createDefaultProfile(),
      );

      setAppointments(
        appointmentsResult.status === "fulfilled" && Array.isArray(appointmentsResult.value)
          ? appointmentsResult.value.slice(0, 3)
          : [],
      );

      setLoading(false);
    }

    void fetchData();

    return () => {
      active = false;
    };
  }, []);

  const healthScore = profile.health_score || 82;
  const userName = profile.full_name || "Alex";

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
          statusLabel="Optimal Standing"
          oneThingToKnow={{
            title: "Fasting Glucose Baseline Normal",
            subtitle: "Your latest OCR blood report indicates fasting glucose at 98 mg/dL (Reference range < 100 mg/dL).",
          }}
          oneThingToDo={{
            title: "Morning Dose: Metformin 500mg",
            subtitle: "Take 1 tablet with breakfast at 8:00 AM for optimal metabolic adherence.",
            isCompleted: taskCompleted,
            onComplete: () => setTaskCompleted(!taskCompleted),
          }}
          oneThingToExplore={{
            title: "AI Sleep Trend Synthesis",
            subtitle: "Your rest consistency improved 14% this week. View synthesized contributing factors.",
            actionLabel: "Explore AI Insights",
            onExplore: () => navigate("/ai-chat"),
          }}
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
            title="Weight & Telemetry Baseline"
            description="30-day continuous weight trend in kilograms"
            data={weightData}
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
        <motion.div variants={motionVariants.contentReveal} className="space-y-6">
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
                2 Items
              </span>
            </div>

            <div className="space-y-2.5">
              <CareAction
                title="Metformin 500mg (Post Breakfast)"
                timeText="8:00 AM"
                contextNote="Take with 250ml water"
                isCompleted={taskCompleted}
                onToggle={() => setTaskCompleted(!taskCompleted)}
              />

              <CareAction
                title="Log Evening Vitals (BP & Pulse)"
                timeText="8:00 PM"
                contextNote="Rest 5 mins before logging"
                isCompleted={false}
              />
            </div>
          </Card>

          {/* AI Contextual Intelligence Prompt Tile */}
          <Card variant="ai" padding="md" className="space-y-3">
            <div className="flex items-center gap-2 text-[#047857]">
              <Bot className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">HealthSphere Copilot</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              "Your medication adherence rate is <strong>{profile.medicine_adherence_rate || 96}%</strong>. Would you like me to summarize potential drug-nutrient interactions for your active prescriptions?"
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
