# maestro-practice

YAML 기반 모바일 UI 테스트 자동화 도구인 [Maestro](https://maestro.dev)를 직접 설치하고, Android 에뮬레이터에서 flow를 작성·실행해 보는 학습 프로젝트입니다.

> 처음에는 실제 서비스 앱(지그재그)을 대상으로 하려 했으나, 해당 앱이 보안 정책상 에뮬레이터 실행을 차단하고 있어 Maestro 공식 샘플 앱(위키피디아)으로 전환했습니다. 자세한 내용은 [troubleshooting 5번](docs/troubleshooting.md)을 참고하세요.

## 목적

- YAML 기반 모바일 UI 자동화 flow를 직접 작성하고 실행해 보며 동작 방식과 한계를 이해한다.
- 코드 기반 자동화(Playwright)와 YAML 기반 자동화의 차이를 비교해 본다.
- 환경 구성부터 트러블슈팅까지의 과정을 기록해, 이후 실무에서 같은 환경을 빠르게 재현할 수 있게 한다.

## 테스트 범위와 원칙

- 실제 운영 중인 서비스 앱을 대상으로 할 때는 **조회 흐름(앱 실행, 검색, 탐색)만** 자동화한다.
- 주문·결제·리뷰 작성 등 서비스나 다른 사용자에게 영향을 줄 수 있는 동작은 자동화하지 않는다.
- 보안 정책(에뮬레이터 차단 등)은 우회하지 않는다.

## 환경

| 항목 | 내용 |
|---|---|
| OS | macOS (Apple Silicon) |
| Java | Temurin 17.0.21 |
| Android Studio | Rabbit 2 (2026.2.2) |
| 에뮬레이터 | Pixel 10 Pro, Google Play 포함 시스템 이미지 (arm64-v8a) |
| Maestro CLI | (설치 버전 기입) |
| 에디터 | VS Code |

## 폴더 구조

```
maestro-practice/
├── flows/                 # Maestro flow 파일 (YAML)
├── docs/
│   ├── setup-guide.md     # 환경 구성 가이드 (처음부터 재현용)
│   └── troubleshooting.md # 설치 중 겪은 문제와 해결 기록
├── .gitignore
└── README.md
```

## 빠른 실행

사전 준비가 끝난 상태(설치 방법은 [setup-guide](docs/setup-guide.md) 참고)에서:

```bash
# 1. 에뮬레이터 실행 후 연결 확인
adb devices

# 2. flow 실행
maestro test flows/<flow 파일명>.yaml
```

## 진행 상황

- [x] Java 17, Android Studio, 에뮬레이터 환경 구성
- [x] 에뮬레이터에 대상 앱 설치 및 adb 연결 확인
- [x] Maestro CLI 설치
- [x] 지그재그 앱 에뮬레이터 실행 차단 확인 → 공식 샘플(위키피디아)로 전환
- [x] 샘플 flow(`android-flow.yaml`, 앱 실행) 실행 성공으로 환경 검증
- [ ] 샘플 advanced flow 분석
- [ ] 첫 flow 직접 작성 및 실행
- [ ] 실행 결과와 배운 점 정리

## 배운 점

flow 작성 후 정리 예정.
