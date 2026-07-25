import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Archive, Trash2, X } from 'lucide-react';

interface MedicineBulkActionsProps {
  selectedCount: number;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const MedicineBulkActions = memo(function MedicineBulkActions({
  selectedCount,
  onArchive,
  onDelete,
  onClearSelection,
}: MedicineBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-teal-50 border border-teal-200">
      <p className="text-sm font-bold text-teal-800">
        {selectedCount} medicine{selectedCount !== 1 ? 's' : ''} selected
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onArchive}
          className="h-8 text-xs font-bold rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          <Archive className="h-3.5 w-3.5 mr-1.5" />
          Archive
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="h-8 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900"
        >
          <X className="h-3.5 w-3.5 mr-1.5" />
          Clear
        </Button>
      </div>
    </div>
  );
});
