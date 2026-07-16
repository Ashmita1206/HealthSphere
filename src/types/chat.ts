export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
  requiresDoctor?: boolean;
  createdAt?: string;
}

export interface ConversationStarted {
  conversationId: string;
  title: string;
}

export interface AIResponse {
  response: string;
  followUpQuestions: string[];
  healthCategory: string;
  riskLevel: string;
  recommendations: string[];
  requiresDoctor: boolean;
}
