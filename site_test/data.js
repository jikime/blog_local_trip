// 장소 데이터 — PRD 7장 (실제 장소, 도로명주소). 좌표는 하드코딩하지 않고
// 런타임에 Nominatim(무료) 또는 네이버 Geocoding으로 도로명주소를 지오코딩한다.
// 5개 동네 × 3곳 = 15곳, 서로 다른 4개 구(서대문·마포·성동·종로)에 분산.

const NEIGHBORHOODS = [
  {
    key: "yeonhui",
    name: "연희동",
    gu: "서대문구",
    tagline: "넓은 로스터리와 골목 베이커리가 어우러진 차분한 동네",
  },
  {
    key: "yeonnam",
    name: "연남동",
    gu: "마포구",
    tagline: "연트럴파크와 주말 플리마켓, 산책하기 좋은 골목길",
  },
  {
    key: "seongsu",
    name: "성수동",
    gu: "성동구",
    tagline: "연무장길 카페촌과 베이커리가 모인 요즘 동네",
  },
  {
    key: "ikseon",
    name: "익선동",
    gu: "종로구",
    tagline: "100년 한옥 골목 사이로 디저트와 음식이 숨어 있는 동네",
  },
  {
    key: "mangwon",
    name: "망원동",
    gu: "마포구",
    tagline: "동네 사랑방 카페와 전통시장이 살아 있는 생활 동네",
  },
];

// category: 'cafe' | 'food' | 'space'
const PLACES = [
  // 연희동 (서대문구)
  {
    id: 1,
    name: "앤트러사이트 연희점",
    neighborhood: "yeonhui",
    category: "cafe",
    categoryLabel: "카페(로스터리)",
    address: "서울 서대문구 연희로 135",
    note: "다크 인테리어와 넓은 공간이 특징인 로스터리 카페예요.",
    feature: "다크 인테리어·넓은 공간",
    lastChecked: "2026-06",
  },
  {
    id: 2,
    name: "매뉴팩트커피 연희점",
    neighborhood: "yeonhui",
    category: "cafe",
    categoryLabel: "카페(스페셜티)",
    address: "서울 서대문구 연희로11길 29",
    note: "싱글 오리진과 핸드드립을 즐길 수 있는 스페셜티 카페예요.",
    feature: "싱글 오리진·핸드드립",
    lastChecked: "2026-06",
  },
  {
    id: 3,
    name: "뉘블랑쉬",
    neighborhood: "yeonhui",
    category: "food",
    categoryLabel: "맛집(베이커리)",
    address: "서울 서대문구 연희로15길 52",
    note: "크루아상으로 알려진 연희동 베이커리예요.",
    feature: "크루아상",
    lastChecked: "2026-06",
  },

  // 연남동 (마포구)
  {
    id: 4,
    name: "테일러커피 연남1호점",
    neighborhood: "yeonnam",
    category: "cafe",
    categoryLabel: "카페(스페셜티)",
    address: "서울 마포구 성미산로 189",
    note: "연남동을 대표하는 스페셜티 카페예요.",
    feature: "연남 대표 스페셜티",
    lastChecked: "2026-06",
  },
  {
    id: 5,
    name: "동진시장",
    neighborhood: "yeonnam",
    category: "space",
    categoryLabel: "공간(시장)",
    address: "서울 마포구 성미산로 198",
    note: "주말이면 플리마켓과 먹거리로 붐비는 시장이에요.",
    feature: "주말 플리마켓·먹거리",
    lastChecked: "2026-06",
  },
  {
    id: 6,
    name: "경의선숲길 연남동 구간",
    neighborhood: "yeonnam",
    category: "space",
    categoryLabel: "공간(공원)",
    address: "서울 마포구 연남동 경의선숲길",
    note: "\"연트럴파크\"로 불리는 산책 코스예요.",
    feature: "연트럴파크 산책",
    lastChecked: "2026-06",
  },

  // 성수동 (성동구)
  {
    id: 7,
    name: "자연도 소금빵집",
    neighborhood: "seongsu",
    category: "food",
    categoryLabel: "맛집(베이커리)",
    address: "서울 성동구 연무장길 56-1",
    note: "갓 구운 소금빵으로 줄 서는 베이커리예요.",
    feature: "갓 구운 소금빵",
    lastChecked: "2026-06",
  },
  {
    id: 8,
    name: "의자모멘토",
    neighborhood: "seongsu",
    category: "cafe",
    categoryLabel: "카페",
    address: "서울 성동구 연무장길 44",
    note: "연무장길 카페촌에 자리한 카페예요.",
    feature: "연무장길 카페촌",
    lastChecked: "2026-06",
  },
  {
    id: 9,
    name: "성수 앤드밀(&meal)",
    neighborhood: "seongsu",
    category: "food",
    categoryLabel: "맛집(브런치)",
    address: "서울 성동구 연무장3길 5-1",
    note: "브런치와 식사를 함께 즐길 수 있는 곳이에요.",
    feature: "브런치·식사",
    lastChecked: "2026-06",
  },

  // 익선동 (종로구)
  {
    id: 10,
    name: "시그니처 R",
    neighborhood: "ikseon",
    category: "cafe",
    categoryLabel: "카페(디저트)",
    address: "서울 종로구 돈화문로11다길 27",
    note: "한옥 골목 안의 디저트 카페예요.",
    feature: "한옥 골목 디저트",
    lastChecked: "2026-06",
  },
  {
    id: 11,
    name: "살라댕방콕",
    neighborhood: "ikseon",
    category: "food",
    categoryLabel: "맛집(태국)",
    address: "서울 종로구 돈화문로11다길 40",
    note: "한옥에서 즐기는 태국 음식점이에요.",
    feature: "한옥 태국 음식",
    lastChecked: "2026-06",
  },
  {
    id: 12,
    name: "익선동 한옥거리",
    neighborhood: "ikseon",
    category: "space",
    categoryLabel: "공간(한옥거리)",
    address: "서울 종로구 익선동 한옥거리",
    note: "100년 된 한옥이 늘어선 골목길이에요.",
    feature: "100년 한옥 골목",
    lastChecked: "2026-06",
  },

  // 망원동 (마포구)
  {
    id: 13,
    name: "커피하우스 마이샤",
    neighborhood: "mangwon",
    category: "cafe",
    categoryLabel: "카페",
    address: "서울 마포구 포은로 52",
    note: "동네 사랑방 같은 분위기의 카페예요.",
    feature: "동네 사랑방 카페",
    lastChecked: "2026-06",
  },
  {
    id: 14,
    name: "올웨이즈 어거스트 커피",
    neighborhood: "mangwon",
    category: "cafe",
    categoryLabel: "카페(스페셜티)",
    address: "서울 마포구 포은로8길 32",
    note: "대기가 많은 망원동 스페셜티 카페예요.",
    feature: "대기 많은 스페셜티",
    lastChecked: "2026-06",
  },
  {
    id: 15,
    name: "망원시장",
    neighborhood: "mangwon",
    category: "space",
    categoryLabel: "공간(시장)",
    address: "서울 마포구 망원동 망원시장",
    note: "먹거리가 풍성한 전통시장이에요.",
    feature: "먹거리 전통시장",
    lastChecked: "2026-06",
  },
];

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "cafe", label: "카페" },
  { key: "food", label: "맛집" },
  { key: "space", label: "공간" },
];

window.APP_DATA = { NEIGHBORHOODS, PLACES, CATEGORIES };
