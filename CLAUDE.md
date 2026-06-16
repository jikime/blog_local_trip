# 프로젝트 안내 — 로컬 여행 블로그 하네스 (네이버 지도 실연동)

도시를 동네 단위로 보여주는 로컬 여행 블로그 **단일 정적 `index.html`** 시안을, 디자인→콘텐츠 데이터→네이버 지도 연동→구현→QA 팀 파이프라인으로 **반복 생성**하는 하네스다. 지도는 네이버 지도(Web Dynamic Map)로 실제 좌표에 핀을 찍는다.

## 자연어 라우팅 (먼저 읽기)
아래 성격의 요청이면 스킬명을 직접 입력하지 않아도 **`local-travel-blog-orchestrator` 스킬을 먼저 사용**한다.

- "로컬 여행 블로그 만들어줘", "동네 탐방 시안", "네이버 지도 블로그", "지도 스크롤리텔링 페이지", "장소 카드 + 지도 페이지", "index.html 시안", "이 PRD로 만들어줘" → 초기 실행
- "재실행", "업데이트", "보완", "이전 결과 기반", "이 부분만 다시", "지도만 다시", "디자인만 다시", "장소만 바꿔서 다시", "키 바꿔서 다시" → 부분/새 재실행
- 직접 호출 예: `local-travel-blog-orchestrator` 스킬 실행

## 핵심 원칙 (위험 지점)
- **사용자 작업 게이트**: 네이버 지도 키(`ncpKeyId`) 발급·웹서비스 URL 등록·`geocode.mjs` 로컬 실행·정적 서버 서빙은 사용자가 직접 한다. 하네스는 멈추고 명시적으로 승인을 요청하며 대신 실행하지 않는다.
- **Secret 금지**: Client Secret은 어떤 산출물에도 포함하지 않는다. geocode.mjs는 환경변수로만 읽는다. QA가 강제 검증·차단한다.
- `file://`는 인증 실패 — 정적 웹 서버로 서빙해야 한다.
- 산출물은 단일 `index.html` 하나. 별도 페이지를 만들지 않는다.

## 팀 구성 (일상 언어)
- `editorial-designer` — 디자인 토큰·시각 언어를 정하는 **디자이너**
- `place-content-curator` — 동네·장소·실주소·태그 데이터를 모으는 **콘텐츠 큐레이터**
- `naver-map-engineer` — 지도 연동·인증·폴백·지오코딩을 맡는 **지도 엔지니어**
- `frontend-builder` — 단일 `index.html`로 조립하는 **구현자**
- `qa-accessibility-reviewer` — 핀-카드·폴백·반응형·Secret을 잡는 **검증자**

## 주요 위치
| 목적 | 위치 |
|---|---|
| 전체 진행표(입구) | `.claude/skills/local-travel-blog-orchestrator/SKILL.md` |
| 작업 매뉴얼 | `.claude/skills/{naver-map-integration, editorial-design-system, single-page-frontend-build, ui-qa-accessibility-check}/SKILL.md` |
| 팀원 역할 카드 | `.claude/agents/*.md` |
| 입력 | `artifacts/inputs/` (첫 예시: `enhanced.md`) |
| 산출물 지도 | `artifacts/README.md` |
| 최종 산출물 | `artifacts/final/index.html` (+ `scripts/geocode.mjs`, `data/places.json`) |
| 개선 이력 | `artifacts/improvement-log.md` |

## 변경 이력
- 2026-06-16 — 하네스 신규 구축. Skill 5(orchestrator 1 + 매뉴얼 4) / Agent 5 / artifacts 골격 생성. enhanced.md를 첫 입력 예시로 비치. 재사용 템플릿형, 키·서빙은 사용자 직접.
