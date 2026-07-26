import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { EmptyChat } from './EmptyChat';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestionClick: (text: string) => void;
  onRegenerate?: () => void;
  onOpenPromptsModal?: () => void;
}

export function ChatMessages({
  messages,
  isLoading,
  onSuggestionClick,
  onRegenerate,
  onOpenPromptsModal,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll logic
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, isLoading]);

  return (
    <ScrollArea className="flex-1 bg-background/30">
      <div className="p-3 sm:p-5 space-y-4 max-w-3xl mx-auto">
        {messages.length === 0 ? (
          <EmptyChat
            onSuggestionClick={onSuggestionClick}
            onOpenPromptsModal={onOpenPromptsModal}
          />
        ) : (
          messages.map((message, index) => {
            const isLastAssistant =
              message.role === 'assistant' && index === messages.length - 1;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                onSuggestionClick={onSuggestionClick}
                onRegenerate={isLastAssistant ? onRegenerate : undefined}
              />
            );
          })
        )}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </ScrollArea>
  );
}

