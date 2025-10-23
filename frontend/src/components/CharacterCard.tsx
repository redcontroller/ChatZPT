import React from 'react';
import { Character } from '@shared/types/character';
import { Card } from './Card';
import { Button } from './Button';

interface CharacterCardProps {
  character: Character;
  selectedCharacter?: Character | null;
  onSelect: (character: Character) => void;
  isCustom?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  selectedCharacter,
  onSelect,
  isCustom = false,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selectedCharacter?.id === character.id
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'hover:scale-105'
      }`}
      onClick={() => onSelect(character)}
    >
      <div>
        {/* 캐릭터 아바타 */}
        <div className="flex items-center justify-center mb-4">
          {character.avatar && character.avatar !== '/images/default-avatar.jpg' ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                // 이미지 로드 실패 시 기본 아바타로 대체
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
            character.avatar && character.avatar !== '/images/default-avatar.jpg' ? 'hidden' : ''
          }`}>
            {character.name.charAt(0)}
          </div>
        </div>

        {/* 캐릭터 정보 */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {character.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {character.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 line-clamp-2">
            {character.personality}
          </p>
          
          {/* 캐릭터 태그 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {character.isDefault && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                기본 캐릭터
              </span>
            )}
            {isCustom && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                내 캐릭터
              </span>
            )}
            {character.isActive && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                활성
              </span>
            )}
          </div>

          {/* 대화 시작 버튼 */}
          <Button
            buttonVariant="primary"
            buttonSize="sm"
            className="w-full"
            onClick={() => onSelect(character)}
          >
            대화 시작하기
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CharacterCard;
