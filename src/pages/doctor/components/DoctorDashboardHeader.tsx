import React, { useState } from 'react';
import { Stethoscope, Calendar, Clock, Users, CheckCircle, ShieldCheck, DollarSign } from 'lucide-react';

export interface DoctorProfileSummary {
  fullName: string;
  specialization: string;
  hospital: string;
  consultationFee: number;
  isAvailable: boolean;
}

export interface DoctorDashboardHeaderProps {
  doctor?: DoctorProfileSummary;
  stats?: {
    todayTotal: number;
    waitingQueue: number;
    completedToday: number;
    avgSatisfaction: number;
  };
  onToggleAvailability?: (isAvailable: boolean) => void;
}

export const DoctorDashboardHeader: React.FC<DoctorDashboardHeaderProps> = ({
  doctor = {
    fullName: 'Dr. Vikramaditya Sen',
    specialization: 'Cardiologist & Internal Medicine',
    hospital: 'Metro Heart Institute & Research Center',
    consultationFee: 750,
    isAvailable: true,
  },
  stats = {
    todayTotal: 14,
    waitingQueue: 3,
    completedToday: 8,
    avgSatisfaction: 4.9,
  },
  onToggleAvailability,
}) => {
  const [available, setAvailable] = useState(doctor.isAvailable);

  const handleToggle = () => {
    const next = !available;
    setAvailable(next);
    if (onToggleAvailability) onToggleAvailability(next);
  };

  return (
    <div
      data-testid="doctor-dashboard-header"
      className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white border border-teal-500/30 shadow-md space-y-6"
    >
      {/* Top bar: Doctor Profile & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-teal-300">
              <Stethoscope className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">{doctor.fullName}</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                Verified Physician
              </span>
            </div>
            <p className="text-xs text-teal-200/80 font-medium">
              {doctor.specialization} • {doctor.hospital}
            </p>
          </div>
        </div>

        {/* Status Toggle & Fee */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Consultation Fee:</span>
            <span className="font-bold text-emerald-400">₹{doctor.consultationFee}</span>
          </div>

          <button
            onClick={handleToggle}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              available
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                available ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{available ? 'Accepting Patients' : 'Offline / In Rounds'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Today's Total</span>
          </div>
          <span className="text-xl font-extrabold text-white">{stats.todayTotal}</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Waiting in Queue</span>
          </div>
          <span className="text-xl font-extrabold text-amber-300">{stats.waitingQueue}</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed</span>
          </div>
          <span className="text-xl font-extrabold text-emerald-300">{stats.completedToday}</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Patient Rating</span>
          </div>
          <span className="text-xl font-extrabold text-white">{stats.avgSatisfaction} / 5.0</span>
        </div>
      </div>
    </div>
  );
};
