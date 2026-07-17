import { useState, useEffect, useRef } from 'react';
import { Send, Mic, Volume2, ImagePlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePreview } from './ImagePreview';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';

export interface SelectedImage {
  data: string;
  mimeType: string;
}

interface ChatInputProps {
  isLoading: boolean;
  onSend: (content: string, image?: SelectedImage) => void;
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image size must be less than 5MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64WithPrefix = e.target?.result as string;
      const mimeType = file.type;
      const base64 = base64WithPrefix.split(',')[1];
      setSelectedImage({ data: base64, mimeType });
      toast({ title: 'Image Uploaded', description: 'Image ready for analysis' });
    };
    reader.readAsDataURL(file);
    // Reset file input
    event.target.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading || (!input.trim() && !selectedImage)) return;

    onSend(input.trim(), selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
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
        {/* Actions Row - Stacks on top of input on very small screens, sits beside it on larger screens */}
        <div className="flex gap-1.5 order-2 sm:order-1 flex-wrap sm:flex-nowrap justify-between sm:justify-start">
          <div className="flex gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleTts}
              className={ttsEnabled ? 'bg-primary/10 text-primary border-primary/30' : ''}
              title="Toggle text-to-speech"
              aria-label="Toggle text-to-speech"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onVoiceInput}
              className={isListening ? 'bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30 animate-pulse' : ''}
              title={isListening ? 'Stop listening' : 'Start voice input'}
              aria-label="Voice input"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild title="Upload image" aria-label="Upload image">
              <label className="cursor-pointer">
                <ImagePlus className="h-4 w-4" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </Button>
          </div>
          
          {/* Emergency Button - Right aligned on mobile row, shrink on sm */}
          <Button
            variant="outline"
            size="icon"
            onClick={onEmergencyClick}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
            title="Emergency"
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
              placeholder={isListening ? "Listening..." : "Ask about your health..."}
              className="w-full text-base sm:text-sm h-11 sm:h-10 pr-10" // text-base prevents iOS zoom
              disabled={isLoading}
            />
            {/* Status Overlays */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {speechError && <span className="text-xs text-destructive animate-pulse">{speechError}</span>}
              {isListening && interimTranscript && (
                <span className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[150px] inline-block">
                  {interimTranscript}
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            className="shrink-0 h-11 w-11 sm:h-10 sm:w-10"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
