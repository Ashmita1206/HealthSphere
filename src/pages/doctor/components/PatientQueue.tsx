import React from 'react';
import { motion } from 'framer-motion';
import { User, Clock, AlertTriangle, ArrowRight, Video, FileText } from 'lucide-react';

export interface QueuePatient {
  id: string;
  tokenNumber: number;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  triageSeverity: 'urgent' | 'moderate' | 'routine';
  waitTimeMinutes: number;
  consultationType: 'telemedicine' | 'in-clinic';
}

export interface PatientQueueProps {
  queue?: QueuePatient[];
  onSelectPatient?: (patient: QueuePatient) => void;
  onStartConsultation?: (patient: QueuePatient) => void;
  className?: string;
}

export const DEFAULT_PATIENT_QUEUE: QueuePatient[] = [
  {
    id: 'p-101',
    tokenNumber: 1,
    name: 'Aarav Sharma',
    age: 48,
    gender: 'Male',
    chiefComplaint: 'Postprandial palpitations & elevated blood pressure readings (142/92)',
    triageSeverity: 'urgent',
    waitTimeMinutes: 4,
    consultationType: 'telemedicine',
  },
  {
    id: 'p-102',
    tokenNumber: 2,
    name: 'Priyanka Patel',
    age: 34,
    gender: 'Female',
    chiefComplaint: 'Routine Type 2 Diabetes quarterly follow-up and HbA1c review',
    triageSeverity: 'routine',
    waitTimeMinutes: 12,
    consultationType: 'telemedicine',
  },
  {
    id: 'p-103',
    tokenNumber: 3,
    name: 'Harpreet Singh',
    age: 62,
    gender: 'Male',
    chiefComplaint: 'Occasional morning dyspnea, requests prescription refill for Atorvastatin',
    triageSeverity: 'moderate',
    waitTimeMinutes: 25,
    consultationType: 'in-clinic',
  },
];

export const PatientQueue: React.FC<PatientQueueProps> = ({
  queue = DEFAULT_PATIENT_QUEUE,
  onSelectPatient,
  onStartConsultation,
  className = '',
}) => {
  return (
    <div
      data-testid="patient-queue"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Live Patient Triage Queue
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time waiting room prioritizing acute symptom severity
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          {queue.length} In Queue
        </span>
      </div>

      <div className="space-y-3">
        {queue.map((patient, index) => {
          const isUrgent = patient.triageSeverity === 'urgent';
          const isModerate = patient.triageSeverity === 'moderate';

          const badgeClasses = isUrgent
            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
            : isModerate
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200'
            : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200';

          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Patient Profile & Complaint */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-750 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  #{patient.tokenNumber}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {patient.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({patient.age}y • {patient.gender})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                      {patient.triageSeverity.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Waited {patient.waitTimeMinutes}m
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xl">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Complaint:</span>{' '}
                    {patient.chiefComplaint}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onSelectPatient && onSelectPatient(patient)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chart</span>
                </button>

                <button
                  onClick={() => onStartConsultation && onStartConsultation(patient)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {patient.consultationType === 'telemedicine' ? (
                    <Video className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  <span>Start Consultation</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
