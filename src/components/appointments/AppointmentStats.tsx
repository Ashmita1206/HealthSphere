import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, XCircle, Timer } from 'lucide-react';

interface AppointmentStatsProps {
  appointments: any[];
}

export const AppointmentStats = memo(function AppointmentStats({
  appointments,
}: AppointmentStatsProps) {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate.toDateString() === today.toDateString();
    }).length;

    const upcoming = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed';
    }).length;

    const completed = appointments.filter((apt) => apt.status === 'completed').length;
    const cancelled = appointments.filter((apt) => apt.status === 'cancelled').length;
    const missed = appointments.filter((apt) => apt.status === 'missed').length;

    // Next appointment countdown
    const futureAppointments = appointments
      .filter((apt) => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate > today && apt.status !== 'cancelled' && apt.status !== 'completed';
      })
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

    const nextAppointment = futureAppointments[0];
    let countdown = '';
    if (nextAppointment) {
      const diff = new Date(nextAppointment.appointment_date).getTime() - Date.now();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) {
        countdown = `${days}d ${hours}h`;
      } else {
        countdown = `${hours}h`;
      }
    }

    return {
      today: todayAppointments,
      upcoming,
      completed,
      cancelled,
      missed,
      countdown,
    };
  }, [appointments]);

  const cards = [
    {
      icon: Calendar,
      label: "Today's Appointments",
      value: stats.today,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      icon: Clock,
      label: 'Upcoming',
      value: stats.upcoming,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: stats.completed,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      icon: XCircle,
      label: 'Cancelled',
      value: stats.cancelled,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
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

      {stats.countdown && (
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-gradient-to-r from-teal-50 to-blue-50 border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-teal-200 flex items-center justify-center shrink-0">
                <Timer className="w-5 h-5 text-teal-700" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Next Appointment In
                </p>
                <p className="text-xl font-extrabold font-heading text-teal-700">
                  {stats.countdown}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
