/* =================================
   SOULSOFON — ELDEN MAP STABLE
   ================================= */

/* ===== CONFIG ===== */
const GAMES = [
  { id: "elden", name: "Elden Ring", file: "data/elden_ring.json" }
];

/* ===== DOM ===== */
const gameListEl = document.getElementById("game-list");
const contentEl = document.getElementById("content");

/* ===== INIT ===== */
initGameList();

/* ======================
   GAME LIST
   ====================== */
function initGameList() {
  gameListEl.innerHTML = "";

  GAMES.forEach(game => {
    const btn = document.createElement("button");
    btn.textContent = game.name;
    btn.className = "game-btn";
    btn.onclick = () => loadGame(game);
    gameListEl.appendChild(btn);
  });
}

/* ======================
   LOAD GAME
   ====================== */
async function loadGame(game) {
  contentEl.innerHTML = "";

  try {
    const res = await fetch(game.file);
    const data = await res.json();
    renderEldenMap(data);
  } catch (e) {
    console.error("Ошибка загрузки Elden Ring:", e);
  }
}

/* ======================
   ELDEN RING MAP
   ====================== */
function renderEldenMap(data) {
  contentEl.innerHTML = "";

  /* MAP WRAPPER */
  const wrapper = document.createElement("div");
  wrapper.id = "elden-map-wrapper";

  /* MAP IMAGE */
  const map = document.createElement("img");
  map.id = "elden-map";
  map.src = data.map;
  map.alt = "Elden Ring Map";

  wrapper.appendChild(map);
  contentEl.appendChild(wrapper);

  /* REGIONS */
  const regionsBox = document.createElement("div");
  regionsBox.id = "elden-regions";

  Object.entries(data.regions).forEach(([key, region]) => {
    const btn = document.createElement("button");
    btn.className = "region";
    btn.textContent = region.name;

    btn.onclick = () => zoomToRegion(btn, map);

    regionsBox.appendChild(btn);
  });

  contentEl.appendChild(regionsBox);

  /* RESET BUTTON */
  const resetBtn = document.createElement("button");
  resetBtn.id = "reset-map";
  resetBtn.textContent = "СБРОС КАРТЫ";
  resetBtn.onclick = () => resetMap(map);

  contentEl.appendChild(resetBtn);
}

/* ======================
   MAP ZOOM
   ====================== */
function zoomToRegion(regionBtn, map) {
  const mapRect = map.getBoundingClientRect();
  const btnRect = regionBtn.getBoundingClientRect();

  const offsetX =
    (btnRect.left + btnRect.width / 2) -
    (mapRect.left + mapRect.width / 2);

  const offsetY =
    (btnRect.top + btnRect.height / 2) -
    (mapRect.top + mapRect.height / 2);

  const scale = 1.8;

  map.style.transform = `
    scale(${scale})
    translate(${-offsetX / scale}px, ${-offsetY / scale}px)
  `;
}

/* ======================
   RESET MAP
   ====================== */
function resetMap(map) {
  map.style.transform = "scale(1)";
}









































