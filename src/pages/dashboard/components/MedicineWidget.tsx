import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pill, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { api } from "@/services/api";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  adherence_rate: number;
}

interface MedicineWidgetProps {
  limit?: number;
}

export function MedicineWidget({ limit = 5 }: MedicineWidgetProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedicines() {
      try {
        const data = await api.get<Medicine[]>("/health/medicines?active=true");
        setMedicines((data || []).slice(0, limit));
      } catch (err) {
        setError("Failed to load medicines");
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMedicines();
  }, [limit]);

  if (loading) {
    return (
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-700" />
              Active Medicines
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Daily dosage schedule</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 animate-pulse">
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-slate-200 rounded w-1/3"></div>
                </div>
                <div className="h-5 w-12 bg-slate-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || medicines.length === 0) {
    return (
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
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">No medicines found</p>
              <p className="text-[11px] text-slate-500 mt-1">Add your active prescriptions to track adherence</p>
            </div>
            <Link to="/medicines">
              <Badge className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-3 py-1.5 rounded-full cursor-pointer">
                <Plus className="w-3 h-3 mr-1" />
                Add Medicine
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
        <div className="space-y-2.5">
          {medicines.map((medicine, idx) => (
            <motion.div
              key={medicine.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{medicine.name}</p>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">{medicine.dosage} • {medicine.frequency}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {medicine.adherence_rate}% rate
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
