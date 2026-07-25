import { motion } from "framer-motion";
import { Sparkles, Bot, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HealthOverviewProps {
  userName: string;
  healthScore: number;
  pendingMedicines: number;
  upcomingAppointments: number;
}

export function HealthOverview({
  userName,
  healthScore,
  pendingMedicines,
  upcomingAppointments,
}: HealthOverviewProps) {
  const navigate = useNavigate();

  return (
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
          Good to see you, {userName}. Your vitals are stable today.
        </h2>

        <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
          No critical lab anomalies detected. You have <strong>{pendingMedicines} pending medication doses</strong> and <strong>{upcomingAppointments} upcoming doctor consultation</strong> scheduled.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
          <Button
            onClick={() => {
              const chatWidgetBtn = document.getElementById("ai-chat-trigger");
              if (chatWidgetBtn) chatWidgetBtn.click();
              else navigate("/ai-assistant");
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
  );
}
