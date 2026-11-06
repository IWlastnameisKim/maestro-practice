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
- [x] 샘플 advanced flow 및 subflow 분석
- [x] 첫 flow 작성: 온보딩 subflow를 다국어 대응·홈 탭 도착 검증으로 수정 ([flows/subflows/onboarding-android.yaml](flows/subflows/onboarding-android.yaml))
- [ ] 검색 flow 작성

## 작성한 flow

| flow | 내용 | 검증 기준 |
|---|---|---|
| `onboarding-android.yaml` | 앱 데이터 초기화 후 온보딩 4단계 통과 | 하단 GNB 홈 탭이 선택된 상태(`id` + `selected: true`) |

## 배운 점

자세한 과정은 [troubleshooting 7~9번](docs/troubleshooting.md)에 기록했습니다.

- **셀렉터는 언어에 의존하지 않게.** 텍스트 셀렉터는 기기 언어가 바뀌면 깨진다. 우선순위는 id > 다국어 정규식(`"Forward|앞으로"`) > 단일 언어 텍스트 > 좌표.
- **id가 없다면 testability 문제다.** 연습에서는 정규식으로 우회했지만, 실무라면 개발팀에 테스트용 id 추가를 요청하는 것이 근본 해결이다.
- **hierarchy는 "그 순간의 화면"만 보여준다.** 요소를 못 찾으면, 그 스텝이 실행되는 시점의 화면에서 다시 확인한다.
- **`optional`로 실패를 덮지 않는다.** optional은 팝업처럼 "있을 수도 없을 수도 있는" 요소에만 쓴다.
- **변하는 콘텐츠가 아니라 변하지 않는 구조로 검증한다.** 피드 문구 대신 GNB의 id와 선택 상태로 "홈 도착"을 확인했다.
- **확인 스텝은 fail도 확인한다.** 일부러 틀린 조건을 넣어 fail이 나는지 봐야, 그 스텝이 실제로 무언가를 잡아낼 수 있다는 걸 알 수 있다.
- **웹 자동화 경험이 그대로 통한다.** 모바일 UI hierarchy도 웹 DOM과 같은 트리 구조라, Playwright에서 셀렉터를 잡던 방식이 그대로 적용됐다.
