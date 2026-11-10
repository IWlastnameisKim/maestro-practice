# CLAUDE.md — maestro-practice

이 프로젝트는 Maestro(YAML 기반 모바일 UI 자동화)를 학습하는 저장소다.
목표는 "통과하는 flow"가 아니라 "실제로 문제를 잡아내는 flow"를 만드는 것이다.

## 환경

- macOS (Apple Silicon), Android 에뮬레이터 `Pixel_10_Pro` (Google Play 이미지)
- 에뮬레이터 언어: **한국어**
- 대상 앱: 위키피디아 (`appId: org.wikipedia`)
- 공통 사전 조건: `flows/subflows/onboarding-android.yaml` (앱 초기화 → 온보딩 통과 → 홈 탭 도착 확인)

## 폴더 구조

기능별 폴더 + 스위트 태그 혼합 방식. **폴더는 기능을, 태그는 스위트를 나타낸다.**

- `flows/<기능>/*.yaml` — 테스트 본체 (예: `flows/search/`, `flows/saved/`). 기능 폴더 밖에 두지 않는다.
- `flows/subflows/` — 초기 조건 세팅용 재사용 flow. 테스트 본체가 `runFlow`로 불러 쓰며, 단독으로 실행하지 않는다.
- `flows/scripts/` — `runScript`로 호출하는 JS
- `flows/config.yaml` — 하위 폴더까지 탐색하도록 설정 (`flows: ["**"]`)
- `package.json` — 스위트별 실행 명령
- `tools/suites.mjs` — 스위트 구성 표 출력 / 태깅 규칙 검사
- `samples/` — `maestro download-samples`로 받은 공식 샘플. **수정하지 않고, 커밋하지 않는다.**
  - 참고용이다. flow에서 `samples/` 경로를 **참조하지 않는다** (CI에는 이 폴더가 없다).
  - 필요한 것은 규칙(다국어 등)에 맞게 고쳐서 `flows/subflows/` 또는 `flows/scripts/`로 옮긴다.
- `docs/` — 설치 가이드, 트러블슈팅, AI 리뷰 기록

## 태깅 규칙

- 스위트는 `sanity`, `regression` 두 개로 시작한다. 늘어나면 이 목록과 `tools/suites.mjs`를 함께 고친다.
- 모든 테스트 flow는 스위트 태그를 최소 1개 단다. 태그가 없으면 **어떤 스위트에서도 실행되지 않는다.**
- `sanity`를 달면 `regression`도 함께 단다. (sanity ⊂ regression)
- 플랫폼 태그 `android`를 단다. 기능 태그(`search`, `saved` 등)는 선택이다.
- subflow에는 스위트 태그를 달지 않는다.
- 스위트 편입·제외는 **파일을 옮기지 않고 태그만 바꾼다.**
- flow를 추가·수정하면 `npm run check:suites`로 확인하고, 결과물에 "추가·변경된 flow × 태그" 표를 함께 제시한다.

## 실행

- 스위트: `npm run test:sanity` / `npm run test:regression` → JUnit 리포트 `report/<스위트>.xml`
- 태그 지정: `npm run test:tag -- <태그>` (예: `npm run test:tag -- search`)
- 구성 확인: `npm run list:suites` / 규칙 검사: `npm run check:suites`
- **태그 없이 `maestro test flows`를 실행하지 않는다.** subflows까지 단독 실행된다.
- CI(GitHub Actions) 에뮬레이터는 **영어**, 로컬은 **한국어**다. 텍스트 셀렉터는 반드시 영어·한국어를 함께 쓴다.

## CI (GitHub Actions)

- workflow: `.github/workflows/maestro.yml` — PR → sanity, 매일 03:00 KST → regression, 수동 실행 시 스위트·버전 선택
- 순서: 태깅 규칙 검사 → 전체 YAML 문법 검사 → **앱 버전별로** 에뮬레이터 실행 (matrix, 병렬)
- 앱 버전은 **고정**한다. 목록: `ci/app-versions.json` (`enabled: true`인 버전이 모두 실행된다)
- APK는 커밋하지 않고 이 저장소의 GitHub Release(`app-<id>` 태그)에 올린 뒤, `sha256`으로 같은 파일인지 검증한다.
- 버전 추가: APK를 Release에 올림 → `shasum -a 256 <apk>` → `ci/app-versions.json`에 항목 추가
- 문구를 앱 문자열 리소스로 확인했다면, **어느 버전 기준인지** flow 주석에 남긴다.

