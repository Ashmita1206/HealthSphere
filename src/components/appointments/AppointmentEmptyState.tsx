import { memo } from 'react';
import { Calendar, Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AppointmentEmptyStateProps {
  type: 'default' | 'search' | 'filter' | 'completed';
  onAction: () => void;
}

export const AppointmentEmptyState = memo(function AppointmentEmptyState({
  type,
  onAction,
}: AppointmentEmptyStateProps) {
  const config = {
    default: {
      icon: Calendar,
      title: 'No Appointments Scheduled',
      description: 'Book a consultation with board-certified physicians and specialists.',
      buttonText: 'Book First Appointment',
      buttonIcon: Plus,
    },
    search: {
      icon: Search,
      title: 'No Appointments Found',
      description: 'Try adjusting your search terms to find what you are looking for.',
      buttonText: 'Clear Search',
      buttonIcon: X,
    },
    filter: {
      icon: Calendar,
      title: 'No Appointments Match Filter',
      description: 'Try changing your filter criteria to see more results.',
      buttonText: 'Clear Filters',
      buttonIcon: X,
    },
    completed: {
      icon: Calendar,
      title: 'No Completed Appointments',
      description: 'Your completed appointments will appear here.',
      buttonText: 'View All Appointments',
      buttonIcon: Calendar,
    },
  };

  const { icon: Icon, title, description, buttonText, buttonIcon: ButtonIcon } = config[type];

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
          <Icon className="h-8 w-8 stroke-[1.8]" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 font-heading">{title}</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">{description}</p>
        </div>
        <Button
          onClick={onAction}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
        >
          <ButtonIcon className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
});
