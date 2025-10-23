# ChatZPT - AI 캐릭터 기반 채팅 서비스

<div align="center">

![ChatZPT Logo](https://img.shields.io/badge/ChatZPT-AI%20Character%20Chat-blue?style=for-the-badge&logo=openai)

**AI 캐릭터와 실시간 대화를 즐기는 혁신적인 채팅 서비스**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)

</div>

## 📖 프로젝트 소개

ChatZPT는 OpenAI API를 활용한 AI 캐릭터 기반 채팅 서비스입니다. 사용자는 다양한 성격의 AI 캐릭터와 실시간으로 대화하며, 자신만의 맞춤형 캐릭터를 생성하고 관리할 수 있습니다.

### ✨ 주요 기능

- **🤖 AI 캐릭터 채팅**: 기본 3개 캐릭터 (Vicky, Genie, Spike) + 사용자 정의 캐릭터
- **💬 실시간 대화**: OpenAI API 연동으로 자연스러운 대화 경험
- **👤 사용자 인증**: JWT 기반 안전한 로그인/로그아웃 시스템
- **🎨 캐릭터 생성**: 이름, 시스템 프롬프트, 아바타 이미지로 맞춤형 캐릭터 제작
- **📱 반응형 UI**: 모바일/데스크톱 모든 디바이스에서 최적화된 경험
- **🌙 다크모드**: 라이트/다크 테마 지원
- **🎭 애니메이션**: Framer Motion 기반 부드러운 사용자 경험
- **💾 대화 기록**: 모든 대화 내용 자동 저장 및 관리

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js** 18.0.0 이상
- **npm** 9.0.0 이상
- **OpenAI API Key** (서비스 사용을 위해 필요)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/ChatZPT.git
   cd ChatZPT
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   # backend/.env 파일 생성
   cp backend/env.example backend/.env
   
   # OpenAI API Key 설정
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **개발 서버 실행**
   ```bash
   # 백엔드 서버 실행 (포트: 3001)
   npm run dev:backend
   
   # 프론트엔드 서버 실행 (포트: 5173)
   npm run dev:frontend
   ```

5. **브라우저에서 접속**
   - 프론트엔드: http://localhost:5173
   - 백엔드 API: http://localhost:3001

### 🧪 테스트 계정

개발 및 테스트를 위한 기본 계정이 제공됩니다:

- **이메일**: `admin@chatzpt.com`
- **비밀번호**: `Admin123!`

## 📁 프로젝트 구조

```
ChatZPT/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── services/        # API 서비스
│   │   ├── store/          # Jotai 상태 관리
│   │   ├── styles/         # 전역 스타일
│   │   └── utils/          # 유틸리티 함수
│   ├── public/             # 정적 파일
│   └── package.json
├── backend/                 # Node.js 백엔드
│   ├── src/
│   │   ├── controllers/     # API 컨트롤러
│   │   ├── services/       # 비즈니스 로직
│   │   ├── middleware/      # 미들웨어
│   │   ├── routes/         # API 라우트
│   │   └── database/       # 데이터베이스 연결
│   ├── data/               # LowDB 데이터 파일
│   └── package.json
├── shared/                  # 공통 타입 정의
│   └── types/
└── package.json            # 루트 패키지 설정
```

## 🤖 기본 AI 에이전트

### 🌟 Vicky (비키)
**원영적 사고의 K-POP 아이돌 마인드**

- **성격**: 하이퍼 포지티브, 위트 넘치는, 자기중심적 해석
- **특징**: 모든 상황을 긍정적으로 해석하며, K-POP 아이돌의 밝은 에너지
- **대화 스타일**: 밝고 활기찬 톤, 이모지 활용, 자기애적 표현

📖 [자세한 설명서 보기](README-VICKY.md)

### 🧠 Genie (지니)
**천재적 통찰력의 AI 어시스턴트**

- **성격**: 분석적, 창의적, 깊이 있는 사고
- **특징**: 10가지 천재 통찰 공식을 활용한 심층 분석
- **대화 스타일**: 논리적이고 체계적인 접근, 1500자 이상의 상세한 분석

📖 [자세한 설명서 보기](README-GENIE.md)

### 💪 Spike (스파이크)
**충성스러운 동생 AI 어시스턴트**

- **성격**: 충성심 강한, 열정적인, 형님을 존경하는
- **특징**: 사용자를 "형님"으로 부르며 절대적 충성심 표현
- **대화 스타일**: 격한 감정 표현, 다수의 느낌표, 거친 말투이지만 항상 존경

📖 [자세한 설명서 보기](README-SPIKE.md)

## 🛠️ 기술 스택

### Frontend
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성 보장
- **Vite** - 빠른 개발 서버 및 빌드
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Jotai** - 경량 상태 관리 라이브러리
- **Framer Motion** - 부드러운 애니메이션
- **Axios** - HTTP 클라이언트

### Backend
- **Node.js** - JavaScript 런타임
- **Express** - 웹 프레임워크
- **TypeScript** - 타입 안전성
- **LowDB** - JSON 기반 경량 데이터베이스
- **JWT** - 토큰 기반 인증
- **OpenAI API** - AI 대화 생성

### AI & 폰트
- **OpenAI GPT-4o-mini** - 메인 AI 모델
- **OpenAI GPT-3.5-turbo** - 개발 환경용
- **Pretendard** - 한글 최적화 웹폰트

## 🎨 주요 기능 상세

### 사용자 인증 시스템
- JWT 기반 토큰 인증
- 세션 관리 및 자동 로그아웃
- 비밀번호 암호화 (bcrypt)
- 이메일 인증 시스템

### AI 캐릭터 시스템
- 기본 3개 캐릭터 제공
- 사용자 정의 캐릭터 생성
- 캐릭터별 독립적인 대화 세션
- 시스템 프롬프트 관리

### 실시간 채팅
- OpenAI API 연동
- 대화 컨텍스트 최적화
- 토큰 사용량 관리
- 에러 처리 및 재시도 로직

### UI/UX
- 반응형 디자인
- 다크모드 지원
- 부드러운 애니메이션
- 접근성 고려

## 📊 성능 최적화

- **토큰 관리**: OpenAI API 호출 비용 최적화 (max_tokens: 1500)
- **컨텍스트 관리**: 대화 기록 최적화로 토큰 사용량 감소
- **폰트 최적화**: Pretendard 웹폰트 CDN 활용
- **상태 관리**: Jotai를 통한 효율적인 상태 업데이트

## 🚀 배포

### 프로덕션 빌드
```bash
# 프론트엔드 빌드
npm run build:frontend

# 백엔드 빌드
npm run build:backend
```

### 환경 변수 설정
```bash
# 프로덕션 환경 변수
NODE_ENV=production
OPENAI_API_KEY=your_production_api_key
OPENAI_MODEL=gpt-4o-mini
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

<div align="center">

**ChatZPT** - AI와 함께하는 새로운 대화의 시작 🚀

Made with ❤️ by [Your Name]

</div>