import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Clock, Trash2, User, Stethoscope, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ doctor_name: "", specialty: "", hospital: "", appointment_date: "" });

  const fetch = async () => {
    if (!user) return;
    const data = await api.get<any[]>("/health/appointments");
    setAppointments(data || []);
  };

  useEffect(() => { fetch(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.doctor_name || !form.appointment_date) return;
    setLoading(true);
    try {
      await api.post("/health/appointments", form);
      toast({ title: "Appointment Scheduled Successfully" });
      setOpen(false);
      setForm({ doctor_name: "", specialty: "", hospital: "", appointment_date: "" });
      fetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to schedule", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/health/appointments/${id}`);
    toast({ title: "Appointment Cancelled" });
    fetch();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <PageHeader
        title="Clinical Appointments & Consultations"
        description="Book, manage, and reschedule upcoming specialist visits across network hospitals."
        breadcrumbs={[{ label: "Appointments" }]}
        badge="Confirmed Schedule"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Book Appointment</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-700" />
                  Book Doctor Consultation
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Physician / Doctor Name *</Label>
                  <Input
                    value={form.doctor_name}
                    onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medical Specialty</Label>
                  <Input
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    placeholder="e.g. Cardiology, Neurology, Pediatrics"
                    className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hospital / Clinic</Label>
                  <Input
                    value={form.hospital}
                    onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                    placeholder="e.g. HealthSphere Central Hospital"
                    className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Appointment Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={form.appointment_date}
                    onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                    className="h-10 text-xs rounded-xl border-slate-200"
                  />
                </div>

                <Button
                  onClick={handleAdd}
                  disabled={loading}
                  className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
                >
                  {loading ? "Confirming Booking..." : "Confirm & Save Appointment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Appointments Grid */}
      {appointments.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
              <Calendar className="h-8 w-8 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">No Appointments Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Book a consultation with board-certified physicians and specialists.
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book First Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {appointments.map((apt, idx) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover bg-white transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                          <Stethoscope className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-teal-800 transition-colors">
                            {apt.doctor_name}
                          </h3>
                          <p className="text-xs text-slate-500 font-normal">
                            {apt.specialty ? `${apt.specialty} • ` : ""}{apt.hospital || "Hospital"}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(apt.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-9 w-9 shrink-0"
                        title="Cancel Appointment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-teal-800 font-bold">
                        <Clock className="h-4 w-4 text-teal-700" />
                        <span>{new Date(apt.appointment_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Confirmed
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}

