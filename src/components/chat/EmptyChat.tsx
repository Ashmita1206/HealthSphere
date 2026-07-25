import { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Activity, Pill, Stethoscope, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyChatProps {
  onSuggestionClick?: (text: string) => void;
  onOpenPromptsModal?: () => void;
}

export const EmptyChat = memo(function EmptyChat({
  onSuggestionClick,
  onOpenPromptsModal,
}: EmptyChatProps) {
  const suggestions = [
    { text: 'Analyze my symptoms', icon: <Stethoscope className="w-4 h-4 text-teal-600" /> },
    { text: 'Explain my medicine dosage', icon: <Pill className="w-4 h-4 text-emerald-600" /> },
    { text: 'Understand blood test report', icon: <FileText className="w-4 h-4 text-violet-600" /> },
    { text: 'BP & Glucose lifestyle tips', icon: <Activity className="w-4 h-4 text-cyan-600" /> },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-700/20"
      >
        <Bot className="h-8 w-8" />
      </motion.div>

      <h3 className="text-xl font-extrabold font-heading text-slate-900 mb-1">
        HealthSphere AI Assistant
      </h3>
      <p className="text-xs text-slate-500 mb-6 max-w-sm leading-relaxed">
        Your 24/7 clinical health companion. Ask about medical conditions, prescription dosages, diagnostic reports, or daily wellness protocols.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md mb-4">
        {suggestions.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.1 }}
            onClick={() => onSuggestionClick?.(item.text)}
            className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-left transition-all hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <div className="flex shrink-0 items-center justify-center h-8 w-8 rounded-lg bg-slate-50 border border-slate-100">
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-slate-700 truncate">{item.text}</span>
          </motion.button>
        ))}
      </div>

      {onOpenPromptsModal && (
        <Button
          type="button"
          variant="outline"
          onClick={onOpenPromptsModal}
          className="rounded-xl border-teal-200 text-xs font-bold text-teal-800 hover:bg-teal-50"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-teal-600" />
          Explore 18 Clinical Prompt Categories
        </Button>
      )}
    </div>
  );
});
