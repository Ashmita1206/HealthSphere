import React, { useState, useEffect } from 'react';
import { aiService, WellnessCoachData } from '@/services/ai/aiService';
import { Sparkles, Sun, Moon, Dumbbell, Droplets, Utensils, Bed, ShieldAlert } from 'lucide-react';

export const AIWellnessCoachWidget: React.FC = () => {
  const [data, setData] = useState<WellnessCoachData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiService
      .getWellnessCoach()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900 text-white animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-10 bg-slate-800 rounded mb-2" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-900/50 shadow-xl text-white space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base font-heading">AI Wellness Coach</h3>
            <p className="text-[11px] text-teal-300/80">Personalized Health Brief & Routine Guidance</p>
          </div>
        </div>
      </div>

      {/* Morning & Evening Brief Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sun className="w-4 h-4" /> Morning Brief
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{data.morningBrief}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Moon className="w-4 h-4" /> Evening Summary
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{data.eveningSummary}</p>
        </div>
      </div>

      {/* 5 Advice Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
            <Dumbbell className="w-3.5 h-3.5" /> Exercise
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">{data.exercise}</p>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-1">
            <Droplets className="w-3.5 h-3.5" /> Hydration
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">{data.hydration}</p>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
            <Utensils className="w-3.5 h-3.5" /> Nutrition
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">{data.nutrition}</p>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 mb-1">
            <Bed className="w-3.5 h-3.5" /> Sleep
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">{data.sleep}</p>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Stress Advice
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">{data.stressAdvice}</p>
        </div>
      </div>
    </div>
  );
};
