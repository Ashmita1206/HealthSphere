import { PlusCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';
import { ConversationItem } from './ConversationItem';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onCloseMobile?: () => void; // Optional callback to close mobile sidebar on select
}

export function ConversationSidebar({
  conversations,
  selectedConversation,
  onSelect,
  onDelete,
  onNewChat,
  onCloseMobile,
}: ConversationSidebarProps) {
  
  const handleSelect = (id: string) => {
    onSelect(id);
    onCloseMobile?.();
  };

  const handleNewChat = () => {
    onNewChat();
    onCloseMobile?.();
  };

  return (
    <div className="flex flex-col h-full w-full bg-muted/20">
      <div className="p-4 pb-2 shrink-0">
        <Button
          className="w-full justify-start shadow-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground transition-all duration-300"
          onClick={handleNewChat}
          aria-label="Start new chat"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center mt-10 opacity-50 flex flex-col items-center">
            <MessageSquare className="w-8 h-8 mb-2" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          conversations.map((chat) => (
            <ConversationItem
              key={chat._id}
              conversation={chat}
              isSelected={selectedConversation === chat._id}
              onSelect={handleSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
