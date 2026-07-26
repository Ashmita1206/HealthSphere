import { useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MedicalTagsProps {
  label: string;
  tags?: unknown;
  placeholder: string;
  color: 'rose' | 'amber' | 'blue' | 'purple';
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

const colorClasses = {
  rose: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
};

export function MedicalTags({
  label,
  tags,
  placeholder,
  color,
  onAdd,
  onRemove,
}: MedicalTagsProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const safeTags = Array.isArray(tags) ? tags : [];

  const handleAdd = () => {
    const nextTag = inputValue.trim();
    if (!nextTag) return;

    if (
      safeTags.some(
        (tag) =>
          typeof tag === 'string' &&
          tag.toLowerCase() === nextTag.toLowerCase(),
      )
    ) {
      setInputValue('');
      return;
    }

    onAdd(nextTag);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
    if (event.key === 'Escape') {
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    onRemove(index);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <AlertCircle
          className={`h-3.5 w-3.5 ${
            color === 'rose' ? 'text-rose-600' : 'text-slate-500'
          }`}
        />
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
          aria-label={`Add ${label}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="h-10 text-xs font-bold rounded-xl"
          aria-label={`Add ${label}`}
        >
          Add
        </Button>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="list"
        aria-label={`${label} list`}
      >
        {safeTags.map((tag, index) => {
          const safeTag = typeof tag === 'string' ? tag : String(tag);

          return (
            <Badge
              key={`${safeTag}-${index}`}
              className={`text-xs font-bold px-3 py-1 rounded-full ${colorClasses[color]} flex items-center gap-1 cursor-pointer`}
              role="listitem"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === 'Delete') {
                  handleRemove(index);
                }
              }}
              onClick={() => handleRemove(index)}
              aria-label={`Remove ${safeTag}`}
            >
              {safeTag}
              <span aria-hidden="true">×</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
