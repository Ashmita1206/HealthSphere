export type MedicineStatus =
  | 'active'
  | 'completed'
  | 'missed'
  | 'expired'
  | 'archived';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  strength?: string;
  timing?: string;
  remainingPills?: number;
  totalPills?: number;
  startDate?: string;
  endDate?: string;
  doctorName?: string;
  status: MedicineStatus;
  adherence?: number;
  description?: string;
  instructions?: string;
  notes?: string;
  createdAt?: string;
}
