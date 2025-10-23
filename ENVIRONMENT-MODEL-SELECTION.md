# 환경별 OpenAI 모델 선택 가이드

## 🎯 개요

ChatZPT AI 캐릭터 채팅 시스템에서 환경에 따라 다른 OpenAI 모델을 자동으로 선택하는 기능을 설명합니다.

## 🔧 구현된 기능

### 환경별 모델 선택

| 환경 | 모델 | 이유 |
|------|------|------|
| **개발 환경** | `gpt-3.5-turbo` | 비용 절감, 빠른 응답 |
| **프로덕션 환경** | `gpt-4o-mini` | 높은 품질, 안정성 |

### 자동 선택 로직

```typescript
private getModelForEnvironment(): string {
  // 환경변수로 명시적으로 설정된 경우 우선 사용
  if (config.OPENAI_MODEL) {
    return config.OPENAI_MODEL;
  }
  
  // 환경에 따른 기본 모델 선택
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'gpt-4o-mini' : 'gpt-3.5-turbo';
}
```

## ⚙️ 설정 방법

### 1. 자동 선택 (권장)

환경변수를 설정하지 않으면 자동으로 환경에 따라 모델이 선택됩니다.

```bash
# 개발 환경
NODE_ENV=development  # gpt-3.5-turbo 사용

# 프로덕션 환경
NODE_ENV=production   # gpt-4o-mini 사용
```

### 2. 수동 설정

특정 모델을 강제로 사용하고 싶은 경우:

```env
# .env 파일에서 수동 설정
OPENAI_MODEL=gpt-4o-mini  # 항상 gpt-4o-mini 사용
```

### 3. 환경변수 우선순위

1. **환경변수 설정** (`OPENAI_MODEL`) - 최우선
2. **자동 선택** (환경에 따른 기본값)

## 📊 모델 비교

### GPT-3.5-turbo (개발 환경)
- **장점**: 빠른 응답, 저렴한 비용
- **단점**: 상대적으로 낮은 품질
- **용도**: 개발, 테스트, 프로토타이핑

### GPT-4o-mini (프로덕션 환경)
- **장점**: 높은 품질, 안정성
- **단점**: 상대적으로 높은 비용
- **용도**: 실제 서비스, 사용자 대면

## 💰 비용 비교

### 토큰당 가격 (2024년 기준)

| 모델 | 입력 토큰 | 출력 토큰 |
|------|-----------|-----------|
| GPT-3.5-turbo | $0.0005/1K | $0.0015/1K |
| GPT-4o-mini | $0.00015/1K | $0.0006/1K |

### 월간 비용 예상 (1000명 사용자)

| 환경 | 모델 | 예상 비용 |
|------|------|-----------|
| 개발 | GPT-3.5-turbo | $50-100 |
| 프로덕션 | GPT-4o-mini | $200-400 |

## 🚀 사용 방법

### 1. 개발 환경 설정

```bash
# 개발 환경에서 실행
NODE_ENV=development npm run dev
# 자동으로 gpt-3.5-turbo 사용
```

### 2. 프로덕션 환경 설정

```bash
# 프로덕션 환경에서 실행
NODE_ENV=production npm start
# 자동으로 gpt-4o-mini 사용
```

### 3. 환경변수 확인

```bash
# 현재 환경 확인
echo $NODE_ENV

# 사용 중인 모델 확인 (로그에서)
tail -f backend/logs/combined.log | grep "Using OpenAI model"
```

## 🔍 모니터링

### 로그 확인

```bash
# 모델 사용 로그 확인
tail -f backend/logs/combined.log | grep "Using OpenAI model"

# 예시 출력:
# Using OpenAI model: gpt-3.5-turbo (Environment: development)
# Using OpenAI model: gpt-4o-mini (Environment: production)
```

### 환경별 설정 확인

```typescript
// 서버 시작 시 환경 정보 출력
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Selected Model: ${config.OPENAI_MODEL}`);
```

## 📋 설정 체크리스트

### 기본 설정
- [ ] `NODE_ENV` 환경변수 설정
- [ ] 자동 모델 선택 확인
- [ ] 로그에서 모델 사용 확인

### 수동 설정 (필요시)
- [ ] `OPENAI_MODEL` 환경변수 설정
- [ ] 설정값 검증
- [ ] 비용 모니터링

### 프로덕션 배포
- [ ] `NODE_ENV=production` 설정
- [ ] gpt-4o-mini 모델 사용 확인
- [ ] 성능 모니터링

## 💡 팁과 주의사항

### 개발 환경 팁
1. **빠른 테스트**: gpt-3.5-turbo로 빠른 개발
2. **비용 절감**: 개발 중 비용 최소화
3. **반복 테스트**: 저렴한 모델로 반복 테스트

### 프로덕션 환경 팁
1. **품질 우선**: gpt-4o-mini로 높은 품질 보장
2. **안정성**: 검증된 모델 사용
3. **사용자 경험**: 일관된 고품질 응답

### 주의사항
1. **환경변수 확인**: 배포 시 `NODE_ENV` 설정 확인
2. **비용 모니터링**: 프로덕션 환경 비용 추적
3. **성능 테스트**: 환경별 성능 차이 확인

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. 잘못된 모델 사용
```bash
# 환경변수 확인
echo $NODE_ENV
echo $OPENAI_MODEL

# 서버 재시작
npm run dev
```

#### 2. 모델 변경이 적용되지 않음
```bash
# 환경변수 재설정
export NODE_ENV=production
export OPENAI_MODEL=gpt-4o-mini

# 서버 재시작
npm run dev
```

#### 3. 비용 초과
```bash
# 개발 환경으로 전환
export NODE_ENV=development
# 또는 저렴한 모델로 수동 설정
export OPENAI_MODEL=gpt-3.5-turbo
```

---

**환경별 최적화로 효율적인 AI 챗봇 서비스를 운영하세요! 🚀✨**
