---
name: single-page-frontend-build
description: 디자인 토큰·장소 데이터·지도 연동 노트를 받아 단일 정적 index.html(HTML/CSS/바닐라 JS)로 조립하는 작업 매뉴얼. 데스크톱 스플릿뷰/모바일 접이식 미니맵, City→Neighborhood→Place→Article 계층, Explore·Search·Saved·Walks의 drawer·탭·accordion mock, 반응형(390/768/1440), 접근성 폴백을 한 페이지에 담는다. frontend-builder 에이전트가 따른다.
---

# Single Page Frontend Build

확정된 디자인 토큰 + 장소 데이터 + 지도 연동 노트를 **단일 `index.html`**로 조립하는 매뉴얼.

## 트리거

`index.html` 구현·조립, 반응형 레이아웃 작성, mock 패널 구현 시.

## 단일 페이지 제약 (반드시 준수)

- 공개 산출물은 **단일 정적 `index.html` 하나**. `explore.html`·`search.html`·`saved.html`·`article.html`·`neighborhood.html` 등 별도 페이지를 만들지 않는다.
- Explore·Search·Saved·Walks는 **같은 페이지의 drawer·탭·accordion mock**으로 표현(실제 기능 없음).
- 빌드 프레임워크·번들러 없이 바닐라 JS로 충분. 빌드 백엔드·Mapbox GL·Google Places·DB 미사용.
- `geocode.mjs`는 화면이 아니므로 페이지 수에 포함하지 않는다.

## IA / 구성

- 첫 화면: 도시/동네 제목, 대표 지도 패널, 핵심 태그 배지, 추천 동네 카드.
- 본문: 에디토리얼 글 + 네이버 지도 패널 **스플릿뷰**(데스크톱). 모바일은 상단 미니 지도 + 하단 핀 리스트.
- 계층: 단일 페이지 안에 City→Neighborhood→Place→Article을 섹션·카드·시각 그룹으로 압축.
- Neighborhood 섹션 = 인트로 + 지도 패널 + Places 그리드 + 아티클 요약.
- Place 카드 = 이름·카테고리·주소·상태·최종확인일 + 사진 placeholder + 좌표(lat/lng). 같은 좌표로 마커를 찍어 카드↔핀 1:1.
- 하단 탭 mock: 지도·동네·검색·저장 (44px 터치타겟).

## P0 구현 체크리스트

- [ ] 데스크톱 스플릿뷰 / 모바일 상단 미니맵 + 하단 핀 리스트
- [ ] 핀 번호·카드 번호·본문 하이라이트 색 일치
- [ ] 태그 배지 색·아이콘·상태 스타일
- [ ] Place 카드(이름·카테고리·주소·상태·최종확인일) 정적 표현
- [ ] 사진 placeholder + aspect-ratio + caption (사진 없이도 레이아웃 완성)
- [ ] 모바일 단일 컬럼 + 하단 탭 mock + 44px 터치타겟
- [ ] 지도 실패 시 핀 리스트 폴백(동등 텍스트)

## P1 / P2 (시간 허용 시)

- P1: Explore 패널(클러스터·경계·필터 UI mock), Search 오버레이 mock(입력·추천·empty), Walks 타임라인/스텝 카드, Saved 패널 mock, OG preview 블록.
- P2: 기여자 프로필 카드, 제보 CTA mock, 다국어 라벨 + 주변 동네 카드 mock.

## 지도 코드 연동

`naver-map-integration` 스킬의 마커+fitBounds+폴백 패턴을 그대로 사용한다. 스크립트 URL은 `ncpKeyId=YOUR_CLIENT_ID` 자리표시자로 두고, 사용자가 발급 키로 채우도록 주석으로 안내한다. **Secret은 넣지 않는다.** 좌표는 `data/places.json`(지오코딩 결과)을 fetch하거나 인라인 배열로 둔다.

## 반응형 / 접근성

- 뷰포트 390px / 768px / 1440px에서 텍스트 겹침·표 넘침·차트 깨짐 없음.
- 카드 중첩 금지, 섹션별 카드 수·여백으로 과밀 방지.
- `prefers-reduced-motion` 시 scrollytelling 비활성.

## 산출물 형식

- `artifacts/final/index.html` — 브라우저에서 정적 서버로 직접 열어볼 수 있는 단일 파일.
- (필요 시) `artifacts/final/data/places.json` 스키마에 맞춘 fetch.

## 품질 체크

- [ ] 단일 페이지(별도 .html 없음)
- [ ] 디자인 토큰을 `:root` CSS 변수로 반영
- [ ] 핀-카드 1:1 + 폴백 경로
- [ ] 3개 뷰포트 정상
- [ ] 산출물에 Secret 없음, 스크립트 URL은 자리표시자
