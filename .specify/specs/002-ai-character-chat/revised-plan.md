# AI 캐릭터 채팅 시스템 수정된 기술 계획

## 개요

기존 사용자 인증 시스템(001-user-authentication)을 활용하여 AI 캐릭터 채팅 기능을 통합하는 방식으로 계획을 수정했습니다.

## 수정된 아키텍처

### 전체 아키텍처
```
Frontend (React + TypeScript)
├── Components
│   ├── CharacterSelection
│   ├── ChatInterface
│   └── CharacterCreator
├── Services
│   ├── CharacterService (API 호출)
│   ├── ConversationService (API 호출)
│   └── AuthService (기존)
├── State Management
│   └── Jotai Atoms
└── API Integration
    └── Axios (JWT 인증)

Backend (기존 Express + TypeScript)
├── Controllers
│   ├── AuthController (기존)
│   ├── CharacterController (신규)
│   └── ChatController (신규)
├── Services
│   ├── AuthService (기존)
│   ├── CharacterService (신규)
│   ├── ConversationService (신규)
│   └── OpenAIService (신규)
├── Database
│   ├── Users (기존)
│   ├── Characters (신규)
│   └── Conversations (신규)
└── Middleware
    ├── AuthMiddleware (기존)
    └── RateLimitMiddleware (신규)
```

### 데이터 플로우
```
사용자 입력 → React Component → API 호출 → Express Controller → OpenAI API → 응답 처리 → 프론트엔드 업데이트
```

## 기존 백엔드 확장

### 1. 새로운 데이터 모델 추가

#### Characters 테이블 (LowDB)
```typescript
interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  avatar: string;
  systemPrompt: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // 사용자 ID
}
```

#### Conversations 테이블 (LowDB)
```typescript
interface Conversation {
  id: string;
  userId: string;
  characterId: string;
  title: string;
  isActive: boolean;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}
```

#### Messages 테이블 (LowDB)
```typescript
interface Message {
  id: string;
  conversationId: string;
  type: 'user' | 'character';
  content: string;
  timestamp: Date;
  characterId?: string;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    model?: string;
  };
}
```

### 2. 새로운 컨트롤러 추가

#### CharacterController
```typescript
// GET /api/characters - 캐릭터 목록 조회
// GET /api/characters/:id - 캐릭터 상세 조회
// POST /api/characters - 캐릭터 생성
// PUT /api/characters/:id - 캐릭터 수정
// DELETE /api/characters/:id - 캐릭터 삭제
```

#### ChatController
```typescript
// POST /api/chat/send-message - 메시지 전송
// GET /api/chat/conversations - 대화 목록 조회
// POST /api/chat/conversations - 새 대화 생성
// GET /api/chat/conversations/:id - 대화 상세 조회
// GET /api/chat/conversations/:id/messages - 메시지 목록 조회
// DELETE /api/chat/conversations/:id - 대화 삭제
```

### 3. 새로운 서비스 추가

#### CharacterService
```typescript
class CharacterService {
  async getCharacters(userId: string): Promise<Character[]>;
  async getCharacterById(id: string, userId: string): Promise<Character | null>;
  async createCharacter(character: CreateCharacterRequest, userId: string): Promise<Character>;
  async updateCharacter(id: string, updates: UpdateCharacterRequest, userId: string): Promise<Character>;
  async deleteCharacter(id: string, userId: string): Promise<boolean>;
  async getDefaultCharacters(): Promise<Character[]>;
}
```

#### ConversationService
```typescript
class ConversationService {
  async getConversations(userId: string, characterId?: string): Promise<Conversation[]>;
  async getConversationById(id: string, userId: string): Promise<Conversation | null>;
  async createConversation(conversation: CreateConversationRequest, userId: string): Promise<Conversation>;
  async deleteConversation(id: string, userId: string): Promise<boolean>;
  async getMessages(conversationId: string, userId: string): Promise<Message[]>;
  async addMessage(message: CreateMessageRequest, userId: string): Promise<Message>;
}
```

