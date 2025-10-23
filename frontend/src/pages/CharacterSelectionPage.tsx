import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  charactersAtom, 
  selectedCharacterAtom, 
  charactersLoadingAtom, 
  charactersErrorAtom,
  characterSearchQueryAtom
} from '../store/characterAtom';
import { characterService } from '../services/characterService';
import { Character } from '@shared/types/character';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import CreateCharacterModal from '../components/CreateCharacterModal';
import CharacterCard from '../components/CharacterCard';
import { Layout } from '../components/Layout';

const CharacterSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useAtom(charactersAtom);
  const [selectedCharacter, setSelectedCharacter] = useAtom(selectedCharacterAtom);
  const [loading, setLoading] = useAtom(charactersLoadingAtom);
  const [error, setError] = useAtom(charactersErrorAtom);
  const [searchQuery, setSearchQuery] = useAtom(characterSearchQueryAtom);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'default' | 'custom'>('all');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await characterService.getCharacters(searchQuery);
      setCharacters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 캐릭터 목록
  const getFilteredCharacters = () => {
    let filtered = characters;
    
    if (activeFilter === 'default') {
      filtered = characters.filter(char => char.isDefault);
    } else if (activeFilter === 'custom') {
      filtered = characters.filter(char => !char.isDefault);
    }
    
    return filtered;
  };

  const filteredCharacters = getFilteredCharacters();
  const defaultCharacters = characters.filter(char => char.isDefault);
  const customCharacters = characters.filter(char => !char.isDefault);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadCharacters();
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    navigate(`/chat/${character.id}`);
  };


  const handleCreateSuccess = () => {
    loadCharacters(); // 캐릭터 목록 새로고침
  };

  // 필터링 로직 제거 - 기본/사용자 정의 캐릭터를 분리하여 표시

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingSpinner size="lg" />
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI 캐릭터와 대화하기
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                장원영의 '원영적 사고'를 체화한 비키, 천재적 사고의 지니, 충직한 동생 스파이크와 함께 특별한 대화를 나눠보세요
              </p>
            </motion.div>

            {/* 검색 및 액션 버튼 */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* 검색창 */}
                <div className="flex-1 max-w-md">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      type="text"
                      placeholder="캐릭터 검색..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full shadow-lg"
                    />
                  </motion.div>
                </div>
                
                {/* 액션 버튼들 */}
                <div className="flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      buttonVariant="outline"
                      buttonSize="sm"
                      onClick={() => loadCharacters()}
                      className="shadow-lg"
                    >
                      🔍 검색
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      buttonVariant="primary"
                      buttonSize="sm"
                      onClick={() => setShowCreateModal(true)}
                      className="shadow-lg"
                    >
                      ✨ 새 캐릭터
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* 필터 태그 */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { key: 'all', label: '전체', icon: '🌟', count: characters.length },
                  { key: 'default', label: '기본 캐릭터', icon: '🤖', count: defaultCharacters.length },
                  { key: 'custom', label: '내 캐릭터', icon: '✨', count: customCharacters.length },
                ].map((filter) => (
                  <motion.button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as 'all' | 'default' | 'custom')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilter === filter.key
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="mr-2">{filter.icon}</span>
                    {filter.label} ({filter.count})
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* 에러 메시지 */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 캐릭터 목록 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* 필터링된 결과 표시 */}
              {activeFilter === 'all' ? (
                <div className="space-y-12">
                  {/* 기본 캐릭터 섹션 */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <motion.h2 
                      className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <span className="text-3xl">🤖</span>
                      기본 캐릭터
                    </motion.h2>
                    {defaultCharacters.length === 0 ? (
                      <motion.div 
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-gray-400">기본 캐릭터가 없습니다</div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        {defaultCharacters.map((character, index) => (
                          <motion.div
                            key={character.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                              duration: 0.5, 
                              delay: 0.7 + index * 0.1,
                              ease: "easeOut"
                            }}
                            whileHover={{ 
                              y: -5, 
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <CharacterCard
                              character={character}
                              selectedCharacter={selectedCharacter}
                              onSelect={handleCharacterSelect}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* 사용자 정의 캐릭터 섹션 */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <motion.div 
                      className="flex items-center justify-between mb-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <motion.h2 
                        className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                      >
                        <span className="text-3xl">✨</span>
                        내 캐릭터
                      </motion.h2>
                    </motion.div>
                    {customCharacters.length === 0 ? (
                      <motion.div 
                        className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <motion.div 
                          className="text-gray-400 text-lg mb-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.2 }}
                        >
                          아직 만든 캐릭터가 없습니다
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            buttonVariant="primary"
                            buttonSize="sm"
                            onClick={() => setShowCreateModal(true)}
                            className="shadow-lg"
                          >
                            첫 번째 캐릭터 만들기
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1.1 }}
                      >
                        {customCharacters.map((character, index) => (
                          <motion.div
                            key={character.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                              duration: 0.5, 
                              delay: 1.2 + index * 0.1,
                              ease: "easeOut"
                            }}
                            whileHover={{ 
                              y: -5, 
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <CharacterCard
                              character={character}
                              selectedCharacter={selectedCharacter}
                              onSelect={handleCharacterSelect}
                              isCustom={true}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              ) : (
                /* 필터링된 결과만 표시 */
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <motion.h2 
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <span className="text-3xl">
                      {activeFilter === 'default' ? '🤖' : '✨'}
                    </span>
                    {activeFilter === 'default' ? '기본 캐릭터' : '내 캐릭터'}
                  </motion.h2>
                  
                  {filteredCharacters.length === 0 ? (
                    <motion.div 
                      className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div 
                        className="text-gray-400 text-lg mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        {activeFilter === 'default' ? '기본 캐릭터가 없습니다' : '아직 만든 캐릭터가 없습니다'}
                      </motion.div>
                      {activeFilter === 'custom' && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            buttonVariant="primary"
                            buttonSize="sm"
                            onClick={() => setShowCreateModal(true)}
                            className="shadow-lg"
                          >
                            첫 번째 캐릭터 만들기
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      {filteredCharacters.map((character, index) => (
                        <motion.div
                          key={character.id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.7 + index * 0.1,
                            ease: "easeOut"
                          }}
                          whileHover={{ 
                            y: -5, 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CharacterCard
                            character={character}
                            selectedCharacter={selectedCharacter}
                            onSelect={handleCharacterSelect}
                            isCustom={!character.isDefault}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* 캐릭터 생성 모달 */}
        <CreateCharacterModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </Layout>
  );
};

export default CharacterSelectionPage;
