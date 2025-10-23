import { Request, Response } from 'express';
import { characterService } from '../services/characterService';
import { CharacterResponse } from '../types/character';

class CharacterController {
  async getCharacters(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }
      const { search, limit = 20, offset = 0 } = req.query;

      let characters;

      if (search) {
        characters = await characterService.searchCharacters(search as string, userId);
      } else {
        characters = await characterService.getCharacters(userId);
      }

      // 페이징 처리
      const startIndex = Number(offset);
      const endIndex = startIndex + Number(limit);
      const paginatedCharacters = characters.slice(startIndex, endIndex);

      const response: CharacterResponse = {
        success: true,
        characters: paginatedCharacters,
        pagination: {
          total: characters.length,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: endIndex < characters.length,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getCharacters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get characters',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getCharacterById(req: Request, res: Response): Promise<void> {
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

      const character = await characterService.getCharacterById(id, userId);

      if (!character) {
        res.status(404).json({
          success: false,
          message: 'Character not found',
        });
        return;
      }

      const response: CharacterResponse = {
        success: true,
        character,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getCharacterById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get character',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createCharacter(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }
      const characterData = req.body;

      // 입력 검증
      if (!characterData.name || !characterData.description || !characterData.systemPrompt) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, description, systemPrompt',
        });
        return;
      }

      const character = await characterService.createCharacter(characterData, userId);

      const response: CharacterResponse = {
        success: true,
        character,
        message: 'Character created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in createCharacter:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create character',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateCharacter(req: Request, res: Response): Promise<void> {
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
      const updates = req.body;

      const character = await characterService.updateCharacter(id, updates, userId);

      const response: CharacterResponse = {
        success: true,
        character,
        message: 'Character updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in updateCharacter:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error instanceof Error && error.message.includes('Cannot modify')) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update character',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteCharacter(req: Request, res: Response): Promise<void> {
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

      await characterService.deleteCharacter(id, userId);

      const response: CharacterResponse = {
        success: true,
        message: 'Character deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in deleteCharacter:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error instanceof Error && error.message.includes('Cannot delete')) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete character',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const characterController = new CharacterController();
export default characterController;
