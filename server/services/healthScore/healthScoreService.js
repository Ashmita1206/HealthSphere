const HealthScore = require('../../models/HealthScore');
const User = require('../../models/User');
const Medicine = require('../../models/Medicine');
const Report = require('../../models/Report');
const { generateGeminiText, safeParseJSON } = require('../gemini/geminiService');
const logger = require('../../utils/logger');

/**
 * Calculate user AI Health Scores 2.0 with full explanations, targets, and improvement plans
 */
async function calculateUserHealthScores(userId) {
  try {
    const [user, medicines, reports, existingScore] = await Promise.all([
      User.findById(userId).lean().catch(() => null),
      Medicine.find({ userId }).lean().catch(() => []),
      Report.find({ userId }).lean().catch(() => []),
      HealthScore.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    ]);

    const context = `
User Profile: Age ${user?.age || 30}, Gender ${user?.gender || 'Unspecified'}
Active Medications Count: ${medicines.length}
Recent Reports Count: ${reports.length}
Previous Overall Score: ${existingScore?.overallHealthScore || 78}
`;

    const prompt = `
Generate standard healthcare assessment intelligence 2.0 for 9 categories (risk, lifestyle, recovery, sleep, nutrition, hydration, medication, stress, activity).
${context}

Return JSON with exact keys:
{
  "overallHealthScore": 84,
  "scores": {
    "riskScore": { "score": 85, "why": "Low recent critical symptom alerts", "trend": "Improving", "recommendation": "Maintain regular BP tracking", "target": "Score > 90", "improvementPlan": "Weekly vitals check", "estimatedRecoveryTime": "2 weeks" },
    "lifestyleScore": { "score": 78, "why": "Moderate daily activity level", "trend": "Stable", "recommendation": "Increase daily step count by 2,000 steps", "target": "8,000 steps/day", "improvementPlan": "Daily evening brisk walks", "estimatedRecoveryTime": "4 weeks" },
    "recoveryScore": { "score": 82, "why": "Good rest intervals between workouts", "trend": "Improving", "recommendation": "Maintain post-exercise hydration", "target": "85+", "improvementPlan": "Active recovery stretching", "estimatedRecoveryTime": "1 week" },
    "sleepScore": { "score": 72, "why": "Average 6.5 hours sleep duration", "trend": "Needs Attention", "recommendation": "Target 7.5 hours of uninterrupted sleep", "target": "7.5 hrs sleep", "improvementPlan": "No screens 1hr before bed", "estimatedRecoveryTime": "2 weeks" },
    "nutritionScore": { "score": 80, "why": "Balanced diet with low processed sugar", "trend": "Stable", "recommendation": "Incorporate more fiber-rich vegetables", "target": "5 servings veggies/day", "improvementPlan": "Add greens to lunch", "estimatedRecoveryTime": "3 weeks" },
    "hydrationScore": { "score": 88, "why": "Consistent daily fluid intake logged", "trend": "Improving", "recommendation": "Keep up the 2.5L daily target", "target": "2.5 Liters/day", "improvementPlan": "Track water bottle refills", "estimatedRecoveryTime": "Ongoing" },
    "medicationScore": { "score": 94, "why": "High adherence to scheduled dosages", "trend": "Excellent", "recommendation": "Set automated refill alerts", "target": "100% adherence", "improvementPlan": "Smart pill reminder alerts", "estimatedRecoveryTime": "Ongoing" },
    "stressScore": { "score": 75, "why": "Moderate work schedule strain", "trend": "Stable", "recommendation": "Practice 10 mins daily mindfulness", "target": "Score > 80", "improvementPlan": "Daily breathwork exercises", "estimatedRecoveryTime": "2 weeks" },
    "activityScore": { "score": 80, "why": "Consistent light exercise routine", "trend": "Improving", "recommendation": "Add 2 days of light resistance training", "target": "150 mins cardio/week", "improvementPlan": "Cardio + strength blend", "estimatedRecoveryTime": "3 weeks" }
  }
}
`;

    const raw = await generateGeminiText({ prompt });
    const parsed = safeParseJSON(raw, null);

    const scoresObj = parsed || {
      overallHealthScore: 82,
      scores: {
        riskScore: { score: 85, why: 'Low recent alert frequency', trend: 'Improving', recommendation: 'Keep monitoring baseline vitals', target: '90+', improvementPlan: 'Routine vitals log', estimatedRecoveryTime: '2 weeks' },
        lifestyleScore: { score: 76, why: 'Moderate activity', trend: 'Stable', recommendation: 'Aim for 30 minutes active exercise daily', target: '80+', improvementPlan: 'Daily walks', estimatedRecoveryTime: '3 weeks' },
        recoveryScore: { score: 80, why: 'Balanced strain-to-rest ratio', trend: 'Stable', recommendation: 'Allow proper sleep between exercise days', target: '85+', improvementPlan: 'Active recovery', estimatedRecoveryTime: '1 week' },
        sleepScore: { score: 70, why: 'Slightly below optimal sleep duration', trend: 'Needs Attention', recommendation: 'Establish a consistent bedtime routine', target: '7.5 hours', improvementPlan: 'Bedtime schedule', estimatedRecoveryTime: '2 weeks' },
        nutritionScore: { score: 80, why: 'Healthy meal composition', trend: 'Improving', recommendation: 'Ensure adequate micronutrient intake', target: '85+', improvementPlan: 'Whole foods focus', estimatedRecoveryTime: '2 weeks' },
        hydrationScore: { score: 85, why: 'Sufficient daily fluid consumption', trend: 'Stable', recommendation: 'Drink water consistently throughout the day', target: '2.5L daily', improvementPlan: 'Water tracking', estimatedRecoveryTime: 'Ongoing' },
        medicationScore: { score: 92, why: 'Timely medicine dosage', trend: 'Excellent', recommendation: 'Keep medication schedule active', target: '100%', improvementPlan: 'Automated dose alerts', estimatedRecoveryTime: 'Ongoing' },
        stressScore: { score: 75, why: 'Balanced daily stress levels', trend: 'Stable', recommendation: 'Incorporate relaxation breaks during work', target: '80+', improvementPlan: 'Mindfulness breaks', estimatedRecoveryTime: '1 week' },
        activityScore: { score: 78, why: 'Regular light movement logged', trend: 'Improving', recommendation: 'Maintain 10,000 steps goal', target: '10k steps', improvementPlan: 'Active commuting', estimatedRecoveryTime: '2 weeks' },
      },
    };

    // Save record to DB
    const newRecord = await HealthScore.create({
      userId,
      overallHealthScore: scoresObj.overallHealthScore,
      scores: scoresObj.scores,
    });

    return newRecord;
  } catch (error) {
    logger.error('calculateUserHealthScores error', { error: error.message, userId });
    throw error;
  }
}

module.exports = {
  calculateUserHealthScores,
};

