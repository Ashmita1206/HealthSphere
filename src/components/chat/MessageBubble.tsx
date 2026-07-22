import { memo } from 'react';
import { Bot, User, Volume2, AlertTriangle, Activity } from 'lucide-react';
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
    const badgeStyles = {
      LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
      HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
      CRITICAL: 'bg-rose-600 text-white animate-pulse',
    };
    return (
      <Badge className={cn('ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border', badgeStyles[riskLevel])}>
        {riskLevel === 'CRITICAL' && <AlertTriangle className="mr-1 h-3 w-3 inline" />}
        {riskLevel} Risk
      </Badge>
    );
  };

  return (
    <div className={cn('flex gap-3 max-w-full my-1.5', isUser ? 'flex-row-reverse' : '')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold shadow-sm text-xs',
          isUser
            ? 'bg-teal-700 text-white'
            : 'bg-white border border-slate-200 text-teal-800'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Activity className="h-4 w-4 stroke-[2.2]" />}
      </div>
      
      {/* Message Bubble Container */}
      <div
        className={cn(
          'min-w-0 flex-1 max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all',
          isUser
            ? 'bg-teal-700 text-white rounded-tr-xs'
            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80'
        )}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Uploaded by user"
            className="w-full max-w-[240px] h-auto object-cover rounded-xl mb-2.5 border border-white/20 shadow-sm"
          />
        )}
        <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
          {message.content}
        </div>
        
        {!isUser && (
          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-medium">
            <div className="flex items-center">
              <span>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {message.riskLevel && getRiskBadge(message.riskLevel)}
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100"
              onClick={() => speakText(message.content)}
              title="Read aloud"
              aria-label="Read message aloud"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {isUser && (
           <div className="mt-1 flex justify-end">
             <span className="text-[10px] text-teal-200/90 font-medium">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
           </div>
        )}
      </div>
    </div>
  );
});

