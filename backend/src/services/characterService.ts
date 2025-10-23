import { v4 as uuidv4 } from 'uuid';
import database from '../database/connection';
import { Character, CreateCharacterRequest, UpdateCharacterRequest } from '../types/character';

class CharacterService {
  private getDb() {
    return database.getDb();
  }

  async getCharacters(userId?: string): Promise<Character[]> {
    try {
      const characters = this.getDb().data.characters;
      
      if (userId) {
        // 사용자별 캐릭터 필터링 (기본 캐릭터 + 사용자 생성 캐릭터)
        return characters.filter(
          (char: Character) => char.isDefault || char.createdBy === userId
        );
      }
      
      return characters;
    } catch (error) {
      console.error('Error getting characters:', error);
      throw new Error('Failed to get characters');
    }
  }

  async getCharacterById(id: string, userId?: string): Promise<Character | null> {
    try {
      const character = this.getDb().data.characters.find((char: Character) => char.id === id);
      
      if (!character) {
        return null;
      }

      // 사용자별 접근 권한 확인
      if (userId && !character.isDefault && character.createdBy !== userId) {
        return null;
      }

      return character;
    } catch (error) {
      console.error('Error getting character by id:', error);
      throw new Error('Failed to get character');
    }
  }

  async createCharacter(characterData: CreateCharacterRequest, userId: string): Promise<Character> {
    try {
      const newCharacter: Character = {
        id: uuidv4(),
        name: characterData.name,
        description: characterData.description,
        personality: characterData.personality,
        avatar: characterData.avatar || '/images/default-avatar.jpg',
        systemPrompt: characterData.systemPrompt,
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
      };

      this.getDb().data.characters.push(newCharacter);
      await this.getDb().write();
      
      return newCharacter;
    } catch (error) {
      console.error('Error creating character:', error);
      throw new Error('Failed to create character');
    }
  }

  async updateCharacter(id: string, updates: UpdateCharacterRequest, userId: string): Promise<Character> {
    try {
      const character = await this.getCharacterById(id, userId);
      
      if (!character) {
        throw new Error('Character not found');
      }

      // 사용자 생성 캐릭터만 수정 가능
      if (character.isDefault) {
        throw new Error('Cannot modify default characters');
      }

      const updatedCharacter = {
        ...character,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const index = this.getDb().data.characters.findIndex((char: Character) => char.id === id);
      if (index !== -1) {
        this.getDb().data.characters[index] = updatedCharacter;
        await this.getDb().write();
      }
      
      return updatedCharacter;
    } catch (error) {
      console.error('Error updating character:', error);
      throw new Error('Failed to update character');
    }
  }

  async deleteCharacter(id: string, userId: string): Promise<boolean> {
    try {
      const character = await this.getCharacterById(id, userId);
      
      if (!character) {
        throw new Error('Character not found');
      }

      // 사용자 생성 캐릭터만 삭제 가능
      if (character.isDefault) {
        throw new Error('Cannot delete default characters');
      }

      const index = this.getDb().data.characters.findIndex((char: Character) => char.id === id);
      if (index !== -1) {
        this.getDb().data.characters.splice(index, 1);
        await this.getDb().write();
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      throw new Error('Failed to delete character');
    }
  }

  async getDefaultCharacters(): Promise<Character[]> {
    try {
      return this.getDb().data.characters.filter((char: Character) => char.isDefault);
    } catch (error) {
      console.error('Error getting default characters:', error);
      throw new Error('Failed to get default characters');
    }
  }

  async searchCharacters(query: string, userId?: string): Promise<Character[]> {
    try {
      const characters = await this.getCharacters(userId);
      
      const searchTerm = query.toLowerCase();
      return characters.filter((character: Character) =>
        character.name.toLowerCase().includes(searchTerm) ||
        character.description.toLowerCase().includes(searchTerm) ||
        character.personality.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching characters:', error);
      throw new Error('Failed to search characters');
    }
  }
}

export const characterService = new CharacterService();
export default characterService;
