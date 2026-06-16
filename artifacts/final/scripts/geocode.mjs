/**
 * geocode.mjs — 성수동 장소 주소 → 네이버 Geocoding REST API → lat/lng 캐시
 *
 * 용도: 로컬에서 1회 실행. 결과를 artifacts/final/data/places.json으로 저장.
 *       정적 사이트 런타임에서는 이 스크립트를 실행하지 않는다.
 *
 * 실행 전 환경변수 설정:
 *   export NAVER_MAP_CLIENT_ID="발급받은_CLIENT_ID"
 *   export NAVER_MAP_CLIENT_SECRET="발급받은_CLIENT_SECRET"
 *
 * 실행:
 *   node artifacts/final/scripts/geocode.mjs
 *
 * 주의:
 *   - Client Secret을 이 파일이나 산출물 어디에도 하드코딩하지 않는다.
 *   - 신버전 Maps 키와 Geocoding API 키는 동일한 NCP 앱에서 발급받는다.
 *   - Geocoding API 엔드포인트: https://maps.apigw.ntruss.com/map-geocode/v2/geocode
 *
 * 참고 문서: artifacts/map/integration-notes.md §G3
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ── 경로 설정 ────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// 프로젝트 루트 기준 절대 경로
const PROJECT_ROOT  = path.resolve(__dirname, '..', '..', '..');
const INPUT_PATH    = path.join(PROJECT_ROOT, 'artifacts', 'content', 'places.json');
const OUTPUT_DIR    = path.join(PROJECT_ROOT, 'artifacts', 'final', 'data');
const OUTPUT_PATH   = path.join(OUTPUT_DIR, 'places.json');

// ── 인증 (환경변수에서만 읽음) ───────────────────────────────────────────────

const CLIENT_ID     = process.env.NAVER_MAP_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_MAP_CLIENT_SECRET;

// ── 네이버 Geocoding REST API 설정 ──────────────────────────────────────────

const GEOCODE_ENDPOINT = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode';

// 성수동 예상 좌표 범위 (오매핑 감지용)
// 실제 성수동 범위보다 여유 있게 설정
const SEONGSU_BOUNDS = {
  latMin: 37.530,
  latMax: 37.570,
  lngMin: 127.030,
  lngMax: 127.080,
};

// API 레이트 리밋 준수용 딜레이 (ms)
const REQUEST_DELAY_MS = 300;

// ── 유틸리티 함수 ────────────────────────────────────────────────────────────

/**
 * ms만큼 대기한다.
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 좌표가 성수동 예상 범위 안에 있는지 확인한다.
 * @param {number} lat
 * @param {number} lng
 * @returns {boolean}
 */
function isInSeongsuBounds(lat, lng) {
  return (
    lat >= SEONGSU_BOUNDS.latMin &&
    lat <= SEONGSU_BOUNDS.latMax &&
    lng >= SEONGSU_BOUNDS.lngMin &&
    lng <= SEONGSU_BOUNDS.lngMax
  );
}