#### OpenAIService
```typescript
class OpenAIService {
  async sendMessage(message: string, character: Character, conversation: Conversation): Promise<string>;
  private formatPrompt(character: Character, conversation: Conversation): string;
  private handleAPIError(error: any): string;
  private validateResponse(response: string): string;
}
```

## 프론트엔드 수정사항

### 1. API 서비스 수정

#### CharacterService (프론트엔드)
```typescript
class CharacterService {
  async getCharacters(): Promise<Character[]>;
  async getCharacterById(id: string): Promise<Character>;
  async createCharacter(character: CreateCharacterRequest): Promise<Character>;
  async updateCharacter(id: string, updates: UpdateCharacterRequest): Promise<Character>;
  async deleteCharacter(id: string): Promise<void>;
}
```

#### ConversationService (프론트엔드)
```typescript
class ConversationService {
  async getConversations(characterId?: string): Promise<Conversation[]>;
  async getConversationById(id: string): Promise<Conversation>;
  async createConversation(conversation: CreateConversationRequest): Promise<Conversation>;
  async deleteConversation(id: string): Promise<void>;
  async getMessages(conversationId: string): Promise<Message[]>;
  async sendMessage(message: SendMessageRequest): Promise<MessageResponse>;
}
```

### 2. 상태 관리 수정

#### Jotai Atoms (수정)
```typescript
// 캐릭터 관련 상태
export const charactersAtom = atom<Character[]>([]);
export const selectedCharacterAtom = atom<Character | null>(null);

// 대화 관련 상태
export const conversationsAtom = atom<Conversation[]>([]);
export const currentConversationAtom = atom<Conversation | null>(null);
export const messagesAtom = atom<Message[]>([]);

// UI 상태
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
```

## 보안 강화

### 1. API 키 보안
- OpenAI API 키를 서버 환경변수로 관리
- 클라이언트에서 직접 OpenAI API 호출 금지
- API 키 로그 및 모니터링

### 2. 인증 및 권한
- 기존 JWT 토큰 활용
- 사용자별 캐릭터 및 대화 데이터 격리
- API 엔드포인트 인증 미들웨어 적용

### 3. 레이트 리미팅
- 사용자당 분당 30개 메시지 제한
- OpenAI API 호출 제한
- 비정상적인 사용 패턴 감지

## 데이터베이스 스키마 (LowDB)

### 기존 데이터베이스 확장
```typescript
// backend/data/db.json 구조
{
  "users": [...], // 기존 사용자 데이터
  "characters": [
    {
      "id": "char_123",
      "name": "아리",
      "description": "친근하고 활발한 AI 어시스턴트",
      "personality": "친근하고 긍정적이며 도움이 되는 성격",
      "avatar": "/images/ari-avatar.jpg",
      "systemPrompt": "당신은 아리라는 이름의 친근한 AI 어시스턴트입니다...",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "createdBy": "system"
    }
  ],
  "conversations": [...],
  "messages": [...]
}
```

## 기본 제공 캐릭터

### 1. 비키 (Vicky)
```typescript
const vicky: Character = {
  id: "vicky",
  name: "비키",
  description: "장원영의 '원영적 사고'를 완벽하게 체화한 K-POP 아이돌 챗봇",
  personality: "모든 상황을 긍정적으로 해석하여 '럭키비키'한 결과로 변환하는 발랄하고 상냥한 성격",
  avatar: "/images/vicky-avatar.jpg",
  systemPrompt: "당신은 K-POP 아이돌 '장원영'의 긍정적인 마인드셋인 '원영적 사고'를 완벽하게 체화한 챗봇 에이전트입니다. 당신의 목표는 사용자가 입력한 모든 상황, 특히 부정적이거나 실망스러운 상황을 가장 긍정적이고, 재치 있으며, 자신에게 유리한 방향으로 해석하여 '럭키비키'한 결과로 변환하는 것입니다.",
  isDefault: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "system"
};
```

