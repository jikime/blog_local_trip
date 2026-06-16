---
name: naver-map-integration
description: 네이버 지도 Web Dynamic Map을 단일 정적 index.html에 실연동하는 작업 매뉴얼. 키 종류별 인증 파라미터(ncpKeyId vs ncpClientId), 웹서비스 URL 등록, file:// 불가·정적 서버 서빙, 커스텀 마커, fitBounds 프레이밍, 인증/로드 실패 폴백(핀 리스트 동등 텍스트), 빌드 단계 지오코딩(주소→좌표, Secret 로컬 전용)을 다룬다. naver-map-engineer 에이전트가 따른다.
---

# Naver Map Integration

네이버 지도(Web Dynamic Map)를 정적 `index.html`에 실연동하는 매뉴얼. Mapbox/Google 대신 **네이버**를 쓴다.

## 트리거

지도 연동 노트 작성, 마커/폴백 구현 설계, 인증 오류(400/인증 실패) 진단, 지오코딩 스크립트 작성 시.

## 1. 인증 (가장 흔한 실패 지점)

- 스크립트 URL 파라미터는 키 종류에 맞춰야 한다:
  - **신버전 Maps 키 → `ncpKeyId`** (권장)
  - 구버전 키 → `ncpClientId`
  - 불일치 시 400 / 인증 실패.
- NCP 콘솔에 **웹 서비스 URL을 정확히 등록**한다. 페이지 출처(Referer)를 등록 URL과 대조해 인증하므로 **scheme+host+port가 정확히 일치**해야 한다(예: `http://localhost:8000`).
- **Client Secret은 지도 표시에 쓰지 않으며, 산출물에 절대 포함하지 않는다.**

## 2. 웹 서버 필요 (file:// 불가)

`index.html`을 `file://`로 직접 열면 Referer가 없어 **무조건 인증 실패**한다. 정적 웹 서버로 서빙해야 한다(백엔드 로직 없이 파일만 제공).

```
python3 -m http.server 8000      # → http://localhost:8000
# 또는
npx serve                        # 포트 확인 후 그 출처를 NCP에 등록
```

포트를 바꾸면 그 출처를 NCP 콘솔에 다시 등록한다. 외부 배포는 범위 밖(로컬 전용).

## 3. 기본 사용 패턴

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

## 4. 커스텀 마커 + fitBounds + 폴백 (index.html 발췌)

핀/경계/클러스터는 디자인 요소가 아니라 **실제 마커**다. 마커 아이콘만 디자인 토큰(카테고리 색 + 핀 번호)으로 커스텀해 카드·태그와 시각 언어를 맞춘다. 동네 지도는 그 동네 마커들로 `fitBounds`, 히어로 개요 지도는 전체 핀을 담는다.

```html
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID"
        onerror="window.__NMAP_FAILED=true"></script>
<div id="map" style="width:100%;height:400px;"></div>
<script>
  const PLACES = [ /* 빌드 지오코딩으로 lat/lng가 채워진 장소들 */
    { pinNo: 1, category: 'food', name: '...', lat: 37.5655, lng: 126.9217 },
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
    map.fitBounds(bounds);
  }
  window.navermap_authFailure = () => { window.__NMAP_FAILED = true; showFallback(); };
  window.addEventListener('load', initMap);
</script>
```

## 5. 접근성 / 폴백 (필수)

- 지도가 로드·인증 실패해도 레이아웃이 깨지지 않게 **폴백 박스**를 둔다.
- **핀 리스트(장소 카드)** 를 지도의 **동등 텍스트 경로**로 항상 제공한다 — 지도 실패 시에도 모든 장소 정보 접근 가능.
- `prefers-reduced-motion` 시 scrollytelling 비활성.

## 6. 빌드 단계 지오코딩 (Secret 로컬 전용)

정적 사이트엔 서버 런타임이 없으므로 주소→좌표 변환은 **로컬에서 1회 스크립트**로 돌려 좌표를 데이터에 캐시한다. Secret은 이 스크립트에서만(로컬), 산출물에는 Client ID도 불필요(좌표만 박힘).

```js
// scripts/geocode.mjs — 로컬에서 1회 실행. (Secret은 로컬 환경변수에서만)
const ID = process.env.NAVER_MAP_CLIENT_ID, SECRET = process.env.NAVER_MAP_CLIENT_SECRET;
for (const p of PLACES) {
  const u = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=' + encodeURIComponent(p.address);
  const r = await fetch(u, { headers: { 'x-ncp-apigw-api-key-id': ID, 'x-ncp-apigw-api-key': SECRET } });
  const a = (await r.json()).addresses?.[0];
  if (a) { p.lat = +a.y; p.lng = +a.x; }
}
// → PLACES를 data/places.json 으로 출력 (Secret 미포함)
```

운영 팁: 매 요청 호출 대신 **빌드 시 1회 변환해 좌표를 `data/places.json`에 캐시**하면 런타임 호출·쿼터를 아끼고 마커가 즉시 뜬다. 좌표가 동네 중심에서 과도하게 벗어나면(잘못 매칭) 다른 실주소로 교체한다.

## 산출물 형식

- `artifacts/map/integration-notes.md` — 인증 키 종류, 등록할 출처, 폴백 동작, fitBounds 정책, 사용자 작업(G1~G3) 체크리스트.
- `artifacts/final/scripts/geocode.mjs` — 위 스크립트(입력 주소는 content/places.json 참조).

## 품질 체크

- [ ] 스크립트 URL 파라미터가 키 종류와 일치(`ncpKeyId` 기본)
- [ ] 폴백(핀 리스트) 경로가 항상 존재
- [ ] `navermap_authFailure` + `onerror` 둘 다 폴백 연결
- [ ] geocode.mjs와 산출물 어디에도 **Secret 미포함**
- [ ] 사용자 작업(키 발급·URL 등록·서버 서빙) 가이드 명시
