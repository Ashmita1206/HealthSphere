import { MoreVertical, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Conversation } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({ conversation, isSelected, onSelect, onDelete }: ConversationItemProps) {
  // Format the date for the sidebar
  const formattedDate = new Date(conversation.lastMessageAt || new Date()).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div
      className={cn(
        'group flex items-center rounded-xl border transition-all duration-200 mb-2 cursor-pointer',
        isSelected
          ? 'bg-primary text-primary-foreground border-primary shadow-md'
          : 'bg-card hover:bg-accent border-border hover:border-primary/30',
      )}
      onClick={() => onSelect(conversation._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(conversation._id);
        }
      }}
    >
      <div className="flex-1 min-w-0 p-3 pr-0">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")} />
          <p className="truncate text-sm font-semibold leading-none">
            {conversation.title || 'New Conversation'}
          </p>
        </div>
        <p className={cn("text-xs truncate ml-5.5", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {formattedDate}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "mr-1 h-8 w-8 shrink-0 transition-opacity",
              isSelected ? "text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => e.stopPropagation()} // Prevent triggering onSelect when opening menu
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conversation._id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
