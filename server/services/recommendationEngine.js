const { RISK } = require('../utils/constants');

function buildRecommendations({ riskLevel, emergencyDetected }) {
  if (emergencyDetected || riskLevel === RISK.CRITICAL) {
    return [
      'Call emergency services immediately.',
      'Do not delay seeking in-person medical help.',
      'Share your live location with a trusted contact.',
    ];
  }

  if (riskLevel === RISK.HIGH) {
    return [
      'Consult a doctor as soon as possible.',
      'Track symptom progression every few hours.',
      'Avoid strenuous activity until evaluated.',
    ];
  }

  if (riskLevel === RISK.MEDIUM) {
    return [
      'Monitor symptoms over the next 24 hours.',
      'Stay hydrated and get sufficient rest.',
      'Seek medical advice if symptoms worsen.',
    ];
  }

  return [
    'Continue self-monitoring and maintain healthy habits.',
    'Log recurring symptoms for trend analysis.',
    'Book a routine checkup if symptoms persist.',
  ];
}

function buildHealthInsights({ logs = [], reminders = [] }) {
  const insights = [];
  const symptomCounts = new Map();

  for (const log of logs) {
    for (const symptom of log.symptoms || []) {
      const key = symptom.toLowerCase();

      symptomCounts.set(key, (symptomCounts.get(key) || 0) + 1);
    }
  }

  for (const [symptom, count] of symptomCounts.entries()) {
    if (count >= 3) {
      insights.push(`High frequency of ${symptom} detected`);
    }
  }

  const inactiveReminders = reminders.filter(
    (reminder) => reminder.isActive === false,
  ).length;

  if (reminders.length > 0 && inactiveReminders / reminders.length >= 0.4) {
    insights.push('Medication adherence low');
  }

  if (insights.length === 0) {
    insights.push('No significant risk patterns detected');
  }

  return insights;
}

module.exports = {
  buildRecommendations,
  buildHealthInsights,
};
