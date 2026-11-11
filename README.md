# maestro-practice

YAML 기반 모바일 UI 테스트 자동화 도구인 [Maestro](https://maestro.dev)를 직접 설치하고, Android 에뮬레이터에서 flow를 작성·실행해 보는 학습 프로젝트입니다.

> 처음에는 실제 서비스 앱(지그재그)을 대상으로 하려 했으나, 해당 앱이 보안 정책상 에뮬레이터 실행을 차단하고 있어 Maestro 공식 샘플 앱(위키피디아)으로 전환했습니다. 자세한 내용은 [troubleshooting 5번](docs/troubleshooting.md)을 참고하세요.

## 목적

- YAML 기반 모바일 UI 자동화 flow를 직접 작성하고 실행해 보며 동작 방식과 한계를 이해한다.
- 코드 기반 자동화(Playwright)와 YAML 기반 자동화의 차이를 비교해 본다.
- 환경 구성부터 트러블슈팅까지의 과정을 기록해, 이후 실무에서 같은 환경을 빠르게 재현할 수 있게 한다.
- 스위트(sanity / regression) 구성과 GitHub Actions CI까지 실무에 가까운 형태로 운영해 본다.

## 테스트 범위와 원칙

- 대상 앱(위키백과)은 실제 운영 중인 서비스다. **기기 안에서 끝나는 동작(조회, 검색, 기사 저장)만** 자동화한다.
- 문서 편집·토론 작성, 로그인·계정 생성, 신고 등 서비스나 다른 사용자에게 영향을 줄 수 있는 동작은 자동화하지 않는다.
- 테스트가 만든 데이터(저장한 기사 등)는 flow 마지막에 삭제하고, 삭제됐는지 확인한다.
- 보안 정책(에뮬레이터 차단 등)은 우회하지 않는다.

## 환경

| 항목 | 내용 |
|---|---|
| OS | macOS (Apple Silicon) |
| Java | Temurin 17.0.21 |
| Android Studio | Rabbit 2 (2026.2.2) |
| 에뮬레이터 | Pixel 10 Pro, Google Play 포함 시스템 이미지 (API 37, arm64-v8a), 언어 한국어 |
| 대상 앱 | 위키피디아 `org.wikipedia` r/50606-r-2026-09-09 (버전 고정, [ci/app-versions.json](ci/app-versions.json)) |
| Maestro CLI | 2.12.1 |
| Node.js | 실행 명령(npm 스크립트)과 태깅 규칙 검사용 |
| 에디터 | VS Code |

## 폴더 구조

기능별 폴더 + 스위트 태그 혼합 방식입니다. **폴더는 기능을, 태그는 스위트를 나타냅니다.**

```
maestro-practice/
├── flows/
│   ├── config.yaml              # 하위 폴더까지 탐색 (flows: ["**"])
│   ├── saved/                   # 기능별 테스트 본체 (태그로 스위트 지정)
│   │   └── article-save.yaml
│   ├── subflows/                # 초기 조건 세팅용 재사용 flow (단독 실행 안 함)
│   └── scripts/                 # runScript로 호출하는 JS (예: escape-regex.js)
├── tools/suites.mjs             # 스위트 구성 표 출력 / 태깅 규칙 검사
├── ci/app-versions.json         # CI에서 테스트할 앱 버전 목록 (APK URL + sha256)
├── .github/workflows/maestro.yml
├── docs/
│   ├── setup-guide.md           # 환경 구성 가이드 (처음부터 재현용)
│   ├── troubleshooting.md       # 겪은 문제와 해결 기록
│   ├── ci-workflow.md           # CI workflow 해설 (버전 고정, job 간 값 전달, 문법 검사 명령)
│   └── ai-review.md             # AI 작성 flow 리뷰 기록 / testability·앱 결함 후보
├── CLAUDE.md                    # AI 협업 규칙 (셀렉터·검증·태깅 규칙)
├── package.json                 # 스위트별 실행 명령
└── README.md
```

## 빠른 실행

사전 준비가 끝난 상태(설치 방법은 [setup-guide](docs/setup-guide.md) 참고)에서:

```bash
# 1. 에뮬레이터 실행 후 연결 확인
adb devices

# 2. 스위트 실행 (리포트: report/<스위트>.xml)
npm run test:sanity
npm run test:regression

# 특정 태그만 실행
npm run test:tag -- saved

# 스위트 구성 확인 / 태깅 규칙 검사
npm run list:suites
npm run check:suites
```

> 태그 없이 `maestro test flows`를 실행하면 subflows까지 단독 실행되므로 쓰지 않습니다.

## 태깅 규칙

| 태그 | 의미 |
|---|---|
| `sanity`, `regression` | 스위트. 최소 1개 필수. sanity면 regression도 함께 (sanity ⊂ regression) |
| `android` | 플랫폼. 필수 |
| `saved`, `search` … | 기능. 선택 |

스위트 편입·제외는 파일을 옮기지 않고 태그만 바꿉니다. 규칙은 `npm run check:suites`와 CI에서 검사합니다.

## CI (GitHub Actions)

| 시점 | 스위트 |
|---|---|
| PR | sanity |
| 수동 실행 (Actions 탭 → Run workflow) | 스위트(sanity / regression)·앱 버전 선택 |

> 혼자 쓰는 학습용 저장소라 정기 실행(schedule)은 두지 않았습니다.

태깅 규칙 검사 → 전체 YAML 문법 검사 → `ci/app-versions.json`의 **앱 버전마다** 에뮬레이터를 띄워 병렬 실행합니다. APK는 커밋하지 않고 이 저장소의 GitHub Release(`app-<id>` 태그)에 올린 뒤 sha256으로 검증합니다.

| 항목 | 내용 |
|---|---|
| CI 에뮬레이터 | API 34, x86_64, `google_apis`, `pixel_6` (1080×2400), **언어 영어** (로컬은 한국어 → 텍스트 셀렉터는 영어·한국어 함께) |
| 테스트 전 안정화 | 부팅·패키지 매니저·런처 응답 대기, 시스템 오류·ANR 팝업 끄기 ([troubleshooting 11번](docs/troubleshooting.md)) |
| 결과물 (artifact) | `maestro-<스위트>-<버전 id>`: JUnit 리포트, 스텝별 상태(`commands.json`), 실패 스크린샷, `maestro.log`, logcat |

CI 결과는 이렇게 확인합니다.

1. **통과/실패**: `[Passed]` / `[Failed]` 줄과 JUnit 리포트. 로그의 `ERROR`·`WARNING` 대부분은 에뮬레이터·도구 메시지다 ([troubleshooting 12번](docs/troubleshooting.md)).
2. **실제로 검증했는지**: artifact의 `commands.json`에서 `when` 블록이 `SKIPPED`가 아닌지 본다.
3. **실패 원인**: 실패 스크린샷 → `commands.json`(어느 스텝) → logcat(앱 화면 전환 기록) 순서로 좁힌다.

workflow 파일의 각 부분이 무엇을 하는지는 [docs/ci-workflow.md](docs/ci-workflow.md)에 풀어 두었습니다.

## 진행 상황

- [x] Java 17, Android Studio, 에뮬레이터 환경 구성
- [x] 에뮬레이터에 대상 앱 설치 및 adb 연결 확인
- [x] Maestro CLI 설치
- [x] 지그재그 앱 에뮬레이터 실행 차단 확인 → 공식 샘플(위키피디아)로 전환
- [x] 샘플 flow(`android-flow.yaml`, 앱 실행) 실행 성공으로 환경 검증
- [x] 샘플 advanced flow 및 subflow 분석
- [x] 첫 flow 작성: 온보딩 subflow를 다국어 대응·홈 탭 도착 검증으로 수정
- [x] 스위트 구조 설계 (기능 폴더 + 태그), 실행 명령·태깅 규칙 검사 도구 구성
- [x] 샘플 subflow를 다국어 대응으로 이관 (초기화, 검색 프로모션 닫기)
- [x] 기사 저장 flow 작성 및 sanity 스위트 실행 성공
- [x] GitHub Actions workflow 작성 (앱 버전 고정, 여러 버전 matrix 실행 구조)
- [x] 기사 제목 실행 로그 기록, 정규식 특수문자 이스케이프(`flows/scripts/escape-regex.js`)
- [x] 고정 버전 APK를 GitHub Release(`app-r50606`)에 업로드 → CI 첫 실행
- [x] CI 환경 실패("Pixel Launcher isn't responding" 팝업) 대응: 에뮬레이터 안정화 대기·팝업 억제
- [x] CI에서만 실패하던 저장 flow 수정(모음집 시트를 back으로 닫기) → **CI sanity 통과**
- [ ] 괄호가 있는 기사 제목으로 정규식 이스케이프 실기기 검증
- [ ] '새로 들어온 소식' 카드가 없는 날의 처리 방법 결정 (지금은 건너뛰고 pass)
- [ ] 검색 flow 작성

## 작성한 flow

| flow | 종류 | 내용 | 검증 기준 |
|---|---|---|---|
| `saved/article-save.yaml` | sanity, regression | '새로 들어온 소식' 기사 저장 → 저장됨 목록 확인 → 저장 해제 | 저장됨 탭에 읽어 둔 기사 제목이 있음 / 해제 후 사라짐 |
| `subflows/launch-to-home-android.yaml` | subflow | **공통 사전 조건.** 앱 초기화 → 온보딩 통과 → 메인 홈 | 홈 탭이 선택된 상태(`id` + `selected: true`) |
| `subflows/launch-clearstate-android.yaml` | subflow | 앱 데이터 초기화 후 실행 | 온보딩 첫 화면 문구(영어/한국어) |
| `subflows/dismiss-search-promo-android.yaml` | subflow | 검색 위젯 프로모션 바텀시트 닫기 (뜰 때만) | 닫힌 뒤 바텀시트 제목이 사라짐 |
| `scripts/escape-regex.js` | script | 읽어 온 텍스트를 셀렉터용 정규식으로 이스케이프하고 `maestro.log`에 기록 | - |

## 배운 점

자세한 과정은 [troubleshooting 7~12번](docs/troubleshooting.md)과 [ai-review](docs/ai-review.md)에 기록했습니다.

- **셀렉터는 언어에 의존하지 않게.** 텍스트 셀렉터는 기기 언어가 바뀌면 깨진다. 우선순위는 id > 다국어 정규식(`"Forward|앞으로"`) > 단일 언어 텍스트 > 좌표.
- **문구는 추측하지 않고 앱에서 확인한다.** 설치된 APK의 문자열 리소스(`aapt2 dump resources`)에서 영어 원문과 한국어 번역을 대조할 수 있다.
- **id가 없다면 testability 문제다.** 연습에서는 정규식으로 우회했지만, 실무라면 개발팀에 테스트용 id 추가를 요청하는 것이 근본 해결이다.
- **hierarchy는 "그 순간의 화면"만 보여준다.** 요소를 못 찾으면, 그 스텝이 실행되는 시점의 화면에서 다시 확인한다.
- **`optional`로 실패를 덮지 않는다.** optional은 팝업처럼 "있을 수도 없을 수도 있는" 요소에만 쓴다. 앱에 없는 문구(`"최근 들어온 소식"`)도 optional이 붙어 있으면 조용히 통과했다.
- **변하는 콘텐츠가 아니라 변하지 않는 구조로 검증한다.** 피드 문구 대신 GNB의 id와 선택 상태로 "홈 도착"을 확인했다.
- **확인 스텝은 fail도 확인한다.** 일부러 틀린 조건을 넣어 fail이 나는지 봐야, 그 스텝이 실제로 무언가를 잡아낼 수 있다는 걸 알 수 있다.
- **pass가 "검증했다"는 뜻은 아니다.** `when`으로 건너뛴 블록도 리포트에는 SUCCESS로 남는다. 로그에서 실제로 실행됐는지 확인한다.
- **flow 하나가 깨지면 스위트 전체가 멈춘다.** Maestro는 실행 전에 폴더의 모든 YAML을 파싱한다. CI에서는 문법 검사를 먼저 돌린다.
- **실패는 먼저 분류한다: 앱 / flow / 환경.** CI의 시스템 팝업(런처 ANR)은 환경 실패라 flow가 아니라 workflow에서 막았다. 환경 문제를 flow로 덮으면 진짜 결함까지 가려진다.
- **로컬 통과 ≠ CI 통과.** 화면 크기가 다르면 같은 탭도 다른 곳을 누른다. 화면 전체 크기의 `touch_outside`는 가운데를 탭하면 CI(pixel_6)에서 바텀시트 안을 눌러 시트가 닫히지 않았다 → 위치에 의존하지 않는 back 키로 바꿨다.
- **진단은 증거로 확인한다.** 처음에는 "타이밍 문제"로 오진해 대기만 추가했는데, 다음 실행에서 시트가 5초 넘게 닫히지 않는 것으로 드러났다. 스크린샷·hierarchy 좌표·logcat을 맞춰 본 뒤에야 진짜 원인을 찾았다.
- **로그의 `ERROR`라는 단어에 놀라지 않는다.** 결과는 `[Passed]`/`[Failed]`와 스텝 상태로 판단한다.
- **웹 자동화 경험이 그대로 통한다.** 모바일 UI hierarchy도 웹 DOM과 같은 트리 구조라, Playwright에서 셀렉터를 잡던 방식이 그대로 적용됐다.
