# 네이버 지도 연동 노트 — 성수동 시안

> 작성일: 2026-06-16  
> 대상: frontend-builder (index.html 적용), 운영자(키 발급·URL 등록)  
> 스킬 출처: `.claude/skills/naver-map-integration/SKILL.md`  
> 디자인 토큰 출처: `artifacts/design/design-tokens.md`  
> 장소 데이터 출처: `artifacts/content/places.json` (4개소)

---

## 1. 인증

### 1-1. 스크립트 URL 파라미터

신버전 Maps 키를 발급받은 경우 `ncpKeyId` 파라미터를 사용한다.
구버전 키는 `ncpClientId`를 사용한다. **파라미터 불일치 시 HTTP 400 또는 인증 실패가 발생하므로 발급받은 키 종류를 반드시 확인한다.**

```html
<!-- 신버전 키 (권장) -->
<script
  src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID"
  onerror="window.__NMAP_FAILED=true"
></script>

<!-- 구버전 키일 경우 (ncpKeyId 대신 ncpClientId) -->
<!-- <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID" onerror="window.__NMAP_FAILED=true"></script> -->
```

- `YOUR_CLIENT_ID` 자리에 NCP 콘솔에서 발급한 **Client ID**만 기입한다.
- **Client Secret은 이 스크립트 태그에 절대 포함하지 않는다.** 지도 표시 자체에는 Secret이 불필요하다.

### 1-2. 웹 서비스 URL 등록 (NCP 콘솔)

NCP 콘솔 > Application > 해당 앱 > 서비스 환경 > 웹 서비스 URL에 다음을 등록한다.

```
http://localhost:8000
```

- **scheme + host + port 가 페이지 Referer와 정확히 일치해야 한다.** 포트가 다르면(예: 3000, 5500) 인증이 거부된다.
- 포트를 변경했다면 그에 맞는 출처를 NCP 콘솔에 다시 등록한다.
- 외부 배포 주소(예: `https://example.com`)는 별도로 추가 등록한다 — 이번 작업 범위 밖.

### 1-3. Client Secret 규칙

| 용도 | Client ID | Client Secret |
|------|-----------|---------------|
| 지도 스크립트 로드 | 필요 (`ncpKeyId`) | 불필요, 포함 금지 |
| 지오코딩 REST API (로컬 1회) | 필요 (환경변수) | 필요 (환경변수) |
| 산출물(HTML·JSON) | 포함 금지 | 포함 금지 |

---

## 2. 웹 서버 서빙 (file:// 불가)

`index.html`을 파일 탐색기에서 더블클릭(`file://` 열기)하면 Referer가 없어 **무조건 인증 실패**한다.
반드시 정적 웹 서버를 통해 `http://localhost:XXXX`로 열어야 한다.

```bash
# 방법 A — Python (추가 설치 불필요)
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 으로 접근

# 방법 B — Node.js serve
npx serve .
# 터미널에 출력된 포트를 확인 후 그 포트를 NCP 콘솔에 등록
```

> 서버 서빙과 키 발급·URL 등록은 사용자가 직접 수행한다(게이트 G1~G3 참조).

---

## 3. 커스텀 마커 (디자인 토큰 적용)

### 3-1. 핀 색상 토큰

`artifacts/design/design-tokens.md`의 `--pin-*` 토큰을 그대로 사용한다.

| 카테고리 | 배경 토큰 | 전경 토큰 | 배경 HEX | 전경 HEX |
|---------|----------|----------|---------|---------|
| food (음식) | `--pin-food-bg` → `--color-tag-food-bg` | `--pin-food-fg` → `--color-tag-food-fg` | `#E8E0D8` | `#3D2B1F` |
| cafe (카페) | `--pin-cafe-bg` → `--color-tag-cafe-bg` | `--pin-cafe-fg` → `--color-tag-cafe-fg` | `#DDE2D8` | `#1F2D1C` |
| space (공간) | `--pin-space-bg` → `--color-tag-space-bg` | `--pin-space-fg` → `--color-tag-space-fg` | `#D6DCE8` | `#1A2540` |
| active (선택) | `--pin-active-bg` → `--color-primary` | `--pin-active-fg` → `--color-neutral-50` | `#2B3A55` | `#FAF9F6` |

핀 크기: `--pin-size: 1.75rem (28px)`, 폰트: `--pin-font-family` (IBM Plex Mono), 폰트 크기: `--pin-font-size` (0.75rem)

### 3-2. 핀 번호 체계

장소 카드의 `pinNo`와 지도 핀 번호가 1:1 일치해야 한다.

| pinNo | 장소명 | 카테고리 |
|-------|--------|---------|
| 1 | 헤비스테이크 | food |
| 2 | 난포 | food |
| 3 | 대림창고 | cafe |
| 4 | 언더스탠드에비뉴 | space |

