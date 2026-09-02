import { AlertCircle, FileText, Plus, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: AlertCircle,
      label: "Emergency SOS",
      bgColor: "bg-rose-50 hover:bg-rose-100",
      borderColor: "border-rose-200",
      textColor: "text-rose-700",
      iconBg: "bg-rose-600 text-white",
      path: "/emergency",
    },
    {
      icon: Clock,
      label: "AI Consultation",
      bgColor: "bg-white hover:bg-teal-50/50",
      borderColor: "border-slate-200/80",
      textColor: "text-slate-800",
      iconBg: "bg-teal-700 text-white shadow-xs",
      path: "/ai-chat",
    },
    {
      icon: FileText,
      label: "Upload Report",
      bgColor: "bg-white hover:bg-slate-50",
      borderColor: "border-slate-200/80",
      textColor: "text-slate-800",
      iconBg: "bg-teal-50 text-teal-700 border border-teal-100",
      path: "/reports",
    },
    {
      icon: Plus,
      label: "Add Medicine",
      bgColor: "bg-white hover:bg-slate-50",
      borderColor: "border-slate-200/80",
      textColor: "text-slate-800",
      iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      path: "/medicines",
    },
    {
      icon: Calendar,
      label: "Book Visit",
      bgColor: "bg-white hover:bg-slate-50",
      borderColor: "border-slate-200/80",
      textColor: "text-slate-800",
      iconBg: "bg-blue-50 text-blue-700 border border-blue-100",
      path: "/appointments",
    },
    {
      icon: Clock,
      label: "Set Reminder",
      bgColor: "bg-white hover:bg-slate-50",
      borderColor: "border-slate-200/80",
      textColor: "text-slate-800",
      iconBg: "bg-purple-50 text-purple-700 border border-purple-100",
      path: "/reminders",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">
        Quick Clinical Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <button
            key={action.path}
            type="button"
            onClick={() => navigate(action.path)}
            className={`p-4 rounded-2xl border ${action.bgColor} ${action.borderColor} ${action.textColor} transition-all flex flex-col items-center text-center gap-2 group shadow-sm hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2`}
          >
            <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
