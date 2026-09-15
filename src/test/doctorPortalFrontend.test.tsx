import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DoctorDashboardHeader } from '@/pages/doctor/components/DoctorDashboardHeader';
import { PatientQueue, DEFAULT_PATIENT_QUEUE } from '@/pages/doctor/components/PatientQueue';
import { PatientDetailsDrawer } from '@/pages/doctor/components/PatientDetailsDrawer';
import { NotesEditor } from '@/pages/doctor/components/NotesEditor';
import { PrescriptionBuilder } from '@/pages/doctor/components/PrescriptionBuilder';
import { AvailabilityCalendar } from '@/pages/doctor/components/AvailabilityCalendar';
import { ConsultationList } from '@/pages/doctor/components/ConsultationList';
import { DoctorPortal } from '@/pages/doctor/DoctorPortal';

describe('F25 — Doctor Portal UI Suite', () => {
  it('1. DoctorDashboardHeader renders doctor profile, consultation fee, and handles availability toggle', () => {
    const handleToggle = vi.fn();
    render(
      <DoctorDashboardHeader
        doctor={{
          fullName: 'Dr. Neha Verma',
          specialization: 'Cardiologist',
          hospital: 'Apollo Heart Institute',
          consultationFee: 800,
          isAvailable: true,
        }}
        onToggleAvailability={handleToggle}
      />
    );

    expect(screen.getByTestId('doctor-dashboard-header')).toBeInTheDocument();
    expect(screen.getByText('Dr. Neha Verma')).toBeInTheDocument();
    expect(screen.getByText(/Apollo Heart Institute/i)).toBeInTheDocument();
    expect(screen.getByText('₹800')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /accepting patients/i });
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledWith(false);
  });

  it('2. PatientQueue renders triage severity badges and triggers patient selection', () => {
    const handleSelect = vi.fn();
    const handleStart = vi.fn();

    render(
      <PatientQueue
        queue={DEFAULT_PATIENT_QUEUE}
        onSelectPatient={handleSelect}
        onStartConsultation={handleStart}
      />
    );

    expect(screen.getByTestId('patient-queue')).toBeInTheDocument();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('Priyanka Patel')).toBeInTheDocument();
    expect(screen.getByText('URGENT')).toBeInTheDocument();

    const chartBtns = screen.getAllByRole('button', { name: /chart/i });
    fireEvent.click(chartBtns[0]);
    expect(handleSelect).toHaveBeenCalledWith(DEFAULT_PATIENT_QUEUE[0]);

    const consultBtns = screen.getAllByRole('button', { name: /start consultation/i });
    fireEvent.click(consultBtns[0]);
    expect(handleStart).toHaveBeenCalledWith(DEFAULT_PATIENT_QUEUE[0]);
  });

  it('3. PatientDetailsDrawer renders patient clinical chart when open', () => {
    const handleClose = vi.fn();
    render(
      <PatientDetailsDrawer
        patient={DEFAULT_PATIENT_QUEUE[0]}
        isOpen={true}
        onClose={handleClose}
      />
    );

    expect(screen.getByTestId('patient-details-drawer')).toBeInTheDocument();
    expect(screen.getAllByText('Aarav Sharma').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/138\/88 mmHg/i)).toBeInTheDocument();
    expect(screen.getByText(/88% Adherence Rate/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close patient details/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('4. NotesEditor allows documenting Subjective, Objective, Assessment, Plan notes', () => {
    const handleSave = vi.fn();
    render(<NotesEditor onSave={handleSave} />);

    expect(screen.getByTestId('notes-editor')).toBeInTheDocument();
    expect(screen.getByText(/Subjective \(Symptoms & History\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Objective \(Exam & Vitals\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessment \(Diagnosis & Impression\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan \(Therapy & Follow-up\)/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /save notes/i });
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('5. PrescriptionBuilder manages medication line items and issues prescription', () => {
    const handleIssue = vi.fn();
    render(<PrescriptionBuilder onIssuePrescription={handleIssue} />);

    expect(screen.getByTestId('prescription-builder')).toBeInTheDocument();
    expect(screen.getByText('Telmisartan')).toBeInTheDocument();

    // Add new medication
    const nameInput = screen.getByPlaceholderText(/medication name/i);
    const dosageInput = screen.getByPlaceholderText(/dosage/i);
    const addBtn = screen.getByRole('button', { name: /add item/i });

    fireEvent.change(nameInput, { target: { value: 'Atorvastatin' } });
    fireEvent.change(dosageInput, { target: { value: '20mg' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('Atorvastatin')).toBeInTheDocument();

    // Issue Prescription
    const issueBtn = screen.getByRole('button', { name: /issue prescription/i });
    fireEvent.click(issueBtn);
    expect(handleIssue).toHaveBeenCalledTimes(1);
  });

  it('6. AvailabilityCalendar configures weekly slots and saves schedule', () => {
    const handleSave = vi.fn();
    render(<AvailabilityCalendar onSave={handleSave} />);

    expect(screen.getByTestId('availability-calendar')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Saturday')).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /save schedule/i });
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('7. ConsultationList renders filterable consultations table and handles search', () => {
    render(<ConsultationList />);

    expect(screen.getByTestId('consultation-list')).toBeInTheDocument();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('Meera Nair')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search patient/i);
    fireEvent.change(searchInput, { target: { value: 'Meera' } });
    expect(screen.getByText('Meera Nair')).toBeInTheDocument();
    expect(screen.queryByText('Aarav Sharma')).not.toBeInTheDocument();
  });

  it('8. DoctorPortal full page switches tabs smoothly', () => {
    render(
      <BrowserRouter>
        <DoctorPortal />
      </BrowserRouter>
    );

    expect(screen.getByTestId('doctor-portal-page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /patient queue/i })).toBeInTheDocument();

    // Switch to Prescriptions tab
    const rxTab = screen.getByRole('button', { name: /prescription builder/i });
    fireEvent.click(rxTab);
    expect(screen.getByTestId('prescription-builder')).toBeInTheDocument();

    // Switch to Availability tab
    const availTab = screen.getByRole('button', { name: /availability calendar/i });
    fireEvent.click(availTab);
    expect(screen.getByTestId('availability-calendar')).toBeInTheDocument();
  });
});
