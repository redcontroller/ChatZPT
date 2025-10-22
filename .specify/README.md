# Spec Kit Integration for ChatZPT

이 프로젝트는 GitHub Spec Kit을 사용하여 스펙 주도 개발을 진행합니다.

## 사용 가능한 Slash Commands

Cursor에서 다음 명령어들을 사용할 수 있습니다:

### 핵심 명령어

- `/speckit.constitution` - 프로젝트의 지배 원칙과 개발 가이드라인 생성/업데이트
- `/speckit.specify` - 구축하고자 하는 것 정의 (요구사항 및 사용자 스토리)
- `/speckit.plan` - 선택한 기술 스택으로 기술적 구현 계획 생성
- `/speckit.tasks` - 구현을 위한 실행 가능한 작업 목록 생성
- `/speckit.implement` - 계획에 따라 기능을 구축하기 위해 모든 작업 실행

### 선택적 명령어

- `/speckit.clarify` - 명세가 부족한 영역 명확화 (speckit.plan 전에 권장)
- `/speckit.analyze` - 아티팩트 간 일관성 및 커버리지 분석
- `/speckit.checklist` - 요구사항 완성도, 명확성, 일관성을 검증하는 맞춤형 품질 체크리스트 생성

## 워크플로우

1. **Constitution 설정**: `/speckit.constitution`으로 프로젝트 원칙 설정
2. **요구사항 정의**: `/speckit.specify`로 구축할 것 정의
3. **명세 명확화**: `/speckit.clarify`로 부족한 부분 보완 (선택사항)
4. **기술 계획**: `/speckit.plan`으로 기술 스택과 아키텍처 계획
5. **작업 분해**: `/speckit.tasks`로 실행 가능한 작업 목록 생성
6. **분석**: `/speckit.analyze`로 일관성 검증 (선택사항)
7. **구현**: `/speckit.implement`로 실제 구현 진행

## 파일 구조

```
.specify/
├── memory/
│   └── constitution.md          # 프로젝트 지배 원칙
├── specs/                       # 기능별 스펙 디렉토리
├── templates/                   # 템플릿 파일들
├── scripts/                     # PowerShell 스크립트들
└── cursor-settings.json         # Cursor 연동 설정
```
