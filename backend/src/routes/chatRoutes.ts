import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// 모든 채팅 라우트는 인증이 필요함
router.use(authenticateToken);

// 대화 목록 조회
router.get('/conversations', chatController.getConversations);

// 새 대화 생성
router.post('/conversations', chatController.createConversation);

// 대화 상세 조회
router.get('/conversations/:id', chatController.getConversationById);

// 대화 메시지 조회
router.get('/conversations/:conversationId/messages', chatController.getMessages);

// 메시지 전송
router.post('/send-message', chatController.sendMessage);

// 대화 삭제
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;
