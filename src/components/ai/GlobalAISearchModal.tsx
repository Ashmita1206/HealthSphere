import React from 'react';
import { useAISearch } from '@/hooks/ai/useAISearch';
import { Search, X, Pill, FileText, MessageSquare, Calendar, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GlobalAISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalAISearchModal: React.FC<GlobalAISearchModalProps> = ({ isOpen, onClose }) => {
  const { query, results, searching, search } = useAISearch();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'medicine':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      default:
        return <Stethoscope className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Global AI Search: Medicines, Reports, Chats, Doctors, Symptoms..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {searching && (
            <div className="text-center py-8 text-xs text-slate-500 font-medium animate-pulse">
              Scanning health records & AI memory...
            </div>
          )}

          {!searching && query.trim() && results.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              No matching health records or chats found for &quot;{query}&quot;.
            </div>
          )}

          {!searching && results.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-100 dark:border-slate-800 transition-colors group"
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                    {item.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          ))}

          {!query.trim() && (
            <div className="py-6 text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Suggested Search Queries
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Diabetes', 'HbA1c Report', 'Doctor Appointment', 'Paracetamol', 'Allergies'].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => search(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-900 hover:text-teal-800 dark:hover:text-teal-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
