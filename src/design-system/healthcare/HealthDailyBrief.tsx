import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Circle, Activity, ChevronRight } from 'lucide-react';
import { motionVariants } from '../tokens/motion';

export interface HealthDailyBriefProps {
  userName?: string;
  overallScore?: number;
  statusLabel?: string;
  oneThingToKnow: { title: string; subtitle: string; category?: string };
  oneThingToDo: { title: string; subtitle: string; isCompleted?: boolean; onComplete?: () => void };
  oneThingToExplore: { title: string; subtitle: string; actionLabel: string; onExplore?: () => void };
}

export const HealthDailyBrief: React.FC<HealthDailyBriefProps> = ({
  userName = 'Alex',
  overallScore = 82,
  statusLabel = 'Optimal Standing',
  oneThingToKnow,
  oneThingToDo,
  oneThingToExplore,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={motionVariants.staggerContainer}
      className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6"
    >
      {/* 1. EDITORIAL HEADER & METRIC ESTABLISHMENT */}
      <motion.div variants={motionVariants.contentReveal} className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4F1] text-[#047857] text-[11px] font-bold uppercase tracking-wider border border-[#A7F3D0]">
              Daily Clinical Briefing
            </span>
            <span className="text-xs text-[#64748B] font-medium">• Updated today at 8:00 AM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#0F172A] font-heading leading-tight">
            Good morning, <span className="font-serif italic text-[#0F766E]">{userName}</span>.
          </h1>
          <p className="text-xs sm:text-sm text-[#475569]">
            Your health indicators have remained stable this week. Here is your daily summary.
          </p>
        </div>

        {/* Health Score Composition */}
        <motion.div variants={motionVariants.metricEstablish} className="flex items-center gap-3.5 bg-[#FAF9F6] p-3.5 px-4 rounded-xl border border-[#E5E7EB] shrink-0 self-start md:self-auto">
          <div className="w-10 h-10 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Health Standing</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#0F172A] tabular-nums font-numeric">{overallScore}</span>
              <span className="text-xs text-[#64748B] font-semibold">/ 100</span>
              <span className="text-xs font-bold text-[#047857] uppercase tracking-wider">STABLE</span>
            </div>
            <p className="text-[10px] text-[#059669] font-medium">+4 points over last 14 days</p>
          </div>
        </motion.div>
      </motion.div>

      {/* 2. PROGRESSIVE NARRATIVE STORY: KNOW -> DO -> EXPLORE */}
      <motion.div variants={motionVariants.staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* STORY POINT 1: KNOW */}
        <motion.div
          variants={motionVariants.contentReveal}
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-[#FAF9F6] border border-slate-200/80 space-y-2 flex flex-col justify-between group transition-all"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">1. What to Know</span>
              <span className="w-2 h-2 rounded-full bg-teal-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
              {oneThingToKnow.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{oneThingToKnow.subtitle}</p>
          </div>
          <div className="pt-2 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <span>Verified Lab Baseline</span>
          </div>
        </motion.div>

        {/* STORY POINT 2: DO */}
        <motion.div
          variants={motionVariants.contentReveal}
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-[#FAF9F6] border border-slate-200/80 space-y-2 flex flex-col justify-between group transition-all"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">2. What to Do</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">{oneThingToDo.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{oneThingToDo.subtitle}</p>
          </div>
          {oneThingToDo.onComplete && (
            <button
              onClick={oneThingToDo.onComplete}
              className={`mt-2 w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                oneThingToDo.isCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-teal-800 text-white hover:bg-teal-700 shadow-xs active:scale-[0.98]'
              }`}
            >
              {oneThingToDo.isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Dose Completed</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </>
              )}
            </button>
          )}
        </motion.div>

        {/* STORY POINT 3: EXPLORE */}
        <motion.div
          variants={motionVariants.contentReveal}
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl bg-[#FAF9F6] border border-slate-200/80 space-y-2 flex flex-col justify-between group transition-all"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">3. What to Explore</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">{oneThingToExplore.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{oneThingToExplore.subtitle}</p>
          </div>
          {oneThingToExplore.onExplore && (
            <button
              onClick={oneThingToExplore.onExplore}
              className="mt-2 w-full py-2 px-3 rounded-lg text-xs font-bold bg-[#E6F4F1] text-[#047857] hover:bg-[#D1FAE5] transition-colors flex items-center justify-center gap-1 group/btn"
            >
              <span>{oneThingToExplore.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
