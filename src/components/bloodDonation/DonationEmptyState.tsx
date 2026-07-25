import { memo } from 'react';
import { Droplet, Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DonationEmptyStateProps {
  type: 'default' | 'search' | 'filter' | 'no-donors' | 'no-requests' | 'no-history';
  onAction: () => void;
}

export const DonationEmptyState = memo(function DonationEmptyState({
  type,
  onAction,
}: DonationEmptyStateProps) {
  const config = {
    default: {
      icon: Droplet,
      title: 'No Blood Donation Activity',
      description: 'Start by finding donors or creating a blood request.',
      buttonText: 'Get Started',
      buttonIcon: Droplet,
    },
    search: {
      icon: Search,
      title: 'No Results Found',
      description: 'Try adjusting your search terms to find what you are looking for.',
      buttonText: 'Clear Search',
      buttonIcon: X,
    },
    filter: {
      icon: Droplet,
      title: 'No Results Match Filter',
      description: 'Try changing your filter criteria to see more results.',
      buttonText: 'Clear Filters',
      buttonIcon: X,
    },
    'no-donors': {
      icon: Droplet,
      title: 'No Donors Found',
      description: 'There are no donors matching your criteria.',
      buttonText: 'View All',
      buttonIcon: Droplet,
    },
    'no-requests': {
      icon: Droplet,
      title: 'No Blood Requests',
      description: 'There are no active blood requests at this time.',
      buttonText: 'Create Request',
      buttonIcon: Plus,
    },
    'no-history': {
      icon: Droplet,
      title: 'No Donation History',
      description: 'Your donation history will appear here.',
      buttonText: 'Donate Now',
      buttonIcon: Droplet,
    },
  };

  const { icon: Icon, title, description, buttonText, buttonIcon: ButtonIcon } = config[type];

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center">
          <Icon className="h-8 w-8 stroke-[1.8]" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 font-heading">{title}</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">{description}</p>
        </div>
        <Button
          onClick={onAction}
          className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
        >
          <ButtonIcon className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
});
