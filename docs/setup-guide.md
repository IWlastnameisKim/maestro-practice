# 환경 구성 가이드 (macOS, Apple Silicon 기준)

처음부터 같은 환경을 재현하기 위한 순서입니다. 각 단계 끝의 "확인" 명령어로 성공 여부를 체크하고 다음 단계로 넘어갑니다.

> 설치 중 실제로 겪은 문제는 [troubleshooting.md](troubleshooting.md)에 정리했습니다.

---

## 1. Homebrew 설치

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- 비밀번호 입력 시 화면에 아무것도 표시되지 않는 것이 정상이다.
- 설치가 끝나면 출력 마지막의 **"==> Next steps:"** 에 나온 명령어를 그대로 실행해야 `brew`가 인식된다.

확인:
```bash
brew --version
```

## 2. Java 17 이상 설치

Maestro CLI는 Java 17 이상이 필요하다.

```bash
brew install --cask temurin@17
```

확인 (터미널을 새로 연 뒤):
```bash
java -version
```

## 3. Xcode Command Line Tools

```bash
xcode-select -p
```
경로가 나오면 설치된 상태. 에러가 나오면:
```bash
xcode-select --install
```

## 4. Android Studio 설치

1. developer.android.com/studio 에서 Apple Silicon용 다운로드
2. `.dmg` 실행 후 응용 프로그램 폴더로 이동
3. 첫 실행 시 Setup Wizard에서 **Standard** 설치 선택, SDK 다운로드까지 완료

## 5. Android 에뮬레이터 생성

1. Welcome 화면 → **More Actions** → **Virtual Device Manager**
2. **`+`** 또는 **Create Virtual Device**
3. **Phone** 카테고리에서 Play Store 아이콘이 있는 기기 선택
4. 시스템 이미지: 이름에 **Google Play** 포함, **arm64-v8a** 선택 후 다운로드
   - `Google APIs`만 있는 이미지에는 Play 스토어가 없다.
5. Finish → 목록에서 ▶ 로 실행

## 6. 대상 앱(위키피디아) 설치

Play 스토어가 아니라 **버전이 고정된 APK**를 설치한다. CI와 같은 버전으로 테스트하기 위해서다. (버전 목록: `ci/app-versions.json`)

Maestro 설치(8단계) 후, 프로젝트 폴더에서:
```bash
maestro download-samples
adb install -r samples/wikipedia.apk
```

확인 — `ci/app-versions.json`의 `versionName`, `sha256`과 같아야 한다:
```bash
adb shell dumpsys package org.wikipedia | grep versionName
shasum -a 256 samples/wikipedia.apk
```

- 에뮬레이터 기본 키보드에서 한글 입력이 안 될 수 있다. 검색어는 영문으로 시작한다.
- 한글 입력이 필요하면: 설정 → System → Languages & input → On-screen keyboard → Gboard → Languages → 한국어 추가

## 7. adb 연결

```bash
echo 'export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

확인 (에뮬레이터 실행 중):
```bash
adb devices
```
```
List of devices attached
emulator-5554   device
```

## 8. Maestro CLI 설치

> **주의**: `brew install maestro` 로 설치하면 이름이 같은 **다른 앱**(AI agent 데스크톱 앱)이 설치된다. 반드시 저장소 이름까지 붙여서 설치한다.

```bash
brew install mobile-dev-inc/tap/maestro
```

확인 (터미널을 새로 연 뒤):
```bash
maestro --version
```

## 9. 대상 앱 패키지명(appId) 확인

flow 파일 상단의 `appId`에 들어갈 값이다.

```bash
adb shell pm list packages | grep -i wikipedia
```

결과가 없으면, 앱을 화면에 띄운 상태에서:
```bash
adb shell dumpsys window | grep -E 'mCurrentFocus'
```
출력에서 `/` 앞부분이 패키지명이다.

## 10. Node.js 설치 (실행 명령용)

스위트 실행(`npm run test:sanity` 등)과 태깅 규칙 검사(`tools/suites.mjs`)에 쓴다. 테스트 자체는 Maestro가 실행한다.

```bash
brew install node
```

확인:
```bash
node --version
npm run check:suites
```

---

## 참고

- [Maestro 공식 문서 – 설치](https://docs.maestro.dev/getting-started/installing-maestro)
- [Maestro GitHub](https://github.com/mobile-dev-inc/Maestro)
