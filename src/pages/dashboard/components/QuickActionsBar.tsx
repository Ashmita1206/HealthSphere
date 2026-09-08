import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  FileText,
  Bot,
  Calendar,
  ShieldAlert,
  PlusCircle,
} from 'lucide-react';

export interface QuickActionsBarProps {
  onLogVitals?: () => void;
  className?: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onLogVitals,
  className = '',
}) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'vitals',
      label: 'Log Vitals',
      description: 'BP, Pulse, Glucose',
      icon: Activity,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100/60 dark:hover:bg-teal-900/50',
      borderColor: 'border-teal-200/80 dark:border-teal-800/60',
      action: () => {
        if (onLogVitals) onLogVitals();
        else navigate('/profile');
      },
    },
    {
      id: 'reports',
      label: 'Upload Report',
      description: 'OCR & AI Analysis',
      icon: FileText,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100/60 dark:hover:bg-sky-900/50',
      borderColor: 'border-sky-200/80 dark:border-sky-800/60',
      action: () => navigate('/medical-reports'),
    },
    {
      id: 'ai-copilot',
      label: 'Ask AI Copilot',
      description: 'Digital Twin Chat',
      icon: Bot,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50',
      borderColor: 'border-emerald-200/80 dark:border-emerald-800/60',
      action: () => navigate('/ai-chat'),
    },
    {
      id: 'appointments',
      label: 'Book Consult',
      description: 'Doctor Telemedicine',
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/50',
      borderColor: 'border-indigo-200/80 dark:border-indigo-800/60',
      action: () => navigate('/appointments'),
    },
    {
      id: 'emergency-sos',
      label: 'Emergency SOS',
      description: 'Instant Alert 108/911',
      icon: ShieldAlert,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100/60 dark:hover:bg-rose-900/50',
      borderColor: 'border-rose-200/80 dark:border-rose-800/60',
      action: () => navigate('/emergency'),
    },
  ];

  return (
    <div
      data-testid="quick-actions-bar"
      className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <PlusCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Clinical Quick Actions</span>
        </h3>
        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">1-Click Telehealth</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={act.id}
              onClick={act.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${act.bgColor} ${act.borderColor} cursor-pointer group`}
            >
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800/80 flex items-center justify-center shadow-2xs mb-2 group-hover:scale-110 transition-transform">
                <Icon className={`w-4 h-4 ${act.color}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {act.label}
                </h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium line-clamp-1">
                  {act.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
