import { memo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Apple,
  Brain,
  Droplets,
  FileText,
  HeartHandshake,
  Moon,
  Pill,
  Receipt,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Syringe,
  TestTube,
  UserCheck,
  Users,
  Baby,
} from 'lucide-react';
import { QUICK_PROMPT_CATEGORIES } from './promptsData';
import type { PromptItem } from './types';

interface QuickPromptsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPrompt: (promptText: string) => void;
}

const iconMap: Record<string, any> = {
  Pill,
  Stethoscope,
  Apple,
  Activity,
  Brain,
  Moon,
  Droplets,
  Scale,
  ShieldAlert,
  FileText,
  Receipt,
  TestTube,
  Syringe,
  HeartHandshake,
  UserCheck,
  Users,
  Baby,
  Sparkles,
};

export const QuickPromptsModal = memo(function QuickPromptsModal({
  open,
  onOpenChange,
  onSelectPrompt,
}: QuickPromptsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allPrompts = QUICK_PROMPT_CATEGORIES.flatMap((c) => c.prompts);

  const filteredPrompts = allPrompts.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl rounded-3xl border-slate-200 bg-white p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold font-heading text-slate-900">
                Clinical Prompt Library
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Choose from 18 specialized medical consultation prompts for instant AI analysis.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-3 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts (e.g. Metformin, Hypertension, Cholesterol, Symptoms)..."
              className="h-10 rounded-xl border-slate-200 pl-9 pr-4 text-xs focus-visible:ring-teal-600"
            />
          </div>

          {/* Category Tabs Scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <Button
              type="button"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={`h-8 rounded-full text-[11px] font-bold ${
                selectedCategory === 'all'
                  ? 'bg-teal-700 text-white hover:bg-teal-800'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              All Prompts ({allPrompts.length})
            </Button>
            {QUICK_PROMPT_CATEGORIES.map((cat) => {
              const IconComp = iconMap[cat.iconName] || Sparkles;
              const isSelected = selectedCategory === cat.label;
              return (
                <Button
                  key={cat.id}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`h-8 shrink-0 rounded-full px-3 text-[11px] font-bold ${
                    isSelected
                      ? 'bg-teal-700 text-white hover:bg-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <IconComp className="mr-1.5 h-3.5 w-3.5" />
                  {cat.label}
                </Button>
              );
            })}
          </div>

          {/* Prompts Grid */}
          <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
            {filteredPrompts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No matching prompts found for "{searchQuery}".
              </div>
            ) : (
              filteredPrompts.map((promptItem: PromptItem) => (
                <div
                  key={promptItem.id}
                  onClick={() => {
                    onSelectPrompt(promptItem.prompt);
                    onOpenChange(false);
                  }}
                  className="group flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-md"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectPrompt(promptItem.prompt);
                      onOpenChange(false);
                    }
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-teal-800 transition-colors">
                        {promptItem.title}
                      </h4>
                      {promptItem.badge && (
                        <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-[9px] font-bold uppercase">
                          {promptItem.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                      {promptItem.prompt}
                    </p>
                    <span className="mt-1.5 inline-block text-[10px] font-semibold text-slate-400">
                      Category: {promptItem.category}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-100"
                  >
                    Use Prompt
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
