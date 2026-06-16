---
name: local-travel-blog-orchestrator
description: 동네 탐방 로컬 여행 블로그(단일 정적 index.html + 네이버 지도 Web Dynamic Map 실연동) 시안을 디자인→콘텐츠 데이터→지도 연동→구현→QA 팀 파이프라인으로 생성하는 입구·진행 관리자. 사용할 때 키워드 — "로컬 여행 블로그 만들어줘", "동네 탐방 시안", "네이버 지도 블로그", "지도 스크롤리텔링 페이지", "장소 카드 + 지도 페이지", "index.html 시안", "이 PRD로 만들어줘", 그리고 후속 요청 "다시 실행", "재실행", "업데이트", "보완", "이전 결과 기반", "이 부분만 다시", "지도만 다시", "디자인만 다시", "장소만 바꿔서 다시", "키 바꿔서 다시". 단순 일반 코딩 질문이나 지도와 무관한 작업에는 사용하지 않는다.
---

# Local Travel Blog Orchestrator

동네 탐방 로컬 여행 블로그 시안을 **재사용 가능한 파이프라인**으로 만드는 전체 진행표다.
최종 산출물은 단일 정적 `index.html`(HTML/CSS/바닐라 JS) + 네이버 지도(Web Dynamic Map) 실연동이며,
빌드 단계 지오코딩 스크립트와 좌표 데이터가 함께 나온다.

> 핵심 원칙: 키 발급·웹서비스 URL 등록·`geocode.mjs` 로컬 실행·정적 서버 서빙은 **사용자 작업**이다.
> 하네스는 코드·스크립트·가이드까지 만들고, 이 위험 행동들 앞에서 **멈추고 명시적으로 승인**을 요청한다.
> Client Secret은 어떤 산출물에도 포함하지 않는다(QA가 강제 검증).

## 트리거

- 신규: "로컬 여행 블로그 만들어줘", "동네 탐방 시안", "네이버 지도 페이지", "이 PRD로 만들어줘"
- 후속: "재실행 / 업데이트 / 보완 / 이전 결과 기반 / 이 부분만 다시 / 지도만 / 디자인만 / 장소만 바꿔서 / 키 바꿔서"

## 산출물 계약 (`artifacts/`)

| 파일 | 역할 | 생성자 | 다음 독자 |
|---|---|---|---|
| `inputs/{입력명}.md` | 도시/동네 PRD·요청(첫 예시 = `enhanced.md`) | 사용자 | 전원 |
| `inputs/map-credentials.md` | ncpKeyId·등록 URL 메모 (**Secret 금지**) | 사용자 [확인 필요] | naver-map-engineer |
| `design/design-tokens.md` | 컬러·타이포·그리드·모션 토큰 | editorial-designer | frontend-builder |
| `content/places.json` | 동네·장소·실주소·태그·pinNo (좌표 전) | place-content-curator | naver-map-engineer |
| `map/integration-notes.md` | 인증·폴백·fitBounds·웹서버 가이드 | naver-map-engineer | frontend-builder |
| `final/index.html` | ★최종 산출물 | frontend-builder | 사용자·qa |
| `final/scripts/geocode.mjs` | 빌드 지오코딩(로컬 전용, Secret 미포함) | naver-map-engineer | 사용자 |
| `final/data/places.json` | 좌표 채워진 데이터(지오코딩 후) | 사용자 실행 결과 | index.html |
| `qa/qa-report.md` | 핀-카드·반응형·시크릿·지표 점검 | qa-accessibility-reviewer | 사용자 |
| `README.md` | 산출물 지도(역할·생성자·다음 독자·상태) | Orchestrator | 전원 |
| `improvement-log.md` | 변경·실패·피드백 기록 | Orchestrator | 전원 |

상태 표기: `최신` / `stale`(앞 단계 변경됨) / `needs-review` / 승인 상태(`사용 가능`·`사람 승인 필요`).

## 실행 모드 분기 (시작 시 반드시 수행)

1. `artifacts/` 존재 여부 확인.
2. 없으면 → **초기 실행**(전체 파이프라인).
3. 있으면 사용자 요청 키워드로 분기:
   - "처음부터 / 새 입력" → **새 실행**(입력 교체, 전체 재생성)
   - "지도만 / 디자인만 / 장소만 / 키 바꿔서 / 이 부분만" → **부분 재실행**
   - 모호하면 사용자에게 재검토 범위를 묻는다.
