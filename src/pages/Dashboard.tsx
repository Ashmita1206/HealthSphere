import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Pill,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  FileText,
  Plus,
  AlertCircle,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  User,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";

const adherenceData = [
  { day: "Mon", adherence: 100 },
  { day: "Tue", adherence: 85 },
  { day: "Wed", adherence: 100 },
  { day: "Thu", adherence: 70 },
  { day: "Fri", adherence: 100 },
  { day: "Sat", adherence: 90 },
  { day: "Sun", adherence: 95 },
];

const wellnessData = [
  { metric: "Sleep Hours", value: 7.5, max: 8, unit: "hrs" },
  { metric: "Physical Activity", value: 45, max: 60, unit: "mins" },
  { metric: "Hydration Target", value: 2.5, max: 3, unit: "L" },
  { metric: "Daily Steps", value: 8500, max: 10000, unit: "steps" },
];

const riskData = [
  { name: "Low Risk", value: 60, color: "#10B981" },
  { name: "Medium Risk", value: 25, color: "#F59E0B" },
  { name: "High Risk", value: 15, color: "#EF4444" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const [profileRes, medicinesRes, appointmentsRes] = await Promise.all([
        api.get<any>("/user/profile"),
        api.get<any[]>("/health/medicines?active=true"),
        api.get<any[]>("/health/appointments?status=scheduled"),
      ]);

      setProfile(profileRes);
      setMedicines((medicinesRes || []).slice(0, 5));
      setAppointments((appointmentsRes || []).slice(0, 3));
      setLoading(false);
    }

    fetchData();
  }, [user]);

  const healthScore = profile?.health_score || 75;

  const statCards = [
    {
      title: "Patient Health Index",
      value: `${healthScore}%`,
      description: "Overall Clinical Wellness",
      icon: Heart,
      color: "teal",
      bg: "bg-teal-50 text-teal-700 border-teal-200/80",
    },
    {
      title: "Medication Compliance",
      value: "92%",
      description: "Weekly adherence rate",
      icon: Pill,
      color: "emerald",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    },
    {
      title: "Upcoming Consultations",
      value: appointments.length.toString(),
      description: "Scheduled appointments",
      icon: Calendar,
      color: "blue",
      bg: "bg-blue-50 text-blue-700 border-blue-200/80",
    },
    {
      title: "Active Clinical Alerts",
      value: "2",
      description: "Requires attention",
      icon: AlertTriangle,
      color: "amber",
      bg: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 animate-bounce flex items-center justify-center text-white font-bold shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500 font-heading">Loading Clinical Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${profile?.full_name || user?.email?.split('@')[0] || "Patient"}`}
        description="Here is your real-time clinical health overview, medication timeline, and AI insights."
        badge="Live Vitals"
        actions={
          <Button
            onClick={() => navigate("/emergency")}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 border border-rose-500"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Emergency SOS</span>
          </Button>
        }
      />

      {/* Hero Patient Greeting & Health Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>HealthSphere AI Active Assistant</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight leading-tight">
            Your Vitals Are Stable Today
          </h2>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
            No critical lab anomalies detected. You have <strong>{medicines.length} pending medication doses</strong> and <strong>{appointments.length} upcoming doctor consultation</strong> scheduled.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Button
              onClick={() => {
                const chatWidgetBtn = document.getElementById("ai-chat-trigger");
                if (chatWidgetBtn) chatWidgetBtn.click();
                else navigate("/dashboard");
              }}
              className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Consult AI Assistant</span>
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold text-xs px-4 py-2.5 rounded-xl"
            >
              <span>Upload Medical Report</span>
            </Button>
          </div>
        </div>

        {/* Circular Radial Gauge Score Preview */}
        <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 w-44 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-200">Patient Health Score</p>
          <div className="relative my-2 w-20 h-20 rounded-full border-4 border-teal-400/40 flex items-center justify-center bg-teal-950/60 shadow-inner">
            <span className="text-3xl font-extrabold font-heading text-white">{healthScore}</span>
            <span className="text-xs font-bold text-teal-300">/100</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Excellent Status
          </span>
        </div>
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1.5 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1">{stat.description}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} border shadow-sm`}>
              <stat.icon className="w-5 h-5 stroke-[2.2]" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          <button
            onClick={() => navigate("/emergency")}
            className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all flex flex-col items-center text-center gap-2 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Emergency SOS</span>
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 transition-all flex flex-col items-center text-center gap-2 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Upload Report</span>
          </button>

          <button
            onClick={() => navigate("/medicines")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 transition-all flex flex-col items-center text-center gap-2 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Add Medicine</span>
          </button>

          <button
            onClick={() => navigate("/appointments")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 transition-all flex flex-col items-center text-center gap-2 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Book Visit</span>
          </button>

          <button
            onClick={() => navigate("/reminders")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 transition-all flex flex-col items-center text-center gap-2 group shadow-sm col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Set Reminder</span>
          </button>

        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Medicine Adherence */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-700" />
                Weekly Medication Compliance
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">
                Daily dosage compliance percentage for this week
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E2E8F0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="adherence"
                      stroke="#0F766E"
                      strokeWidth={3}
                      dot={{ fill: "#0F766E", r: 4 }}
                      activeDot={{ r: 6, fill: "#14B8A6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                    />
                    <span className="text-slate-700">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Bottom Grid: Medicines, Appointments & Today's Wellness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Medicines */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-700" />
                Active Medicines
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">Daily dosage schedule</CardDescription>
            </div>
            <Link to="/medicines" className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {medicines.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No active medicines logged</p>
            ) : (
              <div className="space-y-2.5">
                {medicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{medicine.name}</p>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">{medicine.dosage} • {medicine.frequency}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {medicine.adherence_rate}% rate
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Appointments */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                Scheduled Consultations
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">Upcoming doctor visits</CardDescription>
            </div>
            <Link to="/appointments" className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No upcoming appointments scheduled</p>
            ) : (
              <div className="space-y-2.5">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{apt.doctor_name}</p>
                        <p className="text-[11px] text-slate-500 font-normal">{apt.specialty}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-200 text-slate-700">
                      {new Date(apt.appointment_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Wellness Tracker */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-700" />
              Daily Vitals & Wellness
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Real-time daily goal progress</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {wellnessData.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{m.metric}</span>
                  <span className="font-semibold text-slate-500">
                    {m.value} / {m.max} {m.unit}
                  </span>
                </div>
                <Progress value={(m.value / m.max) * 100} className="h-2 bg-slate-100" />
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}

