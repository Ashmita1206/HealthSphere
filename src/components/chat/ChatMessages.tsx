import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';
import { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestionClick: (text: string) => void;
}

export function ChatMessages({ messages, isLoading, onSuggestionClick }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll logic
  useEffect(() => {
    // Only smooth scroll if a NEW message was added (not just initial history load)
    if (messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, isLoading]);

  return (
    <ScrollArea className="flex-1 bg-background" ref={scrollViewportRef}>
      <div className="p-4 space-y-6 max-w-3xl mx-auto">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={onSuggestionClick} />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </ScrollArea>
  );
}
