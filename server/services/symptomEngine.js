/**
 * Symptom Engine for HealthSphere
 * Maps clinical symptoms to differential patterns, specialists, and red-flags.
 */

const SYMPTOM_SPECIALTY_MAP = [
  {
    keywords: ['chest pain', 'chest tightness', 'palpitations', 'heart racing', 'irregular heartbeat'],
    specialist: 'Cardiology',
    conditions: ['Angina Pectoris', 'Arrhythmia', 'Costochondritis', 'Coronary Artery Disease'],
  },
  {
    keywords: ['shortness of breath', 'breathlessness', 'wheezing', 'cough', 'phlegm', 'asthma'],
    specialist: 'Pulmonology',
    conditions: ['Bronchial Asthma', 'Acute Bronchitis', 'Upper Respiratory Infection', 'Pneumonia'],
  },
  {
    keywords: ['headache', 'dizziness', 'migraine', 'numbness', 'tingling', 'fainting', 'seizure', 'blurred vision'],
    specialist: 'Neurology',
    conditions: ['Migraine with Aura', 'Tension-Type Headache', 'Peripheral Neuropathy', 'Vestibular Dysfunction'],
  },
  {
    keywords: ['joint pain', 'knee pain', 'back pain', 'stiffness', 'arthritis', 'muscle ache', 'swelling in joints'],
    specialist: 'Orthopedics',
    conditions: ['Osteoarthritis', 'Musculoskeletal Strain', 'Lumbago', 'Tendinopathy'],
  },
  {
    keywords: ['stomach pain', 'abdominal pain', 'nausea', 'vomiting', 'acid reflux', 'heartburn', 'diarrhea', 'indigestion'],
    specialist: 'Gastroenterology',
    conditions: ['Gastroesophageal Reflux Disease (GERD)', 'Acute Gastritis', 'Functional Dyspepsia', 'Gastroenteritis'],
  },
  {
    keywords: ['skin rash', 'itching', 'hives', 'eczema', 'dry skin', 'dermatitis', 'acne'],
    specialist: 'Dermatology',
    conditions: ['Contact Dermatitis', 'Urticaria (Hives)', 'Eczematous Dermatitis', 'Allergic Dermatitis'],
  },
  {
    keywords: ['frequent urination', 'excessive thirst', 'sugar', 'thyroid', 'weight loss', 'fatigue', 'diabetes'],
    specialist: 'Endocrinology',
    conditions: ['Type 2 Diabetes Screening', 'Thyroid Dysfunction', 'Metabolic Syndrome', 'Chronic Fatigue'],
  },
  {
    keywords: ['sore throat', 'ear pain', 'nasal congestion', 'sinus', 'runny nose', 'earache'],
    specialist: 'ENT (Otolaryngology)',
    conditions: ['Viral Pharyngitis', 'Acute Sinusitis', 'Allergic Rhinitis', 'Otitis Media'],
  },
];

/**
 * Extract matched specialty and condition hints from symptoms
 */
function analyzeSymptoms(symptomsList = []) {
  const normalized = Array.isArray(symptomsList)
    ? symptomsList.map((s) => String(s).toLowerCase()).join(' ')
    : String(symptomsList).toLowerCase();

  let matchedSpecialist = 'General Physician';
  let possibleConditions = [];

  for (const entry of SYMPTOM_SPECIALTY_MAP) {
    const hasMatch = entry.keywords.some((keyword) => normalized.includes(keyword));
    if (hasMatch) {
      matchedSpecialist = entry.specialist;
      possibleConditions = entry.conditions;
      break;
    }
  }

  // If no specific match, default to General Practice conditions
  if (possibleConditions.length === 0) {
    possibleConditions = [
      'Non-specific Viral Syndrome',
      'Fatigue / Stress-related Symptom',
      'Mild General Infection',
    ];
  }

  return {
    suggestedSpecialist: matchedSpecialist,
    possibleConditions,
  };
}

module.exports = {
  analyzeSymptoms,
  SYMPTOM_SPECIALTY_MAP,
};
