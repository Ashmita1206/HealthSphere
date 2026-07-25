import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileCheck,
  Image as ImageIcon,
  Paperclip,
  X,
  Stethoscope,
  TestTube,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AttachmentItem, AttachmentType } from './types';
import { useToast } from '@/hooks/use-toast';

interface AttachmentUploaderProps {
  onAttachmentSelected: (item: AttachmentItem) => void;
  currentAttachment?: AttachmentItem | null;
  onClearAttachment?: () => void;
}

export function AttachmentUploader({
  onAttachmentSelected,
  currentAttachment,
  onClearAttachment,
}: AttachmentUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSimulatedUpload = (
    fileName: string,
    type: AttachmentType,
    sizeStr: string,
    previewUrl?: string
  ) => {
    setIsUploading(true);
    setUploadProgress(15);
    setIsOpen(false);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            const item: AttachmentItem = {
              id: Date.now().toString(),
              name: fileName,
              type,
              size: sizeStr,
              previewUrl,
            };
            onAttachmentSelected(item);
            toast({
              title: `${type.toUpperCase()} Attached`,
              description: `${fileName} is ready for AI clinical analysis.`,
            });
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: AttachmentType
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum attachment size is 10MB.',
        variant: 'destructive',
      });
      return;
    }

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSimulatedUpload(file.name, type, sizeStr, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      handleSimulatedUpload(file.name, type, sizeStr);
    }

    event.target.value = '';
  };

  return (
    <div className="relative inline-block">
      {/* Attachment Button */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-xl transition-all ${
          currentAttachment
            ? 'border-teal-400 bg-teal-50 text-teal-800'
            : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50'
        }`}
        title="Attach medical document or image"
        aria-label="Attach medical document or image"
        aria-expanded={isOpen}
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {/* Popover Selection Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-12 left-0 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl"
          >
            <div className="mb-2 px-2.5 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Attach Medical File
              </p>
              <p className="text-[11px] text-slate-400">
                Upload image, lab report, or prescription
              </p>
            </div>

            <div className="space-y-1">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                <ImageIcon className="h-4 w-4 text-teal-600" />
                Medical Image (X-Ray, Scan)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                <FileText className="h-4 w-4 text-violet-600" />
                Medical Report (PDF)
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                  className="hidden"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                <Receipt className="h-4 w-4 text-emerald-600" />
                Doctor Prescription
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'prescription')}
                  className="hidden"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                <TestTube className="h-4 w-4 text-cyan-600" />
                Lab Blood Test Panel
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'lab')}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  handleSimulatedUpload(
                    'Sample_Lipid_Profile_July2026.pdf',
                    'report',
                    '1.4 MB'
                  )
                }
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-50"
              >
                <Stethoscope className="h-4 w-4 text-teal-600" />
                Attach Sample Diagnostic Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="absolute -top-12 left-0 z-40 w-56 rounded-xl border border-teal-200 bg-white p-2.5 shadow-lg">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-teal-900">
            <span className="truncate">Uploading attachment...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5 bg-teal-100" />
        </div>
      )}

      {/* Current Attachment Chip */}
      {currentAttachment && !isUploading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-2 inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 px-2.5 py-1 text-xs shadow-xs backdrop-blur-xs"
        >
          <FileCheck className="h-3.5 w-3.5 text-teal-700" />
          <span className="max-w-[140px] truncate font-semibold text-teal-900">
            {currentAttachment.name}
          </span>
          <Badge className="bg-teal-700 text-[9px] font-bold uppercase text-white">
            {currentAttachment.type}
          </Badge>
          <button
            type="button"
            onClick={onClearAttachment}
            className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            aria-label="Remove attachment"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
