import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Droplet, Activity, MapPin, AlertTriangle } from 'lucide-react';

interface DonationStatsProps {
  donors: any[];
  requests: any[];
  myDonations: any[];
}

export const DonationStats = memo(function DonationStats({
  donors,
  requests,
  myDonations,
}: DonationStatsProps) {
  const stats = useMemo(() => {
    const activeDonors = donors.filter((d) => d.availability === 'available').length;
    const activeRequests = requests.filter((r) => r.status === 'active').length;
    const criticalRequests = requests.filter((r) => r.urgency === 'critical' && r.status === 'active').length;
    const myDonationCount = myDonations.length;

    return {
      totalDonors: donors.length,
      activeDonors,
      activeRequests,
      criticalRequests,
      myDonations: myDonationCount,
    };
  }, [donors, requests, myDonations]);

  const cards = [
    {
      icon: Users,
      label: 'Total Donors',
      value: stats.totalDonors,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      icon: Droplet,
      label: 'Active Requests',
      value: stats.activeRequests,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      icon: Activity,
      label: 'My Donations',
      value: stats.myDonations,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      icon: MapPin,
      label: 'Nearby Donors',
      value: stats.activeDonors,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="space-y-4">
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

      {stats.criticalRequests > 0 && (
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Critical Requests
                </p>
                <p className="text-xl font-extrabold font-heading text-rose-700">
                  {stats.criticalRequests} Urgent
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
