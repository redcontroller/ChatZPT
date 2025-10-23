import { describe, it, expect, vi, beforeEach } from 'vitest';
import { characterService } from '../services/characterService';
import { apiClient } from '../services/api';

// Mock API client
vi.mock('../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('CharacterService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCharacters', () => {
    it('should return characters list', async () => {
      const mockCharacters = [
        {
          id: '1',
          name: 'Test Character',
          description: 'A test character',
          personality: 'Friendly',
          avatar: '/avatar.jpg',
          systemPrompt: 'You are helpful',
          isDefault: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      (apiClient.get as any).mockResolvedValue({
        characters: mockCharacters,
      });

      const result = await characterService.getCharacters();

      expect(apiClient.get).toHaveBeenCalledWith('/characters?limit=20&offset=0');
      expect(result).toEqual(mockCharacters);
    });

    it('should handle API errors', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('API Error'));

      await expect(characterService.getCharacters()).rejects.toThrow('API Error');
    });
  });

  describe('getCharacterById', () => {
    it('should return character by id', async () => {
      const mockCharacter = {
        id: '1',
        name: 'Test Character',
        description: 'A test character',
        personality: 'Friendly',
        avatar: '/avatar.jpg',
        systemPrompt: 'You are helpful',
        isDefault: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      };

      (apiClient.get as any).mockResolvedValue({
        character: mockCharacter,
      });

      const result = await characterService.getCharacterById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/characters/1');
      expect(result).toEqual(mockCharacter);
    });

    it('should throw error if character not found', async () => {
      (apiClient.get as any).mockResolvedValue({
        character: null,
      });

      await expect(characterService.getCharacterById('1')).rejects.toThrow('Character not found');
    });
  });

  describe('createCharacter', () => {
    it('should create a new character', async () => {
      const characterData = {
        name: 'New Character',
        description: 'A new character',
        personality: 'Friendly',
        systemPrompt: 'You are helpful',
      };

      const mockCharacter = {
        id: '2',
        ...characterData,
        avatar: '/default-avatar.jpg',
        isDefault: false,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'user',
      };

      (apiClient.post as any).mockResolvedValue({
        character: mockCharacter,
      });

      const result = await characterService.createCharacter(characterData);

      expect(apiClient.post).toHaveBeenCalledWith('/characters', characterData);
      expect(result).toEqual(mockCharacter);
    });
  });

  describe('updateCharacter', () => {
    it('should update character', async () => {
      const updates = {
        name: 'Updated Character',
        description: 'Updated description',
      };

      const mockCharacter = {
        id: '1',
        name: 'Updated Character',
        description: 'Updated description',
        personality: 'Friendly',
        avatar: '/avatar.jpg',
        systemPrompt: 'You are helpful',
        isDefault: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      };

      (apiClient.put as any).mockResolvedValue({
        character: mockCharacter,
      });

      const result = await characterService.updateCharacter('1', updates);

      expect(apiClient.put).toHaveBeenCalledWith('/characters/1', updates);
      expect(result).toEqual(mockCharacter);
    });
  });

  describe('deleteCharacter', () => {
    it('should delete character', async () => {
      (apiClient.delete as any).mockResolvedValue({});

      await characterService.deleteCharacter('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/characters/1');
    });
  });
});
