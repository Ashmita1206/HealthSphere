import { useState } from 'react';
import { MoreVertical, Trash2, MessageSquare, Pin, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Conversation } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onPin?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onPin,
  onRename,
}: ConversationItemProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title || '');

  const formattedDate = new Date(conversation.lastMessageAt || new Date()).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && onRename) {
      onRename(conversation._id, newTitle.trim());
      setIsRenameOpen(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'group relative flex items-center rounded-xl border transition-all duration-200 mb-1.5 cursor-pointer',
          isSelected
            ? 'bg-teal-700 text-white border-teal-700 shadow-sm font-semibold'
            : 'bg-card hover:bg-slate-100/70 border-slate-200/80 hover:border-teal-200 text-slate-700'
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
        <div className="flex-1 min-w-0 p-2.5 pr-0">
          <div className="flex items-center gap-2 mb-0.5">
            <MessageSquare
              className={cn(
                'w-3.5 h-3.5 shrink-0',
                isSelected ? 'text-white' : 'text-slate-400 group-hover:text-teal-700'
              )}
            />
            <p className="truncate text-xs font-bold leading-tight">
              {conversation.title || 'New Conversation'}
            </p>
            {conversation.isPinned && (
              <Pin className={cn('w-3 h-3 shrink-0 rotate-45', isSelected ? 'text-teal-200' : 'text-teal-600')} />
            )}
          </div>
          <p
            className={cn(
              'text-[10px] truncate ml-5.5 font-medium',
              isSelected ? 'text-teal-100' : 'text-slate-400'
            )}
          >
            {formattedDate}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'mr-1 h-7 w-7 shrink-0 rounded-lg transition-opacity',
                isSelected
                  ? 'text-white hover:bg-white/20'
                  : 'opacity-0 group-hover:opacity-100 text-slate-500 hover:bg-slate-200'
              )}
              onClick={(e) => e.stopPropagation()}
              aria-label="Conversation actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
            {onPin && (
              <DropdownMenuItem
                className="cursor-pointer text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(conversation._id);
                }}
              >
                <Pin className="mr-2 h-3.5 w-3.5 text-teal-600" />
                {conversation.isPinned ? 'Unpin Conversation' : 'Pin to Top'}
              </DropdownMenuItem>
            )}

            {onRename && (
              <DropdownMenuItem
                className="cursor-pointer text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewTitle(conversation.title || '');
                  setIsRenameOpen(true);
                }}
              >
                <Edit3 className="mr-2 h-3.5 w-3.5 text-blue-600" />
                Rename Title
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation._id);
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="w-full max-w-sm rounded-2xl p-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-sm font-bold">Rename Conversation</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter a new clinical title for this conversation log.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRenameSubmit} className="space-y-4 mt-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Metformin Dosage Inquiry"
              className="h-10 text-xs rounded-xl"
              autoFocus
            />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRenameOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold">
                Save Title
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

