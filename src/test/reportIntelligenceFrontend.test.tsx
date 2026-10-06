import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MedicalReports from '@/pages/MedicalReports';
import { ReportUploadDropzone } from '@/components/reports/ReportUploadDropzone';
import { AbnormalValuesTable, type AbnormalBiomarker } from '@/components/reports/AbnormalValuesTable';
import { ClinicalRecommendations, type ReportRecommendation } from '@/components/reports/ClinicalRecommendations';
import { ReportHistoryList, type ReportHistoryItem } from '@/components/reports/ReportHistoryList';

// Test fixtures for verified real report data
const realAbnormalValues: AbnormalBiomarker[] = [
  {
    name: 'HbA1c (Glycated Hemoglobin)',
    value: '7.8',
    unit: '%',
    normalRange: '< 5.7 %',
    status: 'Elevated',
    clinicalNote: 'Indicates suboptimal glycemic control over the prior 90 days.',
  },
  {
    name: 'LDL Cholesterol',
    value: '164',
    unit: 'mg/dL',
    normalRange: '< 100 mg/dL',
    status: 'Elevated',
    clinicalNote: 'Elevated atherogenic lipoprotein level; dietary modification indicated.',
  },
];

const realRecommendations: ReportRecommendation[] = [
  {
    id: 'rec-endo',
    category: 'Specialist Consultation',
    title: 'Consult Endocrinologist regarding HbA1c (7.8%)',
    description: 'Discuss potential adjustment of Metformin dosage with your specialist.',
    urgency: 'Within 1 Week',
  },
];

const realHistoryItems: ReportHistoryItem[] = [
  {
    id: 'rep-01',
    title: 'Comprehensive Metabolic Panel',
    category: 'Blood Chemistry',
    date: 'Aug 24, 2026',
    riskLevel: 'moderate',
    summary: 'Elevated HbA1c and LDL profile.',
  },
];

// Mock useMedicalReport hook
vi.mock('@/hooks/ai/useMedicalReport', () => ({
  useMedicalReport: () => ({
    analyzing: false,
    comparing: false,
    reportResult: {
      reportTitle: 'Comprehensive Metabolic Panel & Lipid Profile',
      category: 'Blood Chemistry',
      riskLevel: 'Moderate',
      summary: 'Patient exhibits elevated HbA1c (7.8%) and elevated LDL-C (164 mg/dL) indicating metabolic syndrome and glycemic instability.',
      ocrStatus: 'completed',
      abnormalValues: [
        {
          parameter: 'HbA1c',
          value: '7.8%',
          normalRange: '<5.7%',
          severity: 'Elevated',
          clinicalNote: 'Suboptimal glycemic control.',
        },
      ],
      biomarkers: {
        hba1c: '7.8%',
        sugar: '148 mg/dL',
        cholesterol: '215 mg/dL',
        liver: 'Normal',
        kidney: 'Creatinine 1.4 mg/dL',
      },
      recommendations: ['Consult Endocrinologist regarding glycemic control'],
    },
    comparisonResult: null,
    analyzeDocument: vi.fn(),
    compareTwoReports: vi.fn(),
  }),
}));

describe('F27 — Medical Report Intelligence UI & Clinical Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders MedicalReports page header and download analysis button', () => {
    render(<MedicalReports />);
    expect(screen.getByTestId('medical-reports-page')).toBeInTheDocument();
    expect(screen.getByText(/Medical Report Intelligence & OCR/i)).toBeInTheDocument();
    expect(screen.getByText(/Download Analysis/i)).toBeInTheDocument();
  });

  it('renders ReportUploadDropzone and handles file selection', () => {
    const handleFileSelect = vi.fn();
    render(
      <ReportUploadDropzone
        onFileSelect={handleFileSelect}
        isProcessing={false}
        ocrProgressStep={1}
      />
    );

    expect(screen.getByTestId('report-upload-dropzone')).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop Medical Report Upload/i)).toBeInTheDocument();
    expect(screen.getByText(/Click to browse or drop medical report file here/i)).toBeInTheDocument();

    const file = new File(['dummy report content'], 'blood_test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('report-file-input');
    fireEvent.change(input, { target: { files: [file] } });

    expect(handleFileSelect).toHaveBeenCalledWith(file);
  });

  it('shows OCR progress bar during processing in ReportUploadDropzone', () => {
    render(
      <ReportUploadDropzone
        onFileSelect={vi.fn()}
        isProcessing={true}
        ocrProgressStep={3}
      />
    );

    expect(screen.getByTestId('ocr-progress')).toBeInTheDocument();
    expect(screen.getByText(/AI OCR Processing Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 3 of 4/i)).toBeInTheDocument();
  });

  it('renders honest empty state for AbnormalValuesTable when no abnormal values exist', () => {
    render(<AbnormalValuesTable abnormalValues={[]} />);
    expect(screen.getByTestId('abnormal-values-empty')).toBeInTheDocument();
    expect(screen.getByText(/No Abnormal Biomarkers Flagged/i)).toBeInTheDocument();
    expect(screen.queryByText('HbA1c (Glycated Hemoglobin)')).not.toBeInTheDocument();
  });

  it('renders AbnormalValuesTable highlighting critical and elevated metrics when actual data provided', () => {
    render(<AbnormalValuesTable abnormalValues={realAbnormalValues} />);
    expect(screen.getByTestId('abnormal-values-table')).toBeInTheDocument();
    expect(screen.getByText('HbA1c (Glycated Hemoglobin)')).toBeInTheDocument();
    expect(screen.getByText('7.8')).toBeInTheDocument();
    expect(screen.getByText('LDL Cholesterol')).toBeInTheDocument();
  });

  it('renders honest empty state for ClinicalRecommendations when no recommendations exist', () => {
    render(<ClinicalRecommendations recommendations={[]} />);
    expect(screen.getByTestId('clinical-recommendations-empty')).toBeInTheDocument();
    expect(screen.getByText(/No Clinical Recommendations/i)).toBeInTheDocument();
  });

  it('renders ClinicalRecommendations when actual recommendations are provided', () => {
    render(<ClinicalRecommendations recommendations={realRecommendations} />);
    expect(screen.getByTestId('clinical-recommendations')).toBeInTheDocument();
    expect(screen.getByText(/Consult Endocrinologist regarding HbA1c/i)).toBeInTheDocument();
  });

  it('renders honest empty state for ReportHistoryList when no reports exist', () => {
    render(<ReportHistoryList reports={[]} />);
    expect(screen.getByTestId('report-history-empty')).toBeInTheDocument();
    expect(screen.getByText(/No Diagnostic Reports in Archive/i)).toBeInTheDocument();
  });

  it('renders ReportHistoryList with real report items and action buttons', () => {
    render(<ReportHistoryList reports={realHistoryItems} />);
    expect(screen.getByTestId('report-history-list')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Metabolic Panel')).toBeInTheDocument();
  });
});
