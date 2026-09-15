/**
 * HealthSphere AI — Clinical Decision Support System (CDSS) Service
 * Implements differential diagnosis, drug-drug interaction checking,
 * contraindication evaluation, clinical guidelines, risk stratification,
 * confidence scoring, and explainable AI reasoning.
 */

const DRUG_INTERACTIONS_DB = [
  {
    drugs: ['warfarin', 'aspirin'],
    severity: 'CRITICAL',
    title: 'Severe Bleeding Risk',
    mechanism: 'Additive antiplatelet and anticoagulant pharmacodynamic synergy.',
    recommendation: 'Avoid concurrent administration unless under tight INR monitoring for mechanical valves.',
    citation: 'CHEST 2021 Antithrombotic Therapy Guidelines',
  },
  {
    drugs: ['sildenafil', 'nitroglycerin'],
    severity: 'CRITICAL',
    title: 'Fatal Hypotension Risk',
    mechanism: 'Severe potentiation of nitric oxide-mediated cyclic GMP vasodilation.',
    recommendation: 'Strictly contraindicated. Withhold sildenafil for at least 24 hours prior to nitrates.',
    citation: 'AHA/ACC 2023 Ischemic Heart Disease Guidelines',
  },
  {
    drugs: ['lisinopril', 'spironolactone'],
    severity: 'MAJOR',
    title: 'Hyperkalemia Risk',
    mechanism: 'Concurrent aldosterone inhibition and renin-angiotensin blockade reduces renal potassium excretion.',
    recommendation: 'Monitor serum potassium and renal function at baseline and 1-2 weeks post-initiation.',
    citation: 'KDIGO 2023 Blood Pressure in CKD Guidelines',
  },
  {
    drugs: ['simvastatin', 'clarithromycin'],
    severity: 'MAJOR',
    title: 'Severe Rhabdomyolysis & Myopathy',
    mechanism: 'CYP3A4 inhibition by clarithromycin markedly increases systemic simvastatin AUC.',
    recommendation: 'Suspend simvastatin during macrolide therapy or substitute with azithromycin.',
    citation: 'FDA Drug Safety Communication / ACC Statin Guidelines',
  },
  {
    drugs: ['fluoxetine', 'tramadol'],
    severity: 'MAJOR',
    title: 'Serotonin Syndrome & Seizure Risk',
    mechanism: 'Additive serotonergic agonism and inhibition of CYP2D6 metabolism of tramadol.',
    recommendation: 'Avoid combination. Monitor for hyperreflexia, clonus, diaphoresis, and autonomic instability.',
    citation: 'American Academy of Pain Medicine Clinical Updates',
  },
  {
    drugs: ['metformin', 'contrast'],
    severity: 'MODERATE',
    title: 'Contrast-Induced Lactic Acidosis',
    mechanism: 'Iodinated radiocontrast may cause acute renal impairment, impairing metformin clearance.',
    recommendation: 'Discontinue metformin prior to or at time of iodinated contrast study; resume after 48h if eGFR stable.',
    citation: 'ACR Manual on Contrast Media 2023',
  },
];

