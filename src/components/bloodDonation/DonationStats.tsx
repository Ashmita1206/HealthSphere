import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Droplet, Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DonationStatsProps {
  donors: any[];
  requests: any[];
  myDonations: any[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const DonationStats = memo(function DonationStats({
  donors,
  requests,
  myDonations,
  loading = false,
  error = null,
  onRetry,
}: DonationStatsProps) {
  const stats = useMemo(() => {
    // Only count active requests as open
    const openRequests = requests.filter((r) => r.status === 'active');
    const criticalOpenRequests = openRequests.filter((r) => r.urgency === 'critical');
    const availableDonors = donors.filter((d) => d.availability === 'available');

    return {
      totalDonors: donors.length,
      availableDonors: availableDonors.length,
      openRequests: openRequests.length,
      criticalOpenRequests: criticalOpenRequests.length,
      myDonationsCount: myDonations.length,
    };
  }, [donors, requests, myDonations]);

  if (error) {
    return (
      <Card className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-900">Dashboard Metrics Unavailable</p>
              <p className="text-[11px] text-rose-700">{error}</p>
            </div>
          </div>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8 text-xs font-bold border-rose-200 text-rose-800 hover:bg-rose-100/60 rounded-xl"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const cards = [
    {
      icon: Users,
      label: 'Registered Donors',
      value: stats.totalDonors,
      scope: 'Consented registry',
      color: 'text-teal-800',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      icon: CheckCircle,
      label: 'Available Donors',
      value: stats.availableDonors,
      scope: 'Ready for donation',
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      icon: Droplet,
      label: 'Open Requests',
      value: stats.openRequests,
      scope: 'Active patient needs',
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      icon: Activity,
      label: 'My Donations',
      value: stats.myDonationsCount,
      scope: 'Personal verified units',
      color: 'text-slate-800',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card) => (
          <Card
            key={card.label}
            className={`rounded-2xl border ${card.borderColor} shadow-xs bg-white hover:shadow-sm transition-shadow`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${card.bgColor} ${card.borderColor} border flex items-center justify-center shrink-0`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {card.label}
                  </p>
                  <p className={`text-2xl font-extrabold font-heading ${card.color}`}>
                    {loading ? '—' : card.value}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{card.scope}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.criticalOpenRequests > 0 && !loading && (
        <Card className="rounded-xl border border-rose-300 bg-rose-50/70 p-3 shadow-xs">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {stats.criticalOpenRequests} Critical Blood Request
                {stats.criticalOpenRequests > 1 ? 's' : ''} Require Immediate Attention
              </span>
            </div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full">
              Urgent Triage
            </span>
          </div>
        </Card>
      )}
    </div>
  );
});
