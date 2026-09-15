import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  Pill,
  FileEdit,
  Calendar,
  Stethoscope,
  Video,
} from 'lucide-react';
import { DoctorDashboardHeader } from './components/DoctorDashboardHeader';
import { PatientQueue, QueuePatient } from './components/PatientQueue';
import { PatientDetailsDrawer } from './components/PatientDetailsDrawer';
import { ConsultationList, ConsultationRecord } from './components/ConsultationList';
import { NotesEditor } from './components/NotesEditor';
import { PrescriptionBuilder } from './components/PrescriptionBuilder';
import { AvailabilityCalendar } from './components/AvailabilityCalendar';

export type DoctorPortalTab = 'queue' | 'consultations' | 'prescriptions' | 'notes' | 'availability';

export const DoctorPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DoctorPortalTab>('queue');
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectPatient = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    setIsDrawerOpen(true);
  };

  const handleStartConsultation = (patient: QueuePatient) => {
    if (patient.consultationType === 'telemedicine') {
      navigate(`/telemedicine/${patient.id}`);
    } else {
      setSelectedPatient(patient);
      setActiveTab('notes');
    }
  };

  const tabs = [
    { id: 'queue', label: 'Patient Queue', icon: Users },
    { id: 'consultations', label: 'Consultations', icon: FileCheck },
    { id: 'prescriptions', label: 'Prescription Builder', icon: Pill },
    { id: 'notes', label: 'SOAP Notes', icon: FileEdit },
    { id: 'availability', label: 'Availability Calendar', icon: Calendar },
  ];

  return (
    <div data-testid="doctor-portal-page" className="space-y-6 pb-12">
      {/* 1. Dashboard Header */}
      <DoctorDashboardHeader />

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DoctorPortalTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === 'queue' && (
          <PatientQueue
            onSelectPatient={handleSelectPatient}
            onStartConsultation={handleStartConsultation}
          />
        )}

        {activeTab === 'consultations' && (
          <ConsultationList
            onViewRecord={(record: ConsultationRecord) => {
              setSelectedPatient({
                id: record.patientId,
                tokenNumber: 1,
                name: record.patientName,
                age: 45,
                gender: 'Patient',
                chiefComplaint: record.diagnosis,
                triageSeverity: 'routine',
                waitTimeMinutes: 0,
                consultationType: 'telemedicine',
              });
              setIsDrawerOpen(true);
            }}
          />
        )}

        {activeTab === 'prescriptions' && <PrescriptionBuilder />}

        {activeTab === 'notes' && <NotesEditor />}

        {activeTab === 'availability' && <AvailabilityCalendar />}
      </motion.div>

      {/* 4. Slide-out Patient Details Drawer */}
      <PatientDetailsDrawer
        patient={selectedPatient}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default DoctorPortal;
