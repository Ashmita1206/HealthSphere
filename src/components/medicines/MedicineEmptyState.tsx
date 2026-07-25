import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Plus, X } from 'lucide-react';

interface MedicineEmptyStateProps {
  onAction: () => void;
  type?: 'default' | 'search' | 'archive' | 'filter';
}

export const MedicineEmptyState = memo(function MedicineEmptyState({ onAction, type = 'default' }: MedicineEmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: Pill,
          title: 'No medicines found',
          description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
          buttonText: 'Clear Search',
          buttonIcon: X,
        };
      case 'archive':
        return {
          icon: Pill,
          title: 'No Archived Medicines',
          description: 'Archived medicines will appear here when you archive them.',
          buttonText: undefined,
          buttonIcon: undefined,
        };
      case 'filter':
        return {
          icon: Pill,
          title: 'No Medicines Match',
          description: 'No medicines match the current filter criteria.',
          buttonText: 'Clear Filters',
          buttonIcon: X,
        };
      default:
        return {
          icon: Pill,
          title: 'No Medicines in Cabinet',
          description: 'Add your active prescriptions to enable smart adherence logging and automated dosage reminders.',
          buttonText: 'Add First Prescription',
          buttonIcon: Plus,
        };
    }
  };

  const content = getContent();

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
          <content.icon className="h-8 w-8 stroke-[1.8]" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 font-heading">{content.title}</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">{content.description}</p>
        </div>
        {content.buttonText && (
          <Button
            type="button"
            onClick={onAction}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
          >
            {content.buttonIcon && (
              <content.buttonIcon className="w-4 h-4 mr-2" />
            )}
            {content.buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
