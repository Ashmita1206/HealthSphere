import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MedicalReports from '@/pages/MedicalReports';
import { ReportUploadDropzone } from '@/components/reports/ReportUploadDropzone';
import { AbnormalValuesTable, DEFAULT_ABNORMAL_VALUES } from '@/components/reports/AbnormalValuesTable';
import { ClinicalRecommendations, DEFAULT_REPORT_RECS } from '@/components/reports/ClinicalRecommendations';
import { ReportHistoryList, DEFAULT_REPORT_HISTORY } from '@/components/reports/ReportHistoryList';

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
      biomarkers: {
        hba1c: '7.8%',
        sugar: '148 mg/dL',
        cholesterol: '215 mg/dL',
        liver: 'Normal',
        kidney: 'Creatinine 1.4 mg/dL',
      },
    },
    comparisonResult: null,
    analyzeDocument: vi.fn(),
    compareTwoReports: vi.fn(),
  }),
}));

describe('F27 — Medical Report Intelligence UI', () => {
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

  it('renders AbnormalValuesTable highlighting critical and elevated metrics', () => {
    render(<AbnormalValuesTable abnormalValues={DEFAULT_ABNORMAL_VALUES} />);
    expect(screen.getByTestId('abnormal-values-table')).toBeInTheDocument();
    expect(screen.getByText('HbA1c (Glycated Hemoglobin)')).toBeInTheDocument();
    expect(screen.getByText('7.8')).toBeInTheDocument();
    expect(screen.getByText('LDL Cholesterol')).toBeInTheDocument();
    expect(screen.getByText('Serum Creatinine')).toBeInTheDocument();
  });

  it('renders ClinicalRecommendations categorized by diet, medication, and lifestyle', () => {
    render(<ClinicalRecommendations recommendations={DEFAULT_REPORT_RECS} />);
    expect(screen.getByTestId('clinical-recommendations')).toBeInTheDocument();
    expect(screen.getByText(/Consult Endocrinologist regarding HbA1c/i)).toBeInTheDocument();
    expect(screen.getByText(/Adopt Low-Glycemic Mediterranean Diet/i)).toBeInTheDocument();
  });

  it('renders ReportHistoryList with report items and action buttons', () => {
    render(<ReportHistoryList reports={DEFAULT_REPORT_HISTORY} />);
    expect(screen.getByTestId('report-history-list')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Metabolic Panel & Lipid Profile')).toBeInTheDocument();
    expect(screen.getByText('Complete Blood Count (CBC) with Differential')).toBeInTheDocument();
    expect(screen.getByText('2D Echocardiogram & Doppler Flow Study')).toBeInTheDocument();
  });
});
