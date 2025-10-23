import { apiClient } from './api';
import { Conversation, Message, CreateConversationRequest, SendMessageRequest, MessageResponse } from '@shared/types/chat';

class ChatService {
  async getConversations(characterId?: string, limit = 20, offset = 0): Promise<Conversation[]> {
    const params = new URLSearchParams();
    if (characterId) params.append('characterId', characterId);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await apiClient.get<{ conversations: Conversation[] }>(
      `/chat/conversations?${params.toString()}`
    );
    
    return response.conversations || [];
  }

  async getConversationById(id: string): Promise<Conversation> {
    const response = await apiClient.get<{ conversation: Conversation }>(`/chat/conversations/${id}`);
    
    if (!response.conversation) {
      throw new Error('Conversation not found');
    }
    
    return response.conversation;
  }

  async createConversation(conversationData: CreateConversationRequest): Promise<Conversation> {
    const response = await apiClient.post<{ conversation: Conversation }>('/chat/conversations', conversationData);
    
    if (!response.conversation) {
      throw new Error('Failed to create conversation');
    }
    
    return response.conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/chat/conversations/${id}`);
  }

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await apiClient.get<{ messages: Message[] }>(
      `/chat/conversations/${conversationId}/messages?${params.toString()}`
    );
    
    return response.messages || [];
  }

  async sendMessage(messageData: SendMessageRequest): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/chat/send-message', messageData);
    
    if (!response.success) {
      throw new Error('Failed to send message');
    }
    
    return response;
  }
}

export const chatService = new ChatService();
export default chatService;
