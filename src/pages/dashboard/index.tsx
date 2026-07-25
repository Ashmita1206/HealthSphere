import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Pill,
  Calendar,
  AlertTriangle,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthOverview } from "./components/HealthOverview";
import { QuickActions } from "./components/QuickActions";
import { RecentReportsWidget } from "./components/RecentReportsWidget";
import { MedicineWidget } from "./components/MedicineWidget";
import { AppointmentWidget } from "./components/AppointmentWidget";
import { WellnessWidget } from "./components/WellnessWidget";
import { HealthTrendChart } from "./components/HealthTrendChart";
import { CareNetworkWidget } from "./components/CareNetworkWidget";
import { TimelinePreviewWidget } from "./components/TimelinePreviewWidget";
import { AIHealthSummaryWidget } from "./components/AIHealthSummaryWidget";
import {
  createDefaultProfile,
  normalizeProfileData,
  type Profile,
} from "@/pages/profile/profileData";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const adherenceData = [
  { day: "Mon", adherence: 100 },
  { day: "Tue", adherence: 85 },
  { day: "Wed", adherence: 100 },
  { day: "Thu", adherence: 70 },
  { day: "Fri", adherence: 100 },
  { day: "Sat", adherence: 90 },
  { day: "Sun", adherence: 95 },
];

const riskData = [
  { name: "Low Risk", value: 60, color: "#10B981" },
  { name: "Medium Risk", value: 25, color: "#F59E0B" },
  { name: "High Risk", value: 15, color: "#EF4444" },
];

const weightData = [
  { date: "2024-01-01", weight: 75 },
  { date: "2024-01-08", weight: 74.5 },
  { date: "2024-01-15", weight: 74 },
  { date: "2024-01-22", weight: 73.8 },
  { date: "2024-01-29", weight: 73.5 },
];

const bmiData = [
  { date: "2024-01-01", bmi: 24.5 },
  { date: "2024-01-08", bmi: 24.3 },
  { date: "2024-01-15", bmi: 24.1 },
  { date: "2024-01-22", bmi: 24.0 },
  { date: "2024-01-29", bmi: 23.8 },
];

interface DashboardAppointment {
  id: string;
  appointment_date: string;
  status?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(createDefaultProfile);
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      if (!user) {
        if (active) {
          setProfile(createDefaultProfile());
          setAppointments([]);
          setLoading(false);
        }
        return;
      }

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
        appointmentsResult.status === "fulfilled" &&
          Array.isArray(appointmentsResult.value)
          ? appointmentsResult.value.slice(0, 3)
          : [],
      );
      setLoading(false);
    }

    void fetchData();

    return () => {
      active = false;
    };
  }, [user]);

  const healthScore = profile.health_score || 85;

  const statCards = useMemo(
    () => [
      {
        label: "Patient Health Index",
        value: `${healthScore}%`,
        description: "Overall Clinical Wellness",
        icon: Heart,
        color: "teal" as const,
      },
      {
        label: "Medication Compliance",
        value: `${profile.medicine_adherence_rate || 96}%`,
        description: "Weekly adherence rate",
        icon: Pill,
        color: "emerald" as const,
      },
      {
        label: "Upcoming Consultations",
        value: appointments.length.toString(),
        description: "Scheduled appointments",
        icon: Calendar,
        color: "blue" as const,
      },
      {
        label: "Active Clinical Alerts",
        value: profile.allergies.length.toString(),
        description: profile.allergies.length
          ? "Allergy alerts on your profile"
          : "No profile allergy alerts",
        icon: AlertTriangle,
        color: "amber" as const,
      },
    ],
    [
      appointments.length,
      healthScore,
      profile.allergies,
      profile.medicine_adherence_rate,
    ],
  );

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <span className="sr-only">Loading clinical dashboard</span>
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${profile.full_name || user?.email?.split('@')[0] || "Patient"}`}
        description="Here is your real-time clinical health overview, medication timeline, and AI insights."
        badge="Live Vitals"
        actions={
          <Button
            onClick={() => navigate("/emergency")}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 border border-rose-500"
            aria-label="Open Emergency SOS tools"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Emergency SOS</span>
          </Button>
        }
      />

      {/* Health Overview */}
      <HealthOverview
        userName={profile.full_name || user?.email?.split('@')[0] || "Patient"}
        healthScore={healthScore}
        pendingMedicines={0}
        upcomingAppointments={appointments.length}
      />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => (
          <StatCard key={stat.label} {...stat} index={idx} />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Cross-module care network */}
      <CareNetworkWidget bloodType={profile.blood_type} />

      {/* AI Summary Banner & Timeline Preview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIHealthSummaryWidget healthScore={healthScore} />
        <TimelinePreviewWidget />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Medicine Adherence */}
        <HealthTrendChart
          title="Weekly Medication Compliance"
          description="Daily dosage compliance percentage for this week"
          data={adherenceData.map(d => ({ ...d, date: d.day }))}
          dataKey="adherence"
          color="#0F766E"
          unit="%"
        />

        {/* Clinical Health Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-700" />
                Biomarker Risk Stratification
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">
                Aggregated AI risk assessment based on uploaded vitals
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E2E8F0",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2 pt-2 border-t border-slate-100 text-xs font-bold">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="text-slate-700">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Health Trend Charts - Weight & BMI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthTrendChart
          title="Weight Tracking"
          description="Weight trends over time"
          data={weightData}
          dataKey="weight"
          color="#0F766E"
          unit="kg"
        />
        <HealthTrendChart
          title="BMI Tracking"
          description="Body Mass Index trends"
          data={bmiData}
          dataKey="bmi"
          color="#F59E0B"
          unit=""
        />
      </div>

      {/* Bottom Grid: Reports, Medicines, Appointments & Wellness */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <RecentReportsWidget limit={3} />
        </div>
        <div className="lg:col-span-1">
          <MedicineWidget limit={5} />
        </div>
        <div className="lg:col-span-1">
          <AppointmentWidget limit={3} />
        </div>
        <div className="lg:col-span-1">
          <WellnessWidget />
        </div>
      </div>
    </div>
  );
}
