동네 탐방 로컬 여행 블로그 (지도 scrollytelling)

## 1. Executive Summary

도시를 **동네 단위로 쪼개 직접 걸으며 기록한 느낌**을 한 페이지 안에서 보여주는 로컬 여행 블로그. 지도형 레이아웃·장소 카드·사진 그리드·태그 색상·에디토리얼 타이포그래피를 핵심으로 하되, **지도는 네이버 지도(Web Dynamic Map)로 실제 좌표에 장소 핀을 찍어** 보여준다. 공개 산출물은 **단일 정적 `index.html`**(HTML/CSS/바닐라 JS)이며, 네이버 지도 인증 때문에 `file://`가 아니라 **간단한 웹 서버로 서빙**한다. (검색·저장·제보는 여전히 UI mock 범위.)

---

## 2. Background & Context

- 멀리 떠날 시간·돈이 부족한 도시 직장인의 **마이크로 트래블** 수요 + 알고리즘이 아닌 사람이 큐레이션한 시선에 대한 신뢰 수요가 겹친다.
- 이번 산출물은 실제 지도 연동보다 **동네 탐방 서비스가 어떤 화면 언어를 가져야 하는지**를 보여주는 비교용 UI 시안이다.
- 우수사례 리서치(출처): **On the Grid** / **Neighborhood Guide** / **My Helsinki** / **MapTrotting** / **mapme·Proxi**. 참고 대상은 기능 구현보다 동네 단위 정보 구조, 장소 카드 밀도, 지도-글 병렬 레이아웃, 에디토리얼 사진 운용이다.
- 지도는 **네이버 지도(Naver Maps Web Dynamic Map)** 로 실제 좌표에 장소 핀을 표시한다(Mapbox/Google 대신 네이버). 핀 리스트와 장소 카드는 지도의 **동등 텍스트 경로**로 함께 제공해, 지도 로드·인증 실패 시에도 모든 장소 정보에 접근할 수 있게 한다.

---

## 3. Objectives & Success Metrics

**Goals**
1. 지도형 패널과 글 영역이 나란히 보이는 에디토리얼 레이아웃을 구현한다.
2. 핀, 장소 카드, 태그, 사진 캡션이 같은 시각 언어로 연결되게 만든다.
3. 단일 페이지 안에서 City→Neighborhood→Place→Article 계층을 섹션·카드·시각 그룹으로 압축한다.
4. 음식/카페/공간 태그가 컬러 팔레트와 배지 스타일로 명확히 구분되게 한다.
5. **네이버 지도(Web Dynamic Map)** 에 실제 좌표 핀을 표시하고, 핀·장소 카드·태그·사진 캡션이 같은 시각 언어로 연결되게 한다.

**Non-Goals**
1. **길찾기·경로 계산·실시간 교통·내비게이션** — 지도는 위치 표시(마커)와 동네 프레이밍까지. 경로/Directions API는 범위 밖. (지도 표시·좌표 지오코딩은 이제 In-Scope.)
2. **실시간 예약/결제·테이블 부킹** — 콘텐츠 제품 범위 밖.
3. **검색·저장·제보·UGC 기능** — 이번 시안에서는 버튼과 패널 모형만 제공한다.

**Success Metrics**
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| 첫 화면 인지 | — | 5초 내 도시/동네/탐방 톤 파악 | 사용자 3명 이상 육안 리뷰 |
| 지도-글 관계성 | — | 지도 패널과 장소 카드 연결이 명확 | 핀 번호/카드 번호/색상 매칭 점검 |
| 태그 가독성 | — | 음식/카페/공간 구분 즉시 가능 | 색상·아이콘·라벨 리뷰 |
| 반응형 안정성 | — | 모바일/데스크톱에서 겹침 없음 | 390px, 768px, 1440px 뷰포트 확인 |
| 사진/카드 밀도 | — | 한 화면에 과밀하지 않음 | 섹션별 카드 수와 여백 점검 |

보조: 컬러 대비, 카드 간격, 모바일 텍스트 줄바꿈, 지도 패널 가독성.

