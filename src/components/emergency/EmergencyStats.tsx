import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Phone, MapPin, Shield } from 'lucide-react';

interface EmergencyStatsProps {
  sosSent: number;
  emergencyContacts: number;
  nearbyHospitals: number;
  preparednessScore: number;
}

export const EmergencyStats = memo(function EmergencyStats({
  sosSent,
  emergencyContacts,
  nearbyHospitals,
  preparednessScore,
}: EmergencyStatsProps) {
  const cards = [
    {
      icon: AlertTriangle,
      label: 'SOS Sent',
      value: sosSent,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      icon: Phone,
      label: 'Emergency Contacts',
      value: emergencyContacts,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      icon: MapPin,
      label: 'Nearby Hospitals',
      value: nearbyHospitals,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      icon: Shield,
      label: 'Preparedness Score',
      value: `${preparednessScore}%`,
      color: preparednessScore >= 80 ? 'text-emerald-700' : preparednessScore >= 50 ? 'text-amber-700' : 'text-rose-700',
      bgColor: preparednessScore >= 80 ? 'bg-emerald-50' : preparednessScore >= 50 ? 'bg-amber-50' : 'bg-rose-50',
      borderColor: preparednessScore >= 80 ? 'border-emerald-100' : preparednessScore >= 50 ? 'border-amber-100' : 'border-rose-100',
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
