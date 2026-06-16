/* ===========================================================
   동네 탐방 — app.js
   - 무료 폴백 지도(Leaflet + OSM 타일) 기본 동작
   - 15개 장소를 Nominatim으로 순차 지오코딩(좌표 하드코딩 금지)
   - 호출 간 ~1초 간격 + countrycodes=kr & accept-language=ko
   - 모든 핀을 담도록 fitBounds로 범위 자동 조정
   - 지오코딩 실패 장소는 핀 없이 카드 리스트에 그대로 노출
   - 핀↔카드↔본문 칩 연결, 카테고리 필터, 검색, 동네 칩
   - 네이버 키 입력 UI는 PRD대로 두되 현재 입력 불가로 비활성화
   =========================================================== */

(function () {
  "use strict";

  const { NEIGHBORHOODS, PLACES, CATEGORIES } = window.APP_DATA;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // 상태
  const state = {
    category: "all",
    hood: "all", // 'all' | neighborhood key
    query: "",
  };

  // 좌표 캐시: id -> {lat, lng} | 'fail'
  const coords = {};
  const markers = {}; // id -> leaflet marker
  let map = null;
  let cardEls = {}; // id -> button element

  const hoodByKey = Object.fromEntries(NEIGHBORHOODS.map((n) => [n.key, n]));

  // ---------------- DOM refs ----------------
  const $ = (sel) => document.querySelector(sel);
  const listEl = $("#place-list");
  const resultCountEl = $("#result-count");
  const mapStatusEl = $("#map-status");

  // ---------------- 지도 초기화 (무료 경로) ----------------
  function initMap() {
    // 서울 중심 임시값. 지오코딩 후 fitBounds로 덮어씀.
    map = L.map("map", { scrollWheelZoom: true }).setView(
      [37.5563, 126.9723],
      12
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 기여자',
    }).addTo(map);
  }

  // ---------------- 지오코딩 (Nominatim, 순차 + 1초 간격) ----------------
  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function geocodeOne(place) {
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1" +
      "&countrycodes=kr&accept-language=ko&q=" +
      encodeURIComponent(place.address);
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async function geocodeAll() {
    let done = 0;
    const total = PLACES.length;
    const bounds = [];

    for (const place of PLACES) {
      mapStatusEl.innerHTML =
        "무료 지도(OpenStreetMap)에서 장소 위치를 불러오는 중… (" +
        done +
        "/" +
        total +
        ")";
      const result = await geocodeOne(place);
      if (result) {
        coords[place.id] = result;
        addMarker(place, result);
        bounds.push([result.lat, result.lng]);
        // 진행 중 모든 핀을 담도록 점진적으로 범위 조정
        if (bounds.length >= 2) {
          map.fitBounds(bounds, { padding: [40, 40] });
        } else {
          map.setView([result.lat, result.lng], 14);
        }
      } else {
        coords[place.id] = "fail";
      }
      updateCardGeoState(place.id);
      done += 1;
      // 사용 정책: 호출 간 ~1초 간격
      if (done < total) await sleep(1100);
    }

    const failed = PLACES.filter((p) => coords[p.id] === "fail").length;
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
    if (failed === 0) {
      mapStatusEl.innerHTML =
        "OpenStreetMap 무료 지도 · 키 없이 동작 · " +
        total +
        "개 장소를 모두 표시했어요.";
    } else {
      mapStatusEl.innerHTML =
        "OpenStreetMap 무료 지도 · " +
        (total - failed) +
        "/" +
        total +
        "개 핀 표시. " +
        '<span class="err">' +
        failed +
        "곳은 핀 없이 카드로만 노출돼요.</span>";
    }
    // 현재 필터 반영(마커 가시성)
    applyFilters();
  }

  // ---------------- 마커 생성 ----------------
  function addMarker(place, latlng) {
    const num = visibleIndex(place.id); // 번호는 렌더 후 갱신
    const icon = L.divIcon({
      className: "",
      html:
        '<div class="pin-marker pin-' +
        place.category +
        '" data-id="' +
        place.id +
        '"><span>' +
        place.id +
        "</span></div>",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
    });
    const m = L.marker([latlng.lat, latlng.lng], {
      icon,
      title: place.name,
    }).addTo(map);
    m.bindPopup(
      "<strong>#" +
        place.id +
        " " +
        escapeHtml(place.name) +
        "</strong><br>" +
        escapeHtml(hoodByKey[place.neighborhood].name) +
        " · " +
        escapeHtml(place.categoryLabel) +
        "<br><span style='color:#888'>" +
        escapeHtml(place.address) +
        "</span>"
    );
    m.on("click", () => focusPlace(place.id, false));
    markers[place.id] = m;
  }

  function visibleIndex() {
    return 0; // (번호는 place.id 고정 사용)
  }

  // ---------------- 렌더: 장소 카드 ----------------
  function filteredPlaces() {
    const q = state.query.trim().toLowerCase();
    return PLACES.filter((p) => {
      if (state.category !== "all" && p.category !== state.category)
        return false;
      if (state.hood !== "all" && p.neighborhood !== state.hood) return false;
      if (q) {
        const hay = (
          p.name +
          " " +
          p.categoryLabel +
          " " +
          p.feature +
          " " +
          hoodByKey[p.neighborhood].name +
          " " +
          p.address
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderList() {
    const places = filteredPlaces();
    listEl.innerHTML = "";
    cardEls = {};

    if (places.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.textContent = "조건에 맞는 장소가 없어요. 필터나 검색어를 바꿔 보세요.";
      listEl.appendChild(li);
    } else {
      for (const p of places) {
        listEl.appendChild(buildCard(p));
      }
    }

    resultCountEl.textContent = places.length + "곳";
  }

  function buildCard(p) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card cat-" + p.category;
    btn.id = "card-" + p.id;
    btn.setAttribute("data-id", p.id);

    const hood = hoodByKey[p.neighborhood];
    btn.innerHTML =
      '<span class="card-num" aria-hidden="true">' +
      p.id +
      "</span>" +
      '<div class="card-body">' +
      '<div class="card-title-row">' +
      '<span class="card-title">' +
      escapeHtml(p.name) +
      "</span>" +
      '<span class="card-cat">' +
      escapeHtml(p.categoryLabel) +
      "</span>" +
      '<span class="card-hood">' +
      escapeHtml(hood.name) +
      " · " +
      escapeHtml(hood.gu) +
      "</span>" +
      "</div>" +
      '<p class="place-feature">' +
      escapeHtml(p.note) +
      "</p>" +
      '<div class="card-addr">' +
      escapeHtml(p.address) +
      "</div>" +
      '<div class="card-meta">' +
      "<span>최종 확인 " +
      escapeHtml(p.lastChecked) +
      "</span>" +
      '<span class="geo-tag" data-id="' +
      p.id +
      '"></span>' +
      "</div>" +
      "</div>";

    btn.addEventListener("click", () => focusPlace(p.id, true));
    cardEls[p.id] = btn;
    li.appendChild(btn);
    // 지오코딩 상태 즉시 반영
    queueMicrotask(() => updateCardGeoState(p.id));
    return li;
  }

  function updateCardGeoState(id) {
    const card = cardEls[id];
    if (!card) return;
    const tag = card.querySelector(".geo-tag");
    if (!tag) return;
    const c = coords[id];
    if (c === undefined) {
      tag.className = "geo-tag geo-pending";
      tag.textContent = "위치 확인 중…";
    } else if (c === "fail") {
      tag.className = "geo-tag geo-fail";
      tag.textContent = "지도 핀 없음(주소만 표시)";
    } else {
      tag.className = "geo-tag";
      tag.textContent = "지도에 핀 표시됨";
    }
  }

  // ---------------- 필터 적용: 카드 + 핀 동시 ----------------
  function applyFilters() {
    renderList();
    // 핀 가시성 동기화
    const visibleIds = new Set(filteredPlaces().map((p) => p.id));
    for (const idStr of Object.keys(markers)) {
      const id = Number(idStr);
      const m = markers[id];
      if (visibleIds.has(id)) {
        if (!map.hasLayer(m)) m.addTo(map);
      } else {
        if (map.hasLayer(m)) map.removeLayer(m);
      }
    }
  }

  // ---------------- 핀↔카드 포커스 연결 ----------------
  function clearActive() {
    document
      .querySelectorAll(".card.is-active")
      .forEach((el) => el.classList.remove("is-active"));
    document
      .querySelectorAll(".pin-marker.is-active")
      .forEach((el) => el.classList.remove("is-active"));
  }

  function focusPlace(id, fromCard) {
    clearActive();
    const card = cardEls[id];
    if (card) {
      card.classList.add("is-active");
      if (fromCard !== true) {
        card.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
      }
    }
    const c = coords[id];
    const m = markers[id];
    if (m && c && c !== "fail") {
      if (!map.hasLayer(m)) m.addTo(map);
      map.panTo([c.lat, c.lng]);
      m.openPopup();
      const el = m.getElement();
      if (el) {
        const pin = el.querySelector(".pin-marker");
        if (pin) pin.classList.add("is-active");
      }
    }
  }

  // ---------------- 동네 아티클 + 인라인 칩 렌더 ----------------
  function renderArticles() {
    const wrap = $("#articles-wrap");
    wrap.innerHTML = "";
    for (const hood of NEIGHBORHOODS) {
      const places = PLACES.filter((p) => p.neighborhood === hood.key);
      const article = document.createElement("article");
      article.className = "article";

      const chips = places
        .map(
          (p) =>
            '<button type="button" class="inline-chip" data-id="' +
            p.id +
            '">' +
            '<span class="chip-num num-' +
            p.category +
            '">' +
            p.id +
            "</span>" +
            escapeHtml(p.name) +
            "</button>"
        )
        .join("");

      article.innerHTML =
        "<h3>" +
        escapeHtml(hood.name) +
        '<span class="hood-gu">' +
        escapeHtml(hood.gu) +
        "</span></h3>" +
        '<p class="article-body">' +
        escapeHtml(hood.tagline) +
        " 이 동네에서는 " +
        places.map((p) => escapeHtml(p.name)).join(", ") +
        " 세 곳을 추천해요. 핀 번호를 누르면 지도에서 위치를 바로 확인할 수 있어요." +
        "</p>" +
        '<div class="inline-chips">' +
        chips +
        "</div>";

      wrap.appendChild(article);
    }

    // 인라인 칩 클릭 → 지도/카드 포커스
    wrap.querySelectorAll(".inline-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = Number(chip.getAttribute("data-id"));
        // 해당 장소가 현재 필터에서 숨겨졌으면 필터 초기화 후 포커스
        const p = PLACES.find((x) => x.id === id);
        if (
          (state.category !== "all" && p.category !== state.category) ||
          (state.hood !== "all" && p.neighborhood !== state.hood)
        ) {
          resetFilters();
        }
        document
          .getElementById("map-section")
          .scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        setTimeout(() => focusPlace(id, false), reduceMotion ? 0 : 350);
      });
    });
  }

  // ---------------- 동네 칩 / 카테고리 / 검색 ----------------
  function renderHoodChips() {
    const wrap = $("#hood-chips");
    const all = document.createElement("button");
    all.type = "button";
    all.className = "hood-chip active";
    all.setAttribute("data-hood", "all");
    all.innerHTML = '전체 <span class="count">' + PLACES.length + "</span>";
    wrap.appendChild(all);

    for (const hood of NEIGHBORHOODS) {
      const cnt = PLACES.filter((p) => p.neighborhood === hood.key).length;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hood-chip";
      b.setAttribute("data-hood", hood.key);
      b.innerHTML =
        escapeHtml(hood.name) +
        " <span class='count'>" +
        cnt +
        "</span>";
      wrap.appendChild(b);
    }

    wrap.querySelectorAll(".hood-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.hood = chip.getAttribute("data-hood");
        wrap
          .querySelectorAll(".hood-chip")
          .forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        clearActive();
        applyFilters();
      });
    });
  }

  function renderFilters() {
    const wrap = $("#filters");
    for (const cat of CATEGORIES) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "filter-btn" + (cat.key === "all" ? " active" : "");
      b.setAttribute("data-cat", cat.key);
      b.textContent = cat.label;
      b.addEventListener("click", () => {
        state.category = cat.key;
        wrap
          .querySelectorAll(".filter-btn")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        clearActive();
        applyFilters();
      });
      wrap.appendChild(b);
    }
  }

  function resetFilters() {
    state.category = "all";
    state.hood = "all";
    state.query = "";
    $("#search").value = "";
    document
      .querySelectorAll("#filters .filter-btn")
      .forEach((x) =>
        x.classList.toggle("active", x.getAttribute("data-cat") === "all")
      );
    document
      .querySelectorAll("#hood-chips .hood-chip")
      .forEach((x) =>
        x.classList.toggle("active", x.getAttribute("data-hood") === "all")
      );
    applyFilters();
  }

  function initSearch() {
    const input = $("#search");
    input.addEventListener("input", () => {
      state.query = input.value;
      clearActive();
      applyFilters();
    });
  }

  // ---------------- 네이버 키 패널 (비활성) ----------------
  function initKeyPanel() {
    // PRD 5.6대로 입력 UI는 두되, 현재 입력 불가 상태로 비활성화하고
    // 기본 동작은 무료 지도로 한다.
    const input = $("#ncp-key");
    const applyBtn = $("#ncp-apply");
    const clearBtn = $("#ncp-clear");
    input.disabled = true;
    input.value = "";
    input.placeholder = "ncpKeyId (현재 입력 불가 — 준비 안 됨)";
    [applyBtn, clearBtn].forEach((b) => {
      b.disabled = true;
      b.setAttribute("aria-disabled", "true");
    });
  }

  // ---------------- 유틸 ----------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------------- 부트스트랩 ----------------
  function init() {
    renderHoodChips();
    renderFilters();
    initSearch();
    renderArticles();
    initKeyPanel();
    initMap();
    renderList(); // 지오코딩 전에도 카드 리스트는 즉시 노출(점진적 향상)
    geocodeAll(); // 비동기 순차 지오코딩 시작
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