---

## 4. Target Users & Segments

| 페르소나 | 한 줄 | 핵심 JTBD |
|---|---|---|
| **P1 주말 동네 탐험가 (28~38)** | 마이크로 트래블에 빠진 직장인 | 반나절 동네 코스가 어떤 분위기인지 화면만 보고 판단 |
| **P2 감도 높은 큐레이션 소비자 (25~35)** | 사진·톤으로 장소 고르는 미감 중심 | 사진 그리드, 카드 톤, 태그 색상으로 취향에 맞는지 스캔 |
| **P3 여행 전 동네 리서처 (30~45)** | 방문 전 동네 단위 조사 | 동네 단위 비교 구조와 핀 밀도 표현을 빠르게 이해 |

---

## 5. User Stories & Requirements

**P0 — Must Have**
| # | User Story | Acceptance Criteria |
|---|-----------|-------------------|
| 1 | 독자로서 글과 지도가 함께 있는 느낌을 보고 싶다 | 데스크톱 스플릿뷰(좌 글·우 **네이버 지도 패널**); 모바일은 상단 미니 네이버 지도+하단 핀 리스트 |
| 2 | 장소가 지도와 카드에서 연결되어 보이길 원한다 | 핀 번호, 장소 카드 번호, 본문 하이라이트 색상을 일치 |
| 3 | 동네 단위로 탐색·비교하는 구조를 보고 싶다 | 단일 페이지 내 Neighborhood 섹션(인트로+지도 패널+Places 그리드+아티클 요약) |
| 4 | 음식/카페/공간 태그가 명확해야 한다 | 다중 선택 기능 대신 태그 배지의 색상·아이콘·상태 스타일 정의 |
| 5 | 장소 정보 카드가 신뢰감 있게 보여야 한다 | 이름·카테고리·주소·상태·최종확인일을 정적 카드로 표현 |
| 6 | 사진 없이도 레이아웃이 완성되어야 한다 | 이미지 placeholder, aspect-ratio, caption 스타일을 정의 |
| 7 | 모바일에서 현장용 UI처럼 보여야 한다 | 모바일 단일 컬럼; 하단 탭 모형(지도·동네·검색·저장); 44px 터치타겟 |

**P1 — Should Have**
| # | User Story | Acceptance Criteria |
|---|-----------|-------------------|
| 8 | 지도에서 동네 전체를 탐색하는 느낌을 보고 싶다 | Explore 패널 모형: 클러스터 핀, 동네 경계, 태그 필터 UI만 표현 |
| 9 | 검색 UI의 배치와 상태를 보고 싶다 | 통합 검색 오버레이 mock(입력, 추천, empty 상태) |
| 10 | 도보 동선으로 묶인 코스를 보고 싶다 | Walks 섹션을 타임라인/스텝 카드로 정적 표현 |
| 11 | 저장 기능이 있는 것처럼 보여야 한다 | Saved 패널 mock과 북마크 아이콘 상태만 표현 |
| 12 | 공유/검색 이미지를 상상할 수 있어야 한다 | OG 이미지 preview 블록과 장소/동네 anchor 라벨 시각화 |

**P2 — Nice to Have / Future**
| # | User Story | Acceptance Criteria |
|---|-----------|-------------------|
| 13 | 큐레이터가 누군지 보고 싶다 | 기여자 프로필(On the Grid 어트리뷰션) |
| 14 | 폐업 정보를 제보하는 입구가 보이면 좋겠다 | 제보 CTA 카드 mock |
| 15 | 다국어·주변 동네 확장 가능성이 보이면 좋겠다 | 다국어 라벨과 주변 동네 카드 mock |

---

## 6. Solution Overview

**콘텐츠 모델 (시안 기준)**
- **Place 카드 = 시각 단위**: 이름·카테고리·주소·상태·최종확인일·사진 placeholder + **좌표(lat/lng)** 를 가진 카드 컴포넌트. 좌표는 실제 도로명주소를 **네이버 지오코딩**으로 변환해 보유한다(로컬 빌드 단계 스크립트 — 아래 "지도 연동 가이드" 참고). 같은 좌표로 지도 마커를 찍어 카드 ↔ 핀을 1:1로 잇는다.

