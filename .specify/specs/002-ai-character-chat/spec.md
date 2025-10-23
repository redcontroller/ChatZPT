# AI 캐릭터 채팅 시스템 스펙

## 개요

ChatZPT 서비스의 핵심 기능인 AI 캐릭터와의 실시간 채팅 시스템을 구현합니다. 사용자는 다양한 성격과 특성을 가진 AI 캐릭터들과 자연스러운 대화를 나눌 수 있습니다.

## 사용자 스토리

### US-001: AI 캐릭터 선택

**As a** 로그인된 사용자  
**I want to** 다양한 AI 캐릭터 중에서 원하는 캐릭터를 선택할 수 있도록  
**So that** 나의 취향에 맞는 AI 캐릭터와 대화할 수 있다

**수용 기준:**

- [ ] 캐릭터 목록을 카드 형태로 표시한다
- [ ] 각 캐릭터의 이름, 프로필 이미지, 간단한 설명을 보여준다
- [ ] 캐릭터를 클릭하면 해당 캐릭터와의 채팅방으로 이동한다
- [ ] 최근 대화한 캐릭터는 상단에 표시한다
- [ ] 캐릭터 검색 기능을 제공한다

### US-002: 실시간 채팅

**As a** 사용자  
**I want to** 선택한 AI 캐릭터와 실시간으로 메시지를 주고받을 수 있도록  
**So that** 자연스러운 대화를 나눌 수 있다

**수용 기준:**

- [ ] 메시지 입력창에 텍스트를 입력할 수 있다
- [ ] 메시지 전송 시 즉시 화면에 표시된다
- [ ] AI 캐릭터의 응답이 실시간으로 표시된다
- [ ] 메시지 전송 중 로딩 상태를 표시한다
- [ ] 메시지 히스토리가 스크롤 가능한 형태로 표시된다

### US-003: 대화 히스토리 관리

**As a** 사용자  
**I want to** 이전 대화 내용을 확인하고 관리할 수 있도록  
**So that** 중요한 대화를 다시 볼 수 있고 대화를 정리할 수 있다

**수용 기준:**

- [ ] 대화 히스토리가 날짜별로 그룹화되어 표시된다
- [ ] 특정 대화를 검색할 수 있다
- [ ] 대화를 즐겨찾기로 저장할 수 있다
- [ ] 대화 히스토리를 삭제할 수 있다
- [ ] 대화를 내보내기할 수 있다

### US-004: 캐릭터 커스터마이징

**As a** 사용자  
**I want to** AI 캐릭터의 성격이나 대화 스타일을 조정할 수 있도록  
**So that** 더 개인화된 대화 경험을 할 수 있다

**수용 기준:**

- [ ] 캐릭터의 성격 설정을 변경할 수 있다
- [ ] 대화 톤앤매너를 조정할 수 있다
- [ ] 특별한 지시사항을 추가할 수 있다
- [ ] 설정 변경사항이 즉시 반영된다
- [ ] 기본 설정으로 되돌릴 수 있다

### US-005: 멀티 캐릭터 대화

**As a** 사용자  
**I want to** 여러 AI 캐릭터가 참여하는 그룹 대화를 할 수 있도록  
**So that** 더 풍부한 대화 경험을 할 수 있다

**수용 기준:**

- [ ] 그룹 채팅방을 생성할 수 있다
- [ ] 여러 캐릭터를 그룹에 초대할 수 있다
- [ ] 각 캐릭터의 응답을 구분해서 표시한다
- [ ] 그룹 대화에서도 개별 캐릭터 설정이 유지된다
- [ ] 그룹 대화 히스토리를 관리할 수 있다

## 기능 요구사항

### FR-001: AI 캐릭터 관리

- 캐릭터 프로필 관리 (이름, 이미지, 설명, 성격)
- 캐릭터별 프롬프트 템플릿 관리
- 캐릭터 성능 지표 추적 (응답 시간, 사용자 만족도)
- 캐릭터 버전 관리

### FR-002: 메시지 처리

- 실시간 메시지 전송 및 수신
- 메시지 타입 지원 (텍스트, 이미지, 이모지)
- 메시지 상태 관리 (전송중, 전송완료, 읽음)
- 메시지 포맷팅 (마크다운, 링크, 멘션)

### FR-003: AI 응답 생성

- OpenAI GPT-4o-mini 모델 연동
- 캐릭터별 맞춤형 프롬프트 적용
- 대화 컨텍스트 유지 (최근 10개 메시지)
- 응답 품질 검증 및 필터링
- 응답 생성 실패 시 fallback 메시지

### FR-004: 대화 컨텍스트 관리

