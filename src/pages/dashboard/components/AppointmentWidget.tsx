import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, User, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { api } from "@/services/api";

interface Appointment {
  id: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  status: string;
}

interface AppointmentWidgetProps {
  limit?: number;
}

export function AppointmentWidget({ limit = 3 }: AppointmentWidgetProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const data = await api.get<Appointment[]>("/health/appointments?status=scheduled");
        setAppointments((data || []).slice(0, limit));
      } catch (err) {
        setError("Failed to load appointments");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [limit]);

  if (loading) {
    return (
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              Scheduled Consultations
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Upcoming doctor visits</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || appointments.length === 0) {
    return (
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
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">No appointments scheduled</p>
              <p className="text-[11px] text-slate-500 mt-1">Book your next doctor consultation</p>
            </div>
            <Link to="/appointments">
              <Badge className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-3 py-1.5 rounded-full cursor-pointer">
                <Plus className="w-3 h-3 mr-1" />
                Book Appointment
              </Badge>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
        <div className="space-y-2.5">
          {appointments.map((apt, idx) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
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
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