**단일 페이지 IA**
- 공개 산출물은 **단일 정적 `index.html`**(서빙 루트 `/`) 하나로 제한한다. `explore.html`, `search.html`, `saved.html`, `article.html`, `neighborhood.html` 같은 별도 페이지를 만들지 않는다. (Explore·Search·Saved·Walks는 같은 페이지의 drawer·탭·accordion으로 표현. 좌표를 채우는 빌드 스크립트는 화면이 아니므로 산출물 페이지 수에 포함하지 않는다.)
- 첫 화면: 도시/동네 제목, 대표 지도 패널, 핵심 태그 배지, 추천 동네 카드.
- 본문: 에디토리얼 글과 **네이버 지도 패널** 스플릿뷰를 한 페이지 안에서 제공한다.
- 하단/측면 패널: Explore, Search, Saved, Walks는 실제 기능 없이 탭·drawer·accordion mock으로 표현한다.
- Place 상세는 지도 미니카드 + 본문 내 Place 카드로 시각화한다.

**지도 연동 가이드 (네이버 지도 Web Dynamic Map + 정적 HTML, 웹 서버 필요)**

- 지도는 **네이버 지도 Web Dynamic Map**으로 실제 좌표에 장소 핀을 표시한다(Mapbox/Google 대신 네이버). 동네별 지도는 그 동네 마커들로 `fitBounds` 프레이밍하고, 히어로 개요 지도는 전체 핀을 담는다.
- 핀·경계·클러스터는 "디자인 요소"가 아니라 **실제 마커**다. 다만 마커 아이콘은 디자인 토큰(카테고리 색 + 핀 번호)으로 커스텀해 카드·태그와 시각 언어를 일치시킨다.
- **인증**: 스크립트 URL의 파라미터는 키 종류에 맞춰야 한다 — 신버전 Maps 키는 **`ncpKeyId`**, 구버전 키는 `ncpClientId`(불일치 시 400/인증 실패). NCP 콘솔에 **웹 서비스 URL을 정확히 등록**해야 한다(`http://localhost:8000` 등, scheme+host+port 일치 — 아래 "웹 서버 필요" 참고). **Client Secret은 지도 표시에 쓰지 않으며 산출물에 포함 금지.**
- **지오코딩(주소→좌표)**: 장소의 실제 도로명주소를 **네이버 Geocoding REST**(`https://maps.apigw.ntruss.com/map-geocode/v2/geocode`)로 변환한다. 이 호출은 Secret이 필요하므로 **로컬 빌드 단계 스크립트에서만** 수행하고, 결과 좌표를 정적 데이터(JS 배열/`places.json`)로 구워 넣는다. Secret은 절대 산출물에 포함하지 않는다.
- **접근성/폴백**: 지도가 로드·인증 실패해도 레이아웃이 깨지지 않게 폴백 박스를 두고, **핀 리스트(장소 카드)** 를 지도의 동등 텍스트 경로로 항상 제공한다. `prefers-reduced-motion` 시 scrollytelling 비활성.

네이버 지도 기본 사용 예:

```html
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID"></script>
<div id="map" style="width:100%;height:400px;"></div>
<script>
  const map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.5666, 126.9784),
    zoom: 14,
  });
  new naver.maps.Marker({ position: new naver.maps.LatLng(37.5666, 126.9784), map });
</script>
```

정적 HTML 적용 (단일 `index.html`):

- 산출물은 단일 정적 `index.html` 하나다. 위 예제 패턴을 그대로 넣고 Client ID만 발급 키로 채운다(신버전이면 `ncpKeyId`). 빌드 단계 지오코딩으로 **좌표가 채워진 장소 데이터**(JS 배열/`places.json`)를 함께 두고 마커를 생성한다. 빌드 프레임워크·번들러 없이 바닐라 JS로 충분하다.

