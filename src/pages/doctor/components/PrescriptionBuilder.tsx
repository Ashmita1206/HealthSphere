import React, { useState } from 'react';
import { Pill, Plus, Trash2, Send, CheckCircle2 } from 'lucide-react';

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionBuilderProps {
  initialPrescriptions?: PrescriptionItem[];
  onIssuePrescription?: (items: PrescriptionItem[]) => void;
  className?: string;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  initialPrescriptions = [
    {
      id: 'rx-1',
      medicineName: 'Telmisartan',
      dosage: '40mg',
      frequency: 'Once Daily (Night)',
      duration: '30 Days',
      instructions: 'Take 30 minutes before bedtime with water',
    },
    {
      id: 'rx-2',
      medicineName: 'Metformin HCl ER',
      dosage: '500mg',
      frequency: 'Twice Daily (Morning / Night)',
      duration: '30 Days',
      instructions: 'Take with or immediately after meals',
    },
  ],
  onIssuePrescription,
  className = '',
}) => {
  const [items, setItems] = useState<PrescriptionItem[]>(initialPrescriptions);
  const [issued, setIssued] = useState(false);

  // Form input states
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once Daily');
  const [duration, setDuration] = useState('14 Days');
  const [instructions, setInstructions] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      medicineName: name.trim(),
      dosage: dosage.trim() || 'Standard Dose',
      frequency,
      duration,
      instructions: instructions.trim() || 'Take as directed',
    };

    setItems([...items, newItem]);
    setName('');
    setDosage('');
    setInstructions('');
  };

  const handleRemove = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleIssue = () => {
    if (onIssuePrescription) onIssuePrescription(items);
    setIssued(true);
    setTimeout(() => setIssued(false), 3000);
  };

  return (
    <div
      data-testid="prescription-builder"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Digital Rx Prescription Builder
            </h3>
            <p className="text-xs text-slate-500">Formulate and digitally sign prescription regimen</p>
          </div>
        </div>

        <button
          onClick={handleIssue}
          disabled={items.length === 0}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          {issued ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          <span>{issued ? 'Rx Issued & Synced' : 'Issue Prescription'}</span>
        </button>
      </div>

      {/* Add Medicine Form */}
      <form
        onSubmit={handleAddItem}
        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
      >
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Add New Medication
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Medication Name (e.g. Amlodipine)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          />
          <input
            type="text"
            placeholder="Dosage (e.g. 5mg or 500mg)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          >
            <option value="Once Daily">Once Daily (OD)</option>
            <option value="Twice Daily">Twice Daily (BD)</option>
            <option value="Thrice Daily">Thrice Daily (TID)</option>
            <option value="As Needed">As Needed (PRN)</option>
          </select>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          >
            <option value="5 Days">5 Days</option>
            <option value="7 Days">7 Days</option>
            <option value="14 Days">14 Days</option>
            <option value="30 Days">30 Days</option>
            <option value="90 Days">90 Days</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Special Instructions (e.g. Take after meals with full glass of water)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="text-xs p-2.5 rounded-xl flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-teal-950 text-white dark:text-teal-200 hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </form>

      {/* Prescription List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Current Prescription Items ({items.length})
        </h4>

        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-medium">
            No medications added to prescription yet.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.medicineName}
                    </h5>
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                      {item.dosage}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • {item.frequency} • {item.duration}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Instructions:</span>{' '}
                    {item.instructions}
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  aria-label={`Remove ${item.medicineName}`}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