const CONTRAINDICATIONS_DB = [
  {
    conditionOrAllergy: 'penicillin allergy',
    drug: 'amoxicillin',
    severity: 'CONTRAINDICATED',
    reason: 'Cross-reactive beta-lactam anaphylaxis or severe cutaneous adverse reaction (SCAR).',
    alternative: 'Azithromycin, Doxycycline, or Levofloxacin based on indication.',
  },
  {
    conditionOrAllergy: 'pregnancy',
    drug: 'lisinopril',
    severity: 'CONTRAINDICATED',
    reason: 'Category D/X teratogenicity: oligohydramnios, neonatal renal hypoplasia, and fetal skull deformities.',
    alternative: 'Labetalol, Methyldopa, or Nifedipine extended-release.',
  },
  {
    conditionOrAllergy: 'severe renal impairment',
    drug: 'metformin',
    severity: 'CONTRAINDICATED',
    reason: 'Estimated GFR < 30 mL/min/1.73m² leads to high risk of life-threatening metformin-associated lactic acidosis.',
    alternative: 'Linagliptin or Insulin glargine titration.',
  },
  {
    conditionOrAllergy: 'peptic ulcer disease',
    drug: 'ibuprofen',
    severity: 'CONTRAINDICATED',
    reason: 'Nonselective COX inhibition depletes protective gastric prostaglandins, causing GI bleeding/perforation.',
    alternative: 'Acetaminophen (Paracetamol) or topical therapies.',
  },
  {
    conditionOrAllergy: 'severe asthma',
    drug: 'propranolol',
    severity: 'CONTRAINDICATED',
    reason: 'Non-selective beta-2 blockade can trigger severe, life-threatening bronchospasm.',
    alternative: 'Cardioselective beta-1 blockers (e.g., Metoprolol succinate, Bisoprolol) with caution, or CCBs.',
  },
];

const DIFFERENTIAL_RULES = [
  {
    conditions: ['chest pain', 'dyspnea', 'diaphoresis'],
    diagnosis: 'Acute Coronary Syndrome (NSTEMI / STEMI)',
    icd10: 'I20.0',
    baseConfidence: 88,
    priority: 'CRITICAL',
    reasoning: 'Triad of acute chest pain, breathlessness, and diaphoresis strongly correlates with myocardial ischemia.',
    recommendedActions: [
      'Stat 12-lead ECG within 10 minutes of presentation',
      'Serial high-sensitivity cardiac troponin (hs-cTnI) at 0h, 1h, and 3h',
      'Emergency cardiology consultation / Cardiac catheterization lab activation',
    ],
  },
  {
    conditions: ['fever', 'cough', 'dyspnea', 'crackles'],
    diagnosis: 'Community-Acquired Pneumonia (CAP)',
    icd10: 'J18.9',
    baseConfidence: 82,
    priority: 'HIGH',
    reasoning: 'Fever accompanied by productive cough, respiratory distress, and crackles suggests lower respiratory tract consolidation.',
    recommendedActions: [
      'Chest X-Ray (PA and Lateral views)',
      'CURB-65 pneumonia severity score calculation',
      'Sputum Gram stain, blood cultures, and empiric antimicrobial therapy within 4 hours',
    ],
  },
  {
    conditions: ['polyuria', 'polydipsia', 'fatigue', 'hyperglycemia'],
    diagnosis: 'Type 2 Diabetes Mellitus with Hyperglycemia',
    icd10: 'E11.9',
    baseConfidence: 85,
    priority: 'MODERATE',
    reasoning: 'Osmotic diuresis triad (polyuria, polydipsia) with chronic fatigue and elevated plasma glucose confirms metabolic dysregulation.',
    recommendedActions: [
      'Fasting plasma glucose and venous HbA1c confirmation',
      'Serum ketones and basic metabolic panel to exclude diabetic ketoacidosis (DKA)',
      'Baseline microalbuminuria, lipid panel, and comprehensive diabetic education',
    ],
  },
  {
    conditions: ['fever', 'headache', 'neck stiffness'],
    diagnosis: 'Acute Bacterial / Viral Meningitis',
    icd10: 'G03.9',
    baseConfidence: 91,
    priority: 'CRITICAL',
    reasoning: 'Classic meningeal irritation triad with fever mandates immediate exclusion of central nervous system infection.',
    recommendedActions: [
      'Emergency lumbar puncture for CSF analysis, protein, glucose, and PCR',
      'Stat blood cultures followed immediately by empiric broad-spectrum IV antibiotics and Dexamethasone',
      'Non-contrast head CT prior to LP if focal neurological signs or papilledema present',
    ],
  },
];

