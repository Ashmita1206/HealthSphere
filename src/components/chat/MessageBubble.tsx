import { memo, useState } from 'react';
import {
  User,
  Volume2,
  AlertTriangle,
  Activity,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Message, RiskLevel } from './types';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onSuggestionClick?: (text: string) => void;
}

// Simple Markdown Renderer for rich tables, code blocks, bullet points & bolding
function FormatMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const parseInline = (text: string) => {
    // Bold **text**
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-teal-800">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim());
      if (trimmed.includes(':---') || trimmed.includes('---')) {
        return; // Separator row
      }
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    }

    if (inTable && !trimmed.startsWith('|')) {
      // Flush table
      elements.push(
        <div key={`table-${index}`} className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/60 p-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold">
                {tableHeader.map((h, i) => (
                  <th key={i} className="p-2 font-bold">{parseInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-200/50 last:border-0 hover:bg-slate-100/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-2">{parseInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }

    // Code blocks ```
    if (trimmed.startsWith('```')) {
      return;
    }

    // Headings ###
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="mt-3 mb-1 text-sm font-extrabold font-heading text-teal-950">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h5 key={index} className="mt-2 mb-1 text-xs font-bold text-slate-800">
          {parseInline(trimmed.slice(5))}
        </h5>
      );
      return;
    }

    // Blockquote >
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={index} className="my-2 border-l-3 border-teal-600 bg-teal-50/70 p-2.5 rounded-r-xl text-xs leading-relaxed text-teal-950 font-medium">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Bullet points * or -
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push(
        <li key={index} className="ml-4 list-disc text-xs leading-relaxed py-0.5">
          {parseInline(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <li key={index} className="ml-4 list-decimal text-xs leading-relaxed py-0.5">
          {parseInline(trimmed.replace(/^\d+\.\s/, ''))}
        </li>
      );
      return;
    }

    if (trimmed === '') {
      elements.push(<div key={index} className="h-1.5" />);
      return;
    }

    elements.push(
      <p key={index} className="text-xs sm:text-sm leading-relaxed">
        {parseInline(line)}
      </p>
    );
  });

  return <div className="space-y-1">{elements}</div>;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  onRegenerate,
  onSuggestionClick,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(message.feedback ?? null);
  const { toast } = useToast();
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast({ title: 'Copied to Clipboard', description: 'AI response content copied.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'liked' | 'disliked') => {
    const nextState = feedback === type ? null : type;
    setFeedback(nextState);
    toast({
      title: type === 'liked' ? 'Feedback Received' : 'Feedback Noted',
      description: type === 'liked' ? 'Thank you for rating this response helpful!' : 'We will improve future responses.',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'HealthSphere AI Consultation',
        text: message.content,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#|_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: 'TTS Unsupported',
        description: 'Text-to-speech is not supported in this browser.',
        variant: 'destructive',
      });
    }
  };

  const getRiskBadge = (riskLevel?: RiskLevel) => {
    if (!riskLevel) return null;
    const badgeStyles: Record<RiskLevel, string> = {
      LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
      HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
      CRITICAL: 'bg-rose-600 text-white animate-pulse',
    };
    return (
      <Badge className={cn('ml-2 text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border', badgeStyles[riskLevel])}>
        {riskLevel === 'CRITICAL' && <AlertTriangle className="mr-1 h-3 w-3 inline" />}
        {riskLevel} Risk
      </Badge>
    );
  };

  return (
    <div className={cn('flex gap-3 max-w-full my-2', isUser ? 'flex-row-reverse' : '')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl font-bold shadow-xs text-xs transition-transform hover:scale-105',
          isUser
            ? 'bg-teal-700 text-white shadow-teal-700/20'
            : 'bg-white border border-slate-200 text-teal-800 shadow-slate-100'
        )}
      >
        {isUser ? <User className="h-4.5 w-4.5" /> : <Activity className="h-4.5 w-4.5 stroke-[2.4]" />}
      </div>

      {/* Message Container */}
      <div
        className={cn(
          'min-w-0 flex-1 max-w-[92%] sm:max-w-[85%] rounded-3xl px-4 py-3.5 shadow-xs transition-all',
          isUser
            ? 'bg-teal-700 text-white rounded-tr-xs shadow-teal-800/10'
            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-slate-100'
        )}
      >
        {/* Category Tag if available */}
        {!isUser && message.category && (
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {message.category}
            </span>
            {message.riskLevel && getRiskBadge(message.riskLevel)}
          </div>
        )}

        {/* Image Attachment */}
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Uploaded by user"
            className="w-full max-w-[260px] h-auto object-cover rounded-2xl mb-3 border border-slate-200 shadow-sm"
          />
        )}

        {/* Formatted Markdown Content */}
        {isUser ? (
          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
            {message.content}
          </div>
        ) : (
          <FormatMarkdown content={message.content} />
        )}

        {/* Follow-up Suggestions Chips */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Suggested Follow-Ups:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSuggestionClick?.(sug)}
                  className="rounded-full border border-teal-200 bg-teal-50/70 px-2.5 py-1 text-[11px] font-semibold text-teal-800 transition-all hover:bg-teal-100 hover:border-teal-300 text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Toolbar for AI Messages */}
        {!isUser && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
            <span className="font-medium">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100"
                onClick={handleCopy}
                title="Copy response"
                aria-label="Copy response text"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100"
                onClick={() => speakText(message.content)}
                title="Read aloud"
                aria-label="Read response aloud"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className={`h-7 w-7 rounded-lg ${feedback === 'liked' ? 'text-teal-700 bg-teal-50' : 'text-slate-400 hover:text-teal-700 hover:bg-slate-100'}`}
                onClick={() => handleFeedback('liked')}
                title="Helpful"
                aria-label="Mark response as helpful"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className={`h-7 w-7 rounded-lg ${feedback === 'disliked' ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'}`}
                onClick={() => handleFeedback('disliked')}
                title="Not helpful"
                aria-label="Mark response as unhelpful"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100"
                onClick={handleShare}
                title="Share response"
                aria-label="Share response"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>

              {onRegenerate && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100"
                  onClick={onRegenerate}
                  title="Regenerate answer"
                  aria-label="Regenerate AI answer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {isUser && (
          <div className="mt-1 flex justify-end">
            <span className="text-[10px] text-teal-200/90 font-medium">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});


