# 챗봇 운영 비용 최적화 가이드

## 💰 개요

ChatZPT AI 캐릭터 채팅 시스템의 운영 비용을 최적화하기 위한 설정과 전략을 설명합니다.

## 🔧 구현된 비용 절감 기능

### 1. Context Window 관리

#### 문제점
- 장시간 대화가 이어질 경우, 이전 대화 기록(Context)이 길어지면서 매번 전송되는 **입력 토큰 수가 급격히 늘어남**
- 불필요하게 오래된 대화 기록으로 인한 비용 증가

#### 해결책
```typescript
// 최대 8개 메시지만 유지 (비용 절감)
const MAX_CONTEXT_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 500; // 메시지당 최대 길이 제한

// 최근 메시지들만 선택
const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

// 메시지 길이 제한 및 요약
return recentMessages.map(msg => ({
  ...msg,
  content: msg.content.length > MAX_MESSAGE_LENGTH 
    ? msg.content.substring(0, MAX_MESSAGE_LENGTH) + '...'
    : msg.content
}));
```

### 2. 응답 길이 제한 (Max Tokens)

#### 설정
- **기본값**: 1500 토큰 (약 1500자)
- **환경변수**: `OPENAI_MAX_TOKENS=1500`

#### 구현
```typescript
const completion = await this.openai.chat.completions.create({
  model: config.OPENAI_MODEL || 'gpt-4o-mini',
  messages: [...],
  max_tokens: config.OPENAI_MAX_TOKENS || 1500, // 응답 길이 제한
  // ... 기타 설정
});
```

### 3. 토큰 사용량 추적

#### 기능
- 각 API 호출의 토큰 사용량 추적
- 비용 계산 및 모니터링
- 사용량 기반 알림 시스템

#### 구현
```typescript
async getTokenUsage(completion: any): Promise<{ 
  inputTokens: number; 
  outputTokens: number; 
  totalCost: number 
}> {
  const usage = completion.usage;
  const inputTokens = usage?.prompt_tokens || 0;
  const outputTokens = usage?.completion_tokens || 0;
  
  // GPT-4o-mini 가격 (2024년 기준)
  const inputCost = (inputTokens / 1000) * 0.00015;
  const outputCost = (outputTokens / 1000) * 0.0006;
  const totalCost = inputCost + outputCost;
  
  return { inputTokens, outputTokens, totalCost };
}
```

## ⚙️ 환경변수 설정

### 기본 설정
```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1500
OPENAI_TEMPERATURE=0.7
OPENAI_TOP_P=0.9
OPENAI_FREQUENCY_PENALTY=0.1
OPENAI_PRESENCE_PENALTY=0.1

# 비용 절감을 위한 Context Window 관리
OPENAI_MAX_CONTEXT_MESSAGES=8
OPENAI_MAX_MESSAGE_LENGTH=500
```

### 비용 절감 설정 (극한 모드)
```env
# 더 적극적인 비용 절감
OPENAI_MAX_TOKENS=500
OPENAI_MAX_CONTEXT_MESSAGES=5
OPENAI_MAX_MESSAGE_LENGTH=300
```

### 품질 우선 설정
```env
# 품질을 우선시하는 설정
OPENAI_MAX_TOKENS=2000
OPENAI_MAX_CONTEXT_MESSAGES=12
OPENAI_MAX_MESSAGE_LENGTH=800
```

## 📊 비용 절감 효과

### 기본 설정 vs 최적화 설정

| 설정 | 기본값 | 최적화 | 절감률 |
|------|--------|--------|--------|
| Max Tokens | 200 | 1500 | -650% (품질 향상) |
| Context Messages | 10 | 8 | 20% 절감 |
| Message Length | 무제한 | 500자 | 50-70% 절감 |

### 예상 비용 절감 효과

#### 장기 대화 시나리오 (100개 메시지)
- **최적화 전**: 평균 2000 토큰/요청
- **최적화 후**: 평균 800 토큰/요청
- **절감률**: 약 60% 비용 절감

