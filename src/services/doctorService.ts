import { api } from './api';

export interface Doctor {
  _id: string;
  doctorId: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization: string;
  hospital: string;
  experience: number;
  qualification: string;
  licenseNumber: string;
  availability: string[];
  profileImage?: string;
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorFilters {
  search?: string;
  specialization?: string;
}

export interface CreateDoctorPayload {
  fullName: string;
  email: string;
  phone?: string;
  specialization: string;
  hospital?: string;
  experience?: number;
  qualification?: string;
  licenseNumber: string;
  availability?: string[];
  profileImage?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export const doctorService = {
  /**
   * Fetch all doctors with optional filters
   */
  async getDoctors(filters?: DoctorFilters): Promise<Doctor[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.specialization && filters.specialization !== 'All') {
      params.append('specialization', filters.specialization);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get<ApiResponse<Doctor[]>>(`/doctors${query}`);
    return res.data || [];
  },

  /**
   * Fetch doctor by id or doctorId
   */
  async getDoctorById(id: string): Promise<Doctor> {
    const res = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return res.data;
  },

  /**
   * Register a new doctor
   */
  async createDoctor(payload: CreateDoctorPayload): Promise<Doctor> {
    const res = await api.post<ApiResponse<Doctor>>('/doctors', payload);
    return res.data;
  },

  /**
   * Update doctor profile
   */
  async updateDoctor(id: string, payload: Partial<CreateDoctorPayload>): Promise<Doctor> {
    const res = await api.put<ApiResponse<Doctor>>(`/doctors/${id}`, payload);
    return res.data;
  },

  /**
   * Delete doctor profile
   */
  async deleteDoctor(id: string): Promise<void> {
    await api.delete(`/doctors/${id}`);
  },
};
