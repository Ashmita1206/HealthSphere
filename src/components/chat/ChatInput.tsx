import { useState, useEffect, useRef } from 'react';
import { Send, Mic, Volume2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePreview } from './ImagePreview';
import { AttachmentUploader } from './AttachmentUploader';
import { QuickPromptsModal } from './QuickPromptsModal';
import type { AttachmentItem } from './types';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';

export interface SelectedImage {
  data: string;
  mimeType: string;
}

interface ChatInputProps {
  isLoading: boolean;
  onSend: (content: string, image?: SelectedImage, attachment?: AttachmentItem) => void;
  // TTS State
  ttsEnabled: boolean;
  onToggleTts: () => void;
  // Speech Recognition State
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  speechError: string | null;
  onVoiceInput: () => void;
  resetTranscript: () => void;
  // Emergency
  onEmergencyClick: () => void;
  // Pass suggestion from empty state
  suggestionText?: string;
  onClearSuggestion?: () => void;
}

export function ChatInput({
  isLoading,
  onSend,
  ttsEnabled,
  onToggleTts,
  isListening,
  transcript,
  interimTranscript,
  speechError,
  onVoiceInput,
  resetTranscript,
  onEmergencyClick,
  suggestionText,
  onClearSuggestion,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<AttachmentItem | null>(null);
  const [isPromptsOpen, setIsPromptsOpen] = useState(false);

  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync suggestion text
  useEffect(() => {
    if (suggestionText) {
      setInput(suggestionText);
      onClearSuggestion?.();
      inputRef.current?.focus();
    }
  }, [suggestionText, onClearSuggestion]);

  // Sync voice transcript
  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading || (!input.trim() && !selectedImage && !currentAttachment)) return;

    onSend(input.trim(), selectedImage || undefined, currentAttachment || undefined);
    setInput('');
    setSelectedImage(null);
    setCurrentAttachment(null);
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 sm:p-3 space-y-2 shrink-0">
      <AnimatePresence>
        {selectedImage && (
          <ImagePreview
            data={selectedImage.data}
            mimeType={selectedImage.mimeType}
            onRemove={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Actions Row */}
        <div className="flex gap-1.5 order-2 sm:order-1 flex-wrap sm:flex-nowrap justify-between sm:justify-start items-center">
          <div className="flex gap-1.5 shrink-0 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleTts}
              className={`rounded-xl ${ttsEnabled ? 'bg-teal-50 text-teal-700 border-teal-300' : 'border-slate-200 text-slate-600'}`}
              title="Toggle text-to-speech auto-read"
              aria-label="Toggle text-to-speech"
            >
              <Volume2 className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={onVoiceInput}
              className={`rounded-xl ${isListening ? 'bg-rose-50 border-rose-400 text-rose-600 animate-pulse' : 'border-slate-200 text-slate-600'}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
              aria-label="Voice input"
            >
              <Mic className="h-4 w-4" />
            </Button>

            {/* Quick Prompts Modal Trigger */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPromptsOpen(true)}
              className="rounded-xl border-slate-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300"
              title="Clinical Prompts Library (18 Categories)"
              aria-label="Open clinical prompts library"
            >
              <Sparkles className="h-4 w-4 text-teal-600" />
            </Button>

            {/* Attachment Uploader (Images, PDF, Lab Reports, Prescriptions) */}
            <AttachmentUploader
              onAttachmentSelected={(item) => setCurrentAttachment(item)}
              currentAttachment={currentAttachment}
              onClearAttachment={() => setCurrentAttachment(null)}
            />
          </div>
          
          {/* Emergency Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onEmergencyClick}
            className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 shrink-0"
            title="Emergency Triage Hotline"
            aria-label="Emergency"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Input Form Row */}
        <form onSubmit={handleSubmit} className="flex flex-1 gap-2 order-1 sm:order-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask about your health, medications, or symptoms..."}
              className="w-full text-base sm:text-sm h-11 sm:h-10 pr-10 rounded-xl border-slate-200 focus-visible:ring-teal-600"
              disabled={isLoading}
            />
            {/* Status Overlays */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {speechError && <span className="text-xs text-rose-600 animate-pulse">{speechError}</span>}
              {isListening && interimTranscript && (
                <span className="text-xs text-slate-400 truncate max-w-[100px] sm:max-w-[150px] inline-block">
                  {interimTranscript}
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            className="shrink-0 h-11 w-11 sm:h-10 sm:w-10 rounded-xl bg-teal-700 hover:bg-teal-800 text-white"
            disabled={isLoading || (!input.trim() && !selectedImage && !currentAttachment)}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <QuickPromptsModal
        open={isPromptsOpen}
        onOpenChange={setIsPromptsOpen}
        onSelectPrompt={(text) => {
          setInput(text);
          inputRef.current?.focus();
        }}
      />
    </div>
  );
}
