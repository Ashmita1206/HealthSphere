export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AttachmentType = 'image' | 'pdf' | 'report' | 'prescription' | 'lab';

export interface AttachmentItem {
  id: string;
  name: string;
  type: AttachmentType;
  size: string;
  url?: string;
  progress?: number;
  previewUrl?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  riskLevel?: RiskLevel;
  timestamp: Date;
  imageUrl?: string;
  attachment?: AttachmentItem;
  suggestions?: string[];
  category?: string;
  feedback?: 'liked' | 'disliked';
  isStreaming?: boolean;
  recommendations?: string[];
  requiresDoctor?: boolean;
}

export interface Conversation {
  _id: string;
  title: string;
  lastMessageAt: string;
  isPinned?: boolean;
  messages?: Message[];
  category?: string;
  previewText?: string;
}

export interface PromptItem {
  id: string;
  title: string;
  prompt: string;
  description: string;
  category: string;
  badge?: string;
}

export interface PromptCategory {
  id: string;
  label: string;
  iconName: string;
  prompts: PromptItem[];
}

export interface AISettings {
  responseLength: 'concise' | 'detailed' | 'clinical';
  language: 'en' | 'es' | 'hi' | 'fr' | 'de';
  voice: 'female' | 'male' | 'natural';
  autoSpeak: boolean;
  highRiskAlerts: boolean;
}

export interface ChatHistoryResponse {
  success: boolean;
  data: Conversation[];
}
