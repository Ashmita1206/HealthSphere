import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Droplet, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DonationSummaryProps {
  donors: any[];
  requests: any[];
}

export const DonationSummary = memo(function DonationSummary({
  donors,
  requests,
}: DonationSummaryProps) {
  const summary = useMemo(() => {
    const activeDonors = donors.filter((d) => d.availability === 'available').length;
    const activeRequests = requests.filter((r) => r.status === 'active').length;
    const criticalRequests = requests.filter((r) => r.urgency === 'critical' && r.status === 'active').length;
    const fulfilledRequests = requests.filter((r) => r.status === 'fulfilled').length;

    return {
      activeDonors,
      activeRequests,
      criticalRequests,
      fulfilledRequests,
    };
  }, [donors, requests]);

  const cards = [
    {
      icon: Users,
      label: 'Active Donors',
      value: summary.activeDonors,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      icon: Droplet,
      label: 'Active Requests',
      value: summary.activeRequests,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      icon: AlertTriangle,
      label: 'Critical Requests',
      value: summary.criticalRequests,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      icon: CheckCircle2,
      label: 'Fulfilled',
      value: summary.fulfilledRequests,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
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
                  {card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
