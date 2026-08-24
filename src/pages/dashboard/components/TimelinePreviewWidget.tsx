import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, Activity, Calendar, Pill, FileText, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTimelineDate } from '@/components/timeline/timelineHelpers';

interface TimelinePreviewWidgetProps {
  events?: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: string;
  }>;
}

export const TimelinePreviewWidget = memo(function TimelinePreviewWidget({ events }: TimelinePreviewWidgetProps) {
  const navigate = useNavigate();
  const sampleEvents = useMemo(() => {
    if (events && Array.isArray(events) && events.length > 0) {
      return events.slice(0, 4);
    }
    return [];
  }, [events]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-3.5 w-3.5 text-blue-600" />;
      case 'medicine':
        return <Pill className="h-3.5 w-3.5 text-emerald-600" />;
      case 'report':
        return <FileText className="h-3.5 w-3.5 text-violet-600" />;
      default:
        return <Stethoscope className="h-3.5 w-3.5 text-teal-600" />;
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white flex flex-col justify-between">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                Recent Clinical Timeline
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Longitudinal patient events & care history
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/timeline')}
            className="text-xs font-bold text-teal-700 hover:bg-teal-50 h-8 rounded-xl gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {sampleEvents.length > 0 ? (
          sampleEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => navigate('/timeline')}
              className="group flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 transition-all hover:bg-teal-50/50 hover:border-teal-200 cursor-pointer"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs border border-slate-200/60 mt-0.5">
                  {getIcon(evt.type)}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-xs text-slate-900 truncate group-hover:text-teal-800 transition-colors">
                    {evt.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {evt.description}
                  </p>
                </div>
              </div>

              <Badge className="bg-slate-200/70 text-slate-700 border-none text-[9px] font-semibold shrink-0">
                {formatTimelineDate(evt.timestamp)}
              </Badge>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-slate-500 font-medium">
            No recorded patient events yet. Appointments, lab uploads, and prescriptions will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
});
