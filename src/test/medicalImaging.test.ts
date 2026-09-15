import { describe, it, expect, vi } from 'vitest';

const {
  medicalImagingService,
  MedicalImagingService,
} = require('../../server/services/medicalImagingService');

describe('F47 — AI Medical Imaging Platform', () => {
  const imaging = new MedicalImagingService();

  describe('Multi-Modality AI Lesion Detection', () => {
    it('analyzes Chest X-Ray and generates lesion bounding boxes & Grad-CAM heatmap', () => {
      const result = imaging.generateAIAnalysis('X-RAY', 'CHEST');

      expect(result.annotations.length).toBeGreaterThanOrEqual(2);
      const consolidation = result.annotations.find((a: any) => a.label.includes('Consolidation'));
      expect(consolidation).toBeDefined();
      expect(consolidation.box).toHaveProperty('x');
      expect(consolidation.box).toHaveProperty('y');
      expect(consolidation.box).toHaveProperty('width');
      expect(consolidation.box).toHaveProperty('height');
      expect(consolidation.confidence).toBeGreaterThan(80);

      // Heatmap checks
      expect(result.heatmap.peakLocation).toBeDefined();
      expect(result.heatmap.intensity).toBeGreaterThan(0.8);
      expect(result.heatmap.activationPoints.length).toBeGreaterThanOrEqual(4);

      // Structured Radiology Summary
      expect(result.summary.findings).toContain('airspace opacity');
      expect(result.summary.impression).toContain('pneumonia');
      expect(result.summary.confidenceScore).toBeGreaterThanOrEqual(90);
    });

    it('detects Acute Subdural Hematoma on Brain CT with emergency priority', () => {
      const result = imaging.generateAIAnalysis('CT', 'BRAIN');

      expect(result.annotations).toHaveLength(1);
      expect(result.annotations[0].label).toContain('Subdural Hematoma');
      expect(result.annotations[0].severity).toBe('ACUTE');
      expect(result.annotations[0].confidence).toBeGreaterThanOrEqual(95);
      expect(result.summary.impression).toContain('subdural hematoma');
      expect(result.summary.recommendedFollowUp).toContain('neurosurgical consultation');
    });

    it('detects Meniscal Tear on Knee MRI', () => {
      const result = imaging.generateAIAnalysis('MRI', 'KNEE');

      expect(result.annotations.length).toBeGreaterThanOrEqual(1);
      expect(result.annotations[0].label).toContain('Meniscus');
      expect(result.summary.radsClassification).toContain('Grade 3');
    });

    it('detects Cholelithiasis on Abdominal Ultrasound', () => {
      const result = imaging.generateAIAnalysis('ULTRASOUND', 'ABDOMEN');

      expect(result.annotations.length).toBeGreaterThanOrEqual(1);
      expect(result.annotations[0].label).toContain('Cholelithiasis');
      expect(result.summary.findings).toContain('acoustic shadowing');
    });
  });

  describe('Side-by-Side Longitudinal Scan Comparison', () => {
    it('compares baseline and follow-up scans and evaluates progression', async () => {
      const mockBaseline = {
        _id: 'scan-base-1',
        createdAt: new Date('2026-01-15'),
        modality: 'CT',
        bodyPart: 'CHEST',
        aiAnnotations: [{ id: '1', label: 'Nodule' }],
        aiRadiologySummary: { impression: 'Solitary 4mm pulmonary nodule' },
      };

      const mockFollowUp = {
        _id: 'scan-follow-2',
        createdAt: new Date('2026-06-15'),
        modality: 'CT',
        bodyPart: 'CHEST',
        aiAnnotations: [{ id: '1', label: 'Nodule' }, { id: '2', label: 'Secondary satellite nodule' }],
        aiRadiologySummary: { impression: 'Increasing nodule burden' },
      };

      // Mock findById in MedicalImage
      const MedicalImage = require('../../server/models/MedicalImage');
      const originalFindById = MedicalImage.findById;
      MedicalImage.findById = vi.fn().mockImplementation((id: string) => {
        if (id === 'scan-base-1') return Promise.resolve(mockBaseline);
        if (id === 'scan-follow-2') return Promise.resolve(mockFollowUp);
        return Promise.resolve(null);
      });

      const comparison = await imaging.compareScans('scan-base-1', 'scan-follow-2');

      expect(comparison.comparisonId).toBeDefined();
      expect(comparison.baseline.lesionCount).toBe(1);
      expect(comparison.followUp.lesionCount).toBe(2);
      expect(comparison.progressionStatus).toBe('PROGRESSED');
      expect(comparison.clinicalDelta).toContain('Status is PROGRESSED');

      MedicalImage.findById = originalFindById;
    });
  });
});
