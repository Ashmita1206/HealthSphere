import { describe, it, expect } from 'vitest';

interface AbnormalFinding {
  parameter: string;
  value: string;
  normalRange: string;
  severity: 'Mild' | 'Moderate' | 'High' | 'Critical';
  note?: string;
}

interface ReportAnalysisMockDoc {
  _id: string;
  userId: string;
  reportId: string;
  extractedText: string;
  reportType: 'blood' | 'xray' | 'prescription' | 'lab' | 'general';
  aiSummary: string;
  abnormalFindings: AbnormalFinding[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
  createdAt: Date;
}

interface ReportMockDoc {
  _id: string;
  userId: string;
  title: string;
  fileUrl: string;
  extractedText?: string;
  summary?: string;
  riskLevel?: string;
  abnormalValues?: unknown[];
}

describe('F14 AI Medical Report Intelligence & OCR Backend Suite', () => {
  const patientA = 'user-patient-a';
  const patientB = 'user-patient-b';

  const reportsDb = new Map<string, ReportMockDoc>();
  const analysisDb = new Map<string, ReportAnalysisMockDoc>();
  const timelineEvents: Array<{ userId: string; eventType: string; title: string }> = [];
  const notifications: Array<{ userId: string; title: string; type: string }> = [];

  const resetState = () => {
    reportsDb.clear();
    analysisDb.clear();
    timelineEvents.length = 0;
    notifications.length = 0;

    // Seed test reports
    reportsDb.set('rep-blood-1', {
      _id: 'rep-blood-1',
      userId: patientA,
      title: 'Complete Blood Count & Metabolic Panel',
      fileUrl: 'https://cloudinary.com/reports/blood_test.pdf',
      extractedText: 'Patient: Alice. Glucose: 195 mg/dL. HbA1c: 7.8%. Hemoglobin: 14.2 g/dL. Platelets: 240000 /mcL.',
    });

    reportsDb.set('rep-xray-1', {
      _id: 'rep-xray-1',
      userId: patientA,
      title: 'Chest Radiograph PA View',
      fileUrl: 'https://cloudinary.com/reports/chest_xray.png',
      extractedText: 'Radiology Report: Bilateral lung fields demonstrate pulmonary infiltrates and mild cardiomegaly.',
    });

    reportsDb.set('rep-rx-1', {
      _id: 'rep-rx-1',
      userId: patientA,
      title: 'Discharge Prescription Notes',
      fileUrl: 'https://cloudinary.com/reports/prescription.jpg',
      extractedText: 'Rx: Tab. Metformin 500mg daily with breakfast.\nTab. Atorvastatin 20mg at bedtime.',
    });

    reportsDb.set('rep-patient-b', {
      _id: 'rep-patient-b',
      userId: patientB,
      title: 'Patient B Private Report',
      fileUrl: 'https://cloudinary.com/reports/private.pdf',
      extractedText: 'Normal lab values.',
    });
  };

  // Controller simulation matching server/controllers/reportAnalysisController.js
  async function analyzeReport(callerId: string, reportId: string, payload?: { manualText?: string }) {
    if (!callerId) return { status: 401, error: 'Unauthorized' };

    const report = reportsDb.get(reportId);
    if (!report) return { status: 404, error: 'Report not found' };

    // IDOR Protection
    if (report.userId !== callerId) {
      return { status: 403, error: 'Unauthorized: You can only analyze your own reports' };
    }

    // Dynamic import of real services
    // @ts-expect-error dynamic commonjs loading in vitest
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { extractTextFromDocument } = require('../../server/services/ocrService');
    // @ts-expect-error dynamic commonjs loading in vitest
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { analyzeMedicalReport } = require('../../server/services/reportAnalysisService');

    const ocrResult = await extractTextFromDocument({
      fileUrl: report.fileUrl,
      rawText: payload?.manualText || report.extractedText,
      filename: report.title,
    });

    const analysis = await analyzeMedicalReport({
      extractedText: ocrResult.extractedText,
      reportType: ocrResult.reportType,
      title: report.title,
    });

    const analysisDoc: ReportAnalysisMockDoc = {
      _id: `analysis-${Date.now()}`,
      userId: callerId,
      reportId: report._id,
      extractedText: ocrResult.extractedText,
      reportType: ocrResult.reportType,
      aiSummary: analysis.summary,
      abnormalFindings: analysis.abnormalValues,
      riskLevel: analysis.riskLevel,
      recommendations: analysis.recommendations,
      createdAt: new Date(),
    };

    analysisDb.set(report._id, analysisDoc);

    // Update report
    report.summary = analysis.summary;
    report.riskLevel = analysis.riskLevel;
    report.abnormalValues = analysis.abnormalValues;

    // Record timeline event
    timelineEvents.push({
      userId: callerId,
      eventType: 'REPORT_ANALYZED',
      title: `Medical Report Analyzed: ${report.title}`,
    });

    // Notify user if abnormal values detected
    if (analysis.abnormalValues.length > 0) {
      notifications.push({
        userId: callerId,
        title: 'Abnormal Values Detected in Report',
        type: 'alert',
      });
    }

    if (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical') {
      notifications.push({
        userId: callerId,
        title: 'Doctor Review Recommended',
        type: 'appointment',
      });
    }

    return {
      status: 200,
      data: {
        ...analysisDoc,
        keyFindings: analysis.keyFindings,
        doctorQuestions: analysis.doctorQuestions,
        disclaimer: analysis.disclaimer,
      },
    };
  }

  function getReportAnalysis(callerId: string, reportId: string) {
    if (!callerId) return { status: 401, error: 'Unauthorized' };

    const analysis = analysisDb.get(reportId);
    if (!analysis) return { status: 404, error: 'No analysis found for this report' };

    // IDOR Protection
    if (analysis.userId !== callerId) {
      return { status: 403, error: 'Forbidden: Cannot access another user report analysis' };
    }

    return { status: 200, data: analysis };
  }

  it('1. OCR Service: Extracts text from documents and handles fallback cleanly', async () => {
    // @ts-expect-error dynamic commonjs loading in vitest
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { extractTextFromDocument, detectReportType } = require('../../server/services/ocrService');

    // Type detection tests
    expect(detectReportType('Chest X-ray PA view', 'scan.png')).toBe('xray');
    expect(detectReportType('Complete Blood Count CBC', 'blood.pdf')).toBe('blood');
    expect(detectReportType('Rx Tab. Paracetamol 500mg daily', 'rx.jpg')).toBe('prescription');

    // Fallback when optical engine is unavailable
    const fallbackRes = await extractTextFromDocument({ fileUrl: 'https://example.com/unscannable.pdf', filename: 'unscannable.pdf' });
    expect(fallbackRes.ocrStatus).toBe('fallback');
    expect(fallbackRes.extractedText).toBeDefined();
    expect(fallbackRes.extractedText.length).toBeGreaterThan(0);
  });

  it('2. AI Report Analyzer: Analyzes Blood Reports and extracts abnormal biomarkers', async () => {
    resetState();
    const res = await analyzeReport(patientA, 'rep-blood-1');

    expect(res.status).toBe(200);
    expect(res.data?.reportType).toBe('blood');
    expect(res.data?.riskLevel).toBe('high');

    // Abnormal values detected
    const abnormal = res.data?.abnormalFindings || [];
    expect(abnormal.length).toBeGreaterThanOrEqual(2);

    const hasGlucose = abnormal.some((a) => /glucose/i.test(a.parameter));
    const hasHba1c = abnormal.some((a) => /hba1c/i.test(a.parameter));
    expect(hasGlucose).toBe(true);
    expect(hasHba1c).toBe(true);

    // Structure validation
    expect(res.data?.disclaimer).toMatch(/informational and clinical decision-support/);
    expect(Array.isArray(res.data?.doctorQuestions)).toBe(true);
    expect(res.data?.doctorQuestions.length).toBeGreaterThan(0);
  });

  it('3. AI Report Analyzer: Analyzes X-Ray Reports and flags radiological opacities', async () => {
    resetState();
    const res = await analyzeReport(patientA, 'rep-xray-1');

    expect(res.status).toBe(200);
    expect(res.data?.reportType).toBe('xray');

    const abnormal = res.data?.abnormalFindings || [];
    expect(abnormal.length).toBeGreaterThan(0);

    const hasInfiltrates = abnormal.some((a) => /infiltrate|consolidation/i.test(a.parameter));
    const hasCardiomegaly = abnormal.some((a) => /cardiomegaly/i.test(a.parameter));
    expect(hasInfiltrates || hasCardiomegaly).toBe(true);
  });

  it('4. AI Report Analyzer: Analyzes Prescription Reports and extracts dosage schedules', async () => {
    resetState();
    const res = await analyzeReport(patientA, 'rep-rx-1');

    expect(res.status).toBe(200);
    expect(res.data?.reportType).toBe('prescription');
    expect(res.data?.riskLevel).toBe('low');
    expect(res.data?.keyFindings.length).toBeGreaterThan(0);
  });

  it('5. Timeline & Notification Integration: Emits REPORT_ANALYZED event and triggers alerts', async () => {
    resetState();
    await analyzeReport(patientA, 'rep-blood-1');

    // Timeline event must be logged
    const timelineEvent = timelineEvents.find((e) => e.eventType === 'REPORT_ANALYZED');
    expect(timelineEvent).toBeDefined();
    expect(timelineEvent?.userId).toBe(patientA);

    // Notifications must be triggered
    const abnormalNotif = notifications.find((n) => n.title === 'Abnormal Values Detected in Report');
    const doctorReviewNotif = notifications.find((n) => n.title === 'Doctor Review Recommended');
    expect(abnormalNotif).toBeDefined();
    expect(doctorReviewNotif).toBeDefined();
  });

  it('6. IDOR Protection & Authorization: Prohibits analyzing or viewing another user reports', async () => {
    resetState();

    // Patient A tries to analyze Patient B's report
    const unauthorizedAnalyze = await analyzeReport(patientA, 'rep-patient-b');
    expect(unauthorizedAnalyze.status).toBe(403);

    // Patient B analyzes their own report
    await analyzeReport(patientB, 'rep-patient-b');

    // Patient A tries to view Patient B's analysis
    const unauthorizedView = getReportAnalysis(patientA, 'rep-patient-b');
    expect(unauthorizedView.status).toBe(403);

    // Patient B views their own analysis
    const authorizedView = getReportAnalysis(patientB, 'rep-patient-b');
    expect(authorizedView.status).toBe(200);
  });
});
