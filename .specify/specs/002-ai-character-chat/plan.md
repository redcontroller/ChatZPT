# AI 캐릭터 채팅 시스템 간소화된 기술 계획

## 프로젝트 개요

### 목표
프론트엔드 사전 과제를 위한 AI 캐릭터 채팅 시스템의 MVP(Minimum Viable Product) 구현

### 핵심 기능
1. **기본 제공 캐릭터 3개** (아리, 지니, 루나)
2. **사용자 정의 캐릭터 생성** (이름, 프롬프트, 썸네일)
3. **캐릭터별 독립 대화 관리**
4. **기본 채팅 기능** (메시지 송수신, 내역, 타임스탬프, 로딩)

## 기술 아키텍처

### 전체 아키텍처
```
Frontend (React + TypeScript)
├── Components
│   ├── CharacterSelection
│   ├── ChatInterface
│   └── CharacterCreator
├── Services
│   ├── OpenAIService
│   ├── CharacterService
│   └── ConversationService
├── Storage
│   ├── LocalStorage (캐릭터 데이터)
│   └── LocalStorage (대화 데이터)
└── State Management
    └── Jotai Atoms
```

### 데이터 플로우
```
사용자 입력 → React Component → Jotai State → OpenAI API → 응답 처리 → UI 업데이트
```

## 기술 스택

### 프론트엔드
- **React 19** + **TypeScript**
- **Vite** (빠른 개발 서버)
- **Tailwind CSS** (유틸리티 기반 스타일링)
- **Jotai** (경량 상태 관리)
- **Axios** (HTTP 클라이언트)
- **Framer Motion** (기본 애니메이션)

### AI 통합
- **OpenAI API** (GPT-4o-mini)
- 프론트엔드에서 직접 호출
- 환경변수로 API 키 관리

### 데이터 저장
- **LocalStorage** (로컬 데이터 저장)
- **기존 인증 시스템** (JWT 토큰 활용)

## 컴포넌트 설계

### 1. CharacterSelection 컴포넌트
```typescript
interface CharacterSelectionProps {
  onCharacterSelect: (character: Character) => void;
  onCreateCharacter: () => void;
}

// 기능
- 기본 제공 캐릭터 3개 표시
- 사용자 정의 캐릭터 목록 표시
- 캐릭터 선택 기능
- 캐릭터 생성 버튼
```

### 2. ChatInterface 컴포넌트
```typescript
interface ChatInterfaceProps {
  character: Character;
  conversation: Conversation;
}

// 기능
- 메시지 목록 표시
- 메시지 입력
- 메시지 전송
- 로딩 상태 표시
- 타임스탬프 표시
```

### 3. CharacterCreator 컴포넌트
```typescript
interface CharacterCreatorProps {
  onSave: (character: Character) => void;
  onCancel: () => void;
}

// 기능
- 캐릭터 이름 입력
- 프롬프트 입력
- 썸네일 이미지 업로드
- 캐릭터 저장
```

## 상태 관리 설계

### Jotai Atoms
```typescript
// 캐릭터 관련 상태
export const charactersAtom = atom<Character[]>([]);
export const selectedCharacterAtom = atom<Character | null>(null);

// 대화 관련 상태
export const conversationsAtom = atom<Conversation[]>([]);
export const currentConversationAtom = atom<Conversation | null>(null);

// UI 상태
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
```

## 서비스 레이어 설계

### 1. OpenAIService
```typescript
class OpenAIService {
  async sendMessage(message: string, character: Character, conversation: Conversation): Promise<string>;
  private formatPrompt(character: Character, conversation: Conversation): string;
  private handleAPIError(error: any): string;
}
```

### 2. CharacterService
```typescript
class CharacterService {
  getDefaultCharacters(): Character[];
  getUserCharacters(): Character[];
  saveCharacter(character: Character): void;
  deleteCharacter(characterId: string): void;
  loadCharactersFromStorage(): Character[];
}
```

### 3. ConversationService
```typescript
class ConversationService {
  createConversation(characterId: string): Conversation;
  addMessage(conversationId: string, message: Message): void;
  getConversation(conversationId: string): Conversation | null;
  saveConversation(conversation: Conversation): void;
  loadConversationsFromStorage(): Conversation[];
}
```

## 데이터 모델

### Character
```typescript
interface Character {
  id: string;
  name: string;
  prompt: string;
  thumbnail: string; // base64 또는 URL
  isDefault: boolean;
  createdAt: Date;
}
```

