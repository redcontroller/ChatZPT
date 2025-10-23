import request from 'supertest';
import { app } from '../app';
import database from '../database/connection';

describe('Chat API', () => {
  let authToken: string;
  let testUserId: string;
  let characterId: string;

  beforeAll(async () => {
    // 테스트용 사용자 생성 및 로그인
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'chattest@example.com',
        password: 'password123',
        name: 'Chat Test User',
      });

    testUserId = registerResponse.body.data.user.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'chattest@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.tokens.accessToken;

    // 기본 캐릭터 ID 가져오기
    const charactersResponse = await request(app)
      .get('/api/characters')
      .set('Authorization', `Bearer ${authToken}`);

    characterId = charactersResponse.body.characters[0].id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    const db = database.getDatabase();
    db.get('users').remove({ id: testUserId }).write();
    db.get('conversations').remove({ userId: testUserId }).write();
    db.get('messages').remove({ conversationId: { $in: [] } }).write();
  });

  describe('POST /api/chat/conversations', () => {
    it('should create a new conversation', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId,
          title: 'Test Conversation',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.conversation).toBeDefined();
      expect(response.body.conversation.characterId).toBe(characterId);
    });

    it('should return 400 for missing characterId', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Conversation',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/chat/conversations', () => {
    it('should return conversations list', async () => {
      const response = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.conversations).toBeDefined();
      expect(Array.isArray(response.body.conversations)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/chat/conversations')
        .expect(401);
    });
  });

  describe('POST /api/chat/send-message', () => {
    it('should send a message and get AI response', async () => {
      const response = await request(app)
        .post('/api/chat/send-message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId,
          message: 'Hello, how are you?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.characterResponse).toBeDefined();
      expect(response.body.characterResponse.message).toBeDefined();
      expect(response.body.conversationId).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/chat/send-message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId,
          // Missing message
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent character', async () => {
      const response = await request(app)
        .post('/api/chat/send-message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: 'non-existent-id',
          message: 'Hello',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
