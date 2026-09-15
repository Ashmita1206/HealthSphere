import React from 'react';
import { History, CheckCircle, AlertOctagon, Lock } from 'lucide-react';
import { LoginHistoryItem } from '../../services/securityService';

interface LoginHistoryCardProps {
  history: LoginHistoryItem[];
  isLoading?: boolean;
}

export const LoginHistoryCard: React.FC<LoginHistoryCardProps> = ({ history, isLoading = false }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Recent Login Activity & Audit
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time security log of authentication events across all endpoints.
        </p>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading activity history...</div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">No recent activity logged.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Device & Browser</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3">
                    {item.status === 'success' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3" /> Successful
                      </span>
                    ) : item.status === 'locked' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                        <Lock className="w-3 h-3" /> Locked Out
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                        <AlertOctagon className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-900 dark:text-slate-100 font-medium">{item.device}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{item.ipAddress}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">
                    {new Date(item.createdAt).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
