import { memo } from 'react';
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  FileClock,
  FileText,
  Link2,
  NotebookPen,
  Tags,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  TIMELINE_EVENT_CONFIG,
  TIMELINE_PRIORITY_CONFIG,
  TIMELINE_STATUS_CONFIG,
} from './timelineConstants';
import {
  formatTimelineDate,
  formatTimelineTime,
} from './timelineHelpers';
import type { TimelineEvent } from './timelineTypes';

interface TimelineDrawerProps {
  event: TimelineEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const prettifyKey = (key: string) =>
  key.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const TimelineDrawer = memo(function TimelineDrawer({
  event,
  open,
  onOpenChange,
}: TimelineDrawerProps) {
  if (!event) return null;

  const visual = TIMELINE_EVENT_CONFIG[event.type];
  const status = TIMELINE_STATUS_CONFIG[event.status];
  const priority = TIMELINE_PRIORITY_CONFIG[event.priority];
  const EventIcon = visual.icon;
  const metadataEntries = Object.entries(event.metadata).filter(
    ([, value]) => value !== null && value !== undefined && value !== '',
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-slate-200 sm:max-w-xl sm:rounded-l-3xl">
        <SheetHeader className="pr-8 text-left">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${visual.iconClass}`}
            >
              <EventIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-lg font-extrabold font-heading text-slate-900">
                {event.title}
              </SheetTitle>
              <SheetDescription className="mt-1 text-xs">
                {event.subtitle ?? event.category}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge className={`text-[10px] font-bold ${status.className}`}>
              {status.label}
            </Badge>
            <Badge className={`text-[10px] font-bold ${visual.badgeClass}`}>
              {event.category}
            </Badge>
            <Badge className={`text-[10px] font-bold ${priority.className}`}>
              {priority.label}
            </Badge>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
              <FileText className="h-4 w-4 text-teal-700" />
              Complete Details
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {event.description}
            </p>
            <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                {formatTimelineDate(event.timestamp)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-slate-400" />
                {formatTimelineTime(event.timestamp)}
              </span>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
              <Tags className="h-4 w-4 text-teal-700" />
              Related Information
            </h3>
            {metadataEntries.length > 0 ? (
              <dl className="mt-3 grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
                {metadataEntries.map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {prettifyKey(key)}
                    </dt>
                    <dd className="mt-0.5 break-words text-xs font-semibold text-slate-700">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                No related information is attached to this event.
              </p>
            )}
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
              <NotebookPen className="h-4 w-4 text-teal-700" />
              Notes
            </h3>
            <p className="mt-2 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600">
              {event.notes ?? 'No additional clinical notes were recorded.'}
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <FileClock className="h-3.5 w-3.5" />
                Created
              </span>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {formatTimelineDate(event.createdAt)} ·{' '}
                {formatTimelineTime(event.createdAt)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <FileClock className="h-3.5 w-3.5" />
                Updated
              </span>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {formatTimelineDate(event.updatedAt)} ·{' '}
                {formatTimelineTime(event.updatedAt)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 p-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-800">
              <Link2 className="h-4 w-4" />
              Linked Module
            </h3>
            <p className="mt-1 text-xs text-teal-800/80">
              {event.linkedModule ?? 'No linked module'} · Future integration
              placeholder
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="mt-3 h-8 rounded-lg border-teal-200 bg-white text-[10px] font-bold text-teal-800"
              title="TODO: Backend Integration"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Linked Record
            </Button>
            <p className="mt-2 text-[9px] text-teal-700/70">
              TODO: Backend Integration — connect this action to the originating
              module record.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
});
