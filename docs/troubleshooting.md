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

---

## 7. 샘플 flow가 `Element not found: Text matching regex: Forward`로 실패

**증상**
`samples/android-advanced-flow.yaml` 실행 시 온보딩 첫 단계에서 실패.

**원인**
에뮬레이터 언어가 한국어로 설정되어 있어, 버튼이 "Forward"가 아니라 "앞으로"로 표시됨. 텍스트로 요소를 찾는 셀렉터는 **앱 언어에 따라 결과가 달라진다.**

**확인 과정**
1. `maestro hierarchy`로 온보딩 화면의 UI 구조를 확인
2. "앞으로"는 `text`가 아니라 `accessibilityText`에 있었고, 요소 자체는 `clickable: false`인 아이콘
3. `bounds`를 비교해 클릭 가능한 **부모 요소**(버튼)를 찾았으나, 부모에도 `resource-id`가 비어 있음
   - 부모: `[1136,2640][1280,2784]` (144×144, clickable: true)
   - 자식: `[1172,2676][1244,2748]` (72×72, 부모 정중앙)

**검토한 해결 방법**

| 방법 | 판단 |
|---|---|
| 에뮬레이터 언어를 영어로 변경 | 문제를 피할 뿐 해결이 아님 |
| 한국어 텍스트로 교체 | 언어가 바뀌면 다시 깨짐 |
| `id`로 찾기 | 가장 안정적이지만 이 화면에는 id가 없음 |
| **정규식으로 여러 언어 허용** | id가 없을 때의 현실적인 차선책 → **채택** |

**해결**
Maestro는 텍스트를 정규식으로 찾으므로 `|`(또는)로 두 언어를 함께 허용.
```yaml
- tapOn: "Forward|앞으로"
```
자식 요소가 `clickable: false`여도 Maestro는 요소 중앙을 탭하므로, 그 위치에 있는 부모 버튼이 눌린다.

**배운 점**
- 셀렉터 우선순위: **id > 다국어 정규식 텍스트 > 단일 언어 텍스트 > 좌표**
- id가 없어 자동화가 불안정하다면, 실무에서는 개발팀에 테스트용 id 추가를 요청하는 것이 근본 해결이다. (테스트 용이성, testability)

---

## 8. "건너뛰기" 버튼이 hierarchy에서 검색되지 않음

**증상**
hierarchy 파일에서 Skip/건너뛰기를 찾을 수 없음. `optional: true`로 넘어가게 처리하려 했음.

**optional로 처리하지 않은 이유**
"못 찾으니 optional"은 테스트를 통과시키지만 **문제를 숨길 수 있다.** Skip을 눌러야만 홈으로 가는 구조라면, 스텝이 조용히 건너뛰어진 채 온보딩에 멈춰 있어도 테스트는 성공으로 표시된다.

**원인**
`maestro hierarchy`는 **실행한 그 순간 화면에 보이는 요소만** 보여준다. hierarchy를 저장한 화면은 온보딩 **첫 페이지**였고, Skip 스텝은 Forward를 **3번 누른 뒤의 마지막 페이지**에서 실행된다.

**확인과 해결**
1. Skip 스텝을 빼고 Forward 3번까지만 실행
2. 멈춘 화면을 직접 확인 → 마지막 페이지에 "건너뛰기" 버튼 존재
3. optional 없이 `tapOn: "Skip|건너뛰기"`로 작성 → pass

**배운 점**
- "hierarchy에 없다"는 "존재하지 않는다"가 아니라 "그 순간 화면에 없었다"일 수 있다. **스텝이 실행되는 시점의 화면**에서 확인해야 한다.
- optional은 "있을 수도, 없을 수도 있는 요소"(팝업 등)에만 쓴다. 원인을 모르는 실패를 덮는 용도로 쓰지 않는다.

---

## 9. 온보딩 통과 여부를 무엇으로 검증할 것인가

**첫 시도**
홈 화면의 `"가장 많이 읽은 글"` 텍스트로 `assertVisible` → pass.
일부러 존재하지 않는 텍스트로 바꿔 **fail이 나는지도 확인**해, 확인 스텝이 실제로 동작함을 검증.

**문제 인식**
"가장 많이 읽은 글"은 **콘텐츠 영역**이다. 피드 구성은 날짜·지역·네트워크 상태에 따라 바뀔 수 있어, 홈에 정상 도착했는데도 실패하는 불안정한 테스트가 될 수 있다.

