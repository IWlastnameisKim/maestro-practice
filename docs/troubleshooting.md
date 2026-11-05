# 트러블슈팅 기록

환경 구성 중 실제로 겪은 문제와 원인, 해결 과정을 기록합니다. 추측으로 고치기보다 **상태를 먼저 확인하고 원인을 좁혀가는 것**을 원칙으로 했습니다.

---

## 1. `code .` 실행 시 `command not found: code`

**증상**
```
zsh: command not found: code
```

**원인**
VS Code의 `code` 명령어가 터미널 PATH에 등록되지 않은 상태.

**해결**
- VS Code에서 `Cmd + Shift + P` → `Shell Command: Install 'code' command in PATH`
- 또는 메뉴의 **파일 → 폴더 열기**로 직접 연다.

---

## 2. 만든 폴더가 데스크탑에 보이지 않음

**증상**
`mkdir -p ~/maestro-practice/flows`로 만든 폴더가 데스크탑에 없음.

**원인**
`~`는 데스크탑이 아니라 **홈 폴더**(`/Users/<사용자명>`)를 뜻한다. 실제 위치는 `~/maestro-practice`.

**해결**
```bash
open ~/maestro-practice   # Finder로 열기
```
데스크탑에 두려면 `mv ~/maestro-practice ~/Desktop/`

**배운 점**
경로를 다룰 때는 `pwd`로 현재 위치를 확인하는 습관이 필요하다.

---

## 3. Java 설치 후 `java -version`에서 Java를 찾지 못함

**증상**
```
The operation couldn't be completed. Unable to locate a Java Runtime.
```
`brew install --cask temurin@17` 재실행 시에는 "already installed" 경고가 나옴.

**확인한 것**
- Homebrew 기록상으로는 설치된 상태
- 그런데 시스템에서 Java를 찾지 못함 → 설치 완료 직후 터미널이 아직 새 설정을 인식하지 못한 상태로 판단

**해결**
터미널을 새로 연 뒤 다시 확인하니 정상 인식.
```
openjdk version "17.0.21" 2026-10-20
OpenJDK Runtime Environment Temurin-17.0.21+9
```

**참고 (실제 설치가 안 된 경우의 확인 방법)**
```bash
ls /Library/Java/JavaVirtualMachines/   # JDK 폴더가 있는지
brew reinstall --cask temurin@17        # 없으면 재설치
```

**배운 점**
설치 직후 "찾을 수 없음" 에러는 설치 실패가 아닐 수 있다. 터미널 재시작 여부부터 확인한다.

---

## 4. Maestro 설치 후 `command not found: maestro` (이름이 같은 다른 프로그램 설치)

**증상**
```
zsh: command not found: maestro
```

**확인 과정**

1. Homebrew 실행 파일 위치에 maestro가 있는지 확인 → 없음
   ```bash
   ls /opt/homebrew/bin | grep maestro
   ```
2. `brew install maestro` 재실행 시 출력된 경고를 확인
   ```
   Warning: Treating maestro as a cask. For the formula, use mobile-dev-inc/tap/maestro ...
   Warning: Not upgrading maestro, the latest version is already installed
   ```
   → CLI(formula)가 아니라 **cask(데스크톱 앱)** 로 설치되었다는 단서
3. 실제로 설치된 대상 확인
   ```bash
   brew info --cask maestro
   ```
   ```
   maestro (Maestro): 1.0.2
   AI agent command center
   https://runmaestro.ai/
   ```
   → 모바일 테스트 도구가 아닌, **이름만 같은 다른 프로그램**이 설치되어 있었음

**원인**
`brew install maestro`처럼 이름만 지정하면 Homebrew 기본 저장소의 같은 이름 cask가 우선 설치된다. 모바일 테스트용 Maestro CLI는 `mobile-dev-inc/tap` 저장소에 있다.