class ClinicalDecisionSupportService {
  /**
   * Evaluates pairwise drug interactions among a list of prescribed/proposed medications.
   */
  checkDrugInteractions(medications = []) {
    if (!Array.isArray(medications) || medications.length < 2) {
      return { hasInteractions: false, interactions: [] };
    }

    const normalized = medications.map((m) => String(m).toLowerCase().trim());
    const detected = [];

    for (const rule of DRUG_INTERACTIONS_DB) {
      const matchAll = rule.drugs.every((d) =>
        normalized.some((userMed) => userMed.includes(d)),
      );

      if (matchAll) {
        detected.push({
          drugs: rule.drugs,
          severity: rule.severity,
          title: rule.title,
          mechanism: rule.mechanism,
          recommendation: rule.recommendation,
          citation: rule.citation,
        });
      }
    }

    return {
      hasInteractions: detected.length > 0,
      count: detected.length,
      highestSeverity: detected.some((i) => i.severity === 'CRITICAL')
        ? 'CRITICAL'
        : detected.some((i) => i.severity === 'MAJOR')
          ? 'MAJOR'
          : detected.some((i) => i.severity === 'MODERATE')
            ? 'MODERATE'
            : 'NONE',
      interactions: detected,
    };
  }

  /**
   * Checks proposed medications against patient conditions, allergies, and pregnancy status.
   */
  checkContraindications({ conditions = [], allergies = [], isPregnant = false, eGFR = null }, proposedDrugs = []) {
    const alerts = [];
    const patientFactors = [
      ...conditions.map((c) => String(c).toLowerCase().trim()),
      ...allergies.map((a) => `${String(a).toLowerCase().trim()} allergy`),
    ];

    if (isPregnant) {
      patientFactors.push('pregnancy');
    }
    if (eGFR !== null && eGFR < 30) {
      patientFactors.push('severe renal impairment');
    }

    const normalizedDrugs = proposedDrugs.map((d) => String(d).toLowerCase().trim());

    for (const rule of CONTRAINDICATIONS_DB) {
      const drugMatch = normalizedDrugs.some((drug) => drug.includes(rule.drug));
      const factorMatch = patientFactors.some((factor) => factor.includes(rule.conditionOrAllergy) || rule.conditionOrAllergy.includes(factor));

      if (drugMatch && factorMatch) {
        alerts.push({
          drug: rule.drug,
          trigger: rule.conditionOrAllergy,
          severity: rule.severity,
          reason: rule.reason,
          alternative: rule.alternative,
        });
      }
    }

    return {
      hasContraindications: alerts.length > 0,
      count: alerts.length,
      alerts,
    };
  }

  /**
   * Generates differential diagnosis suggestions based on patient symptoms, vitals, and medical history.
   */
  generateDifferentialDiagnosis({ symptoms = [], vitals = {}, medicalHistory = [], age = null, gender = null }) {
    const patientKeywords = [
      ...symptoms.map((s) => String(s).toLowerCase().trim()),
      ...medicalHistory.map((h) => String(h).toLowerCase().trim()),
    ];

    // Include vitals markers
    if (vitals.temperature && vitals.temperature >= 38.0) patientKeywords.push('fever');
    if (vitals.bloodPressureSys && vitals.bloodPressureSys >= 140) patientKeywords.push('hypertension');
    if (vitals.bloodSugar && vitals.bloodSugar >= 180) patientKeywords.push('hyperglycemia');
    if (vitals.heartRate && vitals.heartRate >= 100) patientKeywords.push('tachycardia');

    const differentials = [];

    for (const rule of DIFFERENTIAL_RULES) {
      const matchedSymptoms = rule.conditions.filter((cond) =>
        patientKeywords.some((keyword) => keyword.includes(cond) || cond.includes(keyword)),
      );

      if (matchedSymptoms.length >= 2) {
        // Compute Bayesian-like adjusted confidence score
        const matchRatio = matchedSymptoms.length / rule.conditions.length;
        let confidenceScore = Math.round(rule.baseConfidence * matchRatio);

        // Adjust for age/history risk factors
        if (age && age > 60 && rule.priority === 'CRITICAL') {
          confidenceScore = Math.min(99, confidenceScore + 5);
        }

        differentials.push({
          diagnosis: rule.diagnosis,
          icd10: rule.icd10,
          priority: rule.priority,
          confidenceScore,
          matchedEvidence: matchedSymptoms,
          clinicalReasoning: rule.reasoning,
          recommendedActions: rule.recommendedActions,
        });
      }
    }

    // Sort by confidence score descending
    differentials.sort((a, b) => b.confidenceScore - a.confidenceScore);

    return {
      totalFound: differentials.length,
      differentials,
    };
  }

