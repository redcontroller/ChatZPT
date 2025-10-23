import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { charactersAtom } from '../store';
import { characterService } from '../services/characterService';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [, setCharacters] = useAtom(charactersAtom);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: '',
    systemPrompt: '',
    avatar: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_SYSTEM_PROMPT_LENGTH = 1000; // 비용 절감을 위한 글자수 제한

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '캐릭터 이름을 입력해주세요';
    } else if (formData.name.length > 50) {
      newErrors.name = '캐릭터 이름은 50자 이내로 입력해주세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '캐릭터 설명을 입력해주세요';
    } else if (formData.description.length > 200) {
      newErrors.description = '캐릭터 설명은 200자 이내로 입력해주세요';
    }

    if (!formData.personality.trim()) {
      newErrors.personality = '캐릭터 성격을 입력해주세요';
    } else if (formData.personality.length > 300) {
      newErrors.personality = '캐릭터 성격은 300자 이내로 입력해주세요';
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = '시스템 프롬프트를 입력해주세요';
    } else if (formData.systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
      newErrors.systemPrompt = `시스템 프롬프트는 ${MAX_SYSTEM_PROMPT_LENGTH}자 이내로 입력해주세요`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newCharacter = await characterService.createCharacter({
        name: formData.name.trim(),
        description: formData.description.trim(),
        personality: formData.personality.trim(),
        systemPrompt: formData.systemPrompt.trim(),
        avatar: formData.avatar.trim() || '/images/default-avatar.jpg',
      });

      setCharacters(prev => [newCharacter, ...prev]);
      onSuccess();
      onClose();
      
      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        personality: '',
        systemPrompt: '',
        avatar: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create character:', error);
      setErrors({ submit: '캐릭터 생성에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              새로운 캐릭터 만들기
            </h2>
            <Button
              buttonVariant="secondary"
              buttonSize="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 캐릭터 이름 */}
            <div>
              <label 
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                캐릭터 이름
                <span className="text-red-500"> *</span>
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="예: 아리아, 루나, 셀리"
                maxLength={50}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 mb-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
              <p className="text-gray-500 text-xs text-right">
                {formData.name.length}/50자
              </p>
            </div>

            {/* 캐릭터 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                캐릭터 설명
                <span className="text-red-500"> *</span>
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="예: 친근하고 유머러스한 AI 어시스턴트"
                maxLength={200}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 mb-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-gray-500 text-xs text-right">
                {formData.description.length}/200자
              </p>
            </div>

             {/* 캐릭터 성격 */}
            <div>
              <label 
                htmlFor="personality"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                캐릭터 성격
                <span className="text-red-500"> *</span>
              </label>
              <textarea
                id="personality"
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                placeholder="예: 밝고 긍정적이며, 사용자를 격려하고 동기부여를 주는 성격"
                maxLength={300}
                disabled={isSubmitting}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  errors.personality ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.personality && (
                <p className="text-red-500 text-sm mt-1">{errors.personality}</p>
              )}
              <p className="text-gray-500 text-xs text-right">
                {formData.personality.length}/300자
              </p>
            </div>

            {/* 시스템 프롬프트 */}
            <div>
              <label 
                htmlFor="systemPrompt"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                시스템 프롬프트
                <span className="text-red-500"> *</span>
              </label>
              <textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                placeholder="예: 당신은 아리아라는 이름의 친근한 AI 어시스턴트입니다. 사용자를 격려하고 긍정적인 에너지를 전달하는 것을 목표로 합니다..."
                maxLength={MAX_SYSTEM_PROMPT_LENGTH}
                disabled={isSubmitting}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  errors.systemPrompt ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.systemPrompt && (
                <p className="text-red-500 text-sm mt-1">{errors.systemPrompt}</p>
              )}
              <p className="text-gray-500 text-xs text-right">
                {formData.systemPrompt.length}/{MAX_SYSTEM_PROMPT_LENGTH}자
              </p>
            </div>

            {/* 썸네일 이미지 URL */}
            <div>
              <label 
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                썸네일 이미지 URL (선택사항)
              </label>
              <Input
                id="avatar"
                type="url"
                value={formData.avatar}
                onChange={(e) => handleInputChange('avatar', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                disabled={isSubmitting}
              />
              <p className="text-gray-500 text-xs mt-1">
                이미지 URL을 입력하세요. 비워두면 기본 아바타가 사용됩니다.
              </p>
            </div>

            {/* 에러 메시지 */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                buttonVariant="secondary"
                buttonSize="md"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                buttonVariant="primary"
                buttonSize="md"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    생성 중...
                  </>
                ) : (
                  '캐릭터 생성'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateCharacterModal;
