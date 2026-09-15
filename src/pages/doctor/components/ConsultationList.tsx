import React, { useState } from 'react';
import { Search, FileCheck, Eye } from 'lucide-react';

export interface ConsultationRecord {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  diagnosis: string;
  status: 'Completed' | 'Prescription Issued' | 'Follow-up';
  fee: number;
}

export interface ConsultationListProps {
  consultations?: ConsultationRecord[];
  onViewRecord?: (consultation: ConsultationRecord) => void;
  className?: string;
}

export const DEFAULT_CONSULTATIONS: ConsultationRecord[] = [
  {
    id: 'c-901',
    patientName: 'Aarav Sharma',
    patientId: 'HS-2026-9812',
    date: 'Today, 11:30 AM',
    diagnosis: 'Essential Hypertension (Stage 1), Suboptimal control',
    status: 'Prescription Issued',
    fee: 750,
  },
  {
    id: 'c-902',
    patientName: 'Meera Nair',
    patientId: 'HS-2026-4421',
    date: 'Today, 10:15 AM',
    diagnosis: 'Acute Bronchitis with nocturnal cough',
    status: 'Completed',
    fee: 750,
  },
  {
    id: 'c-903',
    patientName: 'Rajesh Gupta',
    patientId: 'HS-2026-3190',
    date: 'Yesterday, 4:00 PM',
    diagnosis: 'Type 2 Diabetes Mellitus with microalbuminuria',
    status: 'Follow-up',
    fee: 750,
  },
];

export const ConsultationList: React.FC<ConsultationListProps> = ({
  consultations = DEFAULT_CONSULTATIONS,
  onViewRecord,
  className = '',
}) => {
  const [search, setSearch] = useState('');

  const filtered = consultations.filter(
    (c) =>
      c.patientName.toLowerCase().includes(search.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      c.patientId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      data-testid="consultation-list"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Consultation Logs & Patient Records
            </h3>
            <p className="text-xs text-slate-500">Historical consultations and clinical summaries</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, ID, or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 w-64 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
              <th className="pb-3">Patient</th>
              <th className="pb-3">Date & Time</th>
              <th className="pb-3">Clinical Diagnosis</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3">
                  <div className="font-bold text-slate-900 dark:text-white">{item.patientName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{item.patientId}</div>
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">{item.date}</td>
                <td className="py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{item.diagnosis}</td>
                <td className="py-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.status === 'Prescription Issued'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : item.status === 'Completed'
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => onViewRecord && onViewRecord(item)}
                    className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
