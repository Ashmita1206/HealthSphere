import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface DoseLog {
  id: string;
  date: string;
  time: string;
  status: 'taken' | 'skipped' | 'delayed';
  reason?: string;
}

interface DoseHistoryProps {
  logs: DoseLog[];
  onLogDose: (status: 'taken' | 'skipped' | 'delayed', reason?: string) => void;
}

export function DoseHistory({ logs, onLogDose }: DoseHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return { icon: CheckCircle2, color: 'text-emerald-700', bgColor: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'skipped': return { icon: XCircle, color: 'text-rose-700', bgColor: 'bg-rose-50', badge: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'delayed': return { icon: AlertCircle, color: 'text-amber-700', bgColor: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700 border-amber-200' };
      default: return { icon: Clock, color: 'text-slate-500', bgColor: 'bg-slate-50', badge: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-extrabold text-slate-900 font-heading">Dose History</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLogDose('taken')}
            className="h-7 text-[10px] font-bold rounded-lg"
            aria-label="Log dose"
          >
            Log Dose
          </Button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No dose history yet</p>
            <p className="text-[10px] text-slate-400 mt-1">Log your first dose to track adherence</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {logs.map((log) => {
              const { icon: Icon, color, bgColor, badge } = getStatusIcon(log.status);
              return (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-8 h-8 rounded-full ${bgColor} border border-slate-200 flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-900">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                      <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
                        {log.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{log.time}</span>
                      {log.reason && <span>• {log.reason}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[9px] text-slate-400 mt-3">
          TODO: Backend integration required for dose history persistence
        </p>
      </CardContent>
    </Card>
  );
}
