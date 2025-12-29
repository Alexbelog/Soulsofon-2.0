/* ============================
   SOULSOFON 2.0 — FINAL app.js
   ============================ */

const isAdmin =
  new URLSearchParams(window.location.search).get("admin") === "1";

const DEFAULT_ICON =
  "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

/* ====== ИГРЫ ====== */
const GAMES = [
  { id: "ds1", name: "Dark Souls", file: "data/ds1.json" },
  { id: "ds2", name: "Dark Souls II", file: "data/ds2.json" },
  { id: "ds3", name: "Dark Souls III", file: "data/ds3.json" },
  { id: "sekiro", name: "Sekiro", file: "data/sekiro.json" },
  { id: "elden", name: "Elden Ring", file: "data/elden_ring.json" }
];

let currentGame = null;
let currentBosses = [];

/* ====== DOM ====== */
const gameListEl = document.getElementById("game-list");
const contentEl = document.getElementById("content");

/* ======================
   INIT
   ====================== */
initGameList();

/* ======================
   GAME LIST
   ====================== */
function initGameList() {
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
  currentGame = game.id;

  const res = await fetch(game.file);
  const data = await res.json();

  contentEl.innerHTML = "";

  if (game.id === "elden") {
    renderEldenRing(data);
  } else {
    const bosses = collectBosses(data);
    currentBosses = bosses;
    renderBosses(bosses);
  }
}

/* ======================
   COLLECT BOSSES
   ====================== */
function collectBosses(data) {
  const result = [];

  if (!data.sections) return result;

  Object.values(data.sections).forEach(section => {
    if (Array.isArray(section)) {
      result.push(...section);
    }
  });

  return result;
}

/* ======================
   RENDER BOSSES
   ====================== */
function renderBosses(bosses) {
  contentEl.innerHTML = "";

  bosses.forEach(boss => {
    const state = loadState(boss.id);

    const row = document.createElement("div");
    row.className = "boss";
    if (state.dead) row.classList.add("dead");
    row.dataset.type = boss.type || "main";

    /* LEFT */
    const left = document.createElement("div");
    left.className = "boss-left";

    const icon = document.createElement("img");
    icon.className = "boss-icon";
    icon.src = boss.icon || DEFAULT_ICON;
    icon.loading = "lazy";
    icon.onerror = () => (icon.src = DEFAULT_ICON);

    const name = document.createElement("span");
    name.textContent = boss.name;

    left.append(icon, name);

    /* RIGHT */
    const right = document.createElement("div");
    right.className = "boss-right";

    const deathsInput = document.createElement("input");
    deathsInput.type = "number";
    deathsInput.min = 0;
    deathsInput.value = state.deaths;

    const killBtn = document.createElement("button");
    killBtn.textContent = state.dead ? "ВОСКРЕС" : "УБИТ";
    killBtn.className = "kill-btn";

    if (!isAdmin) {
      deathsInput.disabled = true;
      killBtn.disabled = true;
      killBtn.classList.add("disabled");
    } else {
      deathsInput.onchange = e => {
        state.deaths = Math.max(0, +e.target.value);
        saveState(boss.id, state);
        updateStats();
      };

      killBtn.onclick = () => {
        state.dead = !state.dead;
        saveState(boss.id, state);
        renderBosses(currentBosses);
      };
    }

    right.append(deathsInput, killBtn);

    row.append(left, right);
    contentEl.appendChild(row);
  });

  updateStats();
}

/* ======================
   ELDEN RING
   ====================== */
function renderEldenRing(data) {
  contentEl.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.id = "elden-map-wrapper";

  const map = document.createElement("img");
  map.id = "elden-map";
  map.src = data.map;
  wrapper.appendChild(map);

  const reset = document.createElement("button");
  reset.textContent = "СБРОС КАРТЫ";
  reset.onclick = () => {
    map.style.transform = "scale(1)";
  };

  contentEl.append(wrapper, reset);

  Object.entries(data.regions).forEach(([key, region]) => {
    const btn = document.createElement("button");
    btn.textContent = region.name;
    btn.onclick = () => {
      currentBosses = region.bosses;
      renderBosses(region.bosses);
      zoomMap(map);
    };
    contentEl.appendChild(btn);
  });
}

function zoomMap(map) {
  map.style.transform = "scale(1.8)";
}

/* ======================
   STATE
   ====================== */
function loadState(id) {
  return (
    JSON.parse(localStorage.getItem("boss_" + id)) || {
      deaths: 0,
      dead: false
    }
  );
}

function saveState(id, state) {
  localStorage.setItem("boss_" + id, JSON.stringify(state));
}

/* ======================
   STATS
   ====================== */
function updateStats() {
  // здесь ты можешь привязать счётчики смертей / прогресс
}















































