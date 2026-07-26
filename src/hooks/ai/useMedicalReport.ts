import { useState } from 'react';
import { aiService, MedicalReportAnalysis, ReportComparisonResult } from '@/services/ai/aiService';
import { useToast } from '@/hooks/use-toast';

export function useMedicalReport() {
  const [analyzing, setAnalyzing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [reportResult, setReportResult] = useState<MedicalReportAnalysis | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ReportComparisonResult | null>(null);

  const { toast } = useToast();

  const analyzeDocument = async (file: File) => {
    setAnalyzing(true);
    setReportResult(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await aiService.analyzeReport({
          mimeType: file.type || 'application/pdf',
          base64Data: base64,
        });
        if (res.success && res.data) {
          setReportResult(res.data);
          toast({ title: 'Report Analyzed', description: 'OCR & biomarker extractions complete' });
        }
        setAnalyzing(false);
      };
      reader.onerror = () => {
        setAnalyzing(false);
        toast({ title: 'Error', description: 'Failed reading document file', variant: 'destructive' });
      };
    } catch {
      setAnalyzing(false);
      toast({ title: 'Error', description: 'Report analysis failed', variant: 'destructive' });
    }
  };

  const compareTwoReports = async (reportA: object, reportB: object) => {
    setComparing(true);
    setComparisonResult(null);
    try {
      const res = await aiService.compareReports(reportA, reportB);
      if (res.success && res.data) {
        setComparisonResult(res.data);
        toast({ title: 'Reports Compared', description: 'Trend overview generated' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed comparing reports', variant: 'destructive' });
    } finally {
      setComparing(false);
    }
  };

  return {
    analyzing,
    comparing,
    reportResult,
    comparisonResult,
    analyzeDocument,
    compareTwoReports,
  };
}
