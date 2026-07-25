import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pill, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface MedicineStatsProps {
  activeMedicines: number;
  completedMedicines: number;
  missedDoses: number;
  todayMedicines: number;
  completionRate: number;
}

export const MedicineStats = memo(function MedicineStats({
  activeMedicines,
  completedMedicines,
  missedDoses,
  todayMedicines,
  completionRate,
}: MedicineStatsProps) {
  const stats = [
    {
      label: 'Active Medicines',
      value: activeMedicines,
      icon: Pill,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      label: 'Completed',
      value: completedMedicines,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Missed Doses',
      value: missedDoses,
      icon: AlertCircle,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      label: "Today's Schedule",
      value: todayMedicines,
      icon: Clock,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className={`rounded-2xl border border-slate-200/80 shadow-sm ${stat.bgColor} ${stat.borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} ${stat.borderColor} border flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl font-extrabold font-heading ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Completion Rate */}
      <Card className="col-span-2 md:col-span-4 rounded-2xl border border-slate-200/80 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-teal-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Overall Completion Rate</p>
                <p className="text-xl font-extrabold font-heading text-teal-700">{completionRate}%</p>
              </div>
            </div>
            <div className="flex-1 max-w-xs mx-4">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