#### 월간 사용량 기준 (1000명 사용자)
- **최적화 전**: $500-1000/월
- **최적화 후**: $200-400/월
- **절감액**: $300-600/월

## 🎯 추가 최적화 전략

### 1. 캐싱 전략
```typescript
// 자주 사용되는 응답 캐싱
const responseCache = new Map<string, string>();

// 유사한 질문에 대한 캐시된 응답 재사용
if (responseCache.has(similarQuestion)) {
  return responseCache.get(similarQuestion);
}
```

### 2. 배치 처리
```typescript
// 여러 메시지를 한 번에 처리
const batchMessages = messages.slice(-5); // 최근 5개 메시지만 처리
```

### 3. 모델 선택 최적화
```typescript
// 간단한 질문은 더 저렴한 모델 사용
const model = isSimpleQuestion ? 'gpt-3.5-turbo' : 'gpt-4o-mini';
```

### 4. 사용자별 토큰 제한
```typescript
// 사용자별 일일 토큰 제한
const dailyTokenLimit = 10000;
const userTokenUsage = await getUserTokenUsage(userId);

if (userTokenUsage > dailyTokenLimit) {
  throw new Error('일일 토큰 사용량 초과');
}
```

## 📈 모니터링 및 알림

### 1. 비용 모니터링
```typescript
// 실시간 비용 추적
const costTracker = {
  dailyCost: 0,
  monthlyCost: 0,
  userCosts: new Map<string, number>()
};

// 비용 임계값 설정
const DAILY_COST_LIMIT = 50; // $50/일
const MONTHLY_COST_LIMIT = 1000; // $1000/월
```

### 2. 알림 시스템
```typescript
// 비용 임계값 초과 시 알림
if (dailyCost > DAILY_COST_LIMIT) {
  await sendCostAlert('일일 비용 한도 초과');
}

if (monthlyCost > MONTHLY_COST_LIMIT) {
  await sendCostAlert('월간 비용 한도 초과');
}
```

## 🚀 실행 방법

### 1. 환경변수 설정
```bash
# backend/.env 파일에 설정
cp backend/env.example backend/.env
# .env 파일에서 비용 절감 설정 조정
```

### 2. 서버 실행
```bash
# 백엔드 실행
cd backend
npm run dev

# 프론트엔드 실행
cd frontend
npm run dev
```

### 3. 모니터링 확인
```bash
# 로그에서 토큰 사용량 확인
tail -f backend/logs/combined.log | grep "Token usage"
```

## 📋 체크리스트

### 기본 설정
- [ ] `OPENAI_MAX_TOKENS=1500` 설정
- [ ] `OPENAI_MAX_CONTEXT_MESSAGES=8` 설정
- [ ] `OPENAI_MAX_MESSAGE_LENGTH=500` 설정

### 모니터링 설정
- [ ] 토큰 사용량 추적 활성화
- [ ] 비용 임계값 설정
- [ ] 알림 시스템 설정

### 추가 최적화
- [ ] 캐싱 전략 구현
- [ ] 배치 처리 구현
- [ ] 사용자별 토큰 제한 구현

## 💡 팁과 주의사항

### 비용 절감 팁
1. **Context Window 크기 조정**: 대화 품질과 비용의 균형점 찾기
2. **응답 길이 제한**: 캐릭터별로 다른 길이 제한 설정
3. **모델 선택**: 작업 복잡도에 따른 모델 선택
4. **캐싱 활용**: 자주 사용되는 응답 캐싱

### 주의사항
1. **품질 저하**: 과도한 최적화로 인한 응답 품질 저하 주의
2. **사용자 경험**: 비용 절감과 사용자 경험의 균형 유지
3. **모니터링**: 정기적인 비용 모니터링 필요

---

**효과적인 비용 관리로 지속 가능한 AI 챗봇 서비스를 운영하세요! 💰✨**