```html
<!-- index.html (발췌) -->
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID"
        onerror="window.__NMAP_FAILED=true"></script>
...
<div id="map" style="width:100%;height:400px;"></div>
<script>
  const PLACES = [ /* 빌드 단계 지오코딩으로 lat/lng가 채워진 장소들 */
    { pinNo: 1, category: 'food', name: '...', lat: 37.5655, lng: 126.9217 },
    // ...
  ];
  function initMap() {
    if (window.__NMAP_FAILED || !window.naver?.maps) return showFallback(); // 핀 리스트 폴백
    const map = new naver.maps.Map('map', { zoom: 16 });
    const bounds = new naver.maps.LatLngBounds();
    PLACES.forEach((p) => {
      const pos = new naver.maps.LatLng(p.lat, p.lng);
      new naver.maps.Marker({
        position: pos, map,
        icon: { content: `<div class="pin ${p.category}">${p.pinNo}</div>`,
                anchor: new naver.maps.Point(14, 14) },
      });
      bounds.extend(pos);
    });
    map.fitBounds(bounds); // 동네 마커들로 프레이밍
  }
  window.navermap_authFailure = () => { window.__NMAP_FAILED = true; showFallback(); };
  window.addEventListener('load', initMap);
</script>
```

**웹 서버 필요 (중요)** — `file://`로 열면 인증 실패한다:
- 네이버 지도는 페이지의 출처(Referer)를 콘솔에 등록된 **웹 서비스 URL과 대조**해 인증한다. 따라서 `index.html`을 `file://`로 직접 열면 **무조건 인증 실패**한다. 반드시 **정적 웹 서버로 서빙**해야 한다(백엔드 로직 없이 파일만 제공).
  - `python3 -m http.server 8000` 또는 `npx serve` → `http://localhost:8000` (로컬 전용 — 외부 배포는 범위 밖)
- 띄운 **그 로컬 출처(scheme+host+port)를 NCP 콘솔 웹 서비스 URL에 정확히 등록**한다(예: `http://localhost:8000`). 포트를 바꾸면 그 포트로 다시 등록.

**빌드 단계 지오코딩 (Secret은 로컬 스크립트에서만)** — 정적 사이트엔 서버 런타임이 없다:
- 주소→좌표 변환은 **로컬에서 1회 스크립트**로 돌려 좌표를 `index.html`(또는 `places.json`)에 구워 넣는다. Secret은 이 스크립트에서만(로컬) 쓰고 **산출물에는 포함하지 않는다**(산출물은 Client ID만).

```js
// scripts/geocode.mjs — 로컬에서 1회 실행. 결과 좌표를 데이터에 박는다. (Secret은 로컬에서만)
const ID = process.env.NAVER_MAP_CLIENT_ID, SECRET = process.env.NAVER_MAP_CLIENT_SECRET;
for (const p of PLACES) {
  const u = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=' + encodeURIComponent(p.address);
  const r = await fetch(u, { headers: { 'x-ncp-apigw-api-key-id': ID, 'x-ncp-apigw-api-key': SECRET } });
  const a = (await r.json()).addresses?.[0];
  if (a) { p.lat = +a.y; p.lng = +a.x; }   // 좌표를 데이터에 캐시
}
// → PLACES를 index.html의 <script> 또는 places.json 으로 출력 (Secret 미포함)
```

> 운영 팁: 지오코딩은 매 요청 호출하기보다 **빌드 시 1회 변환해 좌표를 데이터에 캐시**(예: `data/places.json`)하면 런타임 호출·쿼터를 아끼고 마커가 즉시 뜬다. 좌표가 동네 중심에서 과도하게 벗어나면(잘못 매칭) 다른 실주소로 교체한다.

