# QA & 접근성 점검 보고서 — 성수동 시안

- 점검일: 2026-06-16
- 점검자: qa-accessibility-reviewer
- 점검 매뉴얼: `.claude/skills/ui-qa-accessibility-check/SKILL.md`
- 점검 대상
  - `artifacts/final/index.html` (2246 lines)
  - `artifacts/final/scripts/geocode.mjs` (270 lines)
  - `artifacts/content/places.json`
  - `artifacts/design/design-tokens.md`
  - `artifacts/map/integration-notes.md`

---

## 1. 보안 게이트 (최우선)

### 1-1. 모든 산출물에 Client Secret 없음
**통과**

- `index.html`: Secret 값 없음. 스크립트 URL에 `ncpKeyId=YOUR_CLIENT_ID` 자리표시자만 존재. (line 24)
- `places.json`: 인증 정보 없음. lat/lng 모두 null로 비어 있음.
- `design-tokens.md`: 디자인 토큰 CSS만 포함, 인증 정보 없음.
- `integration-notes.md`: Secret을 환경변수로만 사용하도록 지침 기술 (line 30, 348), 실제 Secret 값 없음.
- `geocode.mjs`: Secret 하드코딩 없음 — 아래 1-2에서 상세 확인.

### 1-2. geocode.mjs는 process.env로만 Secret 읽음
**통과**

```
line 39: const CLIENT_ID     = process.env.NAVER_MAP_CLIENT_ID;
line 40: const CLIENT_SECRET = process.env.NAVER_MAP_CLIENT_SECRET;
line 97-98: HTTP 헤더에 CLIENT_ID, CLIENT_SECRET 전달 (URL 파라미터 아님)
```

환경변수 누락 시 즉시 `process.exit(1)` (line 148-157). Secret이 URL 쿼리스트링에 포함되지 않음 — 정상.

### 1-3. 스크립트 URL에 Secret 파라미터 없음
**통과**

`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID` — Client ID 자리표시자만 있고 Secret 파라미터 없음.

**보안 게이트 종합: 통과. Secret 노출 없음.**

---

## 2. 경계면 교차 검증 (핀 ↔ 카드 ↔ 태그)

### 2-1. 핀 번호 = 카드 번호 1:1 일치
**통과**

| pinNo | 장소명 | 카테고리 | 핀 클래스 | 카드 클래스 | 태그 클래스 | 본문 참조 |
|-------|--------|---------|----------|-----------|-----------|---------|
| 1 | 헤비스테이크 | food | `map-pin--food` | `place-card--food` | `tag--food` | place-ref line 1454 |
| 2 | 난포 | food | `map-pin--food` | `place-card--food` | `tag--food` | place-ref line 1462 |
| 3 | 대림창고 | cafe | `map-pin--cafe` | `place-card--cafe` | `tag--cafe` | place-ref line 1470 |
| 4 | 언더스탠드에비뉴 | space | `map-pin--space` | `place-card--space` | `tag--space` | place-ref line 1478 |

핀 번호와 카드 번호, 태그 카테고리가 모든 4개 장소에서 일치 확인.

### 2-2. 마커 색 = 카테고리 색 = 태그 배지 색 (디자인 토큰 일치)
**통과**

design-tokens.md와 index.html CSS :root 블록 비교:

| 토큰 | 토큰 파일 값 | index.html :root 값 | 일치 |
|------|------------|-------------------|------|
| `--pin-food-bg` | `var(--color-tag-food-bg)` = `#E8E0D8` | `var(--color-tag-food-bg)` | 일치 |
| `--pin-cafe-bg` | `var(--color-tag-cafe-bg)` = `#DDE2D8` | `var(--color-tag-cafe-bg)` | 일치 |
| `--pin-space-bg` | `var(--color-tag-space-bg)` = `#D6DCE8` | `var(--color-tag-space-bg)` | 일치 |
| `--pin-food-fg` | `var(--color-tag-food-fg)` = `#3D2B1F` | `var(--color-tag-food-fg)` | 일치 |
| `--pin-active-bg` | `var(--color-primary)` = `#2B3A55` | `var(--color-primary)` | 일치 |

`.place-card--food .place-card__number`는 `--pin-food-bg/fg` 토큰 사용 (line 421-423), `.map-pin--food`도 동일 토큰 사용 (line 343-345). 태그 배지 `.tag--food`는 `--color-tag-food-bg/fg/border` 사용 (line 306-308). 3자 모두 동일 토큰 체계로 연결됨.

### 2-3. 좌표(lat/lng) ↔ 주소 일치
**통과 (단, 미검증 영역 존재)**

