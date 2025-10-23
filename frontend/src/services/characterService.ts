import { apiClient } from './api';
import { Character, CreateCharacterRequest, UpdateCharacterRequest } from '@shared/types/character';

class CharacterService {
  async getCharacters(search?: string, limit = 20, offset = 0): Promise<Character[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await apiClient.get<{ characters: Character[] }>(
      `/characters?${params.toString()}`
    );
    
    return response.characters || [];
  }

  async getCharacterById(id: string): Promise<Character> {
    const response = await apiClient.get<{ character: Character }>(`/characters/${id}`);
    
    if (!response.character) {
      throw new Error('Character not found');
    }
    
    return response.character;
  }

  async createCharacter(characterData: CreateCharacterRequest): Promise<Character> {
    const response = await apiClient.post<{ character: Character }>('/characters', characterData);
    
    if (!response.character) {
      throw new Error('Failed to create character');
    }
    
    return response.character;
  }

  async updateCharacter(id: string, updates: UpdateCharacterRequest): Promise<Character> {
    const response = await apiClient.put<{ character: Character }>(`/characters/${id}`, updates);
    
    if (!response.character) {
      throw new Error('Failed to update character');
    }
    
    return response.character;
  }

  async deleteCharacter(id: string): Promise<void> {
    await apiClient.delete(`/characters/${id}`);
  }

  async getDefaultCharacters(): Promise<Character[]> {
    const response = await apiClient.get<{ characters: Character[] }>('/characters');
    
    return (response.characters || []).filter(char => char.isDefault);
  }
}

export const characterService = new CharacterService();
export default characterService;
