import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  Pill,
  TrendingUp,
  Clock,
  Heart,
  AlertTriangle,
  Activity,
  Stethoscope,
  BarChart3,
  PieChart,
} from 'lucide-react';
import type { TimelineEvent } from './timelineTypes';
import { TIMELINE_EVENT_CONFIG } from './timelineConstants';

interface TimelineInsightsProps {
  events: TimelineEvent[];
}

export const TimelineInsights = memo(function TimelineInsights({
  events,
}: TimelineInsightsProps) {
  const insights = useMemo(() => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Most Active Month
    const monthCounts = new Map<string, number>();
    events.forEach((event) => {
      const date = new Date(event.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    });
    const mostActiveMonth = Array.from(monthCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    const mostActiveMonthName = mostActiveMonth
      ? new Date(parseInt(mostActiveMonth[0].split('-')[0]), parseInt(mostActiveMonth[0].split('-')[1])).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'N/A';

    // Most Visited Doctor
    const doctorCounts = new Map<string, number>();
    events.forEach((event) => {
      const doctor = event.metadata.doctor;
      if (doctor) {
        doctorCounts.set(doctor, (doctorCounts.get(doctor) || 0) + 1);
      }
    });
    const mostVisitedDoctor = Array.from(doctorCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    // Most Common Medicine
    const medicineCounts = new Map<string, number>();
    events.forEach((event) => {
      const medicine = event.metadata.medicine;
      if (medicine) {
        medicineCounts.set(medicine, (medicineCounts.get(medicine) || 0) + 1);
      }
    });
    const mostCommonMedicine = Array.from(medicineCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    // Medicine Adherence %
    const medicineEvents = events.filter((e) => e.type === 'medicine');
    const completedMedicines = medicineEvents.filter((e) => e.status === 'completed');
    const medicineAdherence = medicineEvents.length > 0
      ? Math.round((completedMedicines.length / medicineEvents.length) * 100)
      : 85;

    // Upcoming Appointment
    const upcomingAppointments = events
      .filter((e) => e.type === 'appointment' && e.status === 'upcoming')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const upcomingAppointment = upcomingAppointments[0];

    // Average Visits / Month
    const lastYearEvents = events.filter((e) => new Date(e.timestamp) >= oneYearAgo);
    const averageVisitsPerMonth = lastYearEvents.length / 12;

    // Health Score
    const completedEvents = events.filter((e) => e.status === 'completed').length;
    const totalEvents = events.length;
    const completionRate = totalEvents > 0 ? completedEvents / totalEvents : 0;
    const healthScore = Math.round(
      (completionRate * 40) +
        (medicineAdherence * 0.3) +
        (averageVisitsPerMonth > 2 ? 20 : averageVisitsPerMonth * 10) +
        (upcomingAppointment ? 10 : 0)
    );

    // Longest Gap Between Visits
    const appointmentEvents = events.filter((e) => e.type === 'appointment' && e.status === 'completed');
    let longestGap = 0;
    if (appointmentEvents.length > 1) {
      const sortedAppointments = appointmentEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      for (let i = 1; i < sortedAppointments.length; i++) {
        const gap = (new Date(sortedAppointments[i].timestamp).getTime() - new Date(sortedAppointments[i - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24);
        if (gap > longestGap) longestGap = gap;
      }
    }

    // Emergency Visit Count
    const emergencyVisits = events.filter((e) => e.type === 'emergency').length;

    // This Month Activity
    const thisMonthEvents = events.filter((e) => new Date(e.timestamp) >= oneMonthAgo);

    // Category Distribution
    const categoryCounts = new Map<string, number>();
    events.forEach((event) => {
      const cat = TIMELINE_EVENT_CONFIG[event.type]?.label ?? event.category;
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });
    const categoryDistribution = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: events.length > 0 ? Math.round((count / events.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Monthly Activity Trend (Last 6 Months)
    const monthlyTrend: Array<{ label: string; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const count = events.filter((e) => {
        const ed = new Date(e.timestamp);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      }).length;
      monthlyTrend.push({ label: monthName, count });
    }
    const maxTrendCount = Math.max(...monthlyTrend.map((t) => t.count), 1);

    return {
      mostActiveMonth: mostActiveMonthName,
      mostActiveMonthCount: mostActiveMonth?.[1] || 0,
      mostVisitedDoctor: mostVisitedDoctor?.[0] || 'N/A',
      mostVisitedDoctorCount: mostVisitedDoctor?.[1] || 0,
      mostCommonMedicine: mostCommonMedicine?.[0] || 'N/A',
      mostCommonMedicineCount: mostCommonMedicine?.[1] || 0,
      medicineAdherence,
      upcomingAppointment: upcomingAppointment?.title || 'None',
      upcomingAppointmentDate: upcomingAppointment?.timestamp || null,
      averageVisitsPerMonth: averageVisitsPerMonth.toFixed(1),
      healthScore: Math.min(100, Math.max(0, healthScore)),
      longestGap: Math.round(longestGap),
      emergencyVisits,
      thisMonthActivity: thisMonthEvents.length,
      categoryDistribution,
      monthlyTrend,
      maxTrendCount,
    };
  }, [events]);

  const insightCards = [
    {
      icon: Calendar,
      label: 'Most Active Month',
      value: insights.mostActiveMonth,
      subtitle: `${insights.mostActiveMonthCount} events`,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      icon: User,
      label: 'Most Visited Doctor',
      value: insights.mostVisitedDoctor,
      subtitle: `${insights.mostVisitedDoctorCount} visits`,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      icon: Pill,
      label: 'Most Common Medicine',
      value: insights.mostCommonMedicine,
      subtitle: `${insights.mostCommonMedicineCount} times`,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      icon: TrendingUp,
      label: 'Medicine Adherence',
      value: `${insights.medicineAdherence}%`,
      subtitle: 'Completion rate',
      color: insights.medicineAdherence >= 80 ? 'text-emerald-700' : insights.medicineAdherence >= 50 ? 'text-amber-700' : 'text-rose-700',
      bgColor: insights.medicineAdherence >= 80 ? 'bg-emerald-50' : insights.medicineAdherence >= 50 ? 'bg-amber-50' : 'bg-rose-50',
      borderColor: insights.medicineAdherence >= 80 ? 'border-emerald-100' : insights.medicineAdherence >= 50 ? 'border-amber-100' : 'border-rose-100',
    },
    {
      icon: Clock,
      label: 'Upcoming Appointment',
      value: insights.upcomingAppointment,
      subtitle: insights.upcomingAppointmentDate ? new Date(insights.upcomingAppointmentDate).toLocaleDateString() : 'No upcoming',
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      icon: Activity,
      label: 'Avg Visits / Month',
      value: insights.averageVisitsPerMonth,
      subtitle: 'Last 12 months',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      icon: Heart,
      label: 'Health Score',
      value: `${insights.healthScore}/100`,
      subtitle: insights.healthScore >= 80 ? 'Excellent' : insights.healthScore >= 60 ? 'Good' : 'Needs attention',
      color: insights.healthScore >= 80 ? 'text-emerald-700' : insights.healthScore >= 60 ? 'text-blue-700' : 'text-rose-700',
      bgColor: insights.healthScore >= 80 ? 'bg-emerald-50' : insights.healthScore >= 60 ? 'bg-blue-50' : 'bg-rose-50',
      borderColor: insights.healthScore >= 80 ? 'border-emerald-100' : insights.healthScore >= 60 ? 'border-amber-100' : 'border-rose-100',
    },
    {
      icon: Stethoscope,
      label: 'Longest Gap',
      value: `${insights.longestGap} days`,
      subtitle: 'Between visits',
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
    {
      icon: AlertTriangle,
      label: 'Emergency Visits',
      value: insights.emergencyVisits.toString(),
      subtitle: 'Total recorded',
      color: insights.emergencyVisits > 0 ? 'text-rose-700' : 'text-slate-700',
      bgColor: insights.emergencyVisits > 0 ? 'bg-rose-50' : 'bg-slate-50',
      borderColor: insights.emergencyVisits > 0 ? 'border-rose-100' : 'border-slate-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-teal-700" />
        <h3 className="text-base font-extrabold text-slate-900 font-heading">
          Clinical Insights & Analytics
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {insightCards.map((card) => (
          <Card
            key={card.label}
            className={`rounded-2xl border border-slate-200/80 shadow-sm transition-all hover:shadow-md ${card.bgColor} ${card.borderColor}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.bgColor} ${card.borderColor}`}
                >
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate">
                  {card.label}
                </p>
              </div>
              <p className={`text-base font-extrabold font-heading ${card.color} truncate`}>
                {card.value}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution Chart */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-teal-700" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Category Distribution
                </h4>
              </div>
              <Badge className="bg-teal-50 text-teal-700 text-[10px] font-bold">
                {insights.categoryDistribution.length} Categories
              </Badge>
            </div>

            <div className="space-y-3 pt-2">
              {insights.categoryDistribution.slice(0, 6).map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.name}</span>
                    <span className="text-slate-500">{cat.count} ({cat.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-600 transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Trend Chart */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-700" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Monthly Activity Trend (6 Months)
                </h4>
              </div>
              <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold">
                Volume
              </Badge>
            </div>

            <div className="flex items-end justify-between gap-3 pt-6 h-40">
              {insights.monthlyTrend.map((m) => {
                const heightPercent = Math.max(12, Math.round((m.count / insights.maxTrendCount) * 100));
                return (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-600">{m.count}</span>
                    <div className="w-full bg-slate-100 rounded-t-lg h-28 flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-teal-600 to-teal-500 transition-all duration-500"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
