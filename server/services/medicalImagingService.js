const MedicalImage = require('../models/MedicalImage');

class MedicalImagingService {
  /**
   * Generates deep learning simulation annotations and Grad-CAM heatmap for radiological scans.
   */
  generateAIAnalysis(modality, bodyPart) {
    const normModality = String(modality).toUpperCase();
    const normPart = String(bodyPart).toUpperCase();

    let annotations = [];
    let findings = 'No acute cardiopulmonary or intracranial abnormality identified.';
    let impression = 'Normal physiological baseline scan.';
    let followUp = 'Routine clinical follow-up as indicated.';
    let rads = 'RADS-1 (Negative)';
    let confidence = 94;
    let peakX = 50;
    let peakY = 50;

    if (normModality === 'X-RAY' && normPart.includes('CHEST')) {
      annotations = [
        {
          id: 'ann-cxr-1',
          label: 'Right Middle Lobe Consolidation',
          box: { x: 58, y: 42, width: 18, height: 16 },
          confidence: 91,
          severity: 'ACUTE',
        },
        {
          id: 'ann-cxr-2',
          label: 'Blunting of Costophrenic Angle (Pleural Effusion)',
          box: { x: 68, y: 76, width: 12, height: 10 },
          confidence: 86,
          severity: 'SUSPICIOUS',
        },
      ];
      findings = 'Patchy airspace opacity in right mid-lung zone with subtle blunting of the right costophrenic sulcus. Cardiac silhouette normal in size.';
      impression = 'Right middle lobe pneumonia with small reactive pleural effusion.';
      followUp = 'Follow-up PA chest radiograph in 6 weeks post antibiotic course.';
      rads = 'Infectious Pneumonic Process';
      confidence = 91;
      peakX = 64;
      peakY = 48;
    } else if (normModality === 'CT' && (normPart.includes('BRAIN') || normPart.includes('HEAD'))) {
      annotations = [
        {
          id: 'ann-ct-1',
          label: 'Hyperdense Acute Subdural Hematoma',
          box: { x: 22, y: 35, width: 14, height: 28 },
          confidence: 96,
          severity: 'ACUTE',
        },
      ];
      findings = 'Crescent-shaped hyperattenuating extra-axial fluid collection along the left frontoparietal convexity measuring up to 7mm with 3mm midline shift.';
      impression = 'Acute left hemispheric subdural hematoma with mass effect.';
      followUp = 'Emergency neurosurgical consultation for decompression evaluation.';
      rads = 'ACUTE EMERGENCY';
      confidence = 96;
      peakX = 26;
      peakY = 45;
    } else if (normModality === 'MRI' && normPart.includes('KNEE')) {
      annotations = [
        {
          id: 'ann-mri-1',
          label: 'Medial Meniscus Posterior Horn Tear',
          box: { x: 44, y: 52, width: 10, height: 8 },
          confidence: 89,
          severity: 'SUSPICIOUS',
        },
      ];
      findings = 'Linear high signal intensity extending to the inferior articular surface of the posterior horn of the medial meniscus on PD-weighted images.';
      impression = 'Complex grade 3 tear of the medial meniscus posterior horn.';
      followUp = 'Orthopedic surgical consultation for possible arthroscopic repair.';
      rads = 'Grade 3 Meniscal Tear';
      confidence = 89;
      peakX = 48;
      peakY = 54;
    } else if (normModality === 'ULTRASOUND' && (normPart.includes('ABDOMEN') || normPart.includes('LIVER'))) {
      annotations = [
        {
          id: 'ann-us-1',
          label: 'Cholelithiasis with Acoustic Shadowing',
          box: { x: 50, y: 38, width: 15, height: 12 },
          confidence: 93,
          severity: 'SUSPICIOUS',
        },
      ];
      findings = 'Echogenic foci within the gallbladder lumen demonstrating posterior acoustic shadowing. Gallbladder wall thickness within normal limits (2mm).';
      impression = 'Cholelithiasis without evidence of acute cholecystitis.';
      followUp = 'Elective general surgery consult for symptomatic cholecystectomy.';
      rads = 'Cholelithiasis';
      confidence = 93;
      peakX = 55;
      peakY = 42;
    }

    // Generate Grad-CAM activation points around peak
    const activationPoints = [
      { x: peakX, y: peakY, weight: 1.0 },
      { x: peakX - 5, y: peakY - 4, weight: 0.75 },
      { x: peakX + 6, y: peakY + 3, weight: 0.8 },
      { x: peakX - 2, y: peakY + 6, weight: 0.65 },
      { x: peakX + 4, y: peakY - 5, weight: 0.7 },
    ];

    return {
      annotations,
      heatmap: {
        peakLocation: { x: peakX, y: peakY },
        intensity: 0.92,
        activationPoints,
      },
      summary: {
        findings,
        impression,
        recommendedFollowUp: followUp,
        radsClassification: rads,
        confidenceScore: confidence,
      },
    };
  }

