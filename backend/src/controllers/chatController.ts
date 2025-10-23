import { Request, Response } from 'express';
import { characterService } from '../services/characterService';
import { conversationService } from '../services/conversationService';
import { openaiService } from '../services/openaiService';
import { ConversationResponse, SendMessageRequest } from '../types/chat';

class ChatController {
  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }
      const { characterId, limit = 20, offset = 0 } = req.query;

      const conversations = await conversationService.getConversations(
        userId, 
        characterId as string
      );

      // 페이징 처리
      const startIndex = Number(offset);
      const endIndex = startIndex + Number(limit);
      const paginatedConversations = conversations.slice(startIndex, endIndex);

      const response: ConversationResponse = {
        success: true,
        conversations: paginatedConversations,
        pagination: {
          total: conversations.length,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: endIndex < conversations.length,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getConversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }
      const { characterId, title } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          message: 'Character ID is required',
        });
        return;
      }

      // 캐릭터 존재 확인
      const character = await characterService.getCharacterById(characterId, userId);
      if (!character) {
        res.status(404).json({
          success: false,
          message: 'Character not found',
        });
        return;
      }

      const conversation = await conversationService.createConversation(
        { characterId, title },
        userId
      );

      const response: ConversationResponse = {
        success: true,
        conversation,
        message: 'Conversation created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in createConversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const conversation = await conversationService.getConversationById(id, userId);

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
        return;
      }

      const response: ConversationResponse = {
        success: true,
        conversation,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getConversationById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }
      const { limit = 50, offset = 0 } = req.query;

      const messages = await conversationService.getMessages(conversationId, userId);

      // 페이징 처리
      const startIndex = Number(offset);
      const endIndex = startIndex + Number(limit);
      const paginatedMessages = messages.slice(startIndex, endIndex);

      const response: ConversationResponse = {
        success: true,
        messages: paginatedMessages,
        pagination: {
          total: messages.length,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: endIndex < messages.length,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getMessages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get messages',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }
      const { characterId, message, conversationId }: SendMessageRequest = req.body;

      if (!characterId || !message) {
        res.status(400).json({
          success: false,
          message: 'Character ID and message are required',
        });
        return;
      }

      // 캐릭터 존재 확인
      const character = await characterService.getCharacterById(characterId, userId);
      if (!character) {
        res.status(404).json({
          success: false,
          message: 'Character not found',
        });
        return;
      }

      let currentConversationId = conversationId;

      // 대화가 없으면 새로 생성
      if (!currentConversationId) {
        const newConversation = await conversationService.createConversation(
          { characterId },
          userId
        );
        currentConversationId = newConversation.id;
      } else {
        // 기존 대화 소유권 확인
        const conversation = await conversationService.getConversationById(
          currentConversationId, 
          userId
        );
        if (!conversation) {
          res.status(404).json({
            success: false,
            message: 'Conversation not found',
          });
          return;
        }
      }

      // 사용자 메시지 저장
      const userMessage = await conversationService.addMessage(
        {
          conversationId: currentConversationId,
          type: 'user',
          content: message,
          characterId,
        },
        userId
      );

      // 기존 메시지들 가져오기
      const existingMessages = await conversationService.getMessages(
        currentConversationId, 
        userId
      );

      // AI 응답 생성
      const conversation = await conversationService.getConversationById(currentConversationId, userId);
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
        return;
      }

      const aiResponse = await openaiService.sendMessage(
        message,
        character,
        conversation,
        existingMessages
      );

      // AI 메시지 저장
      const aiMessage = await conversationService.addMessage(
        {
          conversationId: currentConversationId,
          type: 'character',
          content: aiResponse,
          characterId,
        },
        userId
      );

      const response = {
        success: true,
        messageId: aiMessage.id,
        characterResponse: {
          message: aiResponse,
          timestamp: aiMessage.timestamp,
          characterId,
        },
        conversationId: currentConversationId,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      if (error instanceof Error && error.message.includes('rate limit')) {
        res.status(429).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await conversationService.deleteConversation(id, userId);

      const response: ConversationResponse = {
        success: true,
        message: 'Conversation deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in deleteConversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete conversation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const chatController = new ChatController();
export default chatController;