  /**
   * Performs clinical risk stratification into Low, Moderate, High, or Critical.
   */
  evaluateRiskStratification({ age = 35, vitals = {}, conditions = [], medications = [] }) {
    let riskPoints = 0;
    const riskFactors = [];

    // Age factor
    if (age >= 65) {
      riskPoints += 2;
      riskFactors.push('Advanced age (≥ 65 years)');
    } else if (age >= 50) {
      riskPoints += 1;
      riskFactors.push('Age 50–64 years');
    }

    // Vitals factors
    if (vitals.bloodPressureSys && vitals.bloodPressureSys >= 160) {
      riskPoints += 3;
      riskFactors.push(`Stage 2 Hypertension (Sys ${vitals.bloodPressureSys} mmHg)`);
    } else if (vitals.bloodPressureSys && vitals.bloodPressureSys >= 140) {
      riskPoints += 1;
      riskFactors.push('Stage 1 Hypertension');
    }

    if (vitals.spo2 && vitals.spo2 < 92) {
      riskPoints += 4;
      riskFactors.push(`Severe Hypoxemia (SpO2 ${vitals.spo2}%)`);
    } else if (vitals.spo2 && vitals.spo2 < 95) {
      riskPoints += 2;
      riskFactors.push(`Mild-to-moderate Hypoxemia (SpO2 ${vitals.spo2}%)`);
    }

    if (vitals.heartRate && (vitals.heartRate > 120 || vitals.heartRate < 45)) {
      riskPoints += 2;
      riskFactors.push(`Abnormal Resting Heart Rate (${vitals.heartRate} bpm)`);
    }

    // Chronic Comorbidities
    const chronicList = conditions.map((c) => String(c).toLowerCase());
    if (chronicList.some((c) => c.includes('heart failure') || c.includes('cad') || c.includes('stroke'))) {
      riskPoints += 3;
      riskFactors.push('Established Cardiovascular / Cerebrovascular Disease');
    }
    if (chronicList.some((c) => c.includes('diabetes'))) {
      riskPoints += 2;
      riskFactors.push('Diabetes Mellitus Comorbidity');
    }
    if (chronicList.some((c) => c.includes('ckd') || c.includes('renal'))) {
      riskPoints += 3;
      riskFactors.push('Chronic Kidney Disease (CKD)');
    }

    let riskTier = 'LOW';
    if (riskPoints >= 8) riskTier = 'CRITICAL';
    else if (riskPoints >= 5) riskTier = 'HIGH';
    else if (riskPoints >= 2) riskTier = 'MODERATE';

    return {
      riskTier,
      riskScore: riskPoints,
      riskFactors,
      monitoringInterval: riskTier === 'CRITICAL' ? 'Continuous / ICU' : riskTier === 'HIGH' ? 'Every 4 hours' : riskTier === 'MODERATE' ? 'Daily' : 'Routine / Outpatient',
    };
  }