**개선: 변하지 않는 구조(하단 GNB)로 검증**
hierarchy에서 GNB를 확인하니, 온보딩과 달리 **resource-id가 존재**했다.

"홈" 텍스트가 두 군데 검색되어 혼동했으나, `bounds`를 비교해 보니 둘 다 **하단 GNB의 같은 홈 탭**이었다.

| 요소 | 값 | bounds |
|---|---|---|
| 홈 탭 버튼 | `id: org.wikipedia:id/nav_tab_home`, `accessibilityText: "홈"` | `[0,2544][256,2784]` |
| 그 안의 라벨 | `text: "홈"` | `[113,2676][143,2724]` (버튼 안쪽) |

화면 높이가 2856이므로 y좌표 2544~2784는 화면 최하단이다.

또한 홈 탭만 `selected: true`이고 다른 탭은 `false`인 것을 확인해, **"홈 탭이 선택된 상태"**까지 검증하도록 작성.
```yaml
- assertVisible:
    id: "org.wikipedia:id/nav_tab_home"
    selected: true
```

**검증**

| 조건 | 기대 | 결과 |
|---|---|---|
| `nav_tab_home` + `selected: true` | pass | ✅ pass |
| `nav_tab_search` + `selected: true` | fail | ❌ fail (정상) |

pass와 fail이 모두 기대대로 나와 `selected` 조건이 실제로 동작함을 확인.

**배운 점**
- **변하는 콘텐츠가 아니라 변하지 않는 구조로 검증한다.**
- 확인 스텝을 추가하면 **일부러 틀린 조건으로 fail이 나는지까지** 확인한다. pass만 보고는 그 스텝이 무언가를 잡아낼 수 있는지 알 수 없다.
- 눈으로 본 것과 데이터가 다를 때는 `bounds`로 실제 위치를 확인한다.

---

## 10. 에뮬레이터 인터넷 연결 실패 (Wi-Fi는 연결, "인터넷 연결 없음")

**증상**
에뮬레이터 상태 표시줄에 "Wi-Fi 신호가 강합니다, 인터넷 연결 없음". 앱 피드가 로드되지 않음.

**확인**
| 확인 | 명령 | 결과 |
|---|---|---|
| IP 통신 | `adb shell "timeout 6 ping -c1 -W3 8.8.8.8"` | 응답 있음 |
| 이름 조회(DNS) | `adb shell "timeout 6 ping -c1 -W3 en.wikipedia.org"` | **응답 없음** |
| 에뮬레이터가 쓰는 DNS | `ps -ax -o command \| grep netsimd` → `--host-dns=` | `1.214.68.2,61.41.153.2` |
| Mac이 지금 쓰는 DNS | `scutil --dns \| grep nameserver` | `20.249.183.121`, `168.126.63.2` |

**원인**
에뮬레이터는 **켜질 때의 Mac DNS 주소**를 넘겨받아 계속 쓴다. 에뮬레이터를 켜 둔 채 Mac의 네트워크(장소·와이파이)가 바뀌면, 에뮬레이터는 더 이상 쓸 수 없는 이전 DNS로 조회를 시도해서 실패한다. (IP 통신은 되고 DNS만 실패)

**해결**
에뮬레이터를 재시작해서 현재 Mac의 DNS를 다시 넘겨받는다.
```bash
adb emu kill
~/Library/Android/sdk/emulator/emulator -avd Pixel_10_Pro -netdelay none -netspeed full
```
재시작 후 `--host-dns`가 현재 Mac DNS와 같아지고, `en.wikipedia.org` 조회가 성공함을 확인.

네트워크를 자주 옮겨 다닌다면 DNS를 고정해서 켤 수도 있다. (`-dns-server 8.8.8.8,1.1.1.1`)

**배운 점**
- "인터넷 연결 없음"이라고 다 같은 원인이 아니다. **IP 통신과 DNS를 나눠서** 확인하면 원인을 좁힐 수 있다.
- 장소를 옮긴 뒤 테스트가 이상하게 실패하면, 테스트보다 먼저 에뮬레이터의 네트워크를 확인한다.

---

## 11. [환경 실패] CI에서 "Pixel Launcher isn't responding" 팝업으로 sanity 실패

**분류: 환경 실패** — 앱 결함도, flow 결함도 아니다. 같은 flow가 로컬에서는 통과한다.

