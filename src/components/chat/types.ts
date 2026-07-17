export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  imageUrl?: string;
}

export interface Conversation {
  _id: string;
  title: string;
  lastMessageAt: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  data: Conversation[];
}
