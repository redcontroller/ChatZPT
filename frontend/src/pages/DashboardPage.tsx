import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { currentUserAtom } from '../store/userAtom';
import { characterService } from '../services/characterService';
import { chatService } from '../services/chatService';
import { Character } from '@shared/types/character';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const [user] = useAtom(currentUserAtom);
  const navigate = useNavigate();
  const [defaultCharacters, setDefaultCharacters] = useState<Character[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalConversations, setTotalConversations] = useState(0);
  const [recentCharacters, setRecentCharacters] = useState<Character[]>([]);

  useEffect(() => {
    loadDefaultCharacters();
    loadTotalConversations();
    loadRecentCharacters();
  }, []);

  const loadDefaultCharacters = async () => {
    try {
      setLoading(true);
      const characters = await characterService.getCharacters();
      
      // 전체 캐릭터 저장
      setAllCharacters(characters);
      
      // 기본 캐릭터만 필터링 (비키, 지니, 스파이크)
      const defaultChars = characters.filter(char => 
        char.isDefault && ['vicky', 'genie', 'spike'].includes(char.id)
      );
      setDefaultCharacters(defaultChars);
    } catch (error) {
      console.error('Failed to load default characters:', error);
      // 에러 시 기본값 설정
      setAllCharacters([]);
      setDefaultCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalConversations = async () => {
    try {
      // 모든 대화를 가져와서 총 개수 확인 (limit을 크게 설정)
      const conversations = await chatService.getConversations(undefined, 1000, 0);
      setTotalConversations(conversations.length);
    } catch (error) {
      console.error('Failed to load total conversations:', error);
      setTotalConversations(0);
    }
  };

  const loadRecentCharacters = async () => {
    try {
      const conversations = await chatService.getConversations(undefined, 10, 0);
      const characterIds = [...new Set(conversations.map(conv => conv.characterId))];
      const characters = await Promise.all(
        characterIds.map(id => characterService.getCharacterById(id))
      );
      setRecentCharacters(characters);
    } catch (error) {
      console.error('Failed to load recent characters:', error);
      setRecentCharacters([]);
    }
  };

  return (
    <div className="space-y-8 w-full pt-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
          안녕하세요, {user?.name || user?.email}님! 👋
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-2">
          ChatZPT에 오신 것을 환영합니다. 비키의 긍정적 사고, 지니의 천재적 분석, 스파이크의 충직한 지지와 함께 특별한 대화를 시작해보세요.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card hover>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  총 대화 수
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {totalConversations}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card hover>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  사용 가능한 캐릭터
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {allCharacters.length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card hover>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  즐겨찾기 캐릭터
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  0
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            빠른 시작
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {loading ? (
              <div className="col-span-2 flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <>
                {/* 기본 캐릭터들 */}
                {defaultCharacters.map((character) => (
                  <div 
                    key={character.id}
                    className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
                    onClick={() => navigate(`/chat/${character.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        <img 
                          src={character.avatar}
                          alt={`${character.name} 아바타`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 이미지 로드 실패 시 기본 아바타로 대체
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold" style={{display: 'none'}}>
                          {character.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                          {character.name}와 대화하기
                        </h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          {character.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 캐릭터 탐색 */}
                <div 
                  className="p-4 border content-center border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
                  onClick={() => navigate('/characters')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">✨</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                        캐릭터 탐색
                      </h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        다양한 AI 캐릭터를 만나보세요
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            최근 활동
          </h2>
          {recentCharacters.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-secondary-600 dark:text-secondary-400">
                아직 활동이 없습니다. 첫 대화를 시작해보세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentCharacters.map((character, index) => (
                <motion.div
                  key={character.id}
                  className="flex flex-col items-center space-y-2 cursor-pointer group"
                  onClick={() => navigate(`/chat/${character.id}`)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.6 + index * 0.1 
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary-500 transition-colors duration-200">
                      {character.avatar && character.avatar !== '/images/default-avatar.jpg' ? (
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                        character.avatar && character.avatar !== '/images/default-avatar.jpg' ? 'hidden' : ''
                      }`}>
                        {character.name.charAt(0)}
                      </div>
                    </div>
                    {/* 온라인 상태 표시 */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate max-w-20">
                      {character.name}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      최근 대화
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
