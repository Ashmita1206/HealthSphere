import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Phone, Heart, MapPin, CheckCircle2 } from 'lucide-react';

interface EmergencyDashboardProps {
  sosReady: boolean;
  emergencyContactsCount: number;
  medicalCardComplete: boolean;
  locationEnabled: boolean;
}

export const EmergencyDashboard = memo(function EmergencyDashboard({
  sosReady,
  emergencyContactsCount,
  medicalCardComplete,
  locationEnabled,
}: EmergencyDashboardProps) {
  const cards = [
    {
      icon: Shield,
      label: 'Emergency Status',
      value: sosReady ? 'Ready' : 'Setup Required',
      color: sosReady ? 'text-emerald-700' : 'text-amber-700',
      bgColor: sosReady ? 'bg-emerald-50' : 'bg-amber-50',
      borderColor: sosReady ? 'border-emerald-100' : 'border-amber-100',
    },
    {
      icon: Phone,
      label: 'Emergency Contacts',
      value: emergencyContactsCount,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      icon: Heart,
      label: 'Medical ID Status',
      value: medicalCardComplete ? 'Complete' : 'Incomplete',
      color: medicalCardComplete ? 'text-emerald-700' : 'text-rose-700',
      bgColor: medicalCardComplete ? 'bg-emerald-50' : 'bg-rose-50',
      borderColor: medicalCardComplete ? 'border-emerald-100' : 'border-rose-100',
    },
    {
      icon: MapPin,
      label: 'Location Status',
      value: locationEnabled ? 'Enabled' : 'Disabled',
      color: locationEnabled ? 'text-emerald-700' : 'text-slate-500',
      bgColor: locationEnabled ? 'bg-emerald-50' : 'bg-slate-50',
      borderColor: locationEnabled ? 'border-emerald-100' : 'border-slate-200',
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
                <p className={`text-lg font-extrabold font-heading ${card.color}`}>
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
