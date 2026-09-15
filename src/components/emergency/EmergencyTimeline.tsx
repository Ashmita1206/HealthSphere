import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Share2, Phone, CheckCircle2, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'sos-triggered' | 'cancelled' | 'card-shared' | 'location-shared' | 'call-started';
  timestamp: string;
  description: string;
}

interface EmergencyTimelineProps {
  events: TimelineEvent[];
}

const dummyEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'sos-triggered',
    timestamp: '2024-01-15T10:30:00',
    description: 'SOS emergency alert triggered',
  },
  {
    id: '2',
    type: 'location-shared',
    timestamp: '2024-01-15T10:30:05',
    description: 'Location shared with emergency contacts',
  },
  {
    id: '3',
    type: 'card-shared',
    timestamp: '2024-01-15T10:30:10',
    description: 'Medical ID card shared',
  },
  {
    id: '4',
    type: 'call-started',
    timestamp: '2024-01-15T10:30:15',
    description: 'Emergency call initiated',
  },
];

const eventConfig = {
  'sos-triggered': {
    icon: AlertTriangle,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    label: 'SOS Triggered',
  },
  cancelled: {
    icon: XCircle,
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    label: 'Cancelled',
  },
  'card-shared': {
    icon: Share2,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Card Shared',
  },
  'location-shared': {
    icon: Share2,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Location Shared',
  },
  'call-started': {
    icon: Phone,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Call Started',
  },
};

export const EmergencyTimeline = memo(function EmergencyTimeline({
  events = [],
}: EmergencyTimelineProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Emergency History</h3>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No emergency history</p>
            </div>
          ) : (
            events.map((event, index) => {
              const config = eventConfig[event.type];
              const EventIcon = config.icon;

              return (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${config.color}`}
                    >
                      <EventIcon className="h-4 w-4" />
                    </div>
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={`text-[10px] font-bold ${config.color}`}>
                        {config.label}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{formatTime(event.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-700">{event.description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
});