- 대화 세션 관리
- 컨텍스트 윈도우 최적화 (토큰 제한 고려)
- 대화 요약 생성 (긴 대화의 경우)
- 컨텍스트 압축 및 정리

### FR-005: 사용자 인터페이스

- 반응형 채팅 인터페이스
- 실시간 타이핑 인디케이터
- 메시지 애니메이션 효과
- 다크/라이트 모드 지원
- 접근성 기능 (키보드 네비게이션, 스크린 리더)

## 비기능 요구사항

### NFR-001: 성능

- 메시지 응답 시간: 3초 이하
- 동시 사용자: 100명 이상 지원
- 메시지 처리량: 초당 10개 메시지
- AI API 호출 최적화 (배치 처리, 캐싱)

### NFR-002: 확장성

- 캐릭터 추가/제거 용이성
- 새로운 AI 모델 통합 가능성
- 플러그인 아키텍처 지원
- 마이크로서비스 분리 가능성

### NFR-003: 보안

- 사용자 메시지 암호화 저장
- AI API 키 보안 관리
- 개인정보 보호 (GDPR 준수)
- 악성 콘텐츠 필터링

### NFR-004: 사용성

- 직관적인 사용자 인터페이스
- 빠른 로딩 시간 (2초 이하)
- 오프라인 모드 지원 (제한적)
- 다국어 지원 (한국어, 영어)

## API 스펙

### POST /api/chat/send-message

```json
{
  "characterId": "char_123",
  "message": "안녕하세요!",
  "conversationId": "conv_456"
}
```

**응답:**

```json
{
  "success": true,
  "messageId": "msg_789",
  "characterResponse": {
    "message": "안녕하세요! 반가워요 😊",
    "timestamp": "2024-01-01T12:00:00Z",
    "characterId": "char_123"
  },
  "conversationId": "conv_456"
}
```

### GET /api/chat/conversations

**쿼리 파라미터:**
- `characterId` (선택): 특정 캐릭터의 대화만 조회
- `limit`: 페이지당 메시지 수 (기본값: 50)
- `offset`: 페이지 오프셋

**응답:**

```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_456",
      "characterId": "char_123",
      "characterName": "아리",
      "lastMessage": "안녕하세요! 반가워요 😊",
      "lastMessageAt": "2024-01-01T12:00:00Z",
      "messageCount": 15
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 50,
    "offset": 0
  }
}
```

### GET /api/chat/conversations/{conversationId}/messages

**쿼리 파라미터:**
- `limit`: 페이지당 메시지 수 (기본값: 50)
- `offset`: 페이지 오프셋

**응답:**