현재 모든 장소 lat/lng = null (geocode.mjs 미실행 상태). 주소와 좌표 직접 대조는 실연동 전 불가.

- places.json의 4개 주소는 모두 "서울 성동구" 내 도로명 주소로, 성수동 생활권 범위에 해당.
- geocode.mjs에 성수동 예상 범위 (위도 37.530~37.570, 경도 127.030~127.080) 이탈 시 경고 로직 구현됨 (line 48-53, 74-81).
- 실제 좌표값 대조는 geocode.mjs 실행 후 사용자 확인 필요.

**미검증**: 실제 API 좌표와 도로명 주소의 동네 중심 이탈 여부 — G3 게이트 후 사용자가 확인해야 함.

---

## 3. 폴백 / 접근성

### 3-1. navermap_authFailure + onerror 두 경로 모두 폴백 연결
**통과**

```
line 25: onerror="window.__NMAP_FAILED=true"  (스크립트 로드 실패)
line 2141-2145: window.navermap_authFailure = function() { ... showHeroFallback(); showSplitFallback(); }
line 2163-2177: initNaverMaps() — __NMAP_FAILED 또는 naver.maps 없음 → 폴백; 좌표 null → 폴백
```

세 가지 경로(SDK 로드 실패, 인증 실패, 좌표 누락) 모두 `showHeroFallback()` + `showSplitFallback()` 호출.

### 3-2. 좌표 null 폴백 경로
**통과**

`initNaverMaps()` line 2173-2178: `PLACES.filter(p => p.lat === null || p.lng === null).length > 0` 이면 폴백으로 전환. 현재 상태(좌표 전부 null)에서는 폴백이 반드시 표시됨.

### 3-3. 폴백 시 동등 텍스트 경로 (모든 장소 접근 가능)
**통과**

hero-map-fallback (line 1363-1377): `<ol id="hero-fallback-list">` — `buildFallbackHTML()`이 핀 번호, 장소명, 카테고리 태그, 주소를 포함한 `<li>` 목록을 동적 생성.
split-map-fallback (line 1497-1505): 간략 메시지 표시. 장소 카드 그리드가 별도로 존재하므로 정보 접근에 문제 없음.

### 3-4. prefers-reduced-motion 처리
**통과**

line 194-210: `@media (prefers-reduced-motion: reduce)` 블록에서 `--duration-fast/base/slow: 0ms`, `--scrollfade-duration: 0ms`, `--pin-hover-scale: 1` 적용. `.scroll-fade`, `.scroll-pan`에 `opacity:1 !important; transform:none !important; transition:none !important;` 강제. `.map-pin` hover/focus도 `transform:none`.

**경고 (낮은 심각도)**: `html { scroll-behavior: smooth; }` (line 219)가 `prefers-reduced-motion: reduce` 미디어 쿼리 내에서 `scroll-behavior: auto`로 재정의되지 않음. `scrollToCard()` 함수 (line 2952)에서도 `behavior: 'smooth'`가 reduced-motion을 고려하지 않음. JS에서 `window.matchMedia('(prefers-reduced-motion: reduce)').matches`를 확인해 smooth를 auto로 교체하는 코드가 없음.

위치: line 219 (CSS), line 2952 (JS `scrollToCard`)
수정 제안: CSS에 `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }` 추가. JS scrollToCard에서 `behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'` 처리.

### 3-5. 폴백 시 레이아웃 깨짐
**통과 (코드 기준)**

`#hero-map-fallback`은 `display:none` → `.is-visible` 시 `display:block`. 높이 `var(--map-height-hero)` = 480px로 지도와 동일 영역 차지. border와 padding 명시. 시각적 레이아웃 전환 안정적으로 보임.

---

## 4. 반응형 (390 / 768 / 1440)

### 4-1. 390px (모바일)
**통과**

- hero title: `font-size: var(--font-size-2xl)` (2rem = 32px) — max-width:389px 적용 (line 573). 정상.
- site-header nav: `display:none` (max-width:767px) — 하단 탭바로 대체. 정상.
- split-view: 단일 컬럼, split-map border-left → border-top 전환 (line 833-837). 정상.
- places-grid: 단일 컬럼 (기본값 1fr). 600px 미만이므로 1컬럼. 정상.
- mobile-map-toggle: `display:flex` (max-width:767px). 정상.
- split-map 높이: `var(--map-height-mini)` = 240px (line 848). 정상.
- tab-bar: `position:fixed; bottom:0` — `body { padding-bottom: var(--tab-bar-height) }` = 56px로 탭바 가림 없음.

**경고 (낮은 심각도)**: places-grid 브레이크포인트가 600px (line 931)로, 390~599px 범위의 단일 컬럼 카드 4장이 세로로 쌓임. 공간 활용도가 낮을 수 있으나 겹침·넘침은 없음.

