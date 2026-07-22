import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pill, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";

export default function MedicinesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "" });

  const fetchMedicines = async () => {
    if (!user) return;
    const data = await api.get<any[]>("/health/medicines");
    setMedicines(data || []);
  };

  useEffect(() => { fetchMedicines(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name) return;
    setLoading(true);
    try {
      await api.post("/health/medicines", form);
      toast({ title: "Medication Added to Rx Cabinet" });
      setForm({ name: "", dosage: "", frequency: "" });
      setOpen(false);
      fetchMedicines();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add medication", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/health/medicines/${id}`);
    toast({ title: "Medication Removed" });
    fetchMedicines();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <PageHeader
        title="Active Prescriptions & Rx Cabinet"
        description="Track daily dosage schedules, active medications, and refill frequencies."
        breadcrumbs={[{ label: "Medicines" }]}
        badge="Rx Cabinet"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Medication</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-700" />
                  Add New Medication
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medication Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Amoxicillin Trihydrate"
                    className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dosage Amount</Label>
                  <Input
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="e.g. 500 mg Capsule"
                    className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Frequency / Timing</Label>
                  <Input
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    placeholder="e.g. Twice Daily (After Meals)"
                    className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <Button
                  onClick={handleAdd}
                  disabled={loading}
                  className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
                >
                  {loading ? "Adding to Cabinet..." : "Save to Prescription Cabinet"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Medicines Grid */}
      {medicines.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
              <Pill className="h-8 w-8 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">No Medicines in Cabinet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Add your active prescriptions to enable smart adherence logging and automated dosage reminders.
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Prescription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {medicines.map((med, idx) => (
              <motion.div
                key={med.id}
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
                          <Pill className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-teal-800 transition-colors">
                            {med.name}
                          </h3>
                          <p className="text-xs font-bold text-teal-800 mt-0.5">
                            {med.dosage || "Standard Dose"}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(med.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-9 w-9 shrink-0"
                        title="Delete Prescription"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-normal">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{med.frequency || "Daily"}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Prescribed
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