/**
 * 네이버 Geocoding REST API로 주소를 좌표로 변환한다.
 * Client ID와 Secret은 HTTP 헤더로 전달하며 URL에 포함하지 않는다.
 *
 * @param {string} address - 도로명 또는 지번 주소
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function geocodeAddress(address) {
  const url = `${GEOCODE_ENDPOINT}?query=${encodeURIComponent(address)}`;

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'x-ncp-apigw-api-key-id': CLIENT_ID,
        'x-ncp-apigw-api-key':    CLIENT_SECRET,
        'Accept':                  'application/json',
      },
    });
  } catch (networkError) {
    console.error(`  [네트워크 오류] ${address}:`, networkError.message);
    return null;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '(본문 없음)');
    console.error(`  [HTTP ${response.status}] ${address}: ${body}`);
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    console.error(`  [JSON 파싱 오류] ${address}:`, parseError.message);
    return null;
  }

  const addresses = data?.addresses;
  if (!Array.isArray(addresses) || addresses.length === 0) {
    console.warn(`  [결과 없음] "${address}" — 주소를 찾지 못했습니다.`);
    return null;
  }

  const first = addresses[0];
  const lat = parseFloat(first.y);
  const lng = parseFloat(first.x);

  if (isNaN(lat) || isNaN(lng)) {
    console.warn(`  [좌표 파싱 실패] "${address}" — y: ${first.y}, x: ${first.x}`);
    return null;
  }

  return { lat, lng };
}

// ── 메인 실행 ────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== 네이버 지오코딩 스크립트 시작 ===');
  console.log(`입력: ${INPUT_PATH}`);
  console.log(`출력: ${OUTPUT_PATH}`);
  console.log('');

  // 환경변수 검증
  if (!CLIENT_ID) {
    console.error('[오류] NAVER_MAP_CLIENT_ID 환경변수가 설정되지 않았습니다.');
    console.error('  export NAVER_MAP_CLIENT_ID="발급받은_CLIENT_ID"');
    process.exit(1);
  }
  if (!CLIENT_SECRET) {
    console.error('[오류] NAVER_MAP_CLIENT_SECRET 환경변수가 설정되지 않았습니다.');
    console.error('  export NAVER_MAP_CLIENT_SECRET="발급받은_CLIENT_SECRET"');
    process.exit(1);
  }

  // 입력 파일 읽기
  let sourceData;
  try {
    const raw = await fs.readFile(INPUT_PATH, 'utf-8');
    sourceData = JSON.parse(raw);
  } catch (err) {
    console.error(`[오류] places.json을 읽을 수 없습니다: ${err.message}`);
    process.exit(1);
  }

  const places = sourceData?.places;
  if (!Array.isArray(places) || places.length === 0) {
    console.error('[오류] places.json에 places 배열이 없거나 비어 있습니다.');
    process.exit(1);
  }

  console.log(`장소 ${places.length}개에 대해 지오코딩을 시작합니다...`);
  console.log('');

  // 결과 누적용
  const results = [];
  let successCount = 0;
  let failCount    = 0;
  let warnCount    = 0;

  for (const place of places) {
    const { pinNo, name, address } = place;
    process.stdout.write(`[${pinNo}] ${name} — "${address}" ... `);

    const coords = await geocodeAddress(address);

    if (!coords) {
      console.log('실패');
      results.push({ ...place, lat: null, lng: null, _geocodeStatus: 'failed' });
      failCount++;
    } else {
      const { lat, lng } = coords;
      const inBounds = isInSeongsuBounds(lat, lng);

      if (inBounds) {
        console.log(`성공 (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        results.push({ ...place, lat, lng, _geocodeStatus: 'ok' });
        successCount++;
      } else {
        console.log(`경고: 범위 외 좌표 (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        console.warn(
          `  → 성수동 예상 범위를 벗어났습니다. 주소 오매핑 가능성이 있습니다.`
        );
        console.warn(
          `  → 예상 범위: 위도 ${SEONGSU_BOUNDS.latMin}~${SEONGSU_BOUNDS.latMax}, 경도 ${SEONGSU_BOUNDS.lngMin}~${SEONGSU_BOUNDS.lngMax}`
        );
        results.push({ ...place, lat, lng, _geocodeStatus: 'out_of_bounds' });
        warnCount++;
      }
    }

    // 요청 간 딜레이 (마지막 항목 이후에는 불필요)
    if (place !== places[places.length - 1]) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // 출력 디렉토리 생성 (없으면)
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // 출력 데이터 구성 — _geocodeStatus 메타 필드는 최종 산출물에서 제거 가능
  // 여기서는 디버깅을 위해 유지하되 팀에서 필요에 따라 삭제한다
  const outputData = {
    ...sourceData,
    places: results,
    _geocodedAt: new Date().toISOString(),
    _geocodeNote: 'Secret은 환경변수로만 사용. 이 파일에 포함되지 않음.',
  };

  try {
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(outputData, null, 2), 'utf-8');
  } catch (err) {
    console.error(`\n[오류] 출력 파일 저장 실패: ${err.message}`);
    process.exit(1);
  }

  // 결과 요약
  console.log('');
  console.log('=== 지오코딩 완료 ===');
  console.log(`  성공: ${successCount}개`);
  if (warnCount > 0)  console.log(`  경고(범위 외): ${warnCount}개 — 주소 교체 검토 필요`);
  if (failCount > 0)  console.log(`  실패: ${failCount}개 — 주소 확인 또는 재시도 필요`);
  console.log(`  저장됨: ${OUTPUT_PATH}`);

  if (warnCount > 0 || failCount > 0) {
    console.log('');
    console.log('[다음 단계]');
    if (warnCount > 0) {
      console.log('  - 범위 외 좌표가 있는 장소는 place-content-curator에 실주소 교체를 요청하세요.');
    }
    if (failCount > 0) {
      console.log('  - 실패한 주소는 네이버 지도(map.naver.com)에서 직접 검색해 정확한 주소로 수정 후 재실행하세요.');
    }
  }

  if (successCount === places.length) {
    console.log('');
    console.log('[완료] 모든 장소의 좌표가 정상 범위 내에서 수집되었습니다.');
    console.log('  index.html의 PLACES 배열을 artifacts/final/data/places.json 데이터로 교체하세요.');
  }
}

main().catch((err) => {
  console.error('[예기치 않은 오류]', err);
  process.exit(1);
});
