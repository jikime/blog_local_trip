# 개선 이력 (improvement-log)

하네스 실행 중 발견한 실패·피드백·변경을 날짜·대상·내용·사유로 남긴다. 다음번 하네스 수정의 근거가 된다.

| 날짜 | 대상 | 변경/발견 | 사유 |
|---|---|---|---|
| 2026-06-16 | 하네스 전체 | 신규 구축(Skill 5/Agent 5/artifacts 골격) | enhanced.md PRD 기반, 재사용 템플릿형 |
| 2026-06-16 | 1차 실행(성수동) | 5인 팀 파이프라인 완료. 디자인 토큰→places.json(4곳)→지도 노트+geocode.mjs→index.html→QA | enhanced.md 기준 첫 시안 |
| 2026-06-16 | index.html | QA 조건부 통과 후 접근성 3건 수정: role=link→button(Space 키), reduced-motion scroll 분기, 탭 44px 명시 | 키보드 접근성·모션 민감 사용자 대응 |
| 2026-06-16 | index.html | 사용자 Client ID(ncpKeyId=i0wcwq70i3) 적용 | G1 일부 — 사용자 키 제공 |
| 2026-06-16 | index.html | PLACES를 인라인 const→let로 바꾸고 bootstrap()이 ./data/places.json 좌표를 자동 병합하도록 개선 | 지오코딩 후 수동 배열 교체 제거, 좌표 없으면 폴백 유지 |
| 2026-06-16 | assets/ + index.html | codex-image로 에디토리얼 이미지 5장(hero+place 1~4) 병렬 생성·적용. 히어로 배경+카드 사진, placeholder는 onerror 폴백 유지 | PRD 사진 운용. 단 실제 매장 사진 아닌 일러스트(needs-verification) |
| 2026-06-16 | 서빙 | 포트 8000은 다른 프로젝트(Sample4) 점유 확인 → Sample5 시안은 8055로 서빙 | NCP 등록 URL(8000)과 불일치 → 지도 실연동 시 포트 정합 필요 |
| 2026-06-16 | final/data/places.json | 미리보기 근사 좌표 4곳 시드(needs-verification) | 사용자 선택(미리보기 좌표). 마커 렌더 가능. geocode.mjs로 교체 권장 |
| 2026-06-16 | index.html | 폴백 안내 문구를 'YOUR_CLIENT_ID 교체'→'출처 URL 등록/키 종류 확인'으로 수정 | 키는 이미 적용됨, 실제 잔존 원인(인증 출처)을 안내 |

## 기록 양식
- 무엇이 안 됐는지(실패 사례), 어느 단계/팀원에서 발생했는지
- 어떻게 고쳤는지 또는 고칠 후보
- 반복되면 어느 Skill/Agent 규칙에 반영할지
