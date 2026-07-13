const { RISK } = require('../utils/constants');

const emergencyKeywords = [
  'chest pain',
  'unconscious',
  'can not breathe',
  'cannot breathe',
  'difficulty breathing',
  'stroke',
  'seizure',
  'fainted',
  'heart attack',
  'severe bleeding',
];

function computeRiskFromText(text = '') {
  const content = text.toLowerCase();

  const emergencyHit = emergencyKeywords.find((keyword) =>
    content.includes(keyword),
  );

  if (emergencyHit) {
    return {
      riskLevel: RISK.CRITICAL,
      requiresDoctor: true,
      emergencyDetected: true,
      triggerKeyword: emergencyHit,
    };
  }

  const mediumSignals = ['fever', 'persistent', 'pain', 'vomit', 'dizziness'];

  const highSignals = [
    'blood',
    'faint',
    'shortness of breath',
    'severe',
    'high fever',
  ];

  const highScore = highSignals.reduce(
    (count, signal) => count + (content.includes(signal) ? 1 : 0),
    0,
  );

  const mediumScore = mediumSignals.reduce(
    (count, signal) => count + (content.includes(signal) ? 1 : 0),
    0,
  );

  const score = highScore * 2 + mediumScore;

  if (score >= 4) {
    return {
      riskLevel: RISK.HIGH,
      requiresDoctor: true,
      emergencyDetected: false,
    };
  }

  if (score >= 2) {
    return {
      riskLevel: RISK.MEDIUM,
      requiresDoctor: false,
      emergencyDetected: false,
    };
  }

  return {
    riskLevel: RISK.LOW,
    requiresDoctor: false,
    emergencyDetected: false,
  };
}

module.exports = {
  computeRiskFromText,
  emergencyKeywords,
};
