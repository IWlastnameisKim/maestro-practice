# CI workflow 해설 (`.github/workflows/maestro.yml`)

workflow를 읽다가 헷갈렸던 부분을 정리한 문서입니다. 전체 흐름과 결과 확인 방법은 [README의 CI 절](../README.md#ci-github-actions)을 먼저 보세요.

```
[prepare job]  태깅 규칙 검사 → YAML 문법 검사 → 실행 계획(스위트·앱 버전 결정)
      │ outputs (suite, versions)
      ▼
[test job × 앱 버전 수]  APK 다운로드·검증 → 에뮬레이터 안정화 → 스위트 실행 → artifact 업로드
```

---

## 1. 버전은 무엇을 고정하고, 무엇을 고르나

| | 무엇의 버전 | 정하는 곳 | 바뀌는가 |
|---|---|---|---|
| `env: MAESTRO_VERSION: "2.12.1"` | **테스트 도구**(Maestro CLI) | workflow 파일 | 고정 |
| `env: EMULATOR_API_LEVEL: 34` | **에뮬레이터 Android 버전** | workflow 파일 | 고정 |
| 수동 실행 입력 `app_version` | **테스트 대상 앱**(위키피디아 APK) | `ci/app-versions.json`에서 선택 | 실행할 때 고름 |

- 도구와 환경을 고정하는 이유: 결과가 바뀌었을 때 원인을 **앱 하나로 좁히기 위해서**다. Maestro가 매번 최신으로 바뀌면 실패가 앱 때문인지 도구 때문인지 구분할 수 없다.
- 고정이 동작하는 원리: Maestro 설치 스크립트(`get.maestro.mobile.dev`)는 `MAESTRO_VERSION` 환경 변수가 있으면 그 버전(`cli-<버전>`)을, 없으면 최신을 받는다. workflow 최상단 `env`는 모든 단계에 전달된다. (2026-11-11 설치 스크립트로 확인)
- Maestro를 올릴 때는 `MAESTRO_VERSION`만 바꾸고, 같은 앱 버전으로 한 번 돌려 도구 변경의 영향만 따로 본다.
- 로컬과 CI는 **Maestro 버전만 같다.** 에뮬레이터는 로컬 API 37 arm64 한국어 / CI API 34 x86_64 영어(1080×2400)로 다르다.

---

## 2. `${{ steps.plan.outputs.* }}`는 어디서 오나

값은 3단계로 전달된다.

**① 단계에서 값을 만든다** — `$GITHUB_OUTPUT` 파일에 `이름=값`을 쓴다.

```yaml
      - name: 실행 계획
        id: plan                                   # ← steps.plan 의 "plan"
        run: |
          echo "suite=$suite" >> "$GITHUB_OUTPUT"  # ← steps.plan.outputs.suite
          node -e '... appendFileSync(process.env.GITHUB_OUTPUT, `versions=${JSON.stringify(v)}\n`) ...'
                                                   # ← steps.plan.outputs.versions
```

`$GITHUB_OUTPUT`은 GitHub Actions가 단계마다 만들어 주는 파일이다. 셸은 `echo`, node는 파일에 덧붙이는 방식으로 썼다.

**② job 밖으로 내보낸다** — 단계의 출력은 그 job 안에서만 보이므로 job의 `outputs`로 한 번 더 꺼낸다.

```yaml
  prepare:
    outputs:
      suite: ${{ steps.plan.outputs.suite }}
      versions: ${{ steps.plan.outputs.versions }}
```

**③ 다른 job에서 받는다** — `needs.<job>.outputs.<이름>`

```yaml
  test:
    needs: prepare
    strategy:
      matrix:
        app: ${{ fromJSON(needs.prepare.outputs.versions) }}   # 앱 버전마다 job 하나
    ...
            npm run test:${{ needs.prepare.outputs.suite }}
```

**헷갈리기 쉬운 점**

- `outputs`가 job 맨 위에 있지만 **YAML에서 키를 적은 순서는 실행 순서와 관계없다.** 위에서 아래로 실행되는 것은 `steps` 안의 단계뿐이고, `outputs`는 모든 단계가 끝난 뒤 값을 채워 내보내는 **선언**이다.
- `test`는 `needs: prepare`라서 `prepare`가 완전히 끝난 뒤 시작한다. 그 시점에는 값이 이미 채워져 있다.
- outputs는 **문자열로만** 전달된다. 목록은 JSON 문자열로 보내고 받는 쪽에서 `fromJSON`으로 푼다. 덕분에 `ci/app-versions.json`에 버전을 추가하기만 하면 workflow 수정 없이 병렬 job이 늘어난다.

---

## 3. YAML 문법 검사 한 줄 풀이

```sh
find flows -name "*.yaml" ! -name config.yaml -print0 |
  xargs -0 -n1 sh -c 'echo "check $0" && maestro check-syntax "$0"'
```

**`maestro check-syntax`** — Maestro CLI의 하위 명령(`maestro --help`에 나온다). 기기 없이 flow 파일 하나의 문법을 검사한다. 사용법: `maestro check-syntax <file>`

| 조각 | 의미 |
|---|---|
| `find flows -name "*.yaml"` | `flows/` 아래(하위 폴더 포함)의 `.yaml` 파일을 찾는다 |
| `! -name config.yaml` | `config.yaml`은 뺀다 (flow가 아니라 설정 파일이라 flow 문법 검사에서 실패한다) |
| `-print0` | 파일 이름 사이를 줄바꿈 대신 **NUL 문자(`\0`)**로 구분해 출력한다 |
| `\|` | 앞 명령의 출력을 뒤 명령의 입력으로 넘긴다 |
| `xargs` | 넘어온 목록을 **뒤 명령의 인자로 붙여 실행**한다 (`find`는 목록을 출력만 한다) |
| `-0` | 목록을 NUL 기준으로 자른다 (`-print0`과 짝). 파일 이름에 공백이 있어도 쪼개지지 않는다 |
| `-n1` | 인자를 **1개씩** 넘긴다. `check-syntax`가 파일을 하나만 받기 때문 |
| `sh -c '스크립트' 인자` | 작은 셸 스크립트를 실행한다. 스크립트 뒤 **첫 번째 인자가 `$0`**이 된다 (xargs가 파일 경로를 그 자리에 붙인다) |
| `echo "check $0"` | 지금 검사하는 파일을 로그에 남긴다 |
| `&&` | 앞 명령이 성공하면 뒤 명령을 실행한다 |
| `maestro check-syntax "$0"` | 그 파일의 문법을 검사한다 |

`sh -c`를 쓴 이유: 파일 하나당 **명령 두 개**(출력 + 검사)를 실행하려고. xargs는 원래 명령 하나만 실행한다.

**풀어 쓰면** — `find`가 두 파일을 찾았다면 xargs는 이렇게 차례로 실행한다.

```sh
sh -c 'echo "check $0" && maestro check-syntax "$0"' flows/saved/article-save.yaml
sh -c 'echo "check $0" && maestro check-syntax "$0"' flows/subflows/launch-to-home-android.yaml
```

CI 로그:

```
check flows/saved/article-save.yaml
OK
check flows/subflows/launch-to-home-android.yaml
OK
```

**실패하면** — 하나라도 실패하면 xargs가 0이 아닌 종료 코드로 끝나 단계가 실패하고, 에뮬레이터를 띄우는 `test` job은 시작되지 않는다. 실패 직전의 `check ...` 줄이 문제 파일이다.

**왜 에뮬레이터 전에 하나** — Maestro는 실행 전에 폴더의 모든 YAML을 파싱하므로 flow 하나만 깨져도 스위트 전체가 시작되지 않는다. 몇 분 걸리는 에뮬레이터 부팅 전에 몇 초 만에 잡는다.

**검사하지 못하는 것**

- 셀렉터(id, 텍스트)가 앱에 실제로 있는지 (기기가 없으므로)
- `runFlow`로 부르는 파일이 실제로 있는지 — **확인하지 않았다.** 오류 위치가 실제 경로가 아니라 `/syntax-checker:4:29`로 나오는 것으로 보아 파일 내용만 따로 검사하는 것으로 보인다. 경로가 바뀌는 변경은 실행해서 확인한다.