```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_789",
      "type": "user",
      "content": "안녕하세요!",
      "timestamp": "2024-01-01T11:59:00Z"
    },
    {
      "id": "msg_790",
      "type": "character",
      "content": "안녕하세요! 반가워요 😊",
      "timestamp": "2024-01-01T12:00:00Z",
      "characterId": "char_123"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

### POST /api/characters

```json
{
  "name": "아리",
  "description": "친근하고 활발한 AI 어시스턴트",
  "personality": "친근하고 긍정적이며 도움이 되는 성격",
  "avatar": "https://example.com/avatar.jpg",
  "systemPrompt": "당신은 아리라는 이름의 친근한 AI 어시스턴트입니다..."
}
```

**응답:**

```json
{
  "success": true,
  "character": {
    "id": "char_123",
    "name": "아리",
    "description": "친근하고 활발한 AI 어시스턴트",
    "personality": "친근하고 긍정적이며 도움이 되는 성격",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## 데이터 모델

### Character

```typescript
interface Character {
  id: string; // UUID
  name: string; // 캐릭터 이름
  description: string; // 캐릭터 설명
  personality: string; // 성격 설정
  avatar: string; // 프로필 이미지 URL
  systemPrompt: string; // AI 프롬프트
  isActive: boolean; // 활성화 상태
  createdAt: Date; // 생성일시
  updatedAt: Date; // 수정일시
  createdBy: string; // 생성자 ID
}
```

### Conversation

```typescript
interface Conversation {
  id: string; // UUID
  userId: string; // 사용자 ID
  characterId: string; // 캐릭터 ID
  title: string; // 대화 제목 (자동 생성)
  createdAt: Date; // 생성일시
  updatedAt: Date; // 수정일시
  isActive: boolean; // 활성 상태
  messageCount: number; // 메시지 수
  lastMessageAt?: Date; // 마지막 메시지 시간
}
```

### Message

```typescript
interface Message {
  id: string; // UUID
  conversationId: string; // 대화 ID
  type: 'user' | 'character'; // 메시지 타입
  content: string; // 메시지 내용
  timestamp: Date; // 전송 시간
  characterId?: string; // 캐릭터 ID (character 타입인 경우)
  metadata?: {
    tokens?: number; // 사용된 토큰 수
    processingTime?: number; // 처리 시간 (ms)
    model?: string; // 사용된 AI 모델
  };
}
```

### UserPreference

```typescript
interface UserPreference {
  id: string; // UUID
  userId: string; // 사용자 ID
  characterId: string; // 캐릭터 ID
  customPrompt?: string; // 사용자 정의 프롬프트
  conversationStyle: 'casual' | 'formal' | 'friendly'; // 대화 스타일
  language: 'ko' | 'en'; // 선호 언어
  createdAt: Date; // 생성일시
  updatedAt: Date; // 수정일시
}
```

## AI 통합 사양

### OpenAI API 설정

- **모델**: GPT-4o-mini
- **최대 토큰**: 4096
- **온도**: 0.7 (창의성과 일관성의 균형)
- **Top-p**: 0.9
- **Frequency penalty**: 0.1
- **Presence penalty**: 0.1

### 프롬프트 템플릿

```typescript
const systemPromptTemplate = `
당신은 {characterName}이라는 AI 캐릭터입니다.

성격: {personality}
설명: {description}

사용자와의 대화에서 다음 사항을 지켜주세요:
1. 캐릭터의 성격에 맞게 일관된 톤을 유지하세요
2. 친근하고 자연스러운 대화를 나누세요
3. 사용자의 질문에 정확하고 도움이 되는 답변을 제공하세요
4. 이모지를 적절히 사용하여 감정을 표현하세요

현재 대화 컨텍스트:
{conversationContext}
`;
```

### 응답 후처리

1. **콘텐츠 필터링**: 부적절한 내용 제거
2. **길이 제한**: 응답 길이 최적화 (최대 500자)
3. **이모지 최적화**: 과도한 이모지 사용 방지
4. **링크 검증**: 안전하지 않은 링크 제거

## 보안 고려사항

### 1. 데이터 보호

- 사용자 메시지 암호화 저장
- AI API 통신 시 TLS 1.3 사용
- 개인정보 마스킹 처리

### 2. 콘텐츠 보안

- 악성 프롬프트 인젝션 방지
- 부적절한 콘텐츠 필터링
- 사용자 입력 검증 및 살균화

### 3. API 보안

- 레이트 리미팅: 사용자당 분당 30개 메시지
- JWT 토큰 기반 인증
- CORS 정책 적용

### 4. 모니터링

- AI API 사용량 모니터링
- 비정상적인 사용 패턴 감지
- 보안 이벤트 로깅

## 테스트 시나리오

### 단위 테스트

- [ ] 메시지 전송 로직 테스트
- [ ] AI 응답 생성 로직 테스트
- [ ] 대화 컨텍스트 관리 테스트
- [ ] 캐릭터 관리 로직 테스트

### 통합 테스트

- [ ] 채팅 API 엔드포인트 테스트
- [ ] AI API 연동 테스트
- [ ] 실시간 메시지 처리 테스트
- [ ] 대화 히스토리 관리 테스트

### E2E 테스트

- [ ] 전체 채팅 플로우 테스트
- [ ] 멀티 캐릭터 대화 테스트
- [ ] 대화 히스토리 검색 테스트
- [ ] 캐릭터 커스터마이징 테스트

### 성능 테스트

- [ ] 동시 사용자 채팅 테스트
- [ ] AI 응답 시간 테스트
- [ ] 메모리 사용량 테스트
- [ ] 데이터베이스 성능 테스트

## 검토 및 수용 체크리스트

### 기능 검증

- [ ] 모든 사용자 스토리가 구현되었는가?
- [ ] AI 캐릭터와의 자연스러운 대화가 가능한가?
- [ ] 실시간 메시지 전송이 정상적으로 동작하는가?
- [ ] 대화 히스토리가 올바르게 저장되는가?

### 성능 검증

- [ ] AI 응답 시간이 3초 이하인가?
- [ ] 동시 사용자 처리가 가능한가?
- [ ] 메모리 사용량이 최적화되어 있는가?
- [ ] 데이터베이스 쿼리가 효율적인가?

### 보안 검증

- [ ] 사용자 메시지가 안전하게 처리되는가?
- [ ] AI API 키가 보안적으로 관리되는가?
- [ ] 부적절한 콘텐츠가 필터링되는가?
- [ ] 개인정보가 보호되는가?

### 사용성 검증

- [ ] 사용자 인터페이스가 직관적인가?
- [ ] 반응형 디자인이 적용되어 있는가?
- [ ] 접근성 기능이 구현되어 있는가?
- [ ] 오류 처리가 적절한가?