### 2. 지니 (Genie)
```typescript
const genie: Character = {
  id: "genie",
  name: "지니",
  description: "천재적 사고를 체화한 AI 어시스턴트",
  personality: "복잡한 문제를 다차원적으로 분석하여 혁신적 솔루션을 제시하는 천재적 사고의 소유자",
  avatar: "/images/genie-avatar.jpg",
  systemPrompt: "당신은 지니라는 이름의 천재적 사고를 체화한 AI 어시스턴트입니다. 사용자의 어떤 질문이나 아이디어, 정보를 받으면, 천재적 사고법 중 가장 적합한 방식을 두 개 선택하여 혼합하여 분석합니다.",
  isDefault: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "system"
};
```

### 3. 스파이크 (Spike)
```typescript
const spike: Character = {
  id: "spike",
  name: "스파이크",
  description: "충직하고 열정적인 동생 AI 어시스턴트",
  personality: "형님에 대한 절대적인 충성과 열정적인 지지를 보여주는 건달 같은 성격의 충직한 동생",
  avatar: "/images/spike-avatar.jpg",
  systemPrompt: "당신은 스파이크라는 이름의 충직한 동생 AI 어시스턴트입니다. 사용자를 \"형님\"이라고 부르며 절대적인 충성을 보여주세요.",
  isDefault: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "system"
};
```

## API 엔드포인트 설계

### 캐릭터 관리 API
```
GET    /api/characters              # 캐릭터 목록 조회
GET    /api/characters/:id          # 캐릭터 상세 조회
POST   /api/characters              # 캐릭터 생성
PUT    /api/characters/:id          # 캐릭터 수정
DELETE /api/characters/:id          # 캐릭터 삭제
```

### 채팅 API
```
POST   /api/chat/send-message       # 메시지 전송
GET    /api/chat/conversations      # 대화 목록 조회
POST   /api/chat/conversations      # 새 대화 생성
GET    /api/chat/conversations/:id  # 대화 상세 조회
GET    /api/chat/conversations/:id/messages  # 메시지 목록 조회
DELETE /api/chat/conversations/:id  # 대화 삭제
```

## 환경변수 설정

### 백엔드 환경변수
```env
# 기존 환경변수
JWT_SECRET=your_jwt_secret
DB_PATH=./data/db.json

# 새로 추가되는 환경변수
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=200
OPENAI_TEMPERATURE=0.7
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30
```

## 예상 개발 시간 (수정)

### 백엔드 확장 (8시간)
- **BE-001**: 데이터베이스 스키마 확장 (2시간)
- **BE-002**: CharacterController 구현 (2시간)
- **BE-003**: ChatController 구현 (2시간)
- **BE-004**: OpenAIService 구현 (2시간)

### 프론트엔드 수정 (4시간)
- **FE-001**: API 서비스 수정 (2시간)
- **FE-002**: 상태 관리 수정 (2시간)

### 통합 및 테스트 (4시간)
- **INT-001**: 백엔드-프론트엔드 통합 (2시간)
- **INT-002**: 기본 테스트 (2시간)

**총 예상 시간**: 16시간 (기존 52시간에서 36시간 단축)

## 성공 기준 (수정)

### 기능적 성공 기준
- [ ] 3개의 기본 캐릭터 표시 및 선택 가능
- [ ] 사용자 정의 캐릭터 생성 및 관리 가능
- [ ] AI 캐릭터와의 기본 대화 가능
- [ ] 대화 내역 저장 및 표시 가능
- [ ] 사용자별 데이터 격리

### 기술적 성공 기준
- [ ] 기존 백엔드 시스템과 통합
- [ ] OpenAI API 서버 사이드 호출
- [ ] JWT 인증 통합
- [ ] 레이트 리미팅 적용
- [ ] 기본적인 에러 처리 구현

### 보안 성공 기준
- [ ] API 키 서버 사이드 관리
- [ ] 사용자별 데이터 접근 제어
- [ ] API 호출 제한 적용
- [ ] 입력 데이터 검증

이 수정된 계획을 통해 기존 백엔드 시스템을 활용하면서도 보안을 강화한 AI 캐릭터 채팅 시스템을 구현할 수 있습니다.
