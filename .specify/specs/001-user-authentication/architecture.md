# ChatZPT 사용자 인증 시스템 아키텍처

## 시스템 아키텍처 개요

### 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        ChatZPT System                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React 19 + TypeScript + Vite)                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Components    │  │   State Mgmt    │  │   Services   │ │
│  │   - LoginForm   │  │   - Jotai       │  │   - API      │ │
│  │   - RegisterForm│  │   - Auth State  │  │   - Auth     │ │
│  │   - Profile     │  │   - User State  │  │   - HTTP     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Backend (Node.js + Express + TypeScript)                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Controllers   │  │    Services     │  │   Models     │ │
│  │   - AuthCtrl    │  │   - AuthSvc     │  │   - User     │ │
│  │   - UserCtrl    │  │   - UserSvc     │  │   - Token    │ │
│  │   - Middleware  │  │   - JWT Svc     │  │   - Database │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (LowDB + JSON Files)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Users DB      │  │  Tokens DB      │  │  Local Files │ │
│  │   - user.json   │  │  - tokens.json  │  │  - logs/     │ │
│  │   - profiles/   │  │  - sessions/    │  │  - backups/  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 프론트엔드 아키텍처

### 컴포넌트 구조

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx          # 로그인 폼
│   │   ├── RegisterForm.tsx       # 회원가입 폼
│   │   ├── ForgotPasswordForm.tsx # 비밀번호 재설정 폼
│   │   └── ProtectedRoute.tsx     # 보호된 라우트
│   ├── user/
│   │   ├── Profile.tsx            # 사용자 프로필
│   │   ├── ProfileEdit.tsx        # 프로필 편집
│   │   └── ChangePassword.tsx     # 비밀번호 변경
│   ├── common/
│   │   ├── Layout.tsx             # 공통 레이아웃
│   │   ├── Header.tsx             # 헤더
│   │   ├── Footer.tsx             # 푸터
│   │   └── LoadingSpinner.tsx     # 로딩 스피너
│   └── ui/
│       ├── Button.tsx             # 버튼 컴포넌트
│       ├── Input.tsx              # 입력 컴포넌트
│       ├── Modal.tsx              # 모달 컴포넌트
│       └── Toast.tsx              # 토스트 알림
├── hooks/
│   ├── useAuth.ts                 # 인증 관련 훅
│   ├── useApi.ts                  # API 호출 훅
│   ├── useLocalStorage.ts         # 로컬 스토리지 훅
│   └── useTheme.ts                # 테마 관리 훅
├── store/
│   ├── authAtom.ts                # 인증 상태 atom
│   ├── userAtom.ts                # 사용자 정보 atom
│   ├── themeAtom.ts               # 테마 상태 atom
│   └── loadingAtom.ts             # 로딩 상태 atom
├── services/
│   ├── api.ts                     # API 클라이언트 설정
│   ├── authService.ts             # 인증 API 서비스
│   ├── userService.ts             # 사용자 API 서비스
│   └── tokenService.ts            # 토큰 관리 서비스
├── types/
│   ├── auth.ts                    # 인증 관련 타입
│   ├── user.ts                    # 사용자 관련 타입
│   ├── api.ts                     # API 응답 타입
│   └── common.ts                  # 공통 타입
├── utils/
│   ├── validation.ts              # 입력 검증 유틸리티
│   ├── formatters.ts              # 데이터 포맷터
│   ├── constants.ts               # 상수 정의
│   └── helpers.ts                 # 헬퍼 함수
└── styles/
    ├── globals.css                # 글로벌 스타일
    ├── components.css             # 컴포넌트 스타일
    └── themes.css                 # 테마 스타일
```

### 상태 관리 플로우

```
User Action → Component → Hook → Atom → Service → API
     ↓              ↓        ↓       ↓        ↓
  UI Update ← Component ← Hook ← Atom ← Response
```

## 백엔드 아키텍처

### 서비스 레이어 구조

```
src/
├── controllers/
│   ├── authController.ts          # 인증 컨트롤러
│   ├── userController.ts          # 사용자 컨트롤러
│   └── healthController.ts        # 헬스 체크 컨트롤러
├── services/
│   ├── authService.ts             # 인증 비즈니스 로직
│   ├── userService.ts             # 사용자 비즈니스 로직
│   ├── jwtService.ts              # JWT 토큰 서비스
│   ├── emailService.ts            # 이메일 서비스
│   └── validationService.ts       # 검증 서비스
├── models/
│   ├── User.ts                    # 사용자 모델
│   ├── RefreshToken.ts            # 리프레시 토큰 모델
│   ├── PasswordResetToken.ts      # 비밀번호 재설정 토큰 모델
│   └── EmailVerificationToken.ts  # 이메일 인증 토큰 모델
├── middleware/
│   ├── authMiddleware.ts          # JWT 인증 미들웨어
│   ├── validationMiddleware.ts    # 입력 검증 미들웨어
│   ├── errorMiddleware.ts         # 에러 처리 미들웨어
│   ├── rateLimitMiddleware.ts     # 레이트 리미팅 미들웨어
│   └── loggingMiddleware.ts       # 로깅 미들웨어
├── routes/
│   ├── authRoutes.ts              # 인증 라우트
│   ├── userRoutes.ts              # 사용자 라우트
│   └── index.ts                   # 라우트 통합
├── database/
│   ├── connection.ts              # 데이터베이스 연결
│   ├── migrations.ts              # 데이터 마이그레이션
│   └── seeders.ts                 # 초기 데이터
├── utils/
│   ├── bcrypt.ts                  # 비밀번호 해싱
│   ├── crypto.ts                  # 암호화 유틸리티
│   ├── email.ts                   # 이메일 템플릿
│   └── logger.ts                  # 로깅 유틸리티
├── types/
│   ├── auth.ts                    # 인증 관련 타입
│   ├── user.ts                    # 사용자 관련 타입
│   ├── api.ts                     # API 타입
│   └── database.ts                # 데이터베이스 타입
└── config/
    ├── database.ts                # 데이터베이스 설정
    ├── jwt.ts                     # JWT 설정
    ├── email.ts                   # 이메일 설정
    └── app.ts                     # 앱 설정