### 3-3. 마커 아이콘 CSS + 생성 코드

`<head>` 안에 디자인 토큰 `:root` 블록을 포함한 CSS 파일 또는 `<style>` 태그가 있어야 한다.

```css
/* 핀 마커 스타일 — design-tokens.md :root 블록이 로드된 후 적용 */
.map-pin {
  width: var(--pin-size, 28px);
  height: var(--pin-size, 28px);
  border-radius: var(--radius-full, 9999px);
  border: var(--pin-border-width, 2px) solid var(--pin-border-color, rgba(255,255,255,0.85));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--pin-font-family, 'IBM Plex Mono', monospace);
  font-size: var(--pin-font-size, 0.75rem);
  box-shadow: var(--shadow-pin, 0 2px 6px rgba(28,26,23,0.24));
  cursor: pointer;
  transition: transform var(--duration-base, 250ms) var(--easing-pin, cubic-bezier(0.34,1.2,0.64,1));
  user-select: none;
}
.map-pin:hover,
.map-pin:focus {
  transform: scale(var(--pin-hover-scale, 1.08));
  outline: none;
}
.map-pin--food  { background: var(--pin-food-bg, #E8E0D8);  color: var(--pin-food-fg, #3D2B1F); }
.map-pin--cafe  { background: var(--pin-cafe-bg, #DDE2D8);  color: var(--pin-cafe-fg, #1F2D1C); }
.map-pin--space { background: var(--pin-space-bg, #D6DCE8); color: var(--pin-space-fg, #1A2540); }
.map-pin--active {
  background: var(--pin-active-bg, #2B3A55);
  color: var(--pin-active-fg, #FAF9F6);
}

@media (prefers-reduced-motion: reduce) {
  .map-pin { transition: none; }
  .map-pin:hover, .map-pin:focus { transform: none; }
}
```

```js
/**
 * 마커 아이콘 DOM 요소 생성 함수
 * @param {object} place - { pinNo, category, name }
 * @returns {string} HTML 문자열 (naver.maps.Marker icon.content에 전달)
 */
function createPinContent(place) {
  return `<div
    class="map-pin map-pin--${place.category}"
    role="img"
    aria-label="${place.pinNo}번 장소 · ${place.name}"
    tabindex="0"
  >${place.pinNo}</div>`;
}
```

---

## 4. fitBounds 프레이밍

동네 지도에서 마커 4개가 모두 보이도록 `fitBounds`로 자동 프레이밍한다.
모든 장소 좌표를 담은 `LatLngBounds`를 생성해 지도에 적용한다. 패딩 값은 핀이 지도 가장자리에 걸리지 않도록 최소 50px를 권장한다.

```js
const bounds = new naver.maps.LatLngBounds();
PLACES.forEach((p) => {
  bounds.extend(new naver.maps.LatLng(p.lat, p.lng));
});
// 패딩 옵션으로 핀이 가장자리에 잘리지 않게 한다
map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
```

- 좌표 데이터(`lat`, `lng`)는 `geocode.mjs` 1회 실행 후 `artifacts/final/data/places.json`에서 읽는다.
- 좌표가 성수동 중심(위도 약 37.54~37.56, 경도 약 127.04~127.07)에서 과도하게 벗어나면 주소 오매핑이므로 place-content-curator에 실주소 교체를 요청한다.

---

## 5. 완전한 지도 초기화 코드 (index.html 발췌)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <!-- 디자인 토큰 CSS (design-tokens.md :root 블록 포함 파일) -->
  <link rel="stylesheet" href="css/tokens.css">
  <!-- 마커 핀 스타일 (위 섹션 3-3 CSS 포함 파일 또는 인라인) -->
  <link rel="stylesheet" href="css/map-pins.css">

  <!-- 네이버 지도 SDK — 신버전 키: ncpKeyId, 구버전 키: ncpClientId -->
  <script
    src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID"
    onerror="window.__NMAP_FAILED = true"
  ></script>
