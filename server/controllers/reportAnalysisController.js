const Report = require('../models/Report');
const MedicalReportAnalysis = require('../models/MedicalReportAnalysis');
const { extractTextFromDocument } = require('../services/ocrService');
const { analyzeMedicalReport } = require('../services/reportAnalysisService');
const timelineService = require('../services/timelineService');
const { createNotification } = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * POST /api/reports/:id/analyze
 * Extracts document text with OCR and runs AI clinical analysis
 */
async function analyzeReport(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { base64Data, mimeType, manualText } = req.body || {};

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found',
      });
    }

    // IDOR Protection: only report owner can request analysis
    if (report.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only analyze your own reports',
      });
    }

    // 1. Extract text via OCR service
    const rawTextSource = manualText || report.extractedText || report.rawOcrText || '';
    const ocrResult = await extractTextFromDocument({
      fileUrl: report.fileUrl,
      base64Data,
      mimeType: mimeType || report.fileType,
      rawText: rawTextSource,
      filename: report.title,
    });

    // 2. Perform clinical report analysis
    const analysisResult = await analyzeMedicalReport({
      extractedText: ocrResult.extractedText,
      reportType: ocrResult.reportType,
      title: report.title,
    });

    // 3. Save to MedicalReportAnalysis collection
    const analysis = await MedicalReportAnalysis.create({
      userId,
      reportId: report._id,
      extractedText: ocrResult.extractedText,
      reportType: ocrResult.reportType,
      aiSummary: analysisResult.summary,
      abnormalFindings: analysisResult.abnormalValues,
      riskLevel: analysisResult.riskLevel,
      recommendations: analysisResult.recommendations,
    });

    // 4. Update the Report document with summarized metrics
    report.extractedText = ocrResult.extractedText;
    report.summary = analysisResult.summary;
    report.riskLevel = analysisResult.riskLevel;
    report.abnormalValues = analysisResult.abnormalValues;
    report.ocrStatus = ocrResult.ocrStatus === 'completed' ? 'completed' : report.ocrStatus || 'completed';
    await report.save();

    // 5. Timeline Integration: REPORT_ANALYZED event
    await timelineService.createEvent({
      userId,
      eventType: 'REPORT_ANALYZED',
      category: 'report',
      title: 'Medical Report Analyzed',
      description: `${report.title} analyzed. Found ${analysisResult.abnormalValues.length} abnormal parameter(s). Risk: ${analysisResult.riskLevel.toUpperCase()}.`,
      metadata: {
        reportId: report._id,
        reportType: ocrResult.reportType,
        riskLevel: analysisResult.riskLevel,
        abnormalCount: analysisResult.abnormalValues.length,
      },
      relatedId: report._id,
    });

    // 6. Notification Integration:
    // a. Abnormal values detected
    if (analysisResult.abnormalValues.length > 0) {
      await createNotification({
        userId,
        title: 'Abnormal Values Detected in Report',
        message: `${report.title} contains ${analysisResult.abnormalValues.length} abnormal value(s). Please review your report analysis.`,
        type: 'alert',
        severity: analysisResult.riskLevel === 'critical' ? 'high' : 'warning',
        priority: 'high',
        route: `/reports`,
      });
    }

    // b. Doctor review recommended for elevated risk
    if (analysisResult.riskLevel === 'high' || analysisResult.riskLevel === 'critical') {
      await createNotification({
        userId,
        title: 'Doctor Review Recommended',
        message: `Clinical review is recommended for ${report.title} due to elevated risk parameters.`,
        type: 'appointment',
        severity: 'high',
        priority: 'high',
        route: `/consultations`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical report analyzed successfully',
      data: {
        analysisId: analysis._id,
        reportId: report._id,
        title: report.title,
        reportType: ocrResult.reportType,
        ocrStatus: ocrResult.ocrStatus,
        summary: analysisResult.summary,
        keyFindings: analysisResult.keyFindings,
        abnormalValues: analysisResult.abnormalValues,
        riskLevel: analysisResult.riskLevel,
        doctorQuestions: analysisResult.doctorQuestions,
        recommendations: analysisResult.recommendations,
        disclaimer: analysisResult.disclaimer,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    logger.error('Report analysis error', { error: error.message });
    next(error);
  }
}

/**
 * GET /api/reports/:id/analysis
 * Retrieves previous AI analysis for a report (IDOR protected)
 */
async function getReportAnalysis(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const analysis = await MedicalReportAnalysis.findOne({ reportId: id })
      .sort({ createdAt: -1 })
      .populate('reportId', 'title fileUrl category createdAt');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found for this medical report',
      });
    }

    // IDOR Protection: check user ownership
    if (analysis.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot access another patient\'s report analysis',
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeReport,
  getReportAnalysis,
};
