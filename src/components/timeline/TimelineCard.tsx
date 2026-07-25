import { memo, useState, useCallback } from 'react';
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  Eye,
  FileCheck,
  Flag,
  Paperclip,
  Stethoscope,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  TIMELINE_EVENT_CONFIG,
  TIMELINE_PRIORITY_CONFIG,
  TIMELINE_STATUS_CONFIG,
} from './timelineConstants';
import {
  formatTimelineDate,
  formatTimelineTime,
} from './timelineHelpers';
import type { TimelineEvent, TimelineViewMode } from './timelineTypes';

interface TimelineCardProps {
  event: TimelineEvent;
  viewMode: TimelineViewMode;
  onOpen: (event: TimelineEvent) => void;
}

export const TimelineCard = memo(function TimelineCard({
  event,
  viewMode,
  onOpen,
}: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visual = TIMELINE_EVENT_CONFIG[event.type] ?? TIMELINE_EVENT_CONFIG.custom;
  const status = TIMELINE_STATUS_CONFIG[event.status];
  const priority = TIMELINE_PRIORITY_CONFIG[event.priority];
  const EventIcon = visual.icon;
  const compact = viewMode === 'compact';

  const doctor = event.metadata.doctor;
  const hospital = event.metadata.hospital;
  const hasAttachments = Array.isArray(event.attachments) && event.attachments.length > 0;
  const hasTags = Array.isArray(event.tags) && event.tags.length > 0;

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <Card
      className={`group relative min-w-0 overflow-hidden border border-slate-200/80 bg-white shadow-sm transition-all hover:border-teal-200 hover:shadow-md ${
        compact ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(event)}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
        aria-label={`Open details for ${event.title}`}
      />

      <CardContent
        className={`pointer-events-none relative z-10 ${
          compact ? 'p-3.5' : 'p-5'
        }`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex shrink-0 items-center justify-center rounded-xl border ${visual.iconClass} ${
              compact ? 'h-9 w-9' : 'h-11 w-11'
            }`}
          >
            <EventIcon
              className={compact ? 'h-4 w-4' : 'h-5 w-5'}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className={`truncate font-extrabold text-slate-900 transition-colors group-hover:text-teal-800 ${
                    compact ? 'text-sm' : 'text-base'
                  }`}
                >
                  {event.title}
                </h3>
                {event.subtitle && (
                  <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                    {event.subtitle}
                  </p>
                )}
              </div>
              <Badge
                className={`shrink-0 text-[9px] font-bold uppercase tracking-wider ${status.className}`}
              >
                {status.label}
              </Badge>
            </div>

            <p
              className={`mt-2 text-xs leading-relaxed text-slate-600 ${
                compact && !isExpanded
                  ? 'line-clamp-1'
                  : isExpanded
                  ? ''
                  : 'line-clamp-2'
              }`}
            >
              {event.description}
            </p>

            {/* Doctor & Hospital metadata badges */}
            {(doctor || hospital) && (
              <div className="mt-2.5 flex flex-wrap gap-2 text-[10px]">
                {doctor && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
                    <Stethoscope className="h-3 w-3 text-teal-600" aria-hidden="true" />
                    {doctor}
                  </span>
                )}
                {hospital && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
                    <Building2 className="h-3 w-3 text-blue-600" aria-hidden="true" />
                    {hospital}
                  </span>
                )}
              </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                {event.notes && (
                  <div>
                    <span className="font-bold text-slate-700">Notes: </span>
                    <p className="mt-0.5 rounded-lg bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-600">
                      {event.notes}
                    </p>
                  </div>
                )}

                {hasAttachments && (
                  <div>
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <Paperclip className="h-3.5 w-3.5 text-teal-600" /> Attachments:
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {event.attachments!.map((att, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800"
                        >
                          <FileCheck className="h-3 w-3 text-teal-600" />
                          {att.name} {att.size && `(${att.size})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasTags && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    {event.tags!.map((t) => (
                      <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatTimelineDate(event.timestamp)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {formatTimelineTime(event.timestamp)}
              </span>
              <Badge
                className={`px-2 py-0 text-[9px] ${visual.badgeClass}`}
              >
                {event.category}
              </Badge>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${priority.className}`}
              >
                <Flag className="h-3 w-3" aria-hidden="true" />
                {priority.label}
              </span>
              {hasAttachments && !isExpanded && (
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700">
                  <Paperclip className="h-3 w-3" aria-hidden="true" />
                  {event.attachments!.length} file
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className={`pointer-events-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 ${
            compact ? 'mt-2 pt-2' : 'mt-4 pt-3'
          }`}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            aria-expanded={isExpanded}
            aria-controls={`event-details-${event.id}`}
            className="h-8 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                More
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpen(event)}
              className="h-8 rounded-lg text-[10px] font-bold text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label={`View complete details for ${event.title}`}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Details
            </Button>
            {!compact && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="h-8 rounded-lg text-[10px] font-bold"
                title="TODO: Backend Integration"
                aria-label={`Open linked ${event.linkedModule ?? 'module'} when integration is available`}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Linked Module
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
