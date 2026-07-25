import { memo, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface EmergencyChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
}

const defaultItems: ChecklistItem[] = [
  { id: 'medicines', label: 'Carry medicines', checked: false },
  { id: 'identity', label: 'Identity card', checked: false },
  { id: 'insurance', label: 'Insurance documents', checked: false },
  { id: 'contact', label: 'Emergency contact', checked: false },
  { id: 'water', label: 'Water bottle', checked: false },
  { id: 'cash', label: 'Cash', checked: false },
  { id: 'phone', label: 'Charged phone', checked: false },
  { id: 'powerbank', label: 'Power bank', checked: false },
  { id: 'firstaid', label: 'First aid kit', checked: false },
  { id: 'snacks', label: 'Emergency snacks', checked: false },
];

export const EmergencyChecklist = memo(function EmergencyChecklist({
  items = defaultItems,
  onToggle,
}: EmergencyChecklistProps) {
  const [localItems, setLocalItems] = useState<ChecklistItem[]>(items);

  const completedCount = useMemo(() => {
    return localItems.filter((item) => item.checked).length;
  }, [localItems]);

  const progress = useMemo(() => {
    return (completedCount / localItems.length) * 100;
  }, [completedCount, localItems.length]);

  const handleToggle = (id: string) => {
    const updatedItems = localItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );
    setLocalItems(updatedItems);
    onToggle(id);
  };

  const handleReset = () => {
    setLocalItems(localItems.map((item) => ({ ...item, checked: false })));
  };

  return (
    <Card className="rounded-2xl border:border-slate-200/80 shadow-sm bg-white">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Emergency Checklist</h3>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Preparedness</span>
            <span className="font-bold text-slate-900">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {localItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={() => handleToggle(item.id)}
                className="rounded-lg border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label
                htmlFor={item.id}
                className={`text-xs cursor-pointer ${
                  item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
                }`}
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
