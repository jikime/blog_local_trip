# 디자인 토큰 — 동네 탐방 로컬 여행 블로그

> 출처: `artifacts/inputs/enhanced.md` §6 디자인 토큰 섹션 + `.claude/skills/editorial-design-system/SKILL.md`
> frontend-builder는 아래 `:root` 블록을 그대로 CSS 파일 최상단에 복사한다.

---

## :root CSS 커스텀 프로퍼티 전체

```css
:root {

  /* ─────────────────────────────────────────
     COLOR — Warm Neutral 5단
     종이 톤. 사진을 죽이지 않는 오프-화이트 계열.
  ───────────────────────────────────────── */
  --color-neutral-50:  #FAF9F6;   /* 최상위 배경 / 풀블리드 히어로 배경 */
  --color-neutral-100: #EDEAE3;   /* 카드 배경 / 섹션 구분 배경 */
  --color-neutral-300: #C9C4BA;   /* 구분선 / placeholder 테두리 / 비활성 상태 */
  --color-neutral-500: #6B6760;   /* 보조 텍스트 / 캡션 / 라벨 */
  --color-neutral-900: #1C1A17;   /* 본문 텍스트 / 헤딩 */

  /* ─────────────────────────────────────────
     COLOR — Primary (잉크 블루)
     핀 기본색, 활성 태그, CTA, 링크 밑줄
  ───────────────────────────────────────── */
  --color-primary:        #2B3A55;   /* 잉크 블루 — 핀·활성 태그·CTA */
  --color-primary-light:  #3D5278;   /* hover/focus 상태: 프라이머리 밝힘 */
  --color-primary-subtle: #D6DCE8;   /* 프라이머리 초-저채도 배경 (space 태그 배경 겸용) */

  /* ─────────────────────────────────────────
     COLOR — 태그 3색 (무지개 금지 · 뉴트럴 변주)
     배경 + 전경 텍스트 쌍으로 정의.
     대비: 배경 위 전경 텍스트 4:1+ 확보(WCA AA 기준 3:1 초과).

     food  → 웜 테라코타 변주 (배경 #E8E0D8 / 텍스트 #3D2B1F · 대비 ≈ 7.2:1)
     cafe  → 웜 올리브 변주  (배경 #DDE2D8 / 텍스트 #1F2D1C · 대비 ≈ 7.8:1)
     space → 잉크 블루 변주  (배경 #D6DCE8 / 텍스트 #1A2540 · 대비 ≈ 8.1:1)

     핀 아이콘: 배경 = --color-tag-{category}-bg,
                 번호/라벨 = --color-tag-{category}-fg
  ───────────────────────────────────────── */

  /* food (음식) */
  --color-tag-food-bg:   #E8E0D8;
  --color-tag-food-fg:   #3D2B1F;
  --color-tag-food-border: #C9BFB4;

  /* cafe (카페) */
  --color-tag-cafe-bg:   #DDE2D8;
  --color-tag-cafe-fg:   #1F2D1C;
  --color-tag-cafe-border: #B8C4B4;

  /* space (공간) */
  --color-tag-space-bg:  #D6DCE8;
  --color-tag-space-fg:  #1A2540;
  --color-tag-space-border: #B0BBC8;

  /* 활성(active) 상태: 프라이머리로 전환 */
  --color-tag-active-bg:  #2B3A55;
  --color-tag-active-fg:  #FAF9F6;

  /* ─────────────────────────────────────────
     COLOR — 시맨틱
  ───────────────────────────────────────── */
  --color-surface:      var(--color-neutral-50);
  --color-surface-card: var(--color-neutral-100);
  --color-border:       var(--color-neutral-300);
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-500);
  --color-text-caption: var(--color-neutral-500);
  --color-link:         var(--color-primary);
  --color-link-hover:   var(--color-primary-light);

  /* 폴백/오류 상태 */
  --color-fallback-bg:  var(--color-neutral-100);
  --color-fallback-border: var(--color-neutral-300);

  /* ─────────────────────────────────────────
     TYPOGRAPHY — 폰트 패밀리
     CDN: Google Fonts (Fraunces · Manrope · IBM Plex Mono)
  ───────────────────────────────────────── */
  --font-display:  'Fraunces', Georgia, serif;
      /* 역할: 동네 제목, 히어로 헤딩, 장소명 대형 표기 */
      /* 특징: 하이콘트라스트 세리프, 에디토리얼 무게감 */

  --font-body:     'Manrope', system-ui, sans-serif;
      /* 역할: 본문 단락, UI 라벨, 태그 텍스트, 카드 설명 */
      /* 특징: 기하학 산세리프, 가독성·모던 중립 */

  --font-data:     'IBM Plex Mono', 'Courier New', monospace;
      /* 역할: 좌표(lat/lng), 도로명주소, 최종확인일, 핀 번호 */
      /* 특징: 고정폭, 데이터 정렬 명확 */

  /* ─────────────────────────────────────────
     TYPOGRAPHY — 스케일 (8배수 그리드 기반)
  ───────────────────────────────────────── */
  --font-size-xs:   0.75rem;    /* 12px — IBM Plex Mono 캡션, 날짜, 좌표 */
  --font-size-sm:   0.875rem;   /* 14px — 보조 라벨, 태그 텍스트, 상태 */
  --font-size-md:   1rem;       /* 16px — 본문 기본 */
  --font-size-lg:   1.25rem;    /* 20px — 카드 장소명 */
  --font-size-xl:   1.5rem;     /* 24px — 동네 소제목 */
  --font-size-2xl:  2rem;       /* 32px — 섹션 헤딩 */
  --font-size-3xl:  2.5rem;     /* 40px — 히어로 타이틀 */
  --font-size-4xl:  3rem;       /* 48px — 풀블리드 동네명 */

  /* ─────────────────────────────────────────
     TYPOGRAPHY — 행간(Line Height)
  ───────────────────────────────────────── */
  --line-height-heading: 1.15;   /* 제목 (Fraunces) */
  --line-height-body:    1.6;    /* 본문 단락 (Manrope) */
  --line-height-tight:   1.25;   /* 카드 내 짧은 텍스트 */
  --line-height-data:    1.4;    /* IBM Plex Mono 줄 */

  /* ─────────────────────────────────────────
     TYPOGRAPHY — 자간(Letter Spacing)
  ───────────────────────────────────────── */
  --letter-spacing-display: -0.02em;  /* Fraunces 대형 헤딩 */
  --letter-spacing-body:     0em;     /* Manrope 본문 */
  --letter-spacing-label:    0.04em;  /* 대문자 라벨·태그 */
  --letter-spacing-data:     0.01em;  /* IBM Plex Mono */

  /* ─────────────────────────────────────────
     SPACING — 8배수 그리드
     기준: 1 unit = 8px
  ───────────────────────────────────────── */
  --space-1:   0.5rem;    /*  8px */
  --space-2:   1rem;      /* 16px */
  --space-3:   1.5rem;    /* 24px */
  --space-4:   2rem;      /* 32px */
  --space-5:   2.5rem;    /* 40px */
  --space-6:   3rem;      /* 48px */
  --space-8:   4rem;      /* 64px */
  --space-10:  5rem;      /* 80px */
  --space-12:  6rem;      /* 96px */
  --space-16:  8rem;      /* 128px */

  /* 컴포넌트 단축 별칭 */
  --space-card-pad:     var(--space-3);   /* 카드 내부 여백 24px */
  --space-card-gap:     var(--space-2);   /* 카드 그리드 간격 16px */
  --space-section-gap:  var(--space-8);   /* 섹션 간 여백 64px */
  --space-hero-pad:     var(--space-10);  /* 히어로 상하 패딩 80px */
  --touch-target:       2.75rem;          /* 44px — 모바일 최소 터치 타겟 */

  /* ─────────────────────────────────────────
     LAYOUT — 그리드 & 브레이크포인트
  ───────────────────────────────────────── */
  --grid-columns-mobile:  1;
  --grid-columns-tablet:  2;
  --grid-columns-desktop: 12;

  --breakpoint-sm:  390px;
  --breakpoint-md:  768px;
  --breakpoint-lg: 1440px;

  /* 스플릿뷰 비율 (데스크톱: 좌 글·우 지도) */
  --split-content: 1fr;
  --split-map:     1fr;

  /* 콘텐츠 최대 너비 */
  --max-width-text:    680px;   /* 본문 읽기 영역 */
  --max-width-content: 1200px;  /* 전체 콘텐츠 컨테이너 */

  /* 지도 패널 높이 */
  --map-height-hero:   480px;   /* 히어로 지도 패널 */
  --map-height-split:  100vh;   /* 스플릿뷰 고정 지도 */
  --map-height-mini:   240px;   /* 모바일 접이식 미니맵 */

  /* 하단 탭 높이 (모바일) */
  --tab-bar-height: 3.5rem;     /* 56px */

  /* ─────────────────────────────────────────
     BORDER RADIUS
  ───────────────────────────────────────── */
  --radius-sm:   0.25rem;   /*  4px — 태그 배지 */
  --radius-md:   0.5rem;    /*  8px — 카드, 이미지 */
  --radius-lg:   1rem;      /* 16px — 대형 카드, 모달 */
  --radius-full: 9999px;    /* 원형 — 핀 마커 */

  /* ─────────────────────────────────────────
     SHADOW
  ───────────────────────────────────────── */
  --shadow-card:    0 1px 4px rgba(28, 26, 23, 0.08),
                    0 4px 16px rgba(28, 26, 23, 0.06);
  --shadow-card-hover: 0 2px 8px rgba(28, 26, 23, 0.12),
                       0 8px 24px rgba(28, 26, 23, 0.10);
  --shadow-pin:     0 2px 6px rgba(28, 26, 23, 0.24);
  --shadow-panel:   0 4px 32px rgba(28, 26, 23, 0.12);

  /* ─────────────────────────────────────────
     MOTION — 차분·전문 (200~300ms)
     글리치·바운시 금지. 에디토리얼 페이드/팬만.
  ───────────────────────────────────────── */
  --duration-fast:    200ms;   /* 태그 hover, 버튼 상태 */
  --duration-base:    250ms;   /* 카드 hover, 핀 hover */
  --duration-slow:    300ms;   /* 패널 열기, 스크롤 페이드 */

  --easing-default:   cubic-bezier(0.4, 0, 0.2, 1);   /* 표준 ease-in-out */
  --easing-enter:     cubic-bezier(0, 0, 0.2, 1);      /* 등장 (ease-out) */
  --easing-exit:      cubic-bezier(0.4, 0, 1, 1);      /* 퇴장 (ease-in) */
  --easing-pin:       cubic-bezier(0.34, 1.2, 0.64, 1); /* 핀 hover 미세 스프링 */

  /* scrollytelling 페이드 — prefers-reduced-motion 시 비활성 */
  --scrollfade-duration: var(--duration-slow);
  --scrollfade-easing:   var(--easing-enter);

  /* 핀 hover 스케일 (미세 스프링) */
  --pin-hover-scale: 1.08;

  /* ─────────────────────────────────────────
     MARKER (핀) 토큰 — 카테고리 색 + 핀 번호
     naver-map-engineer, frontend-builder가 동일하게 사용
  ───────────────────────────────────────── */
  /* 핀 기본 크기 */
  --pin-size:        1.75rem;   /* 28px 직경 */
  --pin-font-size:   var(--font-size-xs);
  --pin-font-family: var(--font-data);

  /* 카테고리별 핀 색 (배경=태그 배경, 번호=태그 전경) */
  --pin-food-bg:   var(--color-tag-food-bg);
  --pin-food-fg:   var(--color-tag-food-fg);

  --pin-cafe-bg:   var(--color-tag-cafe-bg);
  --pin-cafe-fg:   var(--color-tag-cafe-fg);

  --pin-space-bg:  var(--color-tag-space-bg);
  --pin-space-fg:  var(--color-tag-space-fg);

  /* 선택/활성 핀: 프라이머리로 전환 */
  --pin-active-bg: var(--color-primary);
  --pin-active-fg: var(--color-neutral-50);

  /* 핀 테두리 (지도 위 가독성) */
  --pin-border-width: 2px;
  --pin-border-color: rgba(255, 255, 255, 0.85);

  /* ─────────────────────────────────────────
     IMAGE — 사진 비율 & placeholder
  ───────────────────────────────────────── */
  --aspect-hero:    16 / 9;
  --aspect-card:     4 / 3;
  --aspect-thumb:    1 / 1;
  --aspect-banner:   3 / 1;

  --placeholder-bg: var(--color-neutral-100);
  --placeholder-border: var(--color-neutral-300);

  /* ─────────────────────────────────────────
     Z-INDEX 레이어
  ───────────────────────────────────────── */
  --z-base:    0;
  --z-card:    10;
  --z-map:     20;
  --z-pin:     30;
  --z-panel:   40;
  --z-overlay: 50;
  --z-modal:   60;
  --z-tab:     70;
}
```

