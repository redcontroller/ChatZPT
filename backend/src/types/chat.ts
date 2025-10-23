export interface Conversation {
  id: string;
  userId: string;
  characterId: string;
  title: string;
  isActive: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  type: 'user' | 'character';
  content: string;
  timestamp: string;
  characterId?: string;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    model?: string;
  };
}

export interface CreateConversationRequest {
  characterId: string;
  title?: string;
}

export interface SendMessageRequest {
  characterId: string;
  message: string;
  conversationId?: string;
}

export interface MessageResponse {
  success: boolean;
  messageId: string;
  characterResponse: {
    message: string;
    timestamp: string;
    characterId: string;
  };
  conversationId: string;
}

export interface ConversationResponse {
  success: boolean;
  conversation?: Conversation;
  conversations?: Conversation[];
  messages?: Message[];
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
