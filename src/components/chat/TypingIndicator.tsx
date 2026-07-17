import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl bg-muted px-4 py-3 flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">HealthSphere AI is thinking</span>
        <div className="flex gap-1">
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
        </div>
      </div>
    </div>
  );
}