</head>
<body>

  <!-- 지도 컨테이너 -->
  <div id="map-container">
    <div
      id="map"
      style="width:100%; height:var(--map-height-hero, 480px);"
      aria-label="성수동 장소 지도"
      role="application"
    ></div>

    <!-- 폴백 박스: 지도 로드·인증 실패 시 표시 (기본 숨김) -->
    <div
      id="map-fallback"
      role="region"
      aria-label="지도를 불러올 수 없는 경우 장소 목록"
      hidden
    >
      <p class="map-fallback__notice">
        지도를 불러오지 못했습니다. 아래 장소 목록에서 주소를 확인하세요.
      </p>
      <ol class="map-fallback__list" id="fallback-place-list">
        <!-- showFallback()이 동적으로 채움 -->
      </ol>
    </div>
  </div>

  <script>
    // --- 장소 데이터 (geocode.mjs 실행 후 artifacts/final/data/places.json을 인라인 또는 fetch) ---
    // 아래는 geocode.mjs 실행 전 구조 예시. lat/lng는 실행 후 채워진 값으로 교체한다.
    const PLACES = [
      { pinNo: 1, name: "헤비스테이크",      category: "food",  address: "서울 성동구 연무장길 38",       lat: null, lng: null },
      { pinNo: 2, name: "난포",              category: "food",  address: "서울 성동구 서울숲4길 18-8",    lat: null, lng: null },
      { pinNo: 3, name: "대림창고",          category: "cafe",  address: "서울 성동구 성수이로 78",       lat: null, lng: null },
      { pinNo: 4, name: "언더스탠드에비뉴",  category: "space", address: "서울 성동구 왕십리로 63",       lat: null, lng: null },
    ];

    // --- 폴백: 핀 리스트 동등 텍스트 ---
    function showFallback() {
      const mapEl = document.getElementById('map');
      const fallbackEl = document.getElementById('map-fallback');
      const listEl = document.getElementById('fallback-place-list');

      if (mapEl) mapEl.hidden = true;
      if (fallbackEl) fallbackEl.hidden = false;

      if (listEl && PLACES.length > 0) {
        listEl.innerHTML = PLACES.map((p) => `
          <li class="map-fallback__item">
            <span class="map-fallback__pin map-pin--${p.category}" aria-hidden="true">${p.pinNo}</span>
            <span class="map-fallback__name">${p.name}</span>
            <span class="map-fallback__address">${p.address}</span>
          </li>
        `).join('');
      }
    }

    // --- 인증 실패 콜백 (네이버 SDK가 직접 호출) ---
    window.navermap_authFailure = function () {
      window.__NMAP_FAILED = true;
      console.error('[NaverMap] 인증 실패. NCP 콘솔에서 웹 서비스 URL과 키 종류를 확인하세요.');
      showFallback();
    };

    // --- 마커 아이콘 콘텐츠 생성 ---
    function createPinContent(place) {
      return `<div
        class="map-pin map-pin--${place.category}"
        role="img"
        aria-label="${place.pinNo}번 장소 · ${place.name}"
        tabindex="0"
      >${place.pinNo}</div>`;
    }

    // --- 지도 초기화 ---
    function initMap() {
      // SDK 로드 실패 or 인증 실패 확인
      if (window.__NMAP_FAILED || !window.naver || !window.naver.maps) {
        console.warn('[NaverMap] SDK를 불러오지 못했습니다. 폴백 목록을 표시합니다.');
        return showFallback();
      }

      // 좌표 누락 확인 (geocode.mjs 미실행 상태 감지)
      const missingCoords = PLACES.filter((p) => p.lat === null || p.lng === null);
      if (missingCoords.length > 0) {
        console.warn('[NaverMap] 좌표가 없는 장소가 있습니다. geocode.mjs를 먼저 실행하세요:', missingCoords.map((p) => p.name));
        return showFallback();
      }

      const map = new naver.maps.Map('map', {
        zoom: 16,
        mapTypeId: naver.maps.MapTypeId.NORMAL,
      });

      const bounds = new naver.maps.LatLngBounds();

      PLACES.forEach((place) => {
        const position = new naver.maps.LatLng(place.lat, place.lng);

        const marker = new naver.maps.Marker({
          position,
          map,
          icon: {
            content: createPinContent(place),
            anchor: new naver.maps.Point(14, 14), // 핀 중앙 기준 (28px / 2)
          },
          title: place.name,
        });

        // 마커 클릭 시 해당 장소 카드로 스크롤 (frontend-builder가 카드 id 설정 필요)
        naver.maps.Event.addListener(marker, 'click', () => {
          const cardEl = document.getElementById(`place-card-${place.pinNo}`);
          if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        bounds.extend(position);
      });

      // 전체 마커가 보이도록 자동 프레이밍
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }

    // DOMContentLoaded 이후 SDK가 로드될 시간을 확보하기 위해 load 이벤트 사용
    window.addEventListener('load', initMap);
  </script>

</body>
</html>
```

---

## 6. 인증·로드 실패 폴백 동작 정리

| 실패 원인 | 감지 방법 | 폴백 동작 |
|----------|---------|----------|
| SDK 스크립트 로드 실패 (네트워크 오류, CDN 장애) | `<script onerror>` → `window.__NMAP_FAILED = true` | `initMap()` 진입 시 감지 → `showFallback()` |
| 인증 실패 (키 불일치, URL 미등록, file:// 열기) | SDK가 `window.navermap_authFailure()` 호출 | `window.__NMAP_FAILED = true` 후 `showFallback()` |
| 좌표 누락 (geocode.mjs 미실행) | `PLACES` 내 `lat/lng === null` 검사 | `showFallback()` |

**폴백 UI 내용**: `#map-fallback` 박스에 4개 장소의 핀 번호·이름·주소를 순서 목록으로 표시한다. 지도가 없어도 모든 장소 정보에 접근할 수 있어야 한다(동등 텍스트 경로).

---

## 7. 사용자 작업 게이트 (G1~G3)

아래 세 단계는 자동화할 수 없으므로 사용자가 직접 수행해야 한다.

### G1 — NCP 콘솔 앱 생성 및 키 발급

- [ ] [NCP 콘솔](https://console.ncloud.com/)에 로그인한다.
- [ ] Application > + Create Application 에서 새 앱을 생성한다.
- [ ] Maps > Web Dynamic Map 서비스를 활성화한다.
- [ ] 생성된 **Client ID**를 복사한다 (신버전 키: `ncpKeyId` 파라미터에 사용).
- [ ] **Client Secret**은 `geocode.mjs` 실행 시 환경변수로만 사용한다 (산출물에 절대 기입 금지).
- [ ] `index.html`의 `YOUR_CLIENT_ID` 자리에 발급받은 Client ID를 기입한다.
  - 신버전 키: `ncpKeyId=발급받은_CLIENT_ID`
  - 구버전 키: `ncpClientId=발급받은_CLIENT_ID`

### G2 — 웹 서비스 URL 등록 및 서버 서빙 확인

- [ ] NCP 콘솔 > 해당 앱 > 서비스 환경 > 웹 서비스 URL에 `http://localhost:8000` 을 추가한다.
- [ ] 터미널에서 `index.html`이 있는 디렉토리로 이동 후 정적 서버를 시작한다.
  ```bash
  python3 -m http.server 8000
  # 또는
  npx serve .
  ```
- [ ] 브라우저에서 `http://localhost:8000`(또는 서버가 안내한 포트)으로 접근한다.
- [ ] 개발자 도구(F12) > Network 탭에서 `maps.js` 응답이 200이고 Console에 인증 오류가 없음을 확인한다.

### G3 — geocode.mjs 실행 및 좌표 반영

- [ ] 터미널에 환경변수를 설정한다.
  ```bash
  export NAVER_MAP_CLIENT_ID="발급받은_CLIENT_ID"
  export NAVER_MAP_CLIENT_SECRET="발급받은_CLIENT_SECRET"
  ```
- [ ] `artifacts/final/scripts/geocode.mjs`를 실행한다.
  ```bash
  node /Users/jikime/Dev/Business/Lectures/DavacoDan/Sample5/artifacts/final/scripts/geocode.mjs
  ```
- [ ] `artifacts/final/data/places.json`이 생성되고 4개 장소 모두 `lat`, `lng` 값이 채워졌는지 확인한다.
- [ ] 좌표가 성수동 범위(위도 37.54~37.56, 경도 127.04~127.07)에 있는지 검토한다. 범위를 벗어난 장소가 있으면 place-content-curator에 실주소 교체를 요청한다.
- [ ] `index.html`의 `PLACES` 배열을 생성된 `places.json` 데이터로 교체하거나, `fetch('./data/places.json')`으로 로드하도록 수정한다.

---

## 8. 품질 체크리스트

- [ ] 스크립트 URL 파라미터가 발급 키 종류와 일치 (`ncpKeyId` 신버전 / `ncpClientId` 구버전)
- [ ] NCP 콘솔에 `http://localhost:8000` 웹 서비스 URL 등록 완료
- [ ] `file://`가 아닌 `http://localhost:XXXX`로 서빙 확인
- [ ] `navermap_authFailure` 콜백과 `<script onerror>` 두 경로 모두 폴백 연결
- [ ] 폴백(핀 리스트) 박스가 지도 없이도 4개 장소 정보를 표시
- [ ] 커스텀 핀이 `--pin-{category}-bg/fg` 토큰 색과 일치 (food/cafe/space 3색)
- [ ] 핀 번호가 장소 카드 번호와 1:1 일치 (1 헤비스테이크 · 2 난포 · 3 대림창고 · 4 언더스탠드에비뉴)
- [ ] `fitBounds` 적용으로 전체 4개 마커가 초기 화면에 포함
- [ ] `geocode.mjs` 및 모든 산출물에 Client Secret 미포함
- [ ] `prefers-reduced-motion` 시 핀 hover 트랜지션 비활성 (CSS media query)
