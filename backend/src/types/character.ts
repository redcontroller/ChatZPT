export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  avatar: string;
  systemPrompt: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateCharacterRequest {
  name: string;
  description: string;
  personality: string;
  avatar?: string;
  systemPrompt: string;
}

export interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  personality?: string;
  avatar?: string;
  systemPrompt?: string;
  isActive?: boolean;
}

export interface CharacterResponse {
  success: boolean;
  character?: Character;
  characters?: Character[];
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