**디자인 토큰 (에디토리얼·차분)**
- **컬러**: 웜 뉴트럴 5단 `#FAF9F6 → #EDEAE3 → #C9C4BA → #6B6760 → #1C1A17`(종이 톤, 사진 안 죽임); 프라이머리 1색 = 잉크 블루 `#2B3A55`(핀·활성 태그·CTA). 태그 3색은 무지개 금지 → 미묘한 뉴트럴 변주. 핀/라벨 3:1+.
- **타이포**: 디스플레이 **Fraunces**(하이콘트라스트 세리프) + 본문 **Manrope** + 데이터성 텍스트(좌표·주소·최종확인일) **IBM Plex Mono**. 본문 행간 1.6, 제목 1.15.
- **레이아웃**: 풀블리드 히어로 + 넉넉한 여백 + 카드 중첩 금지; 데스크톱 스플릿뷰, 모바일 접이식 미니맵; 8배수 그리드.
- **모션**: 차분·전문 200~300ms; 핀 hover 스프링 미세 스케일; scrollytelling은 부드러운 페이드/팬(글리치·바운시 금지). `prefers-reduced-motion` 시 scrollytelling 비활성.

**스택**: **단일 정적 `index.html`(HTML/CSS/바닐라 JS) + 정적 웹 서버.** 지도 = **네이버 지도 Web Dynamic Map**(`maps.js?ncpKeyId=...`), 좌표 = **네이버 Geocoding을 빌드 단계 로컬 스크립트**로 변환(**Client Secret은 빌드 스크립트에서만, 산출물 미포함**). 폰트는 CDN(Fraunces·Manrope·IBM Plex Mono). 빌드 프레임워크·런타임 백엔드·Mapbox GL·Google Places·DB 저장소는 사용하지 않는다. 웹 서버는 **정적 파일 서빙 전용**(네이버 인증 Referer 때문에 `file://` 불가).

---

## 7. Open Questions

| Question | Owner | Deadline |
|----------|-------|----------|
| ~~지도 패널 실제 vs 추상 일러스트~~ → **결정: 네이버 지도(Web Dynamic Map) 실연동** | 작성자/디자인 | ✅ 확정(2026-06-16) |
| 네이버 지도 키를 신버전(`ncpKeyId`)으로 발급하고 **로컬 웹 서비스 URL(`http://localhost:PORT`)** 을 등록했는지 | 프론트엔드/운영 | 구현 착수 전 |
| 사진을 실제 장소 사진으로 쓸지 placeholder로 둘지 | 작성자 | 콘텐츠 준비 시 |
| 태그 팔레트를 뉴트럴하게 둘지 더 컬러풀하게 둘지 | 디자인 | 토큰 확정 시 |
| 카드 밀도를 매거진형으로 낮출지, 가이드형으로 높일지 | 작성자/디자인 | 레이아웃 확정 시 |

---

## 8. Timeline & Phasing

- **Phase 0 (디자인 기반 + 지도 연동 준비)**: 태그 팔레트·카드 레이아웃·사진 비율·타이포 스케일 확정 + **네이버 지도 Client ID(ncpKeyId) 발급·웹 서비스 URL 등록, 장소 실주소→네이버 지오코딩 좌표 파이프라인**(빌드 캐시) 구축.
- **Phase 1 (MVP, P0)**: **단일 정적 `index.html`(정적 웹 서버로 서빙)** + **네이버 지도/글 스플릿뷰(커스텀 마커·동네 `fitBounds`)** + 장소 카드 + 태그 배지 + 반응형 하단 탭 mock + **지도 실패 시 핀 리스트 폴백**.
- **Phase 2 (P1)**: Explore/Search/Saved/Walks 패널 mock + hover/focus/empty 상태 + OG preview 블록.
- **Phase 3 (P2)**: 기여자 프로필 카드 + 제보 CTA mock + 다국어 라벨 시각 처리.

**의존성**: **네이버 지도 Client ID(ncpKeyId)·로컬 웹 서비스 URL 등록**(`http://localhost:PORT`), **로컬 정적 웹 서버**(Referer 인증용, `file://` 불가), 장소 **실주소→네이버 지오코딩 좌표**(로컬 빌드 캐시), 이미지 placeholder, 디자인 토큰이 P0의 선행 조건이다. (Client Secret은 **로컬 빌드 스크립트에서만** 사용하고 산출물에 포함하지 않는다.)
