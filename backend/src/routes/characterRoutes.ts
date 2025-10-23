import { Router } from 'express';
import { characterController } from '../controllers/characterController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// 모든 캐릭터 라우트는 인증이 필요함
router.use(authenticateToken);

// 캐릭터 목록 조회
router.get('/', characterController.getCharacters);

// 캐릭터 상세 조회
router.get('/:id', characterController.getCharacterById);

// 캐릭터 생성
router.post('/', characterController.createCharacter);

// 캐릭터 수정
router.put('/:id', characterController.updateCharacter);

// 캐릭터 삭제
router.delete('/:id', characterController.deleteCharacter);

export default router;
