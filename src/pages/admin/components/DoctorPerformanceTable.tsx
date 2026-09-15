import React, { useState } from 'react';
import { Stethoscope, Star, Clock, CheckCircle2, Search, User } from 'lucide-react';

export interface DoctorMetric {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  completedConsultations: number;
  avgDurationMinutes: number;
  satisfactionRating: number; // e.g. 4.9
  prescriptionsIssued: number;
  activeStatus: 'on-duty' | 'in-consult' | 'offline';
}

export const DEFAULT_DOCTORS_METRICS: DoctorMetric[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Mitchell',
    specialization: 'Cardiology',
    hospital: 'Metro Heart Institute',
    completedConsultations: 142,
    avgDurationMinutes: 18,
    satisfactionRating: 4.95,
    prescriptionsIssued: 198,
    activeStatus: 'on-duty',
  },
  {
    id: 'doc-2',
    name: 'Dr. Anita Verma',
    specialization: 'Emergency Medicine & Triage',
    hospital: 'Apex Trauma Center',
    completedConsultations: 215,
    avgDurationMinutes: 12,
    satisfactionRating: 4.91,
    prescriptionsIssued: 260,
    activeStatus: 'on-duty',
  },
  {
    id: 'doc-3',
    name: 'Dr. Rajesh Patel',
    specialization: 'Endocrinology & Diabetology',
    hospital: 'Care Health System',
    completedConsultations: 168,
    avgDurationMinutes: 22,
    satisfactionRating: 4.88,
    prescriptionsIssued: 230,
    activeStatus: 'in-consult',
  },
  {
    id: 'doc-4',
    name: 'Dr. Marcus Vance',
    specialization: 'Pulmonology',
    hospital: 'Westside Respiratory Clinic',
    completedConsultations: 95,
    avgDurationMinutes: 20,
    satisfactionRating: 4.82,
    prescriptionsIssued: 110,
    activeStatus: 'offline',
  },
];

export const DoctorPerformanceTable: React.FC<{
  doctors?: DoctorMetric[];
  className?: string;
}> = ({ doctors = DEFAULT_DOCTORS_METRICS, className = '' }) => {
  const [query, setQuery] = useState('');

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialization.toLowerCase().includes(query.toLowerCase()) ||
      d.hospital.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      data-testid="doctor-performance-table"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Physician Analytics & Clinical Performance
            </h3>
            <p className="text-xs text-slate-500">
              Workload volume, consultation efficiency, and patient clinical satisfaction ratings
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors or spec..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 font-extrabold">Physician</th>
              <th className="py-2.5 px-3 font-extrabold">Specialization & Hospital</th>
              <th className="py-2.5 px-3 font-extrabold">Consultations</th>
              <th className="py-2.5 px-3 font-extrabold">Avg Duration</th>
              <th className="py-2.5 px-3 font-extrabold">Prescriptions</th>
              <th className="py-2.5 px-3 font-extrabold">Rating</th>
              <th className="py-2.5 px-3 font-extrabold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((d) => (
              <tr
                key={d.id}
                data-testid={`doctor-row-${d.id}`}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                      {d.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {d.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{d.specialization}</p>
                  <p className="text-[11px] text-slate-400">{d.hospital}</p>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                  {d.completedConsultations}
                </td>
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                  {d.avgDurationMinutes} mins
                </td>
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                  {d.prescriptionsIssued}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-amber-600 font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{d.satisfactionRating}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      d.activeStatus === 'on-duty'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : d.activeStatus === 'in-consult'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {d.activeStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