**증상**
GitHub Actions에서 수동 실행한 sanity가 실패. 실패 스크린샷에서 온보딩 화면 위에 시스템 팝업 **"Pixel Launcher isn't responding"** 이 떠 있고, 그 때문에 온보딩 화면의 assert가 실패했다.
(CI 로그의 `sun.misc.Unsafe` WARNING은 Java 버전 관련 경고로, 실패 원인이 아니다.)

**원인**
CI 에뮬레이터는 매번 새로 부팅된다. 부팅 직후에는 런처 등 시스템 앱이 초기화 작업으로 바쁜데, 기본 자원(코어 2, RAM 2GB)으로는 런처가 제때 응답하지 못해 시스템이 ANR(응답 없음) 팝업을 띄운다. 이 팝업이 테스트 중인 앱 화면을 가린다.

**flow를 고치지 않은 이유**
팝업을 flow에서 `optional`로 닫거나 assert를 완화하면 통과는 하겠지만, 그건 **환경 문제를 테스트 코드로 덮는 것**이다. 실제 사용자 환경에는 없는 팝업이므로 환경 쪽에서 막는다.

**해결 (`.github/workflows/maestro.yml`만 수정)**

| 구분 | 넣은 것 | 이유 |
|---|---|---|
| 자원 | `cores: 4`, `ram-size: 4096M` | 부팅 직후 시스템 앱이 응답할 여유를 준다 |
| 자원 | `-camera-back none -camera-front none` | 쓰지 않는 가상 카메라를 꺼서 부팅 부하를 줄인다 |
| 대기 1 | `sys.boot_completed=1` + `init.svc.bootanim=stopped` | 부팅이 "끝났다고 표시만 된" 시점이 아니라 부팅 애니메이션까지 끝난 시점을 기다린다 |
| 대기 2 | `pm path android` 응답 | 패키지 매니저가 앱 설치·실행 명령을 받을 수 있는 상태인지 확인 |
| 대기 3 | 홈 이동 후 `mCurrentFocus`가 런처이고 "Not Responding" 창이 아닐 때까지 | 런처가 실제로 응답하는 상태인지 확인 (ANR 창이 포커스면 계속 대기) |
| 대기 4 | `sleep 30` | 부팅 직후 백그라운드 작업(앱 최적화 등)이 가라앉을 시간 |
| 팝업 | `settings put global hide_error_dialogs 1` | 시스템 오류·ANR 팝업을 띄우지 않는다 |
| 팝업 | `settings put secure anr_show_background 0` | 백그라운드 앱의 ANR 팝업을 띄우지 않는다 |
| 팝업 | `disable-spellchecker: true` | 입력 관련 시스템 안내가 뜨지 않게 한다 |
| 팝업 | `CLOSE_SYSTEM_DIALOGS` 브로드캐스트 | 설정 전에 이미 떠 있던 시스템 팝업이 있으면 닫기 시도 |
| 기록 | 테스트 직전 `mCurrentFocus` 출력 | 다음에 실패하면 시작 시점 화면 상태를 로그로 확인 |

**주의 (트레이드오프)**
`hide_error_dialogs`는 **테스트 대상 앱의 크래시 팝업도 숨긴다.** 앱이 죽어도 팝업이 없을 뿐, 화면에서 앱이 사라지므로 다음 assert가 실패해 결함은 여전히 드러난다. 다만 실패 스크린샷에 "앱이 중지됨" 팝업이 보이지 않으므로, CI 실패 시에는 `maestro.log`와 화면 상태를 함께 본다.

**확인**
- 대기 조건 3개(부팅, 패키지 매니저, 런처 포커스)는 로컬 에뮬레이터에서 조건식이 맞게 판정되는 것을 확인. ANR 창 문자열을 넣으면 "대기 계속"으로 판정되는 것도 확인.
- CI에서 실제로 해결됐는지는 **다음 workflow 실행 결과로 확인 필요.**

**배운 점**
- 실패를 보면 먼저 **앱 실패 / flow 실패 / 환경 실패**로 분류한다. 환경 실패를 flow 수정으로 덮으면 진짜 결함까지 가려질 수 있다.
- CI 에뮬레이터는 "부팅 완료" 신호만으로는 안정된 상태가 아니다. 테스트 전에 **시스템이 실제로 응답하는지**까지 확인한다.
