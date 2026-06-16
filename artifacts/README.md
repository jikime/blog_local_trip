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

> 현재 상태: 1차 파이프라인 완료. 좌표가 모두 `null`이라 지금 서버로 열면 **핀 리스트 폴백**으로 렌더된다. 실제 지도 핀은 G1~G3(사용자 작업) 후 표시된다. 최종 `사용 가능` 전환은 G1~G4 완료 후.

## 사용자 작업 게이트 (하네스가 대신 하지 않음)
- **G1** 네이버 지도 키 `ncpKeyId` 발급 + 로컬 출처(`http://localhost:PORT`) NCP 웹서비스 URL 등록
- **G2** 로컬에서 `geocode.mjs` 1회 실행(환경변수 `NAVER_MAP_CLIENT_ID`/`NAVER_MAP_CLIENT_SECRET`) → `data/places.json` 좌표 채움
- **G3** `python3 -m http.server 8000` 또는 `npx serve`로 서빙 (`file://` 불가)
- **G4** 확인 후 `final/index.html` → `사용 가능` 전환

## 흐름
`inputs/` → design + content (병렬) → map(지오코딩 스크립트) → `final/index.html` → qa → 사용자 게이트(G1~G4)
