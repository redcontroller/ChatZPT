import { v4 as uuidv4 } from 'uuid';
import database from '../database/connection';
import { Conversation, Message, CreateConversationRequest } from '../types/chat';

class ConversationService {
  private getDb() {
    return database.getDb();
  }

  async getConversations(userId: string, characterId?: string): Promise<Conversation[]> {
    try {
      let conversations = this.getDb().data.conversations.filter((conv: Conversation) => conv.userId === userId);

      if (characterId) {
        conversations = conversations.filter((conv: Conversation) => conv.characterId === characterId);
      }

      // 최신 대화부터 정렬
      return conversations.sort((a: Conversation, b: Conversation) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw new Error('Failed to get conversations');
    }
  }

  async getConversationById(id: string, userId: string): Promise<Conversation | null> {
    try {
      const conversation = this.getDb().data.conversations.find((conv: Conversation) => conv.id === id && conv.userId === userId);
      return conversation || null;
    } catch (error) {
      console.error('Error getting conversation by id:', error);
      throw new Error('Failed to get conversation');
    }
  }

  async createConversation(conversationData: CreateConversationRequest, userId: string): Promise<Conversation> {
    try {
      const newConversation: Conversation = {
        id: uuidv4(),
        userId,
        characterId: conversationData.characterId,
        title: conversationData.title || `새 대화`,
        isActive: true,
        messageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.getDb().data.conversations.push(newConversation);
      await this.getDb().write();
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    try {
      // 대화 삭제
      const convIndex = this.getDb().data.conversations.findIndex((conv: Conversation) => conv.id === id && conv.userId === userId);
      if (convIndex !== -1) {
        this.getDb().data.conversations.splice(convIndex, 1);
      }
      
      // 관련 메시지들도 삭제
      this.getDb().data.messages = this.getDb().data.messages.filter((msg: Message) => msg.conversationId !== id);
      
      await this.getDb().write();
      
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    try {
      // 대화 소유권 확인
      const conversation = await this.getConversationById(conversationId, userId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const messages = this.getDb().data.messages
        .filter((msg: Message) => msg.conversationId === conversationId)
        .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw new Error('Failed to get messages');
    }
  }

  async addMessage(messageData: Omit<Message, 'id' | 'timestamp'>, userId: string): Promise<Message> {
    try {
      // 대화 소유권 확인
      const conversation = await this.getConversationById(messageData.conversationId, userId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const newMessage: Message = {
        id: uuidv4(),
        ...messageData,
        timestamp: new Date().toISOString(),
      };

      this.getDb().data.messages.push(newMessage);

      // 대화 메시지 수 증가 및 업데이트
      const convIndex = this.getDb().data.conversations.findIndex((conv: Conversation) => conv.id === messageData.conversationId);
      if (convIndex !== -1) {
        this.getDb().data.conversations[convIndex].messageCount += 1;
        this.getDb().data.conversations[convIndex].updatedAt = new Date().toISOString();
        this.getDb().data.conversations[convIndex].lastMessageAt = new Date().toISOString();
      }
      
      await this.getDb().write();

      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw new Error('Failed to add message');
    }
  }

  async updateConversationTitle(id: string, title: string, userId: string): Promise<Conversation> {
    try {
      const conversation = await this.getConversationById(id, userId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const updatedConversation = {
        ...conversation,
        title,
        updatedAt: new Date().toISOString(),
      };

      const index = this.getDb().data.conversations.findIndex((conv: Conversation) => conv.id === id);
      if (index !== -1) {
        this.getDb().data.conversations[index] = updatedConversation;
        await this.getDb().write();
      }
      
      return updatedConversation;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw new Error('Failed to update conversation title');
    }
  }
}

export const conversationService = new ConversationService();
export default conversationService;
