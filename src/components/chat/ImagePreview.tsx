import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImagePreviewProps {
  mimeType: string;
  data: string;
  onRemove: () => void;
}

export function ImagePreview({ mimeType, data, onRemove }: ImagePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="relative inline-block mt-2 mb-3 ml-2"
    >
      <img
        src={`data:${mimeType};base64,${data}`}
        alt="Selected preview"
        className="max-h-24 w-auto rounded-lg border shadow-sm object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 w-6 h-6 rounded-full text-xs flex items-center justify-center shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
        aria-label="Remove image"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
