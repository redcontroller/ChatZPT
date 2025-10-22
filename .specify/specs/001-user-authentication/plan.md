# 사용자 인증 시스템 기술 구현 계획

## 기술 스택 개요

### 프론트엔드

- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장
- **Vite**: 빠른 개발 서버 및 빌드
- **Jotai**: 상태 관리
- **Tailwind CSS**: 스타일링 + 다크모드
- **Framer Motion**: 애니메이션
- **Axios**: HTTP 클라이언트

### 백엔드

- **Node.js + Express**: TypeScript 기반 API 서버
- **LowDB**: JSON 기반 로컬 데이터베이스
- **JWT**: 인증 토큰 관리
- **OpenAPI SDK**: API 문서화

### AI 연동

- **OpenAI API**: GPT-4o-mini 모델
- **환경변수**: API 키 관리

### 데이터 저장

- **LocalStorage**: 클라이언트 사이드 저장
- **JSON 파일**: 서버 사이드 저장

### 테스트

- **Jest**: 테스트 프레임워크

## 프로젝트 구조

```
chatzpt/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── store/          # Jotai 상태 관리
│   │   ├── services/       # API 서비스
│   │   ├── types/          # TypeScript 타입 정의
│   │   ├── utils/          # 유틸리티 함수
│   │   └── styles/         # 글로벌 스타일
│   ├── public/             # 정적 파일
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/                 # Node.js 백엔드
│   ├── src/
│   │   ├── controllers/    # API 컨트롤러
│   │   ├── services/       # 비즈니스 로직
│   │   ├── models/         # 데이터 모델
│   │   ├── middleware/     # Express 미들웨어
│   │   ├── routes/         # API 라우트
│   │   ├── utils/          # 유틸리티 함수
│   │   └── types/          # TypeScript 타입 정의
│   ├── data/               # LowDB 데이터 파일
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── shared/                  # 공유 타입 및 유틸리티
│   ├── types/              # 공통 타입 정의
│   └── utils/              # 공통 유틸리티
├── tests/                   # 통합 테스트
├── docs/                    # 문서
└── package.json            # 루트 패키지 (모노레포)
```

## 구현 단계

### Phase 1: 프로젝트 초기 설정

1. **모노레포 구조 설정**

   - 루트 package.json 설정
   - 워크스페이스 구성
   - 공통 의존성 관리

2. **프론트엔드 초기 설정**

   - Vite + React 19 + TypeScript 프로젝트 생성
   - Tailwind CSS 설정 및 다크모드 구성
   - Framer Motion 설정
   - Axios 설정
   - Jotai 상태 관리 설정

3. **백엔드 초기 설정**
   - Node.js + Express + TypeScript 프로젝트 생성
   - LowDB 설정
   - JWT 미들웨어 설정
   - OpenAPI SDK 설정
   - 환경변수 설정

### Phase 2: 사용자 인증 백엔드 구현

1. **데이터 모델 정의**

   - User 모델 (LowDB 스키마)
   - RefreshToken 모델
   - 데이터베이스 초기화

2. **인증 서비스 구현**

   - 비밀번호 해싱 (bcrypt)
   - JWT 토큰 생성/검증
   - 사용자 등록/로그인 로직
   - 비밀번호 재설정 로직

3. **API 엔드포인트 구현**

   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password
   - GET /api/auth/me

4. **미들웨어 구현**
   - JWT 인증 미들웨어
   - 입력 검증 미들웨어
   - 에러 처리 미들웨어
   - 레이트 리미팅 미들웨어

### Phase 3: 사용자 인증 프론트엔드 구현

1. **타입 정의**

   - API 응답 타입
   - 사용자 데이터 타입
   - 폼 데이터 타입

2. **API 서비스 구현**

   - Axios 인스턴스 설정
   - 인증 관련 API 함수
   - 토큰 관리 유틸리티
   - 인터셉터 설정

3. **상태 관리 구현**

   - 사용자 상태 atom
   - 인증 상태 atom
   - 로딩 상태 atom

4. **컴포넌트 구현**

   - 로그인 폼 컴포넌트
   - 회원가입 폼 컴포넌트
   - 비밀번호 재설정 컴포넌트
   - 보호된 라우트 컴포넌트

5. **라우팅 및 네비게이션**
   - React Router 설정
   - 인증 기반 라우트 보호
   - 리다이렉트 로직

### Phase 4: UI/UX 구현

1. **디자인 시스템**

   - Tailwind CSS 커스텀 설정
   - 다크모드 토글 구현
   - 공통 컴포넌트 스타일

2. **애니메이션 구현**

   - Framer Motion 설정
   - 페이지 전환 애니메이션
   - 폼 상호작용 애니메이션
   - 로딩 애니메이션

