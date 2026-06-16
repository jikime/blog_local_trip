# 성수동 동네 탐방 — 로컬 여행 블로그 시안 + 하네스

도시를 **동네 단위로 기록**하는 로컬 여행 블로그를 **단일 정적 `index.html`**(HTML/CSS/바닐라 JS)로 만든 시안이다. 지도는 **네이버 지도(Web Dynamic Map)**로 실제 좌표에 핀을 찍고, 핀·장소 카드·태그·사진이 같은 시각 언어로 연결된다. 이 저장소는 결과물뿐 아니라, 같은 결과물을 **반복 생성하는 `.claude` 하네스**를 함께 담는다.

## 무엇이 만들어지나

- **최종 산출물**: `artifacts/final/index.html` (성수동 1동네 · 장소 4곳: 헤비스테이크·난포·대림창고·언더스탠드에비뉴)
- 에디토리얼 디자인(웜 뉴트럴 + 잉크 블루), 데스크톱 스플릿뷰 / 모바일 미니맵, 하단 탭·Explore/Search/Saved/Walks mock
- 히어로 + 카드 4장 이미지(codex-image로 생성한 **에디토리얼 일러스트** — 실제 매장 사진 아님)
- 지도 실패 시 **핀 리스트 폴백**(동등 텍스트), 접근성(키보드·`prefers-reduced-motion`) 대응

## 빠른 시작

정적 서버로 띄운다. `file://`로 열면 네이버 지도 인증이 실패한다.

```bash
cd artifacts/final
python3 -m http.server 8055 --directory .
#   → 브라우저에서 http://localhost:8055
```

레이아웃·이미지·카드는 바로 보인다. **지도 핀**은 인증이 통과해야 뜬다(아래).

## 지도 핀 띄우기 (네이버 인증)

두 조건이 모두 맞아야 한다.

1. **출처 등록** — NCP 콘솔 → Maps → 웹 서비스 URL에 현재 서빙 출처(`http://localhost:8055`)를 등록(scheme+host+port 정확히 일치).
2. **키 종류 일치** — `index.html`의 SDK URL: 신버전 키 `ncpKeyId=...`(현재 `i0wcwq70i3`), 구버전이면 `ncpClientId=...`.

등록 후 강력 새로고침(⌘+Shift+R). 좌표는 미리보기 근사값이 들어가 있어 인증만 통과하면 핀 4개가 표시된다.

> 정확한 좌표로 교체하려면 `node artifacts/final/scripts/geocode.mjs`를 로컬에서 1회 실행한다. **Client Secret은 환경변수로만** 쓰고 산출물에 넣지 않는다. 자세한 절차는 `artifacts/README.md` 3번 참고.

## 디렉터리

| 위치 | 내용 |
|---|---|
| `artifacts/final/index.html` | ★ 최종 시안 (단일 페이지) |
| `artifacts/final/assets/` | 히어로·카드 이미지 5장 |
| `artifacts/final/scripts/geocode.mjs` | 주소→좌표 변환(로컬, Secret 미포함) |
| `artifacts/final/data/places.json` | 지도 마커 좌표 데이터 |
| `artifacts/README.md` | **산출물 지도 + 상세 사용 방법** |
| `artifacts/improvement-log.md` | 변경·실패·피드백 이력 |
| `.claude/` | 하네스(Agent 5 · Skill 5 · Orchestrator) |
| `CLAUDE.md` | 하네스 라우팅·주요 위치 안내판 |

## 하네스로 다시 만들기

자연어로 요청하면 `local-travel-blog-orchestrator`가 분기한다. 예) "디자인만 다시", "장소 바꿔서 다시", "지도만 다시", "처음부터 새 입력으로". 팀: 디자이너 · 콘텐츠 큐레이터 · 지도 엔지니어 · 구현자 · QA.

## 보안 원칙

Client **Secret**은 어떤 산출물에도 포함하지 않는다. `geocode.mjs`는 환경변수로만 읽고, 산출물에는 Client ID만 들어간다. QA가 산출물 내 Secret 노출을 강제 검증한다.

## 현재 상태

1차 파이프라인 완료 + 이미지 적용 + 미리보기 좌표 시드 완료. `http://localhost:8055` 서빙 중. **남은 단계는 지도 인증**(NCP에 `http://localhost:8055` 등록). 인증 확인 후 `final/index.html`을 `사용 가능`으로 전환 예정.

자세한 내용은 [`artifacts/README.md`](artifacts/README.md)를 참고한다.