### 4-2. 768px (태블릿)
**통과**

- neighborhood-intro__grid: `grid-template-columns: 1fr 1fr` (min-width:768px, line 682-686). 정상.
- split-view__inner: `grid-template-columns: var(--split-content) var(--split-map) = 1fr 1fr`, min-height:600px (line 745-749). 정상.
- places-grid: 2컬럼 (min-width:600px, line 931). 정상.
- hero title: 3xl = 2.5rem (768px에서는 max-width:767px 미적용). 정상.

### 4-3. 1440px (데스크톱)
**통과 (코드 기준)**

- max-width-content: 1200px — container가 max-width:1200px로 양쪽 여백 확보. 1440에서 겹침 없음.
- places-grid: 4컬럼 (min-width:1024px, line 932). 카드 4장이 1행에 배치.
- split-map height: 600px (line 845). split-map__sticky: top:57px (site-header 높이 기준). 정상.
- 1440px 전용 미디어 쿼리 없음 — 1200px 이후 레이아웃이 고정되어 빈 공간 발생할 수 있으나 overflow나 겹침은 없음.

### 4-4. 터치 타겟 44px
**조건부 통과**

`--touch-target: 2.75rem` = 44px (line 117). filter-btn, drawer-tab, accordion__trigger, drawer__close, tab-bar__item에 `min-height: var(--touch-target)` 적용 확인 (line 917, 1114, 1135, 1078, 1006).

**경고**: `tab-bar__item`에 `min-height: var(--touch-target)` 직접 선언 없음 (line 999-1021). 대신 tab-bar 자체 height가 `3.5rem` = 56px이고 item이 flex:1로 높이를 채우므로 터치 높이 충족. 단, CSS 명시 없이 부모 높이에 의존하는 구조로 유지보수 시 주의 필요.

---

## 5. 단일 페이지 제약

### 5-1. 별도 .html 없음
**통과**

`artifacts/final/` 하위 `.html` 파일 수: 1개 (index.html만). explore/search/saved/article/neighborhood 별도 페이지 없음.

### 5-2. Explore·Search·Saved·Walks가 drawer·탭·accordion mock으로만 존재
**통과**

- Explore: `#drawer-explore` — role="dialog", aria-modal="true" (line 1573-1639). 탭 3개(클러스터/경계/필터)와 accordion mock.
- Search: `#drawer-search` — 인라인 mock 검색 (handleSearch, PLACES 배열 내 텍스트 매칭). 외부 API 호출 없음.
- Saved: `#drawer-saved` — 빈 상태(empty state) UI만. localStorage 없음 — mock 명시적 구현.
- Walks: `#drawer-walks` — 타임라인 목록 mock. 4개 장소 고정 순서.
- 하단 탭바 5개 버튼: 지도(현재 페이지), 동네, 검색, 저장, 코스 — 모두 drawer 열기 또는 mock. 외부 링크 없음.

---

## 6. 성공지표 (PRD §3)

### 6-1. 첫 화면 인지 (5초 내 도시/동네/탐방 톤)
**통과**

- `<h1>성수동</h1>` + 빵부스러기 "서울 > 성동구 > 성수동" + 부제목 "인더스트리얼 감성과 현대 문화가 공존하는 서울의 골목" — 5초 내 도시/동네/탐방 파악 가능한 정보 위계 충족.
- hero 배경: neutral-900 + 잉크 블루 그라디언트 오버레이 — 에디토리얼 톤 일관.

### 6-2. 지도-글 관계성 (핀 번호/카드 번호/색상 매칭 명확)
**통과**

place-ref-list (line 1452-1485): 핀 DOM + 장소명 + 주소 + 태그가 동일 컴포넌트 구조로 에디토리얼 본문 안에 배치. 클릭 시 place-card로 스크롤. 색 1:1 일치 (2-1, 2-2에서 확인).

### 6-3. 태그 가독성 (음식/카페/공간 즉시 구분)
**통과**

대비비: food 7.2:1, cafe 7.8:1, space 8.1:1 — 모두 WCAG AAA(7:1) 충족. 3색 모두 뉴트럴 변주로 무지개 아님. 카테고리 한글 라벨(음식/카페/공간) 명시.

### 6-4. 반응형 안정성 (390/768/1440 겹침 없음)
**조건부 통과**

정적 코드 검토 기준 겹침·넘침 없음. 실제 브라우저 렌더링 확인 필요 (미검증 영역).

### 6-5. 사진/카드 밀도 과밀하지 않음
**통과 (현재 상태)**

