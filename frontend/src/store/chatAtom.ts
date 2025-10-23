import { atom } from 'jotai';
import { Conversation, Message } from '@shared/types/chat';
import { Character } from '@shared/types/character';

// 선택된 캐릭터 상태
export const selectedCharacterAtom = atom<Character | null>(null);

// 대화 목록 상태
export const conversationsAtom = atom<Conversation[]>([]);

// 현재 대화 상태
export const currentConversationAtom = atom<Conversation | null>(null);

// 메시지 목록 상태
export const messagesAtom = atom<Message[]>([]);

// 채팅 로딩 상태
export const chatLoadingAtom = atom<boolean>(false);

// 채팅 에러 상태
export const chatErrorAtom = atom<string | null>(null);

// 메시지 전송 중 상태
export const sendingMessageAtom = atom<boolean>(false);

// AI 응답 생성 중 상태
export const aiRespondingAtom = atom<boolean>(false);

// 대화 필터 (캐릭터별)
export const conversationFilterAtom = atom<string | null>(null);

// 캐릭터별 대화 상태 초기화 함수
export const resetChatStateAtom = atom(
  null,
  (_, set) => {
    set(messagesAtom, []);
    set(currentConversationAtom, null);
    set(chatErrorAtom, null);
    set(sendingMessageAtom, false);
    set(aiRespondingAtom, false);
  }
);
