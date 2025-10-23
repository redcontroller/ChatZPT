import { atom } from 'jotai';
import { Character } from '@shared/types/character';

// 캐릭터 목록 상태
export const charactersAtom = atom<Character[]>([]);

// 선택된 캐릭터 상태
export const selectedCharacterAtom = atom<Character | null>(null);

// 캐릭터 로딩 상태
export const charactersLoadingAtom = atom<boolean>(false);

// 캐릭터 에러 상태
export const charactersErrorAtom = atom<string | null>(null);

// 캐릭터 검색 쿼리
export const characterSearchQueryAtom = atom<string>('');

// 캐릭터 필터 (기본/사용자 생성)
export const characterFilterAtom = atom<'all' | 'default' | 'custom'>('all');
