import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Droplets,
  History,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPlaceholderTimelineEvents } from '@/components/timeline/timelineData';
import {
  formatTimelineDate,
  formatTimelineTime,
} from '@/components/timeline/timelineHelpers';

interface CareNetworkWidgetProps {
  bloodType?: string;
}

const linkClass =
  'inline-flex items-center gap-1 text-xs font-bold text-teal-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2';

export const CareNetworkWidget = memo(function CareNetworkWidget({
  bloodType,
}: CareNetworkWidgetProps) {
  const recentEvents = useMemo(
    () =>
      createPlaceholderTimelineEvents()
        .sort(
          (left, right) =>
            new Date(right.timestamp).getTime() -
            new Date(left.timestamp).getTime(),
        )
        .slice(0, 3),
    [],
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <History className="h-4 w-4 text-teal-700" />
            Timeline Preview
          </CardTitle>
          <Link to="/timeline" className={linkClass}>
            View timeline <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {recentEvents.map((event) => (
            <Link
              key={event.id}
              to="/timeline"
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-teal-200 hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600 ring-4 ring-teal-100" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-slate-900">
                  {event.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  {formatTimelineDate(event.timestamp)} · {formatTimelineTime(event.timestamp)}
                </span>
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-700">
                <Droplets className="h-5 w-5" />
              </div>
              <Badge className="border-rose-200 bg-rose-50 text-rose-700">
                {bloodType || 'Blood type not set'}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Blood Donation Network
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Review active requests, eligibility, donation history, and nearby donors.
              </p>
            </div>
          </div>
          <Link to="/blood-donation" className={linkClass}>
            Open donation center <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white to-rose-50 shadow-sm">
        <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <Clock3 className="mr-1 h-3 w-3" />
                Available 24/7
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Emergency Readiness
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Keep your medical ID, emergency contacts, hospital access, and SOS tools ready.
              </p>
            </div>
          </div>
          <Link to="/emergency" className="inline-flex items-center gap-1 rounded-md text-xs font-bold text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2">
            Review emergency setup <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
});
