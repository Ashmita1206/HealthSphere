import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pill, Trash2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function MedicinesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "" });

  const fetchMedicines = async () => {
    if (!user) return;
    const { data } = await supabase.from("medicines").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setMedicines(data || []);
  };

  useEffect(() => { fetchMedicines(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name) return;
    await supabase.from("medicines").insert({ user_id: user.id, ...form });
    toast({ title: "Medicine Added" });
    setForm({ name: "", dosage: "", frequency: "" });
    setOpen(false);
    fetchMedicines();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("medicines").delete().eq("id", id);
    toast({ title: "Medicine Deleted" });
    fetchMedicines();
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Medicines</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="btn-healthcare"><Plus className="mr-2 h-4 w-4" />Add Medicine</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Medicine</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Dosage</Label><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 500mg" className="mt-1" /></div>
              <div><Label>Frequency</Label><Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="e.g. Twice daily" className="mt-1" /></div>
              <Button onClick={handleAdd} className="w-full btn-healthcare">Add Medicine</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {medicines.map((med) => (
          <Card key={med.id} className="card-healthcare">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Pill className="h-5 w-5 text-primary" /></div>
                  <div><p className="font-semibold">{med.name}</p><p className="text-sm text-muted-foreground">{med.dosage}</p></div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(med.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              <div className="mt-3 flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">{med.frequency}</span></div>
              <Badge className="mt-2" variant={med.is_active ? "default" : "secondary"}>{med.is_active ? "Active" : "Inactive"}</Badge>
            </CardContent>
          </Card>
        ))}
        {medicines.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No medicines added yet</p>}
      </div>
    </div>
  );
}