  /**
   * Suggests clinical guidelines based on current patient diagnosis and medications.
   */
  getClinicalGuidelineRecommendations({ conditions = [], vitals = {} }) {
    const recommendations = [];
    const lowerConditions = conditions.map((c) => String(c).toLowerCase());

    if (lowerConditions.some((c) => c.includes('hypertension'))) {
      recommendations.push({
        guideline: '2023 ACC/AHA Prevention of Cardiovascular Disease',
        target: 'Target blood pressure < 130/80 mmHg',
        intervention: 'Lifestyle modification, sodium restriction (< 2g/day), and combination first-line ACEi/ARB + CCB or Thiazide.',
      });
    }

    if (lowerConditions.some((c) => c.includes('diabetes'))) {
      recommendations.push({
        guideline: '2024 ADA Standards of Care in Diabetes',
        target: 'Target HbA1c < 7.0% for non-pregnant adults',
        intervention: 'Metformin first-line plus SGLT2 inhibitor (e.g. Empagliflozin) or GLP-1 RA if cardiovascular or renal disease present.',
      });
    }

    if (lowerConditions.some((c) => c.includes('asthma') || c.includes('copd'))) {
      recommendations.push({
        guideline: 'GINA / GOLD 2023 Global Guidelines',
        target: 'Symptom control and exacerbation risk reduction',
        intervention: 'Inhaled corticosteroid (ICS) + Formoterol as preferred track for maintenance and reliever therapy.',
      });
    }

    return recommendations;
  }

  /**
   * Synthesizes full CDSS evaluation with explainable AI reasoning.
   */
  async evaluatePatientCase(caseData) {
    const {
      patientId = 'anon',
      age = 45,
      gender = 'unspecified',
      symptoms = [],
      vitals = {},
      conditions = [],
      allergies = [],
      currentMedications = [],
      proposedMedications = [],
      isPregnant = false,
      eGFR = null,
    } = caseData;

    const allDrugs = [...currentMedications, ...proposedMedications];

    const interactions = this.checkDrugInteractions(allDrugs);
    const contraindications = this.checkContraindications(
      { conditions, allergies, isPregnant, eGFR },
      proposedMedications.length > 0 ? proposedMedications : currentMedications,
    );
    const differentials = this.generateDifferentialDiagnosis({
      symptoms,
      vitals,
      medicalHistory: conditions,
      age,
      gender,
    });
    const riskStratification = this.evaluateRiskStratification({
      age,
      vitals,
      conditions,
      medications: allDrugs,
    });
    const guidelines = this.getClinicalGuidelineRecommendations({ conditions, vitals });

    // Explainable AI Reasoning Synthesis
    const reasoningSummary = [];
    if (differentials.differentials.length > 0) {
      reasoningSummary.push(
        `Top differential ${differentials.differentials[0].diagnosis} identified with ${differentials.differentials[0].confidenceScore}% confidence based on clinical presentation.`,
      );
    }
    if (interactions.hasInteractions) {
      reasoningSummary.push(
        `Alert: Detected ${interactions.count} drug-drug interaction(s) with highest severity ${interactions.highestSeverity}.`,
      );
    }
    if (contraindications.hasContraindications) {
      reasoningSummary.push(
        `Warning: ${contraindications.count} contraindication alert(s) triggered by patient allergies or comorbidities.`,
      );
    }
    reasoningSummary.push(
      `Patient stratified as ${riskStratification.riskTier} risk (Score: ${riskStratification.riskScore}).`,
    );

    return {
      timestamp: new Date().toISOString(),
      patientId,
      summary: reasoningSummary.join(' '),
      differentials: differentials.differentials,
      drugInteractions: interactions,
      contraindications,
      riskStratification,
      guidelines,
      confidenceScore: differentials.differentials.length > 0 ? differentials.differentials[0].confidenceScore : 75,
      explainabilityTrace: {
        engine: 'HealthSphere-CDSS-Rules-v4',
        evaluatedAt: new Date().toISOString(),
        evidenceSources: [
          'AHA/ACC Cardiology Practice Guidelines',
          'American Diabetes Association Standards of Care',
          'KDIGO Nephrology Clinical Practice Guidelines',
          'FDA Drug Interaction Reference Database',
        ],
      },
    };
  }
}

const cdssService = new ClinicalDecisionSupportService();

module.exports = {
  cdssService,
  ClinicalDecisionSupportService,
  DRUG_INTERACTIONS_DB,
  CONTRAINDICATIONS_DB,
  DIFFERENTIAL_RULES,
};
