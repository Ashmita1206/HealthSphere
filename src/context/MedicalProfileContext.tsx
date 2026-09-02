import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  medicalProfileService,
  type MedicalProfileData,
} from '@/services/medicalProfileService';

export interface MedicalProfileContextType {
  profile: MedicalProfileData | null;
  loading: boolean;
  completion: number;
  saveProfile: (data: Partial<MedicalProfileData>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const MedicalProfileContext = createContext<MedicalProfileContextType | undefined>(undefined);

export const MedicalProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<MedicalProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }

    setLoading(true);
    try {
      const data = await medicalProfileService.getMedicalProfile();
      if (data) {
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [userId, refreshProfile]);

  const saveProfile = useCallback(
    async (data: Partial<MedicalProfileData>): Promise<boolean> => {
      setLoading(true);
      try {
        const updated = await medicalProfileService.updateMedicalProfile(data);
        if (updated) {
          setProfile(updated);
          return true;
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const completion = profile?.completionPercentage ?? 0;

  return (
    <MedicalProfileContext.Provider
      value={{
        profile,
        loading,
        completion,
        saveProfile,
        refreshProfile,
      }}
    >
      {children}
    </MedicalProfileContext.Provider>
  );
};

export const useMedicalProfile = () => {
  const context = useContext(MedicalProfileContext);
  if (!context) {
    throw new Error('useMedicalProfile must be used within a MedicalProfileProvider');
  }
  return context;
};
