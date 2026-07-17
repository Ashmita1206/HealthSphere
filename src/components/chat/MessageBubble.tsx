import { memo } from 'react';
import { Bot, User, Volume2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Message } from './types';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const { toast } = useToast();
  const isUser = message.role === 'user';

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: 'Error',
        description: 'Text-to-speech is not supported in this browser.',
        variant: 'destructive',
      });
    }
  };

  const getRiskBadge = (riskLevel?: Message['riskLevel']) => {
    if (!riskLevel) return null;
    const variants = {
      LOW: 'risk-low',
      MEDIUM: 'risk-medium',
      HIGH: 'risk-high',
      CRITICAL: 'risk-critical',
    };
    return (
      <Badge className={cn('ml-2 text-[10px] sm:text-xs', variants[riskLevel])}>
        {riskLevel === 'CRITICAL' && <AlertTriangle className="mr-1 h-3 w-3" />}
        {riskLevel}
      </Badge>
    );
  };

  return (
    <div className={cn('flex gap-3 max-w-full', isUser ? 'flex-row-reverse' : '')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted border',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      {/* 
        min-w-0 ensures flex child can shrink below min-content, 
        preventing long strings/code blocks from overflowing 
      */}
      <div
        className={cn(
          'min-w-0 flex-1 max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm',
          isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm border',
        )}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Uploaded by user"
            className="w-full max-w-[240px] h-auto object-cover rounded-lg mb-2 cursor-pointer hover:opacity-90 transition"
          />
        )}
        <div className="text-sm whitespace-pre-wrap break-words overflow-x-auto">
          {message.content}
        </div>
        
        {!isUser && (
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/50 pt-2">
            <div className="flex items-center">
              <span className="text-[10px] text-muted-foreground">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {message.riskLevel && getRiskBadge(message.riskLevel)}
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full hover:bg-background/50"
              onClick={() => speakText(message.content)}
              title="Read aloud"
              aria-label="Read message aloud"
            >
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}
        {isUser && (
           <div className="mt-1 flex justify-end">
             <span className="text-[10px] opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
           </div>
        )}
      </div>
    </div>
  );
});