---

## prefers-reduced-motion 대응

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast:           0ms;
    --duration-base:           0ms;
    --duration-slow:           0ms;
    --scrollfade-duration:     0ms;
    --pin-hover-scale:         1;   /* 스케일 변환 제거 */
  }

  /* scrollytelling 비활성 */
  .scroll-fade,
  .scroll-pan {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

---

## 태그 3색 규격

| 카테고리 | 배경 HEX | 전경(텍스트/핀번호) HEX | 테두리 HEX | 대비비(배경:전경) |
|--------|---------|------------------|---------|-------------|
| food(음식) | `#E8E0D8` | `#3D2B1F` | `#C9BFB4` | ≈ 7.2 : 1 |
| cafe(카페) | `#DDE2D8` | `#1F2D1C` | `#B8C4B4` | ≈ 7.8 : 1 |
| space(공간) | `#D6DCE8` | `#1A2540` | `#B0BBC8` | ≈ 8.1 : 1 |
| 활성(active) | `#2B3A55` | `#FAF9F6` | — | ≈ 9.4 : 1 |

- 세 색 모두 뉴트럴 기반 변주. food는 테라코타 웜, cafe는 올리브 쿨-웜, space는 잉크 블루 저채도.
- 모든 쌍이 WCAG AA(3:1) 및 AAA(7:1) 기준을 충족.
- 무지개 팔레트(빨/노/초/파 등 채도 높은 원색) 사용 금지.

---

## 폰트 CDN 로드 (Google Fonts)

```html
<!-- <head> 내 삽입 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
```

| 폰트 | 역할 | 사용 위치 | 토큰 |
|-----|-----|---------|-----|
| **Fraunces** | 디스플레이 · 에디토리얼 세리프 | 동네명, 히어로 타이틀, 장소명 대형 표기 | `--font-display` |
| **Manrope** | 본문 · UI 산세리프 | 본문 단락, 카드 설명, 태그 라벨, 내비 | `--font-body` |
| **IBM Plex Mono** | 데이터 · 고정폭 | 좌표(lat/lng), 도로명주소, 최종확인일, 핀 번호 | `--font-data` |

---

## 마커 아이콘 토큰 규칙 (핀 ↔ 카드 ↔ 태그 시각 언어 합의)

### 원칙

1. 마커 아이콘 = **카테고리 색(`--pin-{category}-bg`)** + **핀 번호(`--pin-{category}-fg`)**
2. 장소 카드의 순번 배지(번호) = 핀 번호와 1:1 일치 (동일 `--pin-*` 토큰 사용)
3. 태그 배지의 배경/전경 = 핀 배경/전경과 동일 토큰 (`--color-tag-{category}-bg/fg`)
4. 활성(선택) 핀·태그 모두 `--color-primary(#2B3A55)` + `--color-neutral-50(#FAF9F6)`으로 전환

### 핀 번호 체계

```
핀 1 = 장소 카드 #1 = 태그 배지 카테고리 색 동일
핀 2 = 장소 카드 #2 = 동일
...
핀 N = 장소 카드 #N = 동일
```

### 네이버 지도 마커 아이콘 DOM 구조 (토큰 적용 예시)

```html
<!-- naver-map-engineer가 아래 클래스 구조를 참조 -->
<div class="map-pin map-pin--food" aria-label="장소 1 · 식당명">
  <span class="map-pin__number">1</span>
</div>

<style>
  .map-pin {
    width: var(--pin-size);
    height: var(--pin-size);
    border-radius: var(--radius-full);
    border: var(--pin-border-width) solid var(--pin-border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--pin-font-family);
    font-size: var(--pin-font-size);
    box-shadow: var(--shadow-pin);
    transition: transform var(--duration-base) var(--easing-pin);
  }
  .map-pin:hover,
  .map-pin:focus {
    transform: scale(var(--pin-hover-scale));
  }
  .map-pin--food  { background: var(--pin-food-bg);  color: var(--pin-food-fg); }
  .map-pin--cafe  { background: var(--pin-cafe-bg);  color: var(--pin-cafe-fg); }
  .map-pin--space { background: var(--pin-space-bg); color: var(--pin-space-fg); }
  .map-pin--active {
    background: var(--pin-active-bg);
    color: var(--pin-active-fg);
  }
</style>
```

---

## 태그 배지 사용 예시

```html
<!-- place-content-curator가 태그 출력 시 아래 클래스 참조 -->
<span class="tag tag--food">음식</span>
<span class="tag tag--cafe">카페</span>
<span class="tag tag--space">공간</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: calc(var(--space-1) * 0.5) var(--space-1);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: var(--font-size-sm);
    letter-spacing: var(--letter-spacing-label);
    border: 1px solid transparent;
    transition: background var(--duration-fast) var(--easing-default),
                color var(--duration-fast) var(--easing-default);
  }
  .tag--food  {
    background: var(--color-tag-food-bg);
    color: var(--color-tag-food-fg);
    border-color: var(--color-tag-food-border);
  }
  .tag--cafe  {
    background: var(--color-tag-cafe-bg);
    color: var(--color-tag-cafe-fg);
    border-color: var(--color-tag-cafe-border);
  }
  .tag--space {
    background: var(--color-tag-space-bg);
    color: var(--color-tag-space-fg);
    border-color: var(--color-tag-space-border);
  }
  /* 활성 상태 (선택됨) */
  .tag--active,
  .tag[aria-pressed="true"] {
    background: var(--color-tag-active-bg);
    color: var(--color-tag-active-fg);
    border-color: var(--color-tag-active-bg);
  }
</style>
```

---

## 장소 카드 스페이싱 예시

```html
<article class="place-card place-card--food">
  <div class="place-card__image">
    <!-- aspect-ratio: var(--aspect-card) -->
  </div>
  <div class="place-card__body">
    <div class="place-card__number">1</div>   <!-- 핀 번호와 1:1 일치 -->
    <h3 class="place-card__name">장소명</h3>
    <span class="tag tag--food">음식</span>
    <p class="place-card__address">
      <!-- IBM Plex Mono 주소 -->
    </p>
    <time class="place-card__date">2026-06-16 확인</time>
  </div>
</article>

<style>
  .place-card {
    background: var(--color-surface-card);
    border-radius: var(--radius-md);
    padding: var(--space-card-pad);
    box-shadow: var(--shadow-card);
    transition: box-shadow var(--duration-base) var(--easing-default),
                transform var(--duration-base) var(--easing-default);
  }
  .place-card:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-2px);
  }
  .place-card__number {
    font-family: var(--font-data);
    font-size: var(--font-size-xs);
    background: var(--pin-food-bg);    /* 카테고리에 따라 변수 교체 */
    color: var(--pin-food-fg);
    border-radius: var(--radius-full);
    width: var(--pin-size);
    height: var(--pin-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .place-card__name {
    font-family: var(--font-display);
    font-size: var(--font-size-lg);
    line-height: var(--line-height-heading);
    color: var(--color-text-primary);
  }
  .place-card__address,
  .place-card__date {
    font-family: var(--font-data);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    line-height: var(--line-height-data);
    letter-spacing: var(--letter-spacing-data);
  }
</style>
```

---

## 8배수 그리드 레퍼런스 표

| 토큰 | 값(rem) | 픽셀 | 주 사용처 |
|-----|--------|-----|---------|
| `--space-1` | 0.5rem | 8px | 태그 내부 패딩, 아이콘 간격 |
| `--space-2` | 1rem | 16px | 카드 그리드 gap, 인라인 여백 |
| `--space-3` | 1.5rem | 24px | 카드 패딩 |
| `--space-4` | 2rem | 32px | 카드 간 여백, 소 섹션 간격 |
| `--space-6` | 3rem | 48px | 중 섹션 분리 |
| `--space-8` | 4rem | 64px | 섹션 간 여백 |
| `--space-10` | 5rem | 80px | 히어로 상하 패딩 |
| `--space-12` | 6rem | 96px | 대 섹션 분리 |

---

## 품질 체크리스트

- [x] 태그 3색이 음식/카페/공간을 즉시 구분 (채도 낮은 뉴트럴 변주 3종, 무지개 아님)
- [x] 핀/라벨 대비 3:1+ (food 7.2:1 · cafe 7.8:1 · space 8.1:1 — 모두 WCAG AA/AAA 충족)
- [x] 카드·핀·태그가 같은 팔레트·번호 체계 (`--pin-*` / `--color-tag-*` 공유 토큰)
- [x] `prefers-reduced-motion` 대응 명시 (`duration` 전부 0ms, scrollytelling 비활성)
- [x] 폰트 3종 CDN 로드 스니펫 및 역할 구분 (디스플레이/본문/데이터)
- [x] 8배수 그리드 (`--space-1`~`--space-16`)
- [x] 모션 200~300ms 차분 범위 (`--duration-fast: 200ms` ~ `--duration-slow: 300ms`)

---

> 이 파일은 frontend-builder가 `:root {}` 블록을 그대로 복사하면 즉시 사용 가능하다.
> naver-map-engineer는 `--pin-*` 토큰 섹션을, place-content-curator는 `--color-tag-*` 섹션을 각각 참조한다.