```

### API 요청 플로우

```
Client Request → Middleware → Controller → Service → Model → Database
     ↓              ↓           ↓          ↓        ↓         ↓
Client Response ← Middleware ← Controller ← Service ← Model ← Database
```

## 데이터 플로우

### 인증 플로우

```
1. 사용자 로그인 요청
   ↓
2. 프론트엔드: 폼 검증 → API 호출
   ↓
3. 백엔드: 입력 검증 → 사용자 인증 → JWT 생성
   ↓
4. 응답: 사용자 정보 + 토큰
   ↓
5. 프론트엔드: 토큰 저장 → 상태 업데이트 → 리다이렉트
```

### 토큰 갱신 플로우

```
1. API 요청 시 토큰 만료 감지
   ↓
2. 자동으로 리프레시 토큰으로 갱신 요청
   ↓
3. 새 액세스 토큰 발급
   ↓
4. 원래 요청 재시도
```

### 비밀번호 재설정 플로우

```
1. 사용자가 비밀번호 재설정 요청
   ↓
2. 이메일로 재설정 링크 전송
   ↓
3. 사용자가 링크 클릭 → 새 비밀번호 입력
   ↓
4. 토큰 검증 → 비밀번호 업데이트
   ↓
5. 성공 메시지 표시
```

## 보안 아키텍처

### 인증 보안 계층

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Input Validation & Sanitization                  │
│  - Joi/Zod schema validation                               │
│  - XSS prevention                                          │
│  - SQL injection prevention (LowDB)                       │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Authentication & Authorization                   │
│  - JWT token validation                                    │
│  - Role-based access control                               │
│  - Session management                                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Rate Limiting & Monitoring                       │
│  - Request rate limiting                                   │
│  - Failed login attempt tracking                           │
│  - Suspicious activity detection                           │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Data Protection                                  │
│  - Password hashing (bcrypt)                               │
│  - Token encryption                                        │
│  - Secure data storage                                     │
└─────────────────────────────────────────────────────────────┘
```

## 성능 최적화 전략

### 프론트엔드 최적화

```
┌─────────────────────────────────────────────────────────────┐
│                Frontend Performance                        │
├─────────────────────────────────────────────────────────────┤
│  Code Splitting:                                           │
│  - Route-based splitting                                   │
│  - Component lazy loading                                  │
│  - Dynamic imports                                         │
├─────────────────────────────────────────────────────────────┤
│  State Management:                                         │
│  - Jotai atom optimization                                 │
│  - Memoization (React.memo, useMemo)                      │
│  - Selective re-rendering                                  │
├─────────────────────────────────────────────────────────────┤
│  Network Optimization:                                     │
│  - Request deduplication                                   │
│  - Response caching                                        │
│  - Token auto-refresh                                      │
└─────────────────────────────────────────────────────────────┘
```

### 백엔드 최적화

```
┌─────────────────────────────────────────────────────────────┐
│                Backend Performance                         │
├─────────────────────────────────────────────────────────────┤
│  Database Optimization:                                    │
│  - LowDB indexing                                          │
│  - Query optimization                                      │
│  - Data pagination                                         │
├─────────────────────────────────────────────────────────────┤
│  Caching Strategy:                                         │
│  - In-memory caching                                       │
│  - Token caching                                           │
│  - Response caching                                        │
├─────────────────────────────────────────────────────────────┤
│  Resource Management:                                      │
│  - Connection pooling                                      │
│  - Memory management                                       │
│  - Garbage collection optimization                         │
└─────────────────────────────────────────────────────────────┘
```

## 배포 아키텍처

### 개발 환경

```
┌─────────────────────────────────────────────────────────────┐
│                  Development Environment                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend: Vite Dev Server (Port 3000)                    │
│  Backend: Node.js Dev Server (Port 3001)                  │
│  Database: Local LowDB files                               │
│  Hot Reload: Enabled                                       │
│  Debug Mode: Enabled                                       │
└─────────────────────────────────────────────────────────────┘
```

### 프로덕션 환경

```
┌─────────────────────────────────────────────────────────────┐
│                  Production Environment                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend: Static files (Nginx/CDN)                       │
│  Backend: Node.js server (PM2)                            │
│  Database: Persistent LowDB files                          │
│  Logging: Winston + File rotation                          │
│  Monitoring: Health checks + Error tracking               │
└─────────────────────────────────────────────────────────────┘
```

## 모니터링 및 로깅

### 로깅 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Logging Architecture                    │
├─────────────────────────────────────────────────────────────┤
│  Application Logs:                                         │
│  - Request/Response logging                                │
│  - Error logging                                           │
│  - Authentication events                                   │
├─────────────────────────────────────────────────────────────┤
│  Security Logs:                                            │
│  - Failed login attempts                                   │
│  - Suspicious activities                                   │
│  - Token usage patterns                                    │
├─────────────────────────────────────────────────────────────┤
│  Performance Logs:                                         │
│  - Response times                                          │
│  - Database query times                                    │
│  - Memory usage                                            │
└─────────────────────────────────────────────────────────────┘
```

이 아키텍처는 선정된 기술 스택을 기반으로 확장 가능하고 유지보수가 용이한 사용자 인증 시스템을 구축하기 위한 설계입니다.
