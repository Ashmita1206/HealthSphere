import { useState } from 'react';
import { aiService, VisionAnalysisResult } from '@/services/ai/aiService';
import { useToast } from '@/hooks/use-toast';

export function useAIVision() {
  const [analyzing, setAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);

  const { toast } = useToast();

  const analyzeImage = async (category: string, file: File) => {
    setAnalyzing(true);
    setVisionResult(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await aiService.analyzeVision({
          category,
          mimeType: file.type || 'image/jpeg',
          base64Data: base64,
        });
        if (res.success && res.data) {
          setVisionResult(res.data);
          toast({ title: 'Vision Scan Complete', description: `${category} processed successfully` });
        }
        setAnalyzing(false);
      };
      reader.onerror = () => {
        setAnalyzing(false);
        toast({ title: 'Error', description: 'Failed reading image file', variant: 'destructive' });
      };
    } catch {
      setAnalyzing(false);
      toast({ title: 'Error', description: 'Image analysis failed', variant: 'destructive' });
    }
  };

  return {
    analyzing,
    visionResult,
    analyzeImage,
  };
}
