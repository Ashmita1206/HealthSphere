import { motion } from 'framer-motion';
import { Bot, FileText, Activity, Pill, Stethoscope } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    { text: 'Analyze my symptoms', icon: <Stethoscope className="w-5 h-5 text-primary" /> },
    { text: 'Explain my medicine', icon: <Pill className="w-5 h-5 text-primary" /> },
    { text: 'Upload a medical report', icon: <FileText className="w-5 h-5 text-primary" /> },
    { text: 'Help with BP', icon: <Activity className="w-5 h-5 text-primary" /> },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-inner"
      >
        <Bot className="h-10 w-10 text-primary" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
        I can answer questions, analyze reports, and help you manage your health journey.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:bg-accent hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`Prompt suggestion: ${suggestion.text}`}
          >
            <div className="flex shrink-0 items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              {suggestion.icon}
            </div>
            <span className="text-sm font-medium">{suggestion.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
