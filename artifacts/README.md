# artifacts — 산출물 지도

로컬 여행 블로그 하네스의 모든 입력·중간·최종 결과가 여기 모인다. 각 행은 역할·생성자·다음 독자·상태를 가진다.

## 상태 범례
- `최신` — 사용 가능한 최신본
- `stale` — 앞 단계가 바뀌어 다시 만들어야 함
- `needs-review` — 검토 대기
- 승인: `사람 승인 필요` / `사용 가능`

## 산출물 표

| 파일 | 역할 | 생성자 | 다음 독자 | 상태 |
|---|---|---|---|---|
| `inputs/enhanced.md` | 첫 입력 예시(PRD) | 사용자 | 전원 | 최신 |
| `inputs/map-credentials.md` | ncpKeyId·등록 URL 메모 (Secret 금지) | 사용자 [확인 필요] | naver-map-engineer | Client ID 적용됨(ncpKeyId=i0wcwq70i3), G2 등록됨 |
| `design/design-tokens.md` | 컬러·타이포·그리드·모션 토큰 | editorial-designer | frontend-builder | 최신 |
| `content/places.json` | 성수동 4개 장소·실주소·태그·pinNo (좌표 null) | place-content-curator | naver-map-engineer | 최신 |
| `map/integration-notes.md` | 인증·폴백·fitBounds·웹서버 가이드 | naver-map-engineer | frontend-builder | 최신 |
| `final/index.html` | ★최종 산출물 (접근성 수정 반영) | frontend-builder | 사용자·qa | 최신 / **사람 승인 필요** |
| `final/scripts/geocode.mjs` | 빌드 지오코딩(로컬, Secret 미포함) | naver-map-engineer | 사용자 | 최신 (G3 대기) |
| `final/data/places.json` | 좌표 채워진 데이터 | (미리보기 시드) | index.html | 최신 (근사좌표 needs-verification) |
| `qa/qa-report.md` | 품질·접근성·보안 점검 | qa-accessibility-reviewer | 사용자 | 최신 (조건부 통과→이슈 수정 완료) |
| `improvement-log.md` | 변경·실패·피드백 기록 | Orchestrator | 전원 | 최신 |

> 현재 상태: 1차 파이프라인 완료 + 이미지 5장 적용 + 미리보기 근사 좌표 시드 완료. 현재 `http://localhost:8055`로 서빙 중. **남은 1단계는 지도 인증** — NCP 콘솔 웹 서비스 URL에 `http://localhost:8055`를 등록하면 핀이 표시된다. 최종 `사용 가능` 전환은 인증 확인 후.

## 사용자 작업 게이트 (하네스가 대신 하지 않음)
- **G1** 네이버 지도 키 `ncpKeyId` 발급 + 로컬 출처(`http://localhost:PORT`) NCP 웹서비스 URL 등록
- **G2** 로컬에서 `geocode.mjs` 1회 실행(환경변수 `NAVER_MAP_CLIENT_ID`/`NAVER_MAP_CLIENT_SECRET`) → `data/places.json` 좌표 채움
- **G3** `python3 -m http.server 8000` 또는 `npx serve`로 서빙 (`file://` 불가)
- **G4** 확인 후 `final/index.html` → `사용 가능` 전환

## 흐름
`inputs/` → design + content (병렬) → map(지오코딩 스크립트) → `final/index.html` → qa → 사용자 게이트(G1~G4)

---

# 사용 방법

## 1. 시안 열어보기 (가장 빠른 길)

정적 서버로 띄워야 한다. `file://`로 직접 열면 네이버 지도 인증이 실패한다.

```bash
cd artifacts/final
python3 -m http.server 8055 --directory .
#   → 브라우저에서 http://localhost:8055 열기
```

- 이미지(히어로 + 카드 4장)와 전체 레이아웃·카드·태그·하단 탭·drawer mock은 인증과 무관하게 바로 보인다.
- 지도는 인증이 통과해야 핀이 뜬다(아래 2번). 인증 전에는 **핀 리스트 폴백**(동등 텍스트)이 표시된다 — 정상 동작이다.

## 2. 지도에 핀 띄우기 (네이버 인증)

핀이 뜨려면 두 조건이 모두 맞아야 한다.

