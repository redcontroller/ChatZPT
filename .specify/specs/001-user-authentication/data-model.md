# 사용자 인증 시스템 데이터 모델

## 데이터베이스 스키마 (LowDB)

### Users Collection

```typescript
interface User {
  id: string; // UUID v4
  email: string; // 이메일 주소 (unique, lowercase)
  passwordHash: string; // bcrypt 해시된 비밀번호
  createdAt: Date; // 계정 생성일시
  updatedAt: Date; // 마지막 수정일시
  lastLoginAt?: Date; // 마지막 로그인 시간
  isActive: boolean; // 계정 활성화 상태 (기본값: true)
  emailVerified: boolean; // 이메일 인증 상태 (기본값: false)
  profile: {
    name?: string; // 사용자 이름
    avatar?: string; // 아바타 이미지 URL
    bio?: string; // 자기소개
    preferences: {
      theme: 'light' | 'dark' | 'system'; // 테마 설정
      language: 'ko' | 'en'; // 언어 설정
      notifications: {
        email: boolean; // 이메일 알림
        push: boolean; // 푸시 알림
      };
    };
  };
  security: {
    failedLoginAttempts: number; // 실패한 로그인 시도 횟수
    lockedUntil?: Date; // 계정 잠금 해제 시간
    twoFactorEnabled: boolean; // 2FA 활성화 상태
    lastPasswordChange?: Date; // 마지막 비밀번호 변경일
  };
}
```

### RefreshTokens Collection

```typescript
interface RefreshToken {
  id: string; // UUID v4
  userId: string; // 사용자 ID (User.id 참조)
  token: string; // 리프레시 토큰 (랜덤 문자열)
  expiresAt: Date; // 토큰 만료일시
  createdAt: Date; // 토큰 생성일시
  userAgent?: string; // 사용자 에이전트
  ipAddress?: string; // IP 주소
  isRevoked: boolean; // 토큰 취소 상태 (기본값: false)
  revokedAt?: Date; // 토큰 취소일시
}
```

### PasswordResetTokens Collection

```typescript
interface PasswordResetToken {
  id: string; // UUID v4
  userId: string; // 사용자 ID (User.id 참조)
  token: string; // 재설정 토큰 (랜덤 문자열)
  expiresAt: Date; // 토큰 만료일시 (24시간)
  createdAt: Date; // 토큰 생성일시
  usedAt?: Date; // 토큰 사용일시
  ipAddress?: string; // 요청 IP 주소
}
```

### EmailVerificationTokens Collection

```typescript
interface EmailVerificationToken {
  id: string; // UUID v4
  userId: string; // 사용자 ID (User.id 참조)
  token: string; // 인증 토큰 (랜덤 문자열)
  expiresAt: Date; // 토큰 만료일시 (24시간)
  createdAt: Date; // 토큰 생성일시
  verifiedAt?: Date; // 인증 완료일시
}
```

## TypeScript 타입 정의

### 공통 타입

```typescript
// API 응답 기본 형식
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// 페이지네이션
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 정렬 옵션
interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}
```

### 인증 관련 타입

```typescript
// 회원가입 요청
interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

// 로그인 요청
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 로그인 응답
interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    preferences: User['profile']['preferences'];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // 초 단위
  };
}

// 토큰 갱신 요청
interface RefreshTokenRequest {
  refreshToken: string;
}

// 비밀번호 재설정 요청
interface ForgotPasswordRequest {
  email: string;
}

// 비밀번호 재설정 확인
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// 사용자 프로필 업데이트
interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  preferences?: Partial<User['profile']['preferences']>;
}

// 비밀번호 변경
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

### JWT 페이로드 타입

```typescript
interface JWTPayload {
  sub: string; // 사용자 ID
  email: string; // 이메일
  iat: number; // 발급 시간
  exp: number; // 만료 시간
  type: 'access' | 'refresh';
  jti?: string; // JWT ID (토큰 고유 식별자)
}
```

## 데이터베이스 인덱스

### Users Collection 인덱스

```typescript
// 이메일 인덱스 (unique)
{ email: 1 }

// 생성일시 인덱스 (정렬용)
{ createdAt: -1 }

// 활성화 상태 인덱스 (필터링용)
{ isActive: 1 }

