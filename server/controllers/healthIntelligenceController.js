const { getUserHealthContext } = require('../services/aiContextService');
const { generateHealthScores } = require('../services/healthScoreEngine');
const { generateHealthInsights } = require('../services/aiService');
const { generateComprehensiveRecommendations } = require('../services/recommendationEngine');
const timelineService = require('../services/timelineService');
const { createNotification } = require('../services/notificationService');
const HealthScore = require('../models/HealthScore');
const HealthLog = require('../models/HealthLog');
const logger = require('../utils/logger');

/**
 * GET /api/health/intelligence
 * Computes full health intelligence, creates timeline audit, triggers relevant notifications
 */
async function getHealthIntelligence(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;

    // 1. Aggregate comprehensive context
    const context = await getUserHealthContext(userId);

    // 2. Generate multi-dimensional health scores
    const healthScoreResult = await generateHealthScores(context);

    // 3. Generate AI insights & risk assessment
    const insightsResult = await generateHealthInsights(context);

    // 4. Generate structured recommendations & wellness plan
    const recommendations = generateComprehensiveRecommendations(context);

    // 5. Query previous health score to track score delta/improvement
    const previousScoreRecord = await HealthScore.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const previousScore = previousScoreRecord?.overallHealthScore;
    const currentScore = healthScoreResult.overallHealthScore;
    const scoreImproved = typeof previousScore === 'number' && currentScore > previousScore;

    // 6. Save or update HealthScore record in DB
    await HealthScore.create({
      userId,
      overallHealthScore: currentScore,
      scores: healthScoreResult.scores,
      calculatedAt: new Date(),
    });

    // 7. Timeline Integration: AI_HEALTH_ANALYSIS event
    await timelineService.createEvent({
      userId,
      eventType: 'AI_HEALTH_ANALYSIS',
      category: 'ai',
      title: 'AI Health Analysis Performed',
      description: `Overall Health Score: ${currentScore}/100 (${healthScoreResult.status}). Risk Level: ${insightsResult.riskLevel.toUpperCase()}.`,
      metadata: {
        score: currentScore,
        riskLevel: insightsResult.riskLevel,
        timestamp: new Date().toISOString(),
      },
    });

    // 8. Notification Integration:
    // a. Critical health risk detected
    if (insightsResult.riskLevel === 'critical' || insightsResult.riskLevel === 'high') {
      await createNotification({
        userId,
        title: 'High Health Risk Alert',
        message: 'Your recent health analysis identified potential risk indicators. Please review recommendations.',
        type: 'alert',
        severity: 'high',
        priority: 'high',
        route: '/ai-chat',
      });
    }

    // b. Medication adherence dropping
    const adherenceRate = context?.medications?.adherence?.rate ?? 100;
    if (adherenceRate < 70 && (context?.medications?.activeCount || 0) > 0) {
      await createNotification({
        userId,
        title: 'Medication Adherence Alert',
        message: `Your medication adherence has dropped to ${adherenceRate}%. Consistent dosage is vital for health.`,
        type: 'medication',
        severity: 'warning',
        priority: 'high',
        route: '/medicines',
      });
    }

    // c. Doctor consultation recommended
    if (insightsResult.riskLevel !== 'low' || adherenceRate < 60) {
      await createNotification({
        userId,
        title: 'Doctor Consultation Recommended',
        message: 'Based on your latest biometric profile, consulting a physician is advised.',
        type: 'appointment',
        severity: 'info',
        priority: 'normal',
        route: '/consultations',
      });
    }

    // d. Health score improvement
    if (scoreImproved) {
      await createNotification({
        userId,
        title: 'Health Score Improved! 🎉',
        message: `Your overall health score increased from ${previousScore} to ${currentScore}. Keep up the great work!`,
        type: 'general',
        severity: 'info',
        priority: 'normal',
        route: '/analytics',
      });
    }

    // 9. Synthesize trends
    const trends = {
      scoreChange: previousScore ? currentScore - previousScore : 0,
      adherenceTrend: adherenceRate >= 80 ? 'Stable' : 'Declining',
      vitalsStability: context.vitals.abnormalVitalsCount === 0 ? 'Optimal' : 'Needs Monitoring',
      totalAssessmentsLogged: context.symptomHistory.totalAssessments,
    };

    res.status(200).json({
      success: true,
      data: {
        healthScore: healthScoreResult,
        insights: insightsResult.insights,
        risks: {
          level: insightsResult.riskLevel,
          summary: insightsResult.summary,
          keyObservations: insightsResult.keyObservations,
        },
        recommendations,
        trends,
        disclaimer: insightsResult.disclaimer,
      },
    });
  } catch (error) {
    logger.error('Health Intelligence error', { error: error.message });
    next(error);
  }
}

/**
 * GET /api/health/scores
 * Returns all individual sub-scores
 */
async function getHealthScores(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const scores = await generateHealthScores(userId);

    res.status(200).json({
      success: true,
      data: scores,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/health/trends
 * Analyzes health progress over time
 */
async function getHealthTrends(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;

    const [historicalScores, logs] = await Promise.all([
      HealthScore.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      HealthLog.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(15).lean(),
    ]);

    const scoreProgression = historicalScores.map((h) => ({
      score: h.overallHealthScore,
      date: h.createdAt,
    }));

    const bpReadings = logs
      .filter((l) => l.systolic && l.diastolic)
      .map((l) => ({
        systolic: l.systolic,
        diastolic: l.diastolic,
        date: l.date || l.createdAt,
      }));

    const glucoseReadings = logs
      .filter((l) => typeof l.glucose === 'number')
      .map((l) => ({
        glucose: l.glucose,
        date: l.date || l.createdAt,
      }));

    res.status(200).json({
      success: true,
      data: {
        scoreProgression,
        bpTrends: bpReadings,
        glucoseTrends: glucoseReadings,
        totalHistoricalEntries: historicalScores.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealthIntelligence,
  getHealthScores,
  getHealthTrends,
};