## 작업 방식

1. 요청이 "초안 작성"이면 **flow 파일만 작성하고 실행하지 않는다.** 실행은 요청받았을 때만 한다.
2. 화면의 텍스트나 id를 **추측하지 않는다.** 확인이 필요하면 해당 화면에서 `maestro hierarchy`로 확인하고, 확인하지 못한 값은 그렇다고 밝힌다.
3. flow를 수정해서 통과시켰다면, **무엇을 어떻게 바꿨는지** 설명한다.
4. `samples/`, `*.apk`, `*.zip`, `hierarchy.json`, `report/`는 커밋하지 않는다.

## 셀렉터 규칙

- 우선순위: **resource-id > 다국어 정규식 텍스트 > 단일 언어 텍스트 > 좌표**
- 텍스트를 쓸 때는 영어와 한국어를 함께 허용한다. 예: `"Forward|앞으로"`
- 좌표(`point`)는 다른 방법이 모두 없을 때만 쓰고, 쓴 이유를 주석으로 남긴다.
- id도 고정 텍스트도 없는 요소는 위치 관계(`below` 등)로 찾고, testability 문제로 `docs/ai-review.md`에 기록한다.

## 검증(assert) 규칙

- 확인 스텝은 **매일 바뀌는 콘텐츠가 아니라 변하지 않는 구조**로 검증한다.
  - 예: 홈 도착 확인은 피드 문구가 아니라 `id: org.wikipedia:id/nav_tab_home` + `selected: true`
- 매일 바뀌는 콘텐츠(기사 제목 등)는 하드코딩하지 않는다. 실행 중에 읽어서(`copyTextFrom` 등) 다음 스텝에서 사용한다.
- 새 확인 스텝을 추가하면, **일부러 틀린 조건으로 fail이 나는지**도 확인할 수 있게 방법을 함께 제시한다.

## optional 규칙

- **확인(assert) 스텝에 `optional: true`를 쓰지 않는다.** 없으면 그냥 통과하므로 아무것도 검증하지 않게 된다.
- `optional`은 "있을 수도, 없을 수도 있는 요소"(팝업, 스크롤로 찾는 동작 등)에만 쓰고, 그 뒤의 판단은 `runFlow` + `when`이 맡는다.
- 원인을 모르는 실패를 `optional`로 덮지 않는다.

## 조건부 실행

- `runFlow` + `when`으로 블록을 건너뛸 수 있게 했다면 반드시 `label`을 단다. 건너뛰어도 결과는 pass로 표시되기 때문이다.

## 테스트 데이터 정리

- 테스트가 데이터를 만들었다면(저장, 추가 등) flow 마지막에 **삭제하고, 삭제됐는지 확인**한다. 다음 실행에 영향을 주지 않게 한다.

## 절대 하지 않는 것

- 실패하는 확인 스텝을 지우거나, `optional`을 붙이거나, 좌표로 바꿔서 **통과만 시키는 것**
- 앱의 보안 정책(에뮬레이터 감지 등)을 우회하는 것
- 실제 운영 서비스(위키백과)에 영향을 주는 동작을 자동화하는 것
  - 금지: 문서 편집·토론 작성, 로그인·계정 생성, 신고
  - 허용: 기사 저장처럼 기기 안에만 남는 동작 (단, "테스트 데이터 정리" 규칙을 따른다)

## 알려진 주의점

- Android에서 `inputText`로 한글 입력이 잘 안 될 수 있다. 검색어는 영어로 시작한다.
- `runFlow` 경로는 호출하는 flow 파일의 위치를 기준으로 한다.
  - 테스트 본체(`flows/<기능>/x.yaml`) → `../subflows/xxx.yaml`, `../scripts/xxx.js`
  - subflow끼리 → `xxx.yaml` (같은 폴더)
- 한국어/영어 문구는 추측하지 말고 앱 문자열 리소스로 확인할 수 있다: 설치된 APK를 `adb pull` → `aapt2 dump resources`로 기본값(영어)과 `(ko)` 값을 대조한다.
- `maestro hierarchy`는 **실행한 순간의 화면**만 보여준다. 다른 화면의 요소는 그 화면에서 다시 확인한다.

## 리뷰 기록

AI가 작성한 flow를 사람이 리뷰해서 찾은 문제는 `docs/ai-review.md`에 남긴다.
형식: 날짜 · flow · 찾은 문제 · 어느 규칙에 해당하는지 · 어떻게 고쳤는지
