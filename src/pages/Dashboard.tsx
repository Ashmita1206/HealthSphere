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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  { metric: "Sleep", value: 7.5, max: 8 },
  { metric: "Exercise", value: 45, max: 60 },
  { metric: "Water", value: 2.5, max: 3 },
  { metric: "Steps", value: 8500, max: 10000 },
];

const riskData = [
  { name: "Low Risk", value: 60, color: "hsl(142, 76%, 36%)" },
  { name: "Medium Risk", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "High Risk", value: 15, color: "hsl(0, 84%, 60%)" },
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
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("medicines").select("*").eq("user_id", user.id).eq("is_active", true).limit(5),
        supabase.from("appointments").select("*").eq("user_id", user.id).eq("status", "scheduled").order("appointment_date").limit(3),
      ]);

      setProfile(profileRes.data);
      setMedicines(medicinesRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setLoading(false);
    }

    fetchData();
  }, [user]);

  const healthScore = profile?.health_score || 75;

  const statCards = [
    {
      title: "Health Score",
      value: `${healthScore}%`,
      description: "Overall wellness",
      icon: Heart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Medicine Adherence",
      value: "92%",
      description: "This week",
      icon: Pill,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Upcoming Appointments",
      value: appointments.length.toString(),
      description: "Scheduled",
      icon: Calendar,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Active Alerts",
      value: "2",
      description: "Require attention",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.full_name || "User"}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's an overview of your health status
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-healthcare">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          <Button
            variant="outline"
            className="h-auto flex flex-col items-center gap-2 p-4"
            onClick={() => navigate("/medicines")}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add Medicine</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex flex-col items-center gap-2 p-4"
            onClick={() => navigate("/appointments")}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Book Appointment</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex flex-col items-center gap-2 p-4"
            onClick={() => navigate("/reports")}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Upload Report</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex flex-col items-center gap-2 p-4"
            onClick={() => navigate("/reminders")}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs">Set Reminder</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex flex-col items-center gap-2 p-4 border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => navigate("/emergency")}
          >
            <AlertCircle className="h-5 w-5" />
            <span className="text-xs">Emergency</span>
          </Button>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Adherence Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Medicine Adherence
              </CardTitle>
              <CardDescription>Your medication compliance this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="adherence"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Health Risk Distribution
              </CardTitle>
              <CardDescription>Based on your health data analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Medicines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Active Medicines
                </CardTitle>
                <CardDescription>Your current medications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/medicines">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {medicines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active medicines</p>
              ) : (
                <div className="space-y-3">
                  {medicines.map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-xs text-muted-foreground">{medicine.dosage} - {medicine.frequency}</p>
                      </div>
                      <Badge variant="secondary">{medicine.adherence_rate}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/appointments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{apt.doctor_name}</p>
                        <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.appointment_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Wellness Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Today's Wellness
              </CardTitle>
              <CardDescription>Your daily health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wellnessData.map((metric) => (
                  <div key={metric.metric}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{metric.metric}</span>
                      <span className="text-muted-foreground">
                        {metric.value} / {metric.max}
                      </span>
                    </div>
                    <Progress value={(metric.value / metric.max) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
