import { memo } from 'react';
import { MessageSquare, Calendar, Trash2, Pin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Conversation } from './types';

interface ConversationCardProps {
  conversation: Conversation;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onPin?: (id: string) => void;
}

export const ConversationCard = memo(function ConversationCard({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onPin,
}: ConversationCardProps) {
  const formattedDate = new Date(conversation.lastMessageAt || new Date()).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      onClick={() => onSelect(conversation._id)}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 hover:border-teal-300 hover:shadow-md ${
        isSelected
          ? 'border-teal-600 bg-teal-50/70 shadow-sm'
          : 'border-slate-200 bg-white'
      }`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-teal-800 transition-colors">
              {conversation.title || 'Clinical Consultation'}
            </h4>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            {onPin && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(conversation._id);
                }}
                className={`h-7 w-7 rounded-lg ${conversation.isPinned ? 'text-teal-700 bg-teal-100' : 'text-slate-400 hover:text-slate-700'}`}
                title={conversation.isPinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation._id);
              }}
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Delete conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {conversation.previewText && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {conversation.previewText}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-teal-700 group-hover:translate-x-0.5 transition-transform">
            Resume <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
});
