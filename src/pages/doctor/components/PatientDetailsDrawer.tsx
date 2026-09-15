import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Heart, Activity, Pill, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { QueuePatient } from './PatientQueue';

export interface PatientDetailsDrawerProps {
  patient: QueuePatient | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientDetailsDrawer: React.FC<PatientDetailsDrawerProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !patient) return null;

  return (
    <AnimatePresence>
      <div
        data-testid="patient-details-drawer"
        className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 240 }}
          className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{patient.name}</h3>
                <p className="text-xs text-slate-500">
                  {patient.age} Years • {patient.gender} • HealthSphere ID: HS-2026-9812
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close patient details"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Chief Complaint */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Presenting Complaint</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              {patient.chiefComplaint}
            </p>
          </div>

          {/* Live Vitals Telemetry */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Baseline Vitals Telemetry
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-500">Blood Pressure</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">138/88 mmHg</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-500">Heart Rate</span>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">82 bpm</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-500">SpO2 Oxygen</span>
                <p className="text-sm font-bold text-teal-600 dark:text-teal-400">98%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-500">Blood Glucose</span>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">142 mg/dL</p>
              </div>
            </div>
          </div>

          {/* Active Medications & Adherence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Active Prescription Regimen
              </h4>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                88% Adherence Rate
              </span>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Metformin HCl</h5>
                    <p className="text-[10px] text-slate-500">500mg • Morning after breakfast • Daily</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">Compliant</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Telmisartan</h5>
                    <p className="text-[10px] text-slate-500">40mg • Night before bed • Daily</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">Compliant</span>
              </div>
            </div>
          </div>

          {/* Recent Diagnostic Reports */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Diagnostic Reports & OCR Summary
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  Comprehensive Metabolic Panel
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Aug 20, 2026</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Elevated fasting glucose (142 mg/dL) and borderline serum creatinine (1.1 mg/dL). Renal panel intact.
              </p>
            </div>
          </div>

          {/* Allergies & Chronic Conditions */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Allergies:</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                Sulfonamides
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                NSAIDs (mild rash)
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Chronic:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                Essential Hypertension
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                Type 2 Diabetes Mellitus
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
