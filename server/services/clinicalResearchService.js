const seedTrials = [
  {
    trialId: 'NCT-05891244',
    title: 'Phase III Randomized Study of Bispecific HER2/CD3 BiTE vs Standard Trastuzumab in Refractory Breast Carcinoma',
    phase: 'Phase III',
    therapeuticArea: 'Oncology',
    principalInvestigator: 'Dr. Helena Chen, MD, PhD',
    sponsor: 'BioGenetics Oncology Global',
    targetEnrollment: 450,
    currentEnrolled: 312,
    status: 'recruiting',
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 75,
      gender: 'Female',
      inclusionConditions: ['Invasive Ductal Carcinoma', 'HER2-Positive (IHC 3+ or FISH amplified)', 'ECOG Performance Status 0-1'],
      exclusionConditions: ['Active CNS metastases', 'NYHA Class III/IV congestive heart failure', 'Prior anthracycline toxicity'],
      biomarkerRequirements: ['HER2+', 'LVEF >= 50%']
    },
    primaryEndpoints: ['Progression-Free Survival (PFS)', 'Overall Response Rate (ORR)'],
    startDate: '2024-03-01',
    estimatedCompletionDate: '2027-08-30'
  },
  {
    trialId: 'NCT-04921008',
    title: 'Cardioprotective Efficacy of Novel SGLT2 Dual Inhibitor in Patients with Heart Failure and Mildly Reduced EF (HFmrEF)',
    phase: 'Phase II',
    therapeuticArea: 'Cardiology',
    principalInvestigator: 'Dr. Marcus Vance, MD, FACC',
    sponsor: 'CardioCure Therapeutics',
    targetEnrollment: 300,
    currentEnrolled: 240,
    status: 'recruiting',
    eligibilityCriteria: {
      minAge: 40,
      maxAge: 85,
      gender: 'All',
      inclusionConditions: ['Heart Failure', 'Ejection Fraction 41-49%', 'Elevated NT-proBNP > 300 pg/mL'],
      exclusionConditions: ['End-Stage Renal Disease (eGFR < 20)', 'Type 1 Diabetes Mellitus', 'Severe Aortic Stenosis'],
      biomarkerRequirements: ['NT-proBNP > 300 pg/mL', 'eGFR >= 25 mL/min/1.73m2']
    },
    primaryEndpoints: ['Time to First Cardiovascular Death or HF Hospitalization'],
    startDate: '2023-09-15',
    estimatedCompletionDate: '2026-12-31'
  },
  {
    trialId: 'NCT-06129481',
    title: 'Evaluation of Anti-Tau Monoclonal Immunotherapy on Tau Pathology and Cognitive Decline in Prodromal Alzheimer’s',
    phase: 'Phase II',
    therapeuticArea: 'Neurology',
    principalInvestigator: 'Dr. Evelyn Reed, MD',
    sponsor: 'NeuroSphere Health Research',
    targetEnrollment: 200,
    currentEnrolled: 85,
    status: 'recruiting',
    eligibilityCriteria: {
      minAge: 55,
      maxAge: 80,
      gender: 'All',
      inclusionConditions: ['Mild Cognitive Impairment (MCI)', 'Positive Amyloid/Tau PET Scan', 'MMSE Score 22-28'],
      exclusionConditions: ['Major Depressive Episode', 'History of Stroke within 12 months', 'MRI Contraindications'],
      biomarkerRequirements: ['CSF Phospho-Tau181 > 60 pg/mL', 'Amyloid Beta 42/40 ratio < 0.09']
    },
    primaryEndpoints: ['Change from baseline in CDR-SB (Clinical Dementia Rating Sum of Boxes) at 78 weeks'],
    startDate: '2024-06-01',
    estimatedCompletionDate: '2028-02-15'
  }
];

const seedEnrollments = [
  {
    enrollmentId: 'ENR-901',
    trialId: 'NCT-05891244',
    patientId: 'PT-302',
    patientName: 'Maya Lin',
    eligibilityScore: 95,
    cohortAssignment: 'Arm A (Bispecific BiTE + Standard Chemo)',
    enrollmentDate: '2024-11-10T10:00:00.000Z',
    status: 'randomized'
  },
  {
    enrollmentId: 'ENR-902',
    trialId: 'NCT-04921008',
    patientId: 'PT-301',
    patientName: 'Arthur Dent',
    eligibilityScore: 92,
    cohortAssignment: 'Arm B (Placebo + Standard of Care)',
    enrollmentDate: '2024-12-05T14:30:00.000Z',
    status: 'randomized'
  }
];

