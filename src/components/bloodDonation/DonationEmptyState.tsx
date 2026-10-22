import { memo } from 'react';
import {
  Droplet,
  Plus,
  Search,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ServerOff,
  History,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type EmptyStateType =
  | 'default'
  | 'search'
  | 'filter'
  | 'no-donors'
  | 'no-matching-donors'
  | 'no-requests'
  | 'no-matching-requests'
  | 'no-history'
  | 'api-error'
  | 'unauthorized'
  | 'inventory-unconfigured';

interface DonationEmptyStateProps {
  type: EmptyStateType;
  customMessage?: string;
  onAction?: () => void;
}

export const DonationEmptyState = memo(function DonationEmptyState({
  type,
  customMessage,
  onAction,
}: DonationEmptyStateProps) {
  const configs: Record<
    EmptyStateType,
    {
      icon: any;
      title: string;
      description: string;
      buttonText?: string;
      buttonIcon?: any;
      colorClass: string;
    }
  > = {
    default: {
      icon: Droplet,
      title: 'No Donation Activity Found',
      description: 'Start by finding volunteer donors or creating a clinical blood request.',
      buttonText: 'Create Blood Request',
      buttonIcon: Plus,
      colorClass: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    search: {
      icon: Search,
      title: 'No Matching Results Found',
      description: 'We couldn’t find any donors or blood requests matching your search query.',
      buttonText: 'Reset Search',
      buttonIcon: RotateCcw,
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    filter: {
      icon: RotateCcw,
      title: 'No Results Match Active Filters',
      description: 'Try adjusting your blood group, status, or urgency criteria to expand matches.',
      buttonText: 'Clear Filters',
      buttonIcon: RotateCcw,
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    'no-donors': {
      icon: Droplet,
      title: 'No Registered Donors Available',
      description: 'There are currently no volunteer donors listed in this regional registry.',
      buttonText: 'Become a Donor',
      buttonIcon: Droplet,
      colorClass: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    'no-matching-donors': {
      icon: Search,
      title: 'No Donors Match Criteria',
      description: 'No registered donors match your selected blood group or availability filter.',
      buttonText: 'Reset Donor Filters',
      buttonIcon: RotateCcw,
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    'no-requests': {
      icon: Droplet,
      title: 'No Active Blood Requests',
      description: 'There are no open blood requests currently awaiting donor matching.',
      buttonText: 'Create Request',
      buttonIcon: Plus,
      colorClass: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    'no-matching-requests': {
      icon: Search,
      title: 'No Requests Match Criteria',
      description: 'No requests match your current blood group, status, or urgency filter.',
      buttonText: 'Clear Request Filters',
      buttonIcon: RotateCcw,
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    'no-history': {
      icon: History,
      title: 'No Donation History Recorded',
      description: 'Your verified voluntary donations and past contributions will appear here.',
      buttonText: 'Log a Donation',
      buttonIcon: Droplet,
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    'api-error': {
      icon: ServerOff,
      title: 'Unable to Load Data',
      description: customMessage || 'A network error occurred while communicating with the health registry service.',
      buttonText: 'Retry Connection',
      buttonIcon: RotateCcw,
      colorClass: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    unauthorized: {
      icon: ShieldAlert,
      title: 'Authentication Required',
      description: 'Please sign in with a verified account to view donor contacts and register requests.',
      buttonText: 'Sign In',
      buttonIcon: ShieldAlert,
      colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    'inventory-unconfigured': {
      icon: Building2,
      title: 'Blood-Bank Inventory Integration Not Configured',
      description:
        'Official institutional access to government e-RaktKosh / HIMS live stock is pending institutional authorization. Showing verified internal directory facilities.',
      buttonText: 'View Available Facilities',
      buttonIcon: Building2,
      colorClass: 'bg-teal-50 text-teal-800 border-teal-200',
    },
  };

  const item = configs[type] || configs.default;
  const Icon = item.icon;
  const ButtonIcon = item.buttonIcon;

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
      <CardContent className="flex flex-col items-center justify-center py-14 text-center px-6 space-y-4">
        <div className={`w-14 h-14 rounded-2xl ${item.colorClass} border flex items-center justify-center shadow-xs`}>
          <Icon className="h-7 w-7 stroke-[1.8]" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-extrabold text-slate-900 font-heading">{item.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
        </div>
        {item.buttonText && onAction && (
          <Button
            onClick={onAction}
            className="bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
          >
            {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-1.5" />}
            {item.buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
