import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { 
  selectedCharacterAtom,
  currentConversationAtom,
  messagesAtom,
  chatLoadingAtom,
  chatErrorAtom,
  sendingMessageAtom,
  aiRespondingAtom,
  resetChatStateAtom
} from '../store/chatAtom';
import { characterService } from '../services/characterService';
import { chatService } from '../services/chatService';
import { Message } from '@shared/types/chat';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Layout } from '../components/Layout';
import { FaChevronLeft } from 'react-icons/fa';

const ChatPage: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [selectedCharacter, setSelectedCharacter] = useAtom(selectedCharacterAtom);
  const [currentConversation, setCurrentConversation] = useAtom(currentConversationAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [loading, setLoading] = useAtom(chatLoadingAtom);
  const [error, setError] = useAtom(chatErrorAtom);
  const [sendingMessage, setSendingMessage] = useAtom(sendingMessageAtom);
  const [aiResponding, setAiResponding] = useAtom(aiRespondingAtom);
  const [, resetChatState] = useAtom(resetChatStateAtom);
  
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    if (characterId) {
      // 캐릭터가 변경되면 상태 초기화
      resetChatStateLocal();
      initializeChat();
    }
  }, [characterId]);

  const resetChatStateLocal = () => {
    // 모든 채팅 관련 상태 초기화
    resetChatState(); // 전역 상태 초기화
    setError(null);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // 캐릭터 정보 로드
      const character = await characterService.getCharacterById(characterId!);
      setSelectedCharacter(character);

      // 기존 대화 확인 및 로드
      const conversations = await chatService.getConversations(characterId);
      if (conversations.length > 0) {
        const latestConversation = conversations[0];
        setCurrentConversation(latestConversation);
        
        // 메시지 로드
        const conversationMessages = await chatService.getMessages(latestConversation.id);
        setMessages(conversationMessages);
      }

      // 초기화 완료
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedCharacter || sendingMessage) return;

    const userMessage = messageInput.trim();
    setMessageInput('');
    setSendingMessage(true);
    setAiResponding(true);

    try {
      // 사용자 메시지 추가
      const userMessageObj: Message = {
        id: Date.now().toString(),
        conversationId: currentConversation?.id || '',
        type: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
        characterId: selectedCharacter.id,
      };

      setMessages(prev => [...prev, userMessageObj]);

      // AI 응답 요청
      const response = await chatService.sendMessage({
        characterId: selectedCharacter.id,
        message: userMessage,
        conversationId: currentConversation?.id,
      });

      // AI 응답 메시지 추가
      const aiMessage: Message = {
        id: response.messageId,
        conversationId: response.conversationId,
        type: 'character',
        content: response.characterResponse.message,
        timestamp: response.characterResponse.timestamp,
        characterId: response.characterResponse.characterId,
      };

      setMessages(prev => [...prev, aiMessage]);

      // 대화 업데이트
      if (!currentConversation) {
        const newConversation = await chatService.getConversationById(response.conversationId);
        setCurrentConversation(newConversation);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
      setAiResponding(false);
    }
  };

  const handleBackToCharacters = () => {
    navigate('/characters');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button buttonVariant="primary" buttonSize="sm" onClick={handleBackToCharacters}>
            캐릭터 선택으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">캐릭터를 찾을 수 없습니다</h2>
          <Button buttonVariant="primary" buttonSize="sm" onClick={handleBackToCharacters}>
            캐릭터 선택으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
        {/* 헤더 - 고정 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-20">
              <Button
                buttonVariant="secondary"
                buttonSize="sm"
                onClick={handleBackToCharacters}
                className="flex items-center gap-2"
              >
                <FaChevronLeft className="w-4 h-4" />
                뒤로
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                  <img 
                    src={selectedCharacter.avatar}
                    alt={`${selectedCharacter.name} 아바타`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 아바타로 대체
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold" style={{display: 'none'}}>
                    {selectedCharacter.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedCharacter.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCharacter.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 영역 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-0">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-4">
                  <img 
                    src={selectedCharacter.avatar}
                    alt={`${selectedCharacter.name} 아바타`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 아바타로 대체
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{display: 'none'}}>
                    {selectedCharacter.name.charAt(0)}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedCharacter.name}와 대화를 시작해보세요
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedCharacter.personality}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* AI 응답 로딩 */}
                {aiResponding && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-gray-500">AI가 응답을 생성하고 있습니다...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* 메시지 입력 영역 - 하단 고정 */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 items-start">
              <div className="flex-1 relative">
                <textarea
                  placeholder={`${selectedCharacter.name}에게 메시지를 보내세요...`}
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    // 자동 높이 조절
                    const textarea = e.target;
                    textarea.style.height = 'auto';
                    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sendingMessage}
                  className={`w-full min-h-[3rem] max-h-[7.5rem] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none ${
                    messageInput.split('\n').length > 1 ? 'overflow-y-auto' : 'overflow-hidden'
                  }`}
                  maxLength={200}
                  rows={1}
                  style={{ height: '3rem' }}
                />
                <div className="absolute right-3 bottom-2 text-xs text-gray-500">
                  {messageInput.length}/200
                </div>
              </div>
              <Button
                buttonVariant="primary"
                buttonSize="lg"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendingMessage}
                className="px-6 flex-shrink-0"
              >
                {sendingMessage ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  '전송'
                )}
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">ChatZPT는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