const seedPublications = [
  {
    publicationId: 'PUB-2025-01',
    trialId: 'NCT-05891244',
    title: 'Interim Phase II Biomarker Correlates of Bispecific HER2 Engagement in Advanced Solid Tumors',
    journal: 'New England Journal of Medicine (NEJM)',
    doi: '10.1056/NEJMoa2408912',
    impactFactor: 158.5,
    publicationDate: '2025-01-16',
    citationCount: 42,
    abstract: 'Bispecific antibody engagement demonstrates robust T-cell activation and tumor regression in trastuzumab-resistant patient cohorts.'
  },
  {
    publicationId: 'PUB-2024-02',
    trialId: 'NCT-04921008',
    title: 'Neurohormonal and Renal Hemodynamic Biomarkers in Mildly Reduced Ejection Fraction Heart Failure',
    journal: 'The Lancet Cardiology',
    doi: '10.1016/S0140-6736(24)00412-9',
    impactFactor: 168.9,
    publicationDate: '2024-10-12',
    citationCount: 78,
    abstract: 'Dual SGLT2 inhibition preserves glomerular filtration rate while significantly reducing NT-proBNP biomarker curves in ambulatory HFmrEF cohorts.'
  }
];

let activeTrials = JSON.parse(JSON.stringify(seedTrials));
let activeEnrollments = JSON.parse(JSON.stringify(seedEnrollments));

class ClinicalResearchService {
  /**
   * Enterprise Research Operations Overview
   */
  async getResearchOverview() {
    const totalEnrolled = activeTrials.reduce((acc, t) => acc + t.currentEnrolled, 0);
    const targetEnrolled = activeTrials.reduce((acc, t) => acc + t.targetEnrollment, 0);
    const overallRecruitmentProgress = targetEnrolled > 0 ? Math.round((totalEnrolled / targetEnrolled) * 100) : 0;

    return {
      timestamp: new Date().toISOString(),
      summary: {
        activeClinicalTrialsCount: activeTrials.length,
        recruitingTrialsCount: activeTrials.filter(t => t.status === 'recruiting').length,
        totalSubjectsEnrolled: totalEnrolled,
        targetEnrollmentTotal: targetEnrolled,
        recruitmentProgressPercentage: overallRecruitmentProgress,
        peerReviewedPublicationsCount: seedPublications.length,
        averageSubjectRetentionRatePct: 96.4
      },
      therapeuticAreas: [
        { area: 'Oncology', activeStudies: 1, enrolled: 312 },
        { area: 'Cardiology', activeStudies: 1, enrolled: 240 },
        { area: 'Neurology', activeStudies: 1, enrolled: 85 }
      ]
    };
  }

  /**
   * List and filter clinical trials
   */
  async getTrials(query = {}) {
    let trials = [...activeTrials];
    if (query.phase) {
      trials = trials.filter(t => t.phase.toLowerCase() === query.phase.toLowerCase());
    }
    if (query.therapeuticArea) {
      trials = trials.filter(t => t.therapeuticArea.toLowerCase() === query.therapeuticArea.toLowerCase());
    }
    if (query.status) {
      trials = trials.filter(t => t.status.toLowerCase() === query.status.toLowerCase());
    }
    return trials;
  }

