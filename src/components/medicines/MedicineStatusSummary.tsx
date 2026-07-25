import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pill, AlertTriangle, Package, Clock } from 'lucide-react';
import type { Medicine } from './medicineTypes';

interface MedicineStatusSummaryProps {
  medicines: Medicine[] | null | undefined;
}

export const MedicineStatusSummary = memo(function MedicineStatusSummary({
  medicines,
}: MedicineStatusSummaryProps) {
  const summary = useMemo(() => {
    const safeMedicines = medicines || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = safeMedicines.filter((m) => m.status === 'active').length;

    const expiringSoon = safeMedicines.filter((m) => {
      if (!m.endDate) return false;
      const expiry = new Date(m.endDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    }).length;

    const lowStock = safeMedicines.filter((m) => {
      if (m.remainingPills === undefined || m.totalPills === undefined) return false;
      return m.remainingPills / m.totalPills < 0.2;
    }).length;

    const missedToday = safeMedicines.filter((m) => m.status === 'missed').length;

    return { active, expiringSoon, lowStock, missedToday };
  }, [medicines]);

  const cards = [
    {
      icon: Pill,
      label: 'Active Medicines',
      count: summary.active,
      subtitle: 'Currently Running',
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      icon: AlertTriangle,
      label: 'Expiring Soon',
      count: summary.expiringSoon,
      subtitle: 'Within 7 Days',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      icon: Package,
      label: 'Low Stock',
      count: summary.lowStock,
      subtitle: 'Needs Refill',
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      icon: Clock,
      label: 'Missed Today',
      count: summary.missedToday,
      subtitle: 'Dose Missed',
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`rounded-2xl border border-slate-200/80 shadow-sm ${card.bgColor} ${card.borderColor}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${card.bgColor} ${card.borderColor} border flex items-center justify-center shrink-0`}
              >
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className={`text-2xl font-extrabold font-heading ${card.color}`}>
                  {card.count}
                </p>
                <p className="text-[10px] text-slate-500">{card.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
