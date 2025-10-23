import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService } from '../services/chatService';
import { apiClient } from '../services/api';

// Mock API client
vi.mock('../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should return conversations list', async () => {
      const mockConversations = [
        {
          id: '1',
          userId: 'user1',
          characterId: 'char1',
          title: 'Test Conversation',
          isActive: true,
          messageCount: 5,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      (apiClient.get as any).mockResolvedValue({
        conversations: mockConversations,
      });

      const result = await chatService.getConversations();

      expect(apiClient.get).toHaveBeenCalledWith('/chat/conversations?limit=20&offset=0');
      expect(result).toEqual(mockConversations);
    });

    it('should handle API errors', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('API Error'));

      await expect(chatService.getConversations()).rejects.toThrow('API Error');
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const conversationData = {
        characterId: 'char1',
        title: 'New Conversation',
      };

      const mockConversation = {
        id: '2',
        userId: 'user1',
        characterId: 'char1',
        title: 'New Conversation',
        isActive: true,
        messageCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.post as any).mockResolvedValue({
        conversation: mockConversation,
      });

      const result = await chatService.createConversation(conversationData);

      expect(apiClient.post).toHaveBeenCalledWith('/chat/conversations', conversationData);
      expect(result).toEqual(mockConversation);
    });
  });

  describe('getMessages', () => {
    it('should return messages for conversation', async () => {
      const mockMessages = [
        {
          id: '1',
          conversationId: 'conv1',
          type: 'user',
          content: 'Hello',
          timestamp: '2024-01-01T00:00:00Z',
          characterId: 'char1',
        },
        {
          id: '2',
          conversationId: 'conv1',
          type: 'character',
          content: 'Hi there!',
          timestamp: '2024-01-01T00:01:00Z',
          characterId: 'char1',
        },
      ];

      (apiClient.get as any).mockResolvedValue({
        messages: mockMessages,
      });

      const result = await chatService.getMessages('conv1');

      expect(apiClient.get).toHaveBeenCalledWith('/chat/conversations/conv1/messages?limit=50&offset=0');
      expect(result).toEqual(mockMessages);
    });
  });

  describe('sendMessage', () => {
    it('should send message and get response', async () => {
      const messageData = {
        characterId: 'char1',
        message: 'Hello',
        conversationId: 'conv1',
      };

      const mockResponse = {
        success: true,
        messageId: 'msg1',
        characterResponse: {
          message: 'Hi there!',
          timestamp: '2024-01-01T00:00:00Z',
          characterId: 'char1',
        },
        conversationId: 'conv1',
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await chatService.sendMessage(messageData);

      expect(apiClient.post).toHaveBeenCalledWith('/chat/send-message', messageData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      (apiClient.post as any).mockRejectedValue(new Error('API Error'));

      await expect(chatService.sendMessage({
        characterId: 'char1',
        message: 'Hello',
      })).rejects.toThrow('API Error');
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      (apiClient.delete as any).mockResolvedValue({});

      await chatService.deleteConversation('conv1');

      expect(apiClient.delete).toHaveBeenCalledWith('/chat/conversations/conv1');
    });
  });
});
