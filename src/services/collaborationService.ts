import { api } from './api';

export interface StaffPresence {
  userId: string;
  name: string;
  role: string;
  department: string;
  status: 'available' | 'in_consultation' | 'rounding' | 'busy' | 'offline';
  lastSeen: string;
  activeConnections: number;
}

export interface CareTeamMember {
  userId?: string;
  name: string;
  role: string;
  department: string;
}

export interface CareTeamMessage {
  _id?: string;
  senderId?: string;
  senderName: string;
  senderRole: string;
  content: string;
  urgency: 'routine' | 'urgent' | 'stat';
  createdAt: string;
}

export interface CareTeamThread {
  _id: string;
  patientId?: string;
  patientName: string;
  caseTitle: string;
  department: string;
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'active' | 'resolved' | 'archived';
  members: CareTeamMember[];
  messages: CareTeamMessage[];
  lastActivityAt: string;
  createdAt: string;
}

export interface ChartLock {
  patientId: string;
  field: string;
  lockedBy: string;
  lockedByName: string;
  userRole: string;
  lockedAt: string;
  expiresAt: string;
}

export interface SharedClinicalNote {
  _id: string;
  patientId?: string;
  patientName: string;
  title: string;
  category: 'SOAP' | 'discharge_plan' | 'multidisciplinary_rounds' | 'triage_assessment';
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  rawContent?: string;
  version: number;
  currentLock?: {
    lockedBy?: string | null;
    lockedByName?: string | null;
    lockedAt?: string | null;
    expiresAt?: string | null;
  };
  revisions: Array<{
    version: number;
    modifierName: string;
    content: string;
    timestamp: string;
  }>;
  updatedAt: string;
}

export interface NoteConflictResponse {
  conflict: boolean;
  currentVersion: number;
  serverNote: SharedClinicalNote;
  message: string;
}

export const collaborationService = {
  // Staff Presence
  async getStaffPresence(): Promise<{ success: boolean; presenceList: StaffPresence[] }> {
    const res = await api.get('/collaboration/presence');
    return res.data;
  },

  async updatePresence(status: string, department?: string): Promise<{ success: boolean; presence: StaffPresence }> {
    const res = await api.post('/collaboration/presence', { status, department });
    return res.data;
  },

  // Care Team Threads
  async getThreads(params?: { department?: string; urgency?: string; status?: string }): Promise<{ success: boolean; count: number; threads: CareTeamThread[] }> {
    const res = await api.get('/collaboration/threads', { params });
    return res.data;
  },

  async createThread(payload: {
    patientId?: string;
    patientName?: string;
    caseTitle: string;
    department: string;
    urgency?: 'routine' | 'urgent' | 'stat';
    initialMessage?: string;
  }): Promise<{ success: boolean; thread: CareTeamThread }> {
    const res = await api.post('/collaboration/threads', payload);
    return res.data;
  },

  async postMessage(threadId: string, content: string, urgency?: 'routine' | 'urgent' | 'stat'): Promise<{ success: boolean; message: CareTeamMessage; thread: CareTeamThread }> {
    const res = await api.post(`/collaboration/threads/${threadId}/messages`, { content, urgency });
    return res.data;
  },

  // Shared Notes
  async getSharedNote(patientId: string, category = 'SOAP'): Promise<{ success: boolean; note: SharedClinicalNote; activeLocks: ChartLock[] }> {
    const res = await api.get(`/collaboration/notes/${patientId}`, { params: { category } });
    return res.data;
  },

  async updateSharedNote(
    noteId: string,
    payload: {
      baseVersion?: number;
      subjective?: string;
      objective?: string;
      assessment?: string;
      plan?: string;
      rawContent?: string;
      forceOverwrite?: boolean;
    }
  ): Promise<{ success: boolean; note: SharedClinicalNote; version: number; message: string }> {
    const res = await api.put(`/collaboration/notes/${noteId}`, payload);
    return res.data;
  },

  // Field Locks
  async acquireLock(patientId: string, field: string): Promise<{ success: boolean; acquired: boolean; lock?: ChartLock; message?: string }> {
    const res = await api.post('/collaboration/locks/acquire', { patientId, field });
    return res.data;
  },

  async releaseLock(patientId: string, field: string): Promise<{ success: boolean; released: boolean; message?: string }> {
    const res = await api.post('/collaboration/locks/release', { patientId, field });
    return res.data;
  },
};
