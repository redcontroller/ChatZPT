import request from 'supertest';
import { app } from '../app';
import database from '../database/connection';

describe('Character API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // 테스트용 사용자 생성 및 로그인
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    testUserId = registerResponse.body.data.user.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    const db = database.getDatabase();
    db.get('users').remove({ id: testUserId }).write();
    db.get('characters').remove({ createdBy: testUserId }).write();
  });

  describe('GET /api/characters', () => {
    it('should return characters list', async () => {
      const response = await request(app)
        .get('/api/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.characters).toBeDefined();
      expect(Array.isArray(response.body.characters)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/characters')
        .expect(401);
    });
  });

  describe('POST /api/characters', () => {
    it('should create a new character', async () => {
      const characterData = {
        name: 'Test Character',
        description: 'A test character',
        personality: 'Friendly and helpful',
        systemPrompt: 'You are a helpful assistant.',
      };

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(characterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.character).toBeDefined();
      expect(response.body.character.name).toBe(characterData.name);
      expect(response.body.character.isDefault).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Character',
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/characters/:id', () => {
    let characterId: string;

    beforeAll(async () => {
      // 테스트용 캐릭터 생성
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Character',
          description: 'A test character',
          personality: 'Friendly and helpful',
          systemPrompt: 'You are a helpful assistant.',
        });

      characterId = response.body.character.id;
    });

    it('should return character by id', async () => {
      const response = await request(app)
        .get(`/api/characters/${characterId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.character).toBeDefined();
      expect(response.body.character.id).toBe(characterId);
    });

    it('should return 404 for non-existent character', async () => {
      await request(app)
        .get('/api/characters/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