### Message
```typescript
interface Message {
  id: string;
  characterId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  characterId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 기본 제공 캐릭터

### 1. 아리 (Ari)
```typescript
const ari: Character = {
  id: "ari",
  name: "아리",
  prompt: "당신은 아리라는 이름의 친근하고 활발한 AI 어시스턴트입니다. 항상 긍정적이고 도움이 되는 답변을 제공하며, 이모지를 적절히 사용하여 감정을 표현합니다.",
  thumbnail: "/images/ari-avatar.jpg",
  isDefault: true,
  createdAt: new Date()
};
```

### 2. 지니 (Genie)
```typescript
const genie: Character = {
  id: "genie",
  name: "지니",
  prompt: "당신은 지니라는 이름의 지식이 풍부한 AI 어시스턴트입니다. 차분하고 전문적인 톤으로 정확한 정보를 제공하며, 사용자의 질문에 상세하고 도움이 되는 답변을 합니다.",
  thumbnail: "/images/genie-avatar.jpg",
  isDefault: true,
  createdAt: new Date()
};
```

### 3. 루나 (Luna)
```typescript
const luna: Character = {
  id: "luna",
  name: "루나",
  prompt: "당신은 루나라는 이름의 창의적이고 상상력이 풍부한 AI 어시스턴트입니다. 예술적이고 감성적인 답변을 제공하며, 사용자의 창의적 아이디어를 격려하고 발전시켜줍니다.",
  thumbnail: "/images/luna-avatar.jpg",
  isDefault: true,
  createdAt: new Date()
};
```

## OpenAI API 통합

### API 설정
```typescript
const OPENAI_CONFIG = {
  model: "gpt-4o-mini",
  maxTokens: 200,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1
};
```

### 프롬프트 템플릿
```typescript
const createSystemPrompt = (character: Character, conversation: Conversation): string => {
  const recentMessages = conversation.messages.slice(-5); // 최근 5개 메시지만 사용
  const context = recentMessages.map(msg => 
    `${msg.isUser ? '사용자' : character.name}: ${msg.content}`
  ).join('\n');
  
  return `${character.prompt}

현재 대화 컨텍스트:
${context}

위 컨텍스트를 바탕으로 사용자의 메시지에 응답해주세요. 응답은 200자 이내로 간결하게 작성해주세요.`;
};
```

## 로컬 저장소 설계

### LocalStorage 키 구조
```typescript
const STORAGE_KEYS = {
  CHARACTERS: 'chatzpt_characters',
  CONVERSATIONS: 'chatzpt_conversations',
  SETTINGS: 'chatzpt_settings'
};
```

### 데이터 저장/로드 함수
```typescript
// 캐릭터 데이터 관리
const saveCharacters = (characters: Character[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
};

const loadCharacters = (): Character[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
  return stored ? JSON.parse(stored) : getDefaultCharacters();
};

// 대화 데이터 관리
const saveConversations = (conversations: Conversation[]): void => {
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
};

const loadConversations = (): Conversation[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  return stored ? JSON.parse(stored) : [];
};
```

## 에러 처리 전략

### API 에러 처리
```typescript
const handleOpenAIError = (error: any): string => {
  if (error.response?.status === 429) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  } else if (error.response?.status === 401) {
    return "API 키가 유효하지 않습니다.";
  } else if (error.response?.status === 500) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  } else {
    return "알 수 없는 오류가 발생했습니다.";
  }
};
```

### 로컬 저장소 에러 처리
```typescript
const safeLocalStorage = {
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('LocalStorage 저장 실패:', error);
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('LocalStorage 읽기 실패:', error);
      return null;
    }
  }
};
```

## 성능 최적화

### 메시지 렌더링 최적화
```typescript
// React.memo를 사용한 메시지 컴포넌트 최적화
const MessageItem = React.memo(({ message }: { message: Message }) => {
  return (
    <div className="message-item">
      {/* 메시지 내용 */}
    </div>
  );
});
```

### 대화 데이터 최적화
```typescript
// 대화 데이터 압축 (최근 50개 메시지만 유지)
const optimizeConversation = (conversation: Conversation): Conversation => {
  if (conversation.messages.length > 50) {
    return {
      ...conversation,
      messages: conversation.messages.slice(-50)
    };
  }
  return conversation;
};
```

## 개발 환경 설정

### 환경변수
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_APP_NAME=ChatZPT
VITE_APP_VERSION=1.0.0
```

### Vite 설정
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

## 테스트 전략 (간소화)

### 단위 테스트
- 컴포넌트 렌더링 테스트
- 서비스 함수 테스트
- 유틸리티 함수 테스트

### 통합 테스트
- OpenAI API 연동 테스트
- LocalStorage 연동 테스트
- 전체 플로우 테스트

### E2E 테스트 (선택사항)
- 기본 사용자 시나리오 테스트
- 캐릭터 생성 및 대화 테스트

## 배포 전략

### 로컬 개발
- Vite 개발 서버 사용
- Hot Module Replacement (HMR)
- TypeScript 컴파일 체크

### 빌드 및 배포
- Vite 빌드 시스템 사용
- 정적 파일 생성
- 로컬 서버에서 실행

## 예상 개발 시간

### Phase 1: 기본 구조 (1일)
- 프로젝트 설정: 2시간
- 기본 컴포넌트 구조: 4시간
- 상태 관리 설정: 2시간

### Phase 2: 캐릭터 관리 (2일)
- 기본 캐릭터 구현: 4시간
- 캐릭터 생성 기능: 6시간
- 캐릭터 선택 UI: 4시간

### Phase 3: 채팅 기능 (2일)
- 채팅 인터페이스: 6시간
- OpenAI API 연동: 4시간
- 메시지 관리: 4시간

### Phase 4: 통합 및 테스트 (1일)
- 전체 통합: 4시간
- 기본 테스트: 2시간
- 버그 수정: 2시간

**총 예상 시간**: 36시간 (약 1주)

## 성공 기준

### 기능적 성공 기준
- [ ] 3개의 기본 캐릭터 표시 및 선택 가능
- [ ] 사용자 정의 캐릭터 생성 및 관리 가능
- [ ] AI 캐릭터와의 기본 대화 가능
- [ ] 대화 내역 저장 및 표시 가능

### 기술적 성공 기준
- [ ] 로컬 환경에서 정상 실행
- [ ] OpenAI API 연동 정상 동작
- [ ] LocalStorage 데이터 저장/불러오기 정상 동작
- [ ] 기본적인 에러 처리 구현

### 사용성 성공 기준
- [ ] 직관적인 캐릭터 선택 UI
- [ ] 간단하고 명확한 채팅 인터페이스
- [ ] 로딩 상태 및 에러 메시지 표시
- [ ] 반응형 디자인 (모바일/데스크톱)

이 간소화된 계획을 통해 현실적이고 실행 가능한 AI 캐릭터 채팅 시스템을 구현할 수 있습니다.