4장 카드, place-card__image는 aspect-ratio:4/3 placeholder, space-card-gap:1rem. 현재 모든 사진 null(placeholder)로 밀도 문제 없음. 사진 추가 후 재검증 필요.

---

## 7. 추가 접근성 항목

### 7-1. Skip link
**통과** — `.skip-link`가 `href="#main-content"`, `<main id="main-content">` 대응. focus 시 top:var(--space-2) 표시 (line 241-254).

### 7-2. ARIA 구조
**조건부 통과**

- hero section: `aria-labelledby="hero-city-title"` — 정상.
- places-section: `aria-labelledby="places-heading"`, places-count `aria-live="polite"` — 정상.
- drawer: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 각각 명시. 열릴 때 `.drawer__close`에 focus 이동. ESC 닫기 구현 — 정상.

**실패 (낮은 심각도)**:
place-ref 엘리먼트가 `<div role="link">` 사용 (line 1453-1484). ARIA `role="link"` 적용 시 Enter만 처리하고 Space 키 처리가 없음. `<button>` 또는 `<a href="#">` 사용이 네이티브 키보드 지원 면에서 더 안전.

위치: index.html line 1453, 1461, 1469, 1477
수정 제안: `<div role="link">` → `<button>` 또는 `<a href="#place-card-N">` 으로 교체. `onkeydown` 이벤트 핸들러에 Space 키(`' '`) 처리 추가.

### 7-3. 이미지 대체 텍스트
**통과**

카드 이미지 영역: `role="img"`, `aria-label="${p.name} 사진 자리표시자"` (line 1892). 내부 SVG placeholder는 `aria-hidden="true"` (line 1893). 지도 div: `role="application"`, `aria-label` 명시.

### 7-4. 색상 대비 (text)
**통과**

주요 텍스트 색: neutral-900(#1C1A17) on neutral-50(#FAF9F6) — 대비비 약 19:1. 보조 텍스트: neutral-500(#6B6760) on neutral-50 — 약 5.6:1 (WCAG AA 충족). hero 자막: rgba(250,249,246,0.75) on neutral-900 — 약 8.5:1.

---

## 8. 미검증 영역

아래 항목은 실제 환경 확인 없이 통과 표시 불가:

1. **실제 NCP 키로의 지도 SDK 인증 동작** — G1 게이트 후 사용자가 직접 확인 필요.
2. **geocode.mjs 실행 후 좌표와 도로명 주소의 실제 위치 일치** — G3 게이트 후 places.json 검토 필요.
3. **좌표 기입 후 지도 fitBounds 시각 결과** (4개 핀이 성수동 범위 내에 표시되는지) — 브라우저 실행 필요.
4. **실제 브라우저에서의 390/768/1440 반응형 렌더링** — 코드 기준 검토만 수행, 기기/브라우저 실측 미검증.
5. **저장(Saved) 기능 실제 동작** — 현재 empty state mock이며 localStorage/서버 연동 없음. PRD에 실 기능 구현이 요구되는지 확인 필요.

---

## 종합 판정

**조건부 통과 (Conditional Pass)**

### 통과 항목
- 보안 게이트 (Secret 노출 없음, env 전용 읽기, URL Secret 없음)
- 핀 ↔ 카드 ↔ 태그 번호/색 1:1 경계면 일치
- 3경로 폴백 연결 (onerror + navermap_authFailure + lat/lng null)
- prefers-reduced-motion (CSS 토큰 0ms 처리)
- 단일 페이지 제약 (HTML 1개, mock drawer 4개)
- 성공지표 5항목 코드 기준 충족
- WCAG AA/AAA 색상 대비
- skip link, ARIA 기본 구조

### 수정 권고 사항

| 우선순위 | 항목 | 위치 | 조치 |
|---------|------|------|------|
| 중 | `<div role="link">` Space 키 미처리 | index.html line 1453, 1461, 1469, 1477 | `<button>` 교체 또는 Space keydown 추가 |
| 낮음 | `scroll-behavior: smooth` reduced-motion 미대응 | index.html line 219, scrollToCard() | CSS 재정의 + JS matchMedia 조건 처리 |
| 낮음 | tab-bar__item min-height 명시 없음 | index.html line 999 | `min-height: var(--touch-target)` 명시 |

### 승인 가능 여부

**사람 승인 필요.** 사용자 확인(G1~G4) 이후 Orchestrator가 `사용 가능`을 선언해야 함.

- 중 우선순위 이슈(role="link" Space 키) 수정 확인 후 승인 권장.
- G1~G3 게이트 완료 및 브라우저 실연동 확인 필수.

---

*이 보고서는 정적 코드 검토 기준이며, 실제 브라우저 실행·API 실연동은 미검증 영역으로 별도 표시함.*
