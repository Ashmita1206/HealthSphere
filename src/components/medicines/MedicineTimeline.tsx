import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Edit, Archive } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'started' | 'taken' | 'missed' | 'edited' | 'completed' | 'archived';
  date: string;
  time?: string;
  description: string;
}

interface MedicineTimelineProps {
  events: TimelineEvent[];
}

export function MedicineTimeline({ events }: MedicineTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'started': return { icon: Calendar, color: 'text-teal-700', bgColor: 'bg-teal-50' };
      case 'taken': return { icon: CheckCircle2, color: 'text-emerald-700', bgColor: 'bg-emerald-50' };
      case 'missed': return { icon: XCircle, color: 'text-rose-700', bgColor: 'bg-rose-50' };
      case 'edited': return { icon: Edit, color: 'text-blue-700', bgColor: 'bg-blue-50' };
      case 'completed': return { icon: CheckCircle2, color: 'text-purple-700', bgColor: 'bg-purple-50' };
      case 'archived': return { icon: Archive, color: 'text-slate-600', bgColor: 'bg-slate-100' };
      default: return { icon: Clock, color: 'text-slate-500', bgColor: 'bg-slate-50' };
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'started': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'taken': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'missed': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'edited': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'archived': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="p-5">
        <h4 className="text-sm font-extrabold text-slate-900 font-heading mb-4">Medicine Timeline</h4>
        
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No timeline events yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, idx) => {
              const { icon: Icon, color, bgColor } = getEventIcon(event.type);
              return (
                <div key={event.id} className="flex gap-3 relative">
                  {idx !== events.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-100 -translate-x-1/2" />
                  )}
                  <div className={`w-8 h-8 rounded-full ${bgColor} border border-slate-200 flex items-center justify-center shrink-0 z-10`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{event.description}</span>
                      <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getEventBadge(event.type)}`}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      {event.time && (
                        <>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{event.time}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