1. **출처(포트) 등록** — NCP 콘솔 → Maps 애플리케이션 → 웹 서비스 URL에 **현재 서빙 출처**를 등록한다.
   - 8055로 띄웠으면 `http://localhost:8055`, 8000이면 `http://localhost:8000`. scheme+host+port가 정확히 일치해야 한다.
2. **키 종류 일치** — `index.html`의 SDK URL 파라미터가 발급 키 종류와 맞아야 한다.
   - 신버전 키 → `ncpKeyId=...` (현재 적용: `ncpKeyId=i0wcwq70i3`)
   - 구버전 키 → `ncpClientId=...` 로 변경

등록·수정 후 브라우저를 **강력 새로고침**(⌘+Shift+R)한다. 여전히 폴백이면 브라우저 콘솔의 `navermap_authFailure`/인증 에러 메시지를 확인한다.

## 3. 정확한 좌표로 교체 (지오코딩, 선택)

현재 `final/data/places.json`의 좌표는 **미리보기 근사값(needs-verification)**이다. 실주소 기반 정확 좌표로 바꾸려면 로컬에서 1회 실행한다. **Client Secret은 환경변수로만** 쓰며 산출물에 넣지 않는다.

```bash
cd <프로젝트 루트>   # /Users/jikime/Dev/Business/Lectures/DavacoDan/Sample5
export NAVER_MAP_CLIENT_ID=i0wcwq70i3
export NAVER_MAP_CLIENT_SECRET='발급받은_Client_Secret'
node artifacts/final/scripts/geocode.mjs
#   → artifacts/final/data/places.json 의 좌표가 갱신됨. "성공: 4개" 확인.
```

`index.html`은 로드 시 `bootstrap()`이 `./data/places.json` 좌표를 자동 병합하므로 배열을 손으로 고칠 필요가 없다. 새로고침만 하면 된다.

## 4. 이미지 다시 만들기 (선택)

이미지는 codex-image로 생성한 **에디토리얼 일러스트(실제 매장 사진 아님)**이며 `assets/`에 있다. 특정 장소만 다시 만들려면 해당 `place-{n}.png`만 재생성해 같은 경로로 덮어쓰면 된다(파일명 유지 시 자동 반영).

## 5. 하네스 재실행 (부분/전체)

자연어로 요청하면 `local-travel-blog-orchestrator`가 분기한다.

| 요청 예시 | 동작 |
|---|---|
| "디자인만 다시" | 디자인 토큰 재생성 → `index.html` `stale` 표시 후 재조립 |
| "장소 바꿔서 다시" | `places.json` 재큐레이션 → 좌표·지도 재반영 |
| "지도만 다시" | 지도 연동/폴백/지오코딩 스크립트 재작성 |
| "처음부터 / 새 입력" | 입력 교체 후 전체 파이프라인 재실행 |

## 트러블슈팅

| 증상 | 원인 / 조치 |
|---|---|
| 지도 자리에 "지도를 불러오지 못했습니다" 폴백만 | ① 출처 URL 미등록(2번) ② 키 종류 불일치(`ncpKeyId`↔`ncpClientId`) ③ 좌표 없음(3번) |
| 다른 페이지가 열림 | 포트 충돌. 다른 프로젝트가 같은 포트를 점유 중인지 `lsof -nP -iTCP:<포트> -sTCP:LISTEN` 확인 |
| 이미지가 안 보임 | `assets/*.png` 존재·서버 루트 확인. 실패 시 "사진 준비중" placeholder로 자동 폴백 |
| 좌표가 동네에서 벗어남 | 미리보기 근사값일 수 있음. 3번 지오코딩으로 교체 |

## 디렉터리 한눈에

```
artifacts/
├─ inputs/        입력 PRD·키 메모(Secret 금지)
├─ design/        디자인 토큰
├─ content/       장소 데이터(원천)
├─ map/           지도 연동 노트
├─ final/         ★ index.html + assets/ + scripts/geocode.mjs + data/places.json
├─ qa/            품질·접근성·보안 리포트
├─ README.md      (이 파일) 산출물 지도 + 사용 방법
└─ improvement-log.md
```

> 보안 원칙: Client **Secret**은 어떤 산출물에도 넣지 않는다. `geocode.mjs`는 환경변수로만 읽고, 산출물에는 Client ID만 들어간다.
