import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ doctor_name: "", specialty: "", hospital: "", appointment_date: "" });

  const fetch = async () => {
    if (!user) return;
    const { data } = await supabase.from("appointments").select("*").eq("user_id", user.id).order("appointment_date");
    setAppointments(data || []);
  };

  useEffect(() => { fetch(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.doctor_name || !form.appointment_date) return;
    await supabase.from("appointments").insert({ user_id: user.id, ...form });
    toast({ title: "Appointment Added" });
    setOpen(false);
    setForm({ doctor_name: "", specialty: "", hospital: "", appointment_date: "" });
    fetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("appointments").delete().eq("id", id);
    fetch();
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="btn-healthcare"><Plus className="mr-2 h-4 w-4" />Book Appointment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Book Appointment</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Doctor Name</Label><Input value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} className="mt-1" /></div>
                <div><Label>Specialty</Label><Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="mt-1" /></div>
                <div><Label>Hospital</Label><Input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} className="mt-1" /></div>
                <div><Label>Date & Time</Label><Input type="datetime-local" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} className="mt-1" /></div>
                <Button onClick={handleAdd} className="w-full btn-healthcare">Book Appointment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((apt) => (
            <Card key={apt.id} className="card-healthcare">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div>
                    <div><p className="font-semibold">{apt.doctor_name}</p><p className="text-sm text-muted-foreground">{apt.specialty} • {apt.hospital}</p></div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(apt.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{new Date(apt.appointment_date).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
          {appointments.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No appointments scheduled</p>}
        </div>
      </motion.div>
    </div>
  );
}
