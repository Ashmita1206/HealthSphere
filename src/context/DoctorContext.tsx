import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doctorService, Doctor, DoctorFilters } from '@/services/doctorService';

interface DoctorContextType {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  selectedDoctor: Doctor | null;
  selectDoctor: (doctor: Doctor | null) => void;
  fetchDoctors: (filters?: DoctorFilters) => Promise<void>;
  getDoctor: (id: string) => Promise<Doctor | null>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = useCallback(async (filters?: DoctorFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorService.getDoctors(filters);
      setDoctors(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load doctors';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDoctor = useCallback(async (id: string): Promise<Doctor | null> => {
    try {
      return await doctorService.getDoctorById(id);
    } catch (err: unknown) {
      console.error('Failed to fetch doctor detail:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Only auto-fetch when authenticated or initial mount
    const token = localStorage.getItem('healthsphere_token');
    if (token) {
      void fetchDoctors();
    }
  }, [fetchDoctors]);

  return (
    <DoctorContext.Provider
      value={{
        doctors,
        loading,
        error,
        selectedDoctor,
        selectDoctor: setSelectedDoctor,
        fetchDoctors,
        getDoctor,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = (): DoctorContextType => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};