**해결**
```bash
brew uninstall --cask maestro                  # 잘못 설치된 앱 제거
brew install mobile-dev-inc/tap/maestro        # 저장소를 지정해 CLI 설치
```
터미널을 새로 연 뒤 `maestro --version`으로 정상 설치 확인.

**배운 점**
- 경고 메시지를 그냥 넘기지 않고 읽으면 원인이 바로 보이는 경우가 많다.
- 패키지 매니저로 설치할 때 이름이 흔한 도구는 **저장소까지 명시**해서 설치한다.
- "설치됐다"는 메시지만 믿지 말고, **무엇이** 설치됐는지 확인한다.

---

## 5. 대상 앱(지그재그)이 에뮬레이터에서 실행되지 않음

**증상**
Play 스토어에서 정상 설치되었으나, 실행 시 에뮬레이터에서는 실행할 수 없다는 안내와 함께 앱이 종료됨.

**원인**
커머스·금융 앱은 부정 결제·어뷰징 방지를 위해 에뮬레이터나 루팅된 기기에서의 실행을 차단하는 경우가 많다. 환경 설정 문제가 아니라 앱의 의도된 보안 정책으로 판단.

**대응**
- 에뮬레이터 감지를 우회하는 방법은 앱의 보안 정책을 우회하는 것이므로 시도하지 않음.
- 학습 목적(YAML flow 작성 경험)은 대상 앱과 무관하므로, Maestro 공식 샘플 앱으로 전환.
  ```bash
  maestro download-samples
  ```

**배운 점 / 실무 관점의 질문**
- 보안 정책이 강한 서비스는 에뮬레이터만으로 자동화 테스트 환경을 구성하기 어렵다.
- 실무에서는 감지 기능을 끈 테스트 빌드, 실기기, 클라우드 디바이스 팜(AWS Device Farm 등) 중 어떤 방식으로 이 제약을 해결하는지 확인이 필요하다.

---

## 6. GitHub push 실패 (`pre-receive hook declined`)

**증상**
```
remote: error: File samples/sample.zip is 112.00 MB; this exceeds GitHub's file size limit of 100.00 MB
remote: error: GH001: Large files detected.
remote: pre-receive hook declined
 ! [remote rejected] main -> main (pre-receive hook declined)
```
`samples/sample.apk`(78.7MB)도 권장 크기(50MB) 초과 경고.

**원인**
`maestro download-samples`로 받은 샘플 폴더가 커밋에 포함됨. GitHub은 100MB를 넘는 파일을 거절한다.

**첫 시도와 실패**
`.gitignore`에 `samples/`를 추가했지만 push가 동일하게 실패함.
→ `.gitignore`는 **아직 추적되지 않은 파일**에만 적용된다. 이미 커밋된 파일은 계속 추적되고, **과거 커밋 기록 안에도 남아 있다.**

**해결**
샘플은 직접 작성한 파일이 아니고 언제든 다시 받을 수 있으므로 Git LFS 대신 커밋에서 제외. 아직 push 전이었고 커밋이 2개였으므로 하나로 합치면서 정리.
```bash
# .gitignore에 samples/, *.apk, *.zip 추가 후
git reset --soft $(git rev-list --max-parents=0 HEAD)  # 커밋을 첫 커밋으로 합침 (변경 내용은 유지)
git rm -r --cached samples                             # Git 추적에서만 제외 (실제 파일은 유지)
git add .gitignore
git commit --amend -m "Maestro 환경 구성 및 트러블슈팅 기록"
git ls-files                                           # samples/ 가 없는지 확인 후
git push -u origin main
```

**배운 점**
- `.gitignore`는 레포를 만들 때, **파일을 추가하기 전에** 먼저 설정한다.
- push 전에 `git ls-files`로 **무엇이 올라가는지** 확인한다.
- 에러 메시지의 첫 번째 제안(Git LFS)이 항상 정답은 아니다. 그 파일이 애초에 올라가야 하는지부터 판단한다.
