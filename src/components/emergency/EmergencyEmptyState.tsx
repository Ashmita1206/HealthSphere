import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Clock, Plus } from 'lucide-react';

interface EmergencyEmptyStateProps {
  type: 'no-contacts' | 'no-hospital' | 'no-history';
  onAction: () => void;
}

export const EmergencyEmptyState = memo(function EmergencyEmptyState({
  type,
  onAction,
}: EmergencyEmptyStateProps) {
  const config = {
    'no-contacts': {
      icon: Phone,
      title: 'No Emergency Contacts',
      description: 'Add emergency contacts for quick access during emergencies.',
      buttonText: 'Add Contact',
      buttonIcon: Plus,
    },
    'no-hospital': {
      icon: MapPin,
      title: 'No Nearby Hospitals',
      description: 'Enable location to find nearby hospitals.',
      buttonText: 'Enable Location',
      buttonIcon: MapPin,
    },
    'no-history': {
      icon: Clock,
      title: 'No Emergency History',
      description: 'Your emergency activity will appear here.',
      buttonText: 'Dismiss',
      buttonIcon: Plus,
    },
  };

  const { icon: Icon, title, description, buttonText, buttonIcon: ButtonIcon } = config[type];

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center">
          <Icon className="h-8 w-8 stroke-[1.8]" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 font-heading">{title}</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">{description}</p>
        </div>
        <Button
          onClick={onAction}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
        >
          <ButtonIcon className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
});