4. 부분 재실행 시: 바뀐 산출물을 읽는 **뒤 단계 파일을 `stale`로 표시**하고, 필요한 단계만 다시 실행한 뒤 `README.md` 파일·승인 상태를 갱신한다. `index.html`을 다시 만들지 않았으면 `final/index.html`은 `stale`로 둔다.

## Agent Team 실행 흐름

소규모 팀(5명). 팀 생성 시 teammate 모델 정책은 실행 기록에 남긴다(기본 상속).

1. `TeamCreate` — editorial-designer, place-content-curator, naver-map-engineer, frontend-builder, qa-accessibility-reviewer.
2. `TaskCreate` — 의존성과 함께 등록:
   - T1 디자인 토큰 (editorial-designer) ─┐ 병렬
   - T2 장소 데이터 (place-content-curator) ─┘
   - T3 지도 연동 노트 + geocode.mjs (naver-map-engineer) ← T2
   - T4 index.html 조립 (frontend-builder) ← T1, T2, T3
   - T5 QA 점검 (qa-accessibility-reviewer) ← T4  *(위험 산출물은 끝나는 즉시 점진 점검)*
3. 팀원은 `SendMessage`로 경계면 충돌을 공유한다. 예:
   - 마커 아이콘 = 디자인 토큰의 카테고리 색 + 핀 번호 (designer ↔ map-engineer ↔ builder)
   - 태그 팔레트 vs 카드 배지 일관성 (designer ↔ content-curator)
   - 좌표 누락 시 폴백 데이터 형태 (map-engineer ↔ builder)
4. Orchestrator는 `TaskUpdate`/`TaskGet`으로 진행·지연·차단을 확인하고, 막히면 재할당한다.
5. 각 팀원은 결과를 위 계약 경로의 파일로 저장한다.
6. Orchestrator는 `artifacts/`를 읽어 통합하고 `README.md`를 갱신한다.
7. QA 통과 전까지 `final/index.html` 승인 상태 = `사람 승인 필요`.
8. `TeamDelete`로 팀을 정리한다.

## 사람 승인 게이트 (멈추고 명시적으로 요청)

아래 지점에 도달하면 진행을 멈추고, **무엇을·왜 해야 하는지와 그 결과**를 사용자에게 묻는다.
승인 전에는 다음 단계로 가지 않고, 산출물을 `사용 가능`으로 바꾸지 않는다.

- **G1 키·URL**: 네이버 지도 키를 신버전 `ncpKeyId`로 발급하고, 띄울 로컬 출처(`http://localhost:PORT`)를 NCP 콘솔 웹서비스 URL에 등록했는가? → 사용자 확인 필요.
- **G2 지오코딩 실행**: `geocode.mjs`는 Client Secret을 쓴다. **로컬에서 사용자가** `NAVER_MAP_CLIENT_ID`/`NAVER_MAP_CLIENT_SECRET` 환경변수로 1회 실행해 `final/data/places.json`을 채운다. 하네스는 대신 실행하지 않는다.
- **G3 서빙**: `file://`는 인증 실패. 사용자가 `python3 -m http.server 8000` 또는 `npx serve`로 띄워 확인한다.
- **G4 최종 전환**: QA 통과 + 사용자가 "실제로 떴다" 확인 후에만 `final/index.html` → `사용 가능`.

QA가 산출물에서 **Client Secret 노출**을 발견하면 즉시 차단하고 실패로 보고한다(자동 통과 금지).

## 실패 시 대응

- 좌표가 동네 중심에서 과도하게 벗어남 → content-curator가 실주소 교체 후 G2 재실행 안내.
- 지도 인증 실패(400) → `ncpKeyId` vs `ncpClientId` 키 종류, 등록 URL scheme+host+port 일치 점검(G1).
- 팀원 산출물 누락/지연 → `TaskGet`으로 확인 후 재할당 또는 사용자 입력 요청.

## 참조

- 지도 연동·인증·폴백·지오코딩 → `naver-map-integration` 스킬
- 디자인 토큰 → `editorial-design-system` 스킬
- 단일 페이지 조립·반응형·접근성 → `single-page-frontend-build` 스킬
- 검증 체크리스트 → `ui-qa-accessibility-check` 스킬
