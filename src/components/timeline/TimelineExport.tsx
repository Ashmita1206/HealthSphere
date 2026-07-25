import { memo, useCallback } from 'react';
import { Download, FileJson, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadTimelineCsv } from './timelineUtils';
import { downloadTimelineJson } from './timelineHelpers';
import type { TimelineEvent } from './timelineTypes';

interface TimelineExportProps {
  events: TimelineEvent[];
}

export const TimelineExport = memo(function TimelineExport({
  events,
}: TimelineExportProps) {
  const handleCsvExport = useCallback(() => {
    downloadTimelineCsv(events);
  }, [events]);

  const handleJsonExport = useCallback(() => {
    downloadTimelineJson(events);
  }, [events]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-timeline-no-print
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCsvExport}
        disabled={events.length === 0}
        className="h-9 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Export visible timeline as CSV"
      >
        <Download className="h-3.5 w-3.5 mr-1.5" />
        CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleJsonExport}
        disabled={events.length === 0}
        className="h-9 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Export visible timeline as JSON"
      >
        <FileJson className="h-3.5 w-3.5 mr-1.5" />
        JSON
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handlePrint}
        disabled={events.length === 0}
        className="h-9 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label="Print visible health timeline"
      >
        <Printer className="h-3.5 w-3.5 mr-1.5" />
        Print
      </Button>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          [data-timeline-print-root],
          [data-timeline-print-root] * { visibility: visible !important; }
          [data-timeline-print-root] {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            padding: 0 !important;
            background: white !important;
          }
          [data-timeline-no-print] { display: none !important; }
          [data-timeline-print-root] .sticky { position: static !important; }
          [data-timeline-print-root] article,
          [data-timeline-print-root] section { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
});