3. **반응형 디자인**
   - 모바일 우선 디자인
   - 태블릿/데스크톱 대응
   - 접근성 고려

### Phase 5: 테스트 구현

1. **백엔드 테스트**

   - 단위 테스트 (서비스 로직)
   - 통합 테스트 (API 엔드포인트)
   - 데이터베이스 테스트

2. **프론트엔드 테스트**

   - 컴포넌트 테스트
   - 훅 테스트
   - API 서비스 테스트

3. **E2E 테스트**
   - 사용자 인증 플로우
   - 에러 시나리오 테스트

## 데이터 모델 상세

### User (LowDB)

```typescript
interface User {
  id: string; // UUID
  email: string; // 이메일 (unique)
  passwordHash: string; // bcrypt 해시
  createdAt: Date; // 생성일시
  updatedAt: Date; // 수정일시
  lastLoginAt?: Date; // 마지막 로그인
  isActive: boolean; // 계정 활성화 상태
  profile?: {
    name?: string;
    avatar?: string;
  };
}
```

### RefreshToken (LowDB)

```typescript
interface RefreshToken {
  id: string; // UUID
  userId: string; // 사용자 ID
  token: string; // 리프레시 토큰
  expiresAt: Date; // 만료일시
  createdAt: Date; // 생성일시
  userAgent?: string; // 사용자 에이전트
  ipAddress?: string; // IP 주소
}
```

## API 스펙 상세

### 인증 헤더

```
Authorization: Bearer <access_token>
```

### 응답 형식

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
}
```

### 에러 코드

- `VALIDATION_ERROR`: 입력 검증 실패
- `AUTHENTICATION_ERROR`: 인증 실패
- `AUTHORIZATION_ERROR`: 권한 없음
- `USER_NOT_FOUND`: 사용자 없음
- `EMAIL_ALREADY_EXISTS`: 이메일 중복
- `INVALID_TOKEN`: 유효하지 않은 토큰
- `TOKEN_EXPIRED`: 토큰 만료
- `RATE_LIMIT_EXCEEDED`: 요청 한도 초과

## 보안 구현

### 1. 비밀번호 보안

- bcrypt 해싱 (salt rounds: 12)
- 비밀번호 정책 검증
- 일반적인 비밀번호 패턴 차단

### 2. JWT 토큰 보안

- 액세스 토큰: 15분 만료
- 리프레시 토큰: 7일 만료
- 토큰 갱신 메커니즘
- 토큰 무효화 (로그아웃 시)

### 3. 입력 검증

- Joi 또는 Zod를 통한 스키마 검증
- XSS 방지
- SQL 인젝션 방지 (LowDB 사용으로 자동 방지)

### 4. 레이트 리미팅

- express-rate-limit 사용
- 로그인 시도: 분당 5회
- 일반 API: 분당 100회

## 성능 최적화

### 1. 프론트엔드

- React.memo를 통한 불필요한 리렌더링 방지
- useMemo, useCallback을 통한 계산 최적화
- 코드 스플리팅 (React.lazy)
- 이미지 최적화

### 2. 백엔드

- LowDB 인덱싱 최적화
- 메모리 캐싱 (Redis 대신 메모리 캐시)
- API 응답 압축
- 정적 파일 캐싱

### 3. 네트워크

- Axios 요청/응답 인터셉터
- 토큰 자동 갱신
- 요청 중복 제거
- 오프라인 지원 (Service Worker)

## 개발 환경 설정

### 1. 필수 도구

- Node.js 18+
- npm 또는 yarn
- Git

### 2. 환경변수 설정

```bash
# Backend .env
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
OPENAI_API_KEY=your_openai_api_key
BCRYPT_ROUNDS=12
```

### 3. 개발 스크립트

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "test": "npm run test:frontend && npm run test:backend",
    "lint": "npm run lint:frontend && npm run lint:backend"
  }
}
```

## 배포 전략

### 1. 개발 환경

- 로컬 개발 서버
- Hot reload 지원
- 개발용 데이터베이스

### 2. 프로덕션 환경

- 정적 파일 빌드
- 환경변수 설정
- 로그 관리
- 에러 모니터링

## 모니터링 및 로깅

### 1. 로깅

- Winston을 통한 구조화된 로깅
- 로그 레벨 관리
- 파일 로테이션

### 2. 에러 추적

- 클라이언트 에러 추적
- 서버 에러 추적
- 성능 모니터링

이 기술 계획은 선정된 기술 스택을 기반으로 사용자 인증 시스템을 체계적으로 구현하기 위한 상세한 로드맵을 제공합니다.
