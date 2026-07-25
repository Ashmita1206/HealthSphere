import { useState } from 'react';
import { PlusCircle, MessageSquare, Search, Pin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Conversation } from './types';
import { ConversationItem } from './ConversationItem';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onPin?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onCloseMobile?: () => void;
}

export function ConversationSidebar({
  conversations,
  selectedConversation,
  onSelect,
  onDelete,
  onNewChat,
  onPin,
  onRename,
  onCloseMobile,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) =>
    !searchQuery || c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => c.isPinned);
  const recentConversations = filteredConversations.filter((c) => !c.isPinned);

  const handleSelect = (id: string) => {
    onSelect(id);
    onCloseMobile?.();
  };

  const handleNewChat = () => {
    onNewChat();
    onCloseMobile?.();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/70 border-r border-slate-200/70">
      <div className="p-3.5 pb-2 shrink-0 space-y-2">
        <Button
          className="w-full justify-start shadow-xs bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-all duration-200"
          onClick={handleNewChat}
          aria-label="Start new chat"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Clinical Chat
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chat history..."
            className="h-8 pl-8 pr-3 text-[11px] rounded-xl border-slate-200 bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pt-1 space-y-3">
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-800 px-2 mb-1.5">
              <Pin className="h-3 w-3 rotate-45 text-teal-600" /> Pinned Chats
            </div>
            {pinnedConversations.map((chat) => (
              <ConversationItem
                key={chat._id}
                conversation={chat}
                isSelected={selectedConversation === chat._id}
                onSelect={handleSelect}
                onDelete={onDelete}
                onPin={onPin}
                onRename={onRename}
              />
            ))}
          </div>
        )}

        {/* Recent Section */}
        <div>
          {pinnedConversations.length > 0 && (
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Recent Consultations
            </div>
          )}

          {recentConversations.length === 0 && pinnedConversations.length === 0 ? (
            <div className="text-center mt-8 py-6 opacity-60 flex flex-col items-center">
              <MessageSquare className="w-7 h-7 mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600">No conversations found</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Start a new clinical query above</p>
            </div>
          ) : (
            recentConversations.map((chat) => (
              <ConversationItem
                key={chat._id}
                conversation={chat}
                isSelected={selectedConversation === chat._id}
                onSelect={handleSelect}
                onDelete={onDelete}
                onPin={onPin}
                onRename={onRename}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

