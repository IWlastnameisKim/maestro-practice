# AI 작성 flow 리뷰 기록

| 날짜 | flow | 찾은 문제 | 해당 규칙 | 수정 방법 |
|---|---|---|---|---|
| 2026-11-10 | subflows/launch-clearstate-android.yaml | (testability) 온보딩 첫 화면이 Compose로 그려져 제목·링크에 resource-id가 없음 | 셀렉터 규칙 (id 없는 요소 기록) | 앱 문자열 리소스(en/ko)로 확인한 다국어 정규식 텍스트로 검증 |
| 2026-11-10 | subflows/dismiss-search-promo-android.yaml | (testability) 검색 위젯 프로모션 바텀시트 제목에 resource-id가 없음 | 셀렉터 규칙 (id 없는 요소 기록) | 앱 문자열 리소스(en/ko)로 확인한 다국어 정규식 텍스트로 판단 |
| 2026-11-10 | samples → subflows 이관 2건 | 원본 샘플이 영어 전용 텍스트만 사용 → 한국어 로컬 환경에서 실패 | 셀렉터 규칙 (영어+한국어 함께 허용) | 영어/한국어 정규식으로 수정, 프로모션 닫기 후 닫힘 확인(assertNotVisible) 추가 |
| 2026-11-10 | saved/article-save.yaml | (testability) 홈 피드 카드가 Compose로 그려져 resource-id가 없고, 뉴스 문구는 매일 바뀜 | 셀렉터 규칙 (id 없는 요소 기록) | 고정 문구인 카드 설명(explore_feed_in_the_news_subtitle) `below`의 첫 요소를 탭 |
| 2026-11-10 | saved/article-save.yaml | (testability) '저장됨' 목록 항목이 Compose로 그려져 resource-id가 없음 | 셀렉터 규칙 (id 없는 요소 기록) | `copyTextFrom`으로 읽어 둔 기사 제목 텍스트로 확인 |
| 2026-11-10 | saved/article-save.yaml | (앱 결함 후보) 한국어 환경인데 영어로 노출: 저장 직후 바텀시트 "Collect the articles you love", "Create a new collection", 목록 메뉴 "Add to a collection", 접근성 라벨 "Filter saved articles" — 문자열 리소스에 ko 번역 없음 | - | 셀렉터로 쓰지 않음 (id 사용). 앱 이슈로 별도 확인 필요 |
| 2026-11-10 | saved/article-save.yaml | (앱 결함 후보) '새로 들어온 소식' 카드의 접근성 텍스트에 HTML 태그(`<a rel="mw:WikiLink" …>`)가 그대로 노출 → 스크린리더가 태그를 읽음 | - | 셀렉터로 쓰지 않음. 앱 이슈로 별도 확인 필요 |
| 2026-11-10 | subflows/launch-to-home-android.yaml | onboarding을 나누면서 원래 커밋(f3afb60)의 assert 3개 중 `nav_tab_home selected`만 옮기고 `"가장 많이 읽은 글"`(피드 카드 제목 → 날에 따라 없음), `nav_tab_search selected`(홈 탭과 동시 선택 불가 → 항상 실패)를 뺌. **변경 내용은 타당했지만, 사람에게 알리지 않고 assert를 뺀 것은 규칙 위반** | 절대 하지 않는 것 (assert를 지워서 통과) | 사람이 검토 후 두 assert 제외를 승인함. 이후 검증을 빼거나 바꿀 때는 반드시 먼저 알린다 |
| 2026-11-10 | subflows/onboarding-android.yaml (f3afb60) | (사람 쪽 실수) `nav_tab_search selected: true` 반대 조건은 fail 확인용 임시 코드였는데 커밋 전에 지우지 못함 (troubleshooting 9번) | 검증 규칙 (fail 확인) | launch-to-home 분리 시 제외 (사람 승인) |
| 2026-11-10 | saved/article-save.yaml | 매일 바뀌는 기사 제목을 그대로 정규식 셀렉터에 사용 → 괄호 등 특수문자가 있으면 원문과 불일치 | 검증 규칙 (동적 콘텐츠는 읽어서 사용) | `flows/scripts/escape-regex.js`로 이스케이프 + 제목을 maestro.log에 기록 |
| 2026-11-10 | saved/article-save.yaml | 저장 후 '모음집에 추가' 시트를 `tapOn: touch_outside`로 닫음 → touch_outside는 화면 거의 전체 크기([0,128]–[1080,2337])라 Maestro가 탭하는 가운데(y=1232)가 CI(pixel_6)에서는 시트(y≥1138) 안에 떨어져 시트가 닫히지 않음. 이어지는 back ×2 중 1번째가 시트 닫기에 쓰여 뉴스 상세에서 멈춤(`nav_tab_reading_lists` 못 찾음). **AI가 처음에 '시트가 닫히는 중에 back이 눌린 타이밍 문제'로 잘못 진단** → 대기 스텝만 추가했다가 다음 CI에서 시트가 5초 넘게 안 닫히는 것으로 오진 확인 | 작업 방식 (추측하지 않고 확인) · 원인을 모르는 실패를 덮지 않음 | 시트 닫기를 `pressKey: back`으로 변경, 닫힘 확인(`extendedWaitUntil notVisible: touch_outside`)은 유지 (assert 변경 없음) |
