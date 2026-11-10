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
