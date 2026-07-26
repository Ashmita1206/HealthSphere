import React, { useEffect } from 'react';
import { useVoiceAI } from '@/hooks/ai/useVoiceAI';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceQuery?: (query: string) => void;
  latestResponseText?: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceQuery,
  latestResponseText,
}) => {
  const { isListening, isSpeaking, transcript, supported, startListening, stopListening, speakText, stopSpeaking } =
    useVoiceAI();

  useEffect(() => {
    if (latestResponseText && isOpen) {
      speakText(latestResponseText);
    }
  }, [latestResponseText, isOpen, speakText]);

  if (!isOpen) return null;

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim() && onSendVoiceQuery) {
        onSendVoiceQuery(transcript);
      }
    } else {
      startListening((text) => {
        if (text.trim() && onSendVoiceQuery) {
          // send on silence timeout
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-center relative overflow-hidden">
        {/* Animated Background Aura */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />

        <button
          onClick={() => {
            stopSpeaking();
            stopListening();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">Voice AI Assistant</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">Speak with HealthSphere AI</h3>
        <p className="text-xs text-slate-400 mb-6">
          {!supported
            ? 'Voice input is not supported in this browser environment.'
            : isListening
            ? 'Listening... speak clearly into your microphone'
            : isSpeaking
            ? 'Responding via Voice Output...'
            : 'Tap the microphone to speak your health query'}
        </p>

        {/* Dynamic Pulse Orb */}
        <div className="flex justify-center items-center my-8">
          <button
            onClick={handleMicToggle}
            disabled={!supported}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl relative ${
              isListening
                ? 'bg-rose-600 ring-8 ring-rose-500/30 scale-110'
                : isSpeaking
                ? 'bg-teal-600 ring-8 ring-teal-500/30'
                : 'bg-teal-600 hover:bg-teal-500 hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 text-white animate-pulse" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
        </div>

        {/* Live Transcript Display */}
        {transcript && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-teal-200 mb-4 font-mono">
            &quot;{transcript}&quot;
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {isSpeaking ? (
            <Button
              variant="outline"
              size="sm"
              onClick={stopSpeaking}
              className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
            >
              <VolumeX className="w-4 h-4 mr-2" /> Stop Audio
            </Button>
          ) : (
            latestResponseText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakText(latestResponseText)}
                className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
              >
                <Volume2 className="w-4 h-4 mr-2" /> Replay Voice
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