// 복합 인덱스 (이메일 + 활성화 상태)
{ email: 1, isActive: 1 }
```

### RefreshTokens Collection 인덱스

```typescript
// 사용자 ID 인덱스
{ userId: 1 }

// 토큰 인덱스 (unique)
{ token: 1 }

// 만료일시 인덱스 (정리용)
{ expiresAt: 1 }

// 복합 인덱스 (사용자 ID + 활성 상태)
{ userId: 1, isRevoked: 1 }
```

### PasswordResetTokens Collection 인덱스

```typescript
// 토큰 인덱스 (unique)
{
  token: 1;
}

// 사용자 ID 인덱스
{
  userId: 1;
}

// 만료일시 인덱스 (정리용)
{
  expiresAt: 1;
}
```

## 데이터 검증 스키마

### Joi 검증 스키마

```typescript
import Joi from 'joi';

// 회원가입 검증
const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'string.email': '유효한 이메일 주소를 입력해주세요',
    'any.required': '이메일은 필수입니다',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': '비밀번호는 최소 8자 이상이어야 합니다',
      'string.pattern.base':
        '비밀번호는 영문 대소문자, 숫자, 특수문자를 포함해야 합니다',
      'any.required': '비밀번호는 필수입니다',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': '비밀번호가 일치하지 않습니다',
    'any.required': '비밀번호 확인은 필수입니다',
  }),
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': '이름은 최소 2자 이상이어야 합니다',
    'string.max': '이름은 최대 50자까지 가능합니다',
  }),
});

// 로그인 검증
const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional().default(false),
});

// 비밀번호 재설정 검증
const resetPasswordSchema = Joi.object({
  token: Joi.string().uuid().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});
```

## 데이터 마이그레이션

### 초기 데이터베이스 설정

```typescript
// LowDB 초기화 스크립트
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';

interface DatabaseSchema {
  users: User[];
  refreshTokens: RefreshToken[];
  passwordResetTokens: PasswordResetToken[];
  emailVerificationTokens: EmailVerificationToken[];
  metadata: {
    version: string;
    lastMigration: Date;
  };
}

const initializeDatabase = async () => {
  const adapter = new JSONFile<DatabaseSchema>('./data/db.json');
  const db = new Low(adapter, {
    users: [],
    refreshTokens: [],
    passwordResetTokens: [],
    emailVerificationTokens: [],
    metadata: {
      version: '1.0.0',
      lastMigration: new Date(),
    },
  });

  await db.read();
  await db.write();

  return db;
};
```

### 데이터 정리 작업

```typescript
// 만료된 토큰 정리
const cleanupExpiredTokens = async (db: Low<DatabaseSchema>) => {
  const now = new Date();

  // 만료된 리프레시 토큰 삭제
  db.data.refreshTokens = db.data.refreshTokens.filter(
    (token) => token.expiresAt > now
  );

  // 만료된 비밀번호 재설정 토큰 삭제
  db.data.passwordResetTokens = db.data.passwordResetTokens.filter(
    (token) => token.expiresAt > now
  );

  // 만료된 이메일 인증 토큰 삭제
  db.data.emailVerificationTokens = db.data.emailVerificationTokens.filter(
    (token) => token.expiresAt > now
  );

  await db.write();
};

// 정기적인 정리 작업 (cron job)
setInterval(() => {
  cleanupExpiredTokens(db);
}, 24 * 60 * 60 * 1000); // 24시간마다 실행
```

## 데이터 백업 및 복구

### 백업 전략

```typescript
// 데이터베이스 백업
const backupDatabase = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `./backups/db-backup-${timestamp}.json`;

  // 현재 데이터베이스 파일 복사
  await fs.copyFile('./data/db.json', backupPath);

  // 압축 (선택사항)
  // await compressFile(backupPath);

  return backupPath;
};

// 자동 백업 (매일 새벽 2시)
const scheduleBackup = () => {
  const cron = require('node-cron');

  cron.schedule('0 2 * * *', async () => {
    try {
      const backupPath = await backupDatabase();
      console.log(`Database backed up to: ${backupPath}`);
    } catch (error) {
      console.error('Backup failed:', error);
    }
  });
};
```

이 데이터 모델은 LowDB를 사용한 JSON 기반 데이터베이스에 최적화되어 있으며, 사용자 인증 시스템의 모든 요구사항을 충족합니다.