  /**
   * Uploads and runs automated AI pipeline on a new medical imaging scan.
   */
  async processScan({ patientId, doctorId = null, modality, bodyPart, imageUrl, baselineImageId = null }) {
    const aiResults = this.generateAIAnalysis(modality, bodyPart);

    const scan = await MedicalImage.create({
      patientId,
      doctorId,
      modality: String(modality).toUpperCase(),
      bodyPart: String(bodyPart).toUpperCase(),
      imageUrl,
      baselineImageId,
      aiAnnotations: aiResults.annotations,
      heatmapOverlay: aiResults.heatmap,
      aiRadiologySummary: aiResults.summary,
      status: 'ANALYZED',
    });

    return scan;
  }

  /**
   * Performs side-by-side progression comparison between baseline and follow-up scans.
   */
  async compareScans(baselineScanId, followUpScanId) {
    const [baseline, followUp] = await Promise.all([
      MedicalImage.findById(baselineScanId),
      MedicalImage.findById(followUpScanId),
    ]);

    if (!baseline || !followUp) {
      throw new Error('One or both scan records not found for side-by-side comparison');
    }

    const baselineLesionCount = baseline.aiAnnotations ? baseline.aiAnnotations.length : 0;
    const followUpLesionCount = followUp.aiAnnotations ? followUp.aiAnnotations.length : 0;

    let progressionStatus = 'STABLE';
    if (followUpLesionCount > baselineLesionCount) {
      progressionStatus = 'PROGRESSED';
    } else if (followUpLesionCount < baselineLesionCount) {
      progressionStatus = 'REGRESSED';
    }

    return {
      comparisonId: `CMP-${Date.now()}`,
      modality: followUp.modality,
      bodyPart: followUp.bodyPart,
      baseline: {
        id: baseline._id,
        date: baseline.createdAt,
        lesionCount: baselineLesionCount,
        impression: baseline.aiRadiologySummary?.impression,
      },
      followUp: {
        id: followUp._id,
        date: followUp.createdAt,
        lesionCount: followUpLesionCount,
        impression: followUp.aiRadiologySummary?.impression,
      },
      progressionStatus,
      clinicalDelta: `Comparison from ${new Date(baseline.createdAt).toLocaleDateString()} to ${new Date(followUp.createdAt).toLocaleDateString()}: Status is ${progressionStatus}.`,
    };
  }

  async verifyScan(scanId, radiologistId, notes) {
    const scan = await MedicalImage.findById(scanId);
    if (!scan) throw new Error('Scan not found');

    scan.status = 'VERIFIED';
    scan.verifiedBy = radiologistId;
    scan.verifiedAt = new Date();
    scan.verificationNotes = notes;
    await scan.save();

    return scan;
  }
}

const medicalImagingService = new MedicalImagingService();

module.exports = {
  medicalImagingService,
  MedicalImagingService,
};