  /**
   * AI Eligibility Matching Engine
   */
  async matchPatientEligibility(patientProfile) {
    const { age, gender, diagnoses = [], biomarkers = [], medicalHistory = [] } = patientProfile;

    if (!age || !gender) {
      throw new Error('Patient profile requires age and gender for clinical trial matching');
    }

    const matches = activeTrials.map(trial => {
      let score = 50; // base potential
      const reasons = [];
      const criteria = trial.eligibilityCriteria;

      // Age check
      if (age >= criteria.minAge && age <= criteria.maxAge) {
        score += 15;
        reasons.push(`Patient age (${age}) is within trial window [${criteria.minAge}-${criteria.maxAge} years]`);
      } else {
        score -= 40;
        reasons.push(`Patient age (${age}) is outside required trial criteria [${criteria.minAge}-${criteria.maxAge} years]`);
      }

      // Gender check
      if (criteria.gender === 'All' || criteria.gender.toLowerCase() === gender.toLowerCase()) {
        score += 10;
        reasons.push(`Gender match confirmed (${gender})`);
      } else {
        score -= 40;
        reasons.push(`Gender requirement mismatch (Trial strictly requires: ${criteria.gender})`);
      }

      // Inclusion condition overlap
      const hasCondition = criteria.inclusionConditions.some(cond => 
        diagnoses.some(d => cond.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(cond.toLowerCase()))
      );

      if (hasCondition) {
        score += 25;
        reasons.push('Primary inclusion medical diagnosis verified in health record');
      }

      // Exclusion criteria check
      const hasExclusion = criteria.exclusionConditions.some(excl => 
        medicalHistory.some(h => excl.toLowerCase().includes(h.toLowerCase()) || h.toLowerCase().includes(excl.toLowerCase()))
      );

      if (hasExclusion) {
        score -= 50;
        reasons.push('Patient presents a documented exclusion condition');
      }

      const normalizedScore = Math.max(0, Math.min(100, score));

      return {
        trialId: trial.trialId,
        title: trial.title,
        phase: trial.phase,
        therapeuticArea: trial.therapeuticArea,
        eligibilityScore: normalizedScore,
        isEligible: normalizedScore >= 75,
        reasons
      };
    });

    matches.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

    return {
      evaluatedAt: new Date().toISOString(),
      patientSummary: { age, gender, diagnosesCount: diagnoses.length },
      matchedTrials: matches
    };
  }

  /**
   * Enroll Subject with AI Cohort Selection / Randomization
   */
  async enrollSubject(enrollmentData) {
    const { trialId, patientId, patientName, eligibilityScore } = enrollmentData;
    if (!trialId || !patientId || !patientName) {
      throw new Error('Trial enrollment requires trialId, patientId, and patientName');
    }

    const trial = activeTrials.find(t => t.trialId === trialId);
    if (!trial) {
      throw new Error(`Trial with ID ${trialId} not found`);
    }

    if (trial.status !== 'recruiting') {
      throw new Error(`Trial ${trialId} is not currently recruiting (Status: ${trial.status})`);
    }

    // Stratified 1:1 Randomization
    const cohortArm = Math.random() >= 0.5 ? 'Arm A (Active Investigational Drug)' : 'Arm B (Standard of Care / Control)';

    const enrollment = {
      enrollmentId: `ENR-${Math.floor(1000 + Math.random() * 9000)}`,
      trialId,
      patientId,
      patientName,
      eligibilityScore: Number(eligibilityScore) || 88,
      cohortAssignment: cohortArm,
      enrollmentDate: new Date().toISOString(),
      status: 'randomized'
    };

    activeEnrollments.push(enrollment);
    trial.currentEnrolled += 1;

    return {
      success: true,
      message: `Subject ${patientName} successfully randomized into ${cohortArm}`,
      enrollment,
      updatedTrialStats: {
        trialId: trial.trialId,
        currentEnrolled: trial.currentEnrolled,
        targetEnrollment: trial.targetEnrollment
      }
    };
  }

  /**
   * Get Enrolled Subjects for Trial
   */
  async getEnrolledSubjects(trialId) {
    if (!trialId) throw new Error('trialId is required');
    return activeEnrollments.filter(e => e.trialId === trialId);
  }

  /**
   * Research Analytics & Metrics
   */
  async getResearchAnalytics() {
    return {
      recruitmentVelocityByPhase: [
        { phase: 'Phase II', avgEnrolledPerMonth: 18.5, targetMonthlyTarget: 20 },
        { phase: 'Phase III', avgEnrolledPerMonth: 34.2, targetMonthlyTarget: 30 }
      ],
      diversityMetrics: {
        femalePercentage: 54.2,
        malePercentage: 45.8,
        underrepresentedCohortsRatio: 38.4
      },
      trialCompletionForecast: activeTrials.map(t => ({
        trialId: t.trialId,
        phase: t.phase,
        completionProjection: t.estimatedCompletionDate,
        onSchedule: true
      }))
    };
  }

  /**
   * Research Publications Dashboard
   */
  async getPublications() {
    return seedPublications;
  }
}

module.exports = new ClinicalResearchService();
