# ChatZPT 개발 환경 설정 가이드

## 필수 요구사항

### 시스템 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상 또는 **yarn**: 1.22.0 이상
- **Git**: 2.30.0 이상
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+

### 권장 개발 도구

- **IDE**: Visual Studio Code 또는 Cursor
- **터미널**: Windows Terminal, iTerm2, 또는 기본 터미널
- **브라우저**: Chrome, Firefox, Safari (최신 버전)

## 프로젝트 초기 설정

### 1. 저장소 클론 및 의존성 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd chatzpt

# 루트 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd frontend
npm install

# 백엔드 의존성 설치
cd ../backend
npm install
```

### 2. 환경변수 설정

#### 백엔드 환경변수 (.env)

```bash
# backend/.env
NODE_ENV=development
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_long_and_random
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
OPENAI_API_KEY=your_openai_api_key_here
EMAIL_SERVICE_API_KEY=your_email_service_api_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
```

#### 프론트엔드 환경변수 (.env)

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=ChatZPT
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
```

### 3. 데이터베이스 초기화

```bash
# 백엔드 디렉토리에서 실행
cd backend
npm run db:init
npm run db:seed
```

## 개발 스크립트

### 루트 패키지 스크립트

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "test:watch": "npm run test:frontend:watch & npm run test:backend:watch",
    "test:frontend:watch": "cd frontend && npm run test:watch",
    "test:backend:watch": "cd backend && npm run test:watch",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint",
    "lint:fix": "npm run lint:frontend:fix && npm run lint:backend:fix",
    "lint:frontend:fix": "cd frontend && npm run lint:fix",
    "lint:backend:fix": "cd backend && npm run lint:fix",
    "clean": "npm run clean:frontend && npm run clean:backend",
    "clean:frontend": "cd frontend && rm -rf dist node_modules/.vite",
    "clean:backend": "cd backend && rm -rf dist node_modules/.cache",
    "db:reset": "cd backend && npm run db:reset",
    "db:migrate": "cd backend && npm run db:migrate",
    "db:seed": "cd backend && npm run db:seed"
  }
}
```

### 프론트엔드 스크립트

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### 백엔드 스크립트

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext .ts --fix",
    "type-check": "tsc --noEmit",
    "db:init": "ts-node scripts/init-db.ts",
    "db:reset": "ts-node scripts/reset-db.ts",
    "db:migrate": "ts-node scripts/migrate.ts",
    "db:seed": "ts-node scripts/seed.ts"
  }
}
```

## 개발 워크플로우

### 1. 개발 서버 시작

```bash
# 전체 개발 환경 시작 (프론트엔드 + 백엔드)
npm run dev

# 또는 개별적으로 시작
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### 2. 코드 품질 관리

```bash
# 린팅 실행
npm run lint

# 린팅 자동 수정
npm run lint:fix

# 타입 체크
npm run type-check
```

### 3. 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

## VS Code 설정

### 권장 확장 프로그램

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-jest",
    "ms-vscode.vscode-npm-scripts",
    "ms-vscode.vscode-git-graph"
  ]
}
```

### VS Code 설정 (.vscode/settings.json)

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "jest.jestCommandLine": "npm run test",
  "jest.autoRun": "watch"
}
```

### VS Code 작업 설정 (.vscode/tasks.json)

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "npm run test",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Lint and Fix",
      "type": "shell",
      "command": "npm run lint:fix",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

## 디버깅 설정

### VS Code 디버그 설정 (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src",
      "sourceMaps": true
    },
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "cwd": "${workspaceFolder}/backend",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 데이터베이스 관리

### LowDB 초기화 스크립트

```typescript
// backend/scripts/init-db.ts
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';

const initDatabase = async () => {
  const file = join(process.cwd(), 'data', 'db.json');
  const adapter = new JSONFile(file);
  const db = new Low(adapter, {
    users: [],
    refreshTokens: [],
    passwordResetTokens: [],
    emailVerificationTokens: [],
    metadata: {
      version: '1.0.0',
      lastMigration: new Date().toISOString(),
    },
  });

  await db.read();
  await db.write();

  console.log('Database initialized successfully');
};

initDatabase().catch(console.error);
```

### 데이터 시딩 스크립트

```typescript
// backend/scripts/seed.ts
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const seedDatabase = async () => {
  const file = join(process.cwd(), 'data', 'db.json');
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();

  // 테스트 사용자 생성
  const testUser = {
    id: uuidv4(),
    email: 'test@example.com',
    passwordHash: await bcrypt.hash('Test123!', 12),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    emailVerified: true,
    profile: {
      name: 'Test User',
      preferences: {
        theme: 'system',
        language: 'ko',
        notifications: {
          email: true,
          push: true,
        },
      },
    },
    security: {
      failedLoginAttempts: 0,
      twoFactorEnabled: false,
    },
  };

  db.data.users.push(testUser);
  await db.write();

  console.log('Database seeded successfully');
};

seedDatabase().catch(console.error);
```

## API 테스트

### Postman 컬렉션

```json
{
  "info": {
    "name": "ChatZPT Auth API",
    "description": "사용자 인증 API 테스트 컬렉션"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001/api"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\",\n  \"confirmPassword\": \"Test123!\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "login"]
        }
      }
    }
  ]
}
```

## 트러블슈팅

### 일반적인 문제 해결

#### 1. 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 프로세스 종료
taskkill /PID <PID> /F
```

#### 2. 의존성 설치 실패

```bash
# 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript 컴파일 오류

```bash
# 타입 체크 실행
npm run type-check

# tsconfig.json 확인
# 필요한 타입 정의 설치
npm install --save-dev @types/node @types/express
```

#### 4. 데이터베이스 연결 오류

```bash
# 데이터 디렉토리 확인
ls -la backend/data/

# 데이터베이스 재초기화
npm run db:reset
npm run db:init
npm run db:seed
```

### 로그 확인

```bash
# 백엔드 로그 확인
tail -f backend/logs/app.log

# 프론트엔드 개발 서버 로그
# 브라우저 개발자 도구 Console 탭 확인
```

## 성능 최적화 팁

### 1. 개발 환경 최적화

- Vite의 HMR(Hot Module Replacement) 활용
- TypeScript 증분 컴파일 사용
- ESLint 캐싱 활성화

### 2. 빌드 최적화

- 코드 스플리팅 설정
- Tree shaking 활성화
- 이미지 최적화

### 3. 데이터베이스 최적화

- LowDB 인덱싱 활용
- 불필요한 데이터 정리
- 백업 전략 수립

이 가이드를 따라하면 ChatZPT 프로젝트의 개발 환경을 성공적으로 설정할 수 있습니다.
