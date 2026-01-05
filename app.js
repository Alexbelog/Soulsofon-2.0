const GAMES = [
  { id: "ds1", title: "Dark Souls I", file: "data/ds1.json" },
  { id: "ds2", title: "Dark Souls II", file: "data/ds2.json" },
  { id: "ds3", title: "Dark Souls III", file: "data/ds3.json" },
  { id: "bloodborne", title: "Bloodborne", file: "data/bloodborne.json" },
  { id: "sekiro", title: "Sekiro", file: "data/sekiro.json" },
  { id: "elden", title: "Elden Ring", file: "data/elden_ring.json" }
];


const STORAGE_KEY = "soulsfon_progress";

/* ПОРЯДОК СЛОЖНОСТИ */
const RANK_ORDER = { "S": 0, "A": 1, "B": 2, "C": 3, "-": 4 };
const RANK_CYCLE = ["-", "C", "B", "A", "S"];

// Карта Elden Ring: точки ставим только для "больших" боссов.
// Ключи — нормализованные имена (см. normalizeBossName).
const ELDEN_MAP_COORDS = {
  "margit the fell omen": [44, 55],
  "godrick the grafted": [42, 60],
  "tree sentinel": [48, 50],
  "rennala queen of the full moon": [35, 50],
  "starscourge radahn": [58, 72],
  "rykard lord of blasphemy": [22, 62],
  "morgott the omen king": [48, 42],
  "fire giant": [58, 20],
  "maliketh the black blade": [66, 24],
  "godfrey first elden lord": [47, 40],
  "hoarah loux warrior": [47, 40],
  "radagon of the golden order": [50, 38],
  "elden beast": [50, 36],
  "malenia blade of miquella": [84, 18],
  "mohg lord of blood": [33, 26]
};

/* =========================
   Boss Details Modal (1280x720)
   ========================= */
(function initBossDetailsModal(){
  const ensure = () => {
    const root = document.getElementById("boss-modal");
    if (!root) return null;

    const win = root.querySelector(".boss-modal__window");
    const img = root.querySelector("#boss-modal-img");
    const name = root.querySelector("#boss-modal-name");
    const desc = root.querySelector("#boss-modal-desc");
    const game = root.querySelector("#boss-modal-game");

    const close = () => {
      root.classList.add("hidden");
      root.setAttribute("aria-hidden","true");
      document.documentElement.classList.remove("modal-open");
    };

    const open = ({ boss, gameId, gameTitle }) => {
      if (!boss) return;
      // prefer large image if present
      const src = boss.image || boss.art || boss.full || boss.icon || "";
      if (img) {
        img.src = src;
        img.alt = boss.name || "Boss";
      }
      if (game) game.textContent = gameTitle ? String(gameTitle) : "";
      if (name) name.textContent = boss.name || "";
      if (desc) desc.textContent = boss.description || boss.desc || "Описание скоро появится.";
      root.dataset.gameId = gameId || "";
      root.dataset.gameTitle = gameTitle || "";

      root.classList.remove("hidden");
      root.setAttribute("aria-hidden","false");
      document.documentElement.classList.add("modal-open");

      // focus close button for accessibility
      const closeBtn = root.querySelector(".boss-modal__close");
      closeBtn?.focus?.();
    };

    // backdrop close
    root.querySelector("[data-close]")?.addEventListener("click", close);
    root.querySelector(".boss-modal__close")?.addEventListener("click", close);

    // prevent clicks inside from closing
    win?.addEventListener("click", (e) => e.stopPropagation());

    // ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !root.classList.contains("hidden")) close();
    });

    return { open, close, root };
  };

  // Expose globally
  window.SoulBossModal = ensure() || { open: () => {}, close: () => {} };
})();


function normalizeBossName(name){
  return String(name || "")
    .toLowerCase()
    .replace(/[\u2019'`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


const gameList = document.getElementById("game-list");
const content = document.getElementById("content");
// Элементы, которые уже есть в stats.html и НЕ должны удаляться при рендере
const bannerImg = document.getElementById("banner-img");
const sectionsEl = document.getElementById("sections");
const gameProgressEl = document.getElementById("game-progress");
const marathonProgressEl = document.getElementById("marathon-progress");
const youDied = document.getElementById("you-died");
const backBtn = document.getElementById("back-btn");
const fadeOverlay = document.getElementById("fade-overlay");

const gameDeathsEl = document.getElementById("game-deaths");
const marathonDeathsEl = document.getElementById("marathon-deaths");
const marathonPlus = document.getElementById("marathon-plus");
const marathonMinus = document.getElementById("marathon-minus");
const gamePlus = document.getElementById("game-plus");
const gameMinus = document.getElementById("game-minus");

let progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
// Ручные смерти (падения, моб-ганки и т.п.) — теперь по играм.
// Синхронизация: +/− в "Marathon" и "Game" влияет на одну и ту же ручную прибавку ТЕКУЩЕЙ игры.
const GAME_EXTRA_STORE = "soulsofon_game_extra_deaths";

function loadGameExtra(){
  try { return JSON.parse(localStorage.getItem(GAME_EXTRA_STORE)) || {}; } catch { return {}; }
}
function saveGameExtra(obj){
  localStorage.setItem(GAME_EXTRA_STORE, JSON.stringify(obj));
}

let gameExtraDeaths = loadGameExtra();

function getGameExtra(gameId){
  return Number(gameExtraDeaths?.[gameId] || 0);
}
function setGameExtra(gameId, value){
  gameExtraDeaths[gameId] = Math.max(0, Number(value) || 0);
  saveGameExtra(gameExtraDeaths);
}
function sumGameExtra(){
  return Object.values(gameExtraDeaths || {}).reduce((s,v)=> s + (Number(v)||0), 0);
}

// Миграция со старого ключа (marathonDeaths) — если он есть, прибавим к текущей игре при первом запуске после обновления.
(function migrateLegacyMarathonExtra(){
  const legacy = Number(localStorage.getItem("marathonDeaths")) || 0;
  if (!legacy) return;
  // если в новом сторе пока пусто — перенесём в ds1 по умолчанию (потом можно руками поправить)
  if (!Object.keys(gameExtraDeaths || {}).length){
    gameExtraDeaths = { ds1: legacy };
    saveGameExtra(gameExtraDeaths);
  }
  localStorage.removeItem("marathonDeaths");
})();

let currentGame = null;
let currentGameData = null;
let eldenQuery = "";

init();

/* ================= INIT ================= */

async function init() {
  renderGameButtons();
  const firstBtn = document.querySelector(".game-btn");
  if (firstBtn) firstBtn.classList.add("active");
  await loadGame(GAMES[0]);
  updateDeathCounters(currentGameData);
}

/* ================= GAME LIST ================= */

function renderGameButtons() {
  gameList.innerHTML = "";
  GAMES.forEach(game => {
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.type = "button";
    btn.onclick = () => {
      document.querySelectorAll(".game-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadGame(game);
    };

    const thumb = document.createElement("img");
    thumb.className = "thumb";
    thumb.alt = game.title;
    thumb.src = `images/game_icons/${game.id}.png`;
    const img = document.createElement("img");
    img.src = `images/banners/${game.id}.jpg`;
    img.alt = game.title;
    thumb.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = game.title;
    const sub = document.createElement("div");
    sub.className = "sub";
    sub.textContent = "Выбор игры";
    meta.append(title, sub);

    btn.append(thumb, meta);
    gameList.appendChild(btn);
  });
}

/* ================= LOAD GAME ================= */

async function loadGame(game) {
  currentGame = game;
  let gameData = null;

  // Elden Ring: стараемся подтянуть ПОЛНЫЙ список боссов из публичного API.
  // Если нет интернета/заблокировано — используем локальный JSON как запасной вариант.
  if (game.id === "elden") {
    try {
      gameData = await loadEldenFromApi();
    } catch (e) {
      console.warn("Elden API unavailable, fallback to local data", e);
      const res = await fetch(game.file);
      gameData = await res.json();
      try {
        if (window.SoulUI && typeof window.SoulUI.toast === "function") {
          window.SoulUI.toast(
            "Elden Ring: неполный список офлайн",
            "Для полного списка боссов нужен интернет. Если открываешь через file:// — запусти сайт через локальный сервер (например: python -m http.server)."
          );
        }
      } catch {}

    }
  } else {
    const res = await fetch(game.file);
    gameData = await res.json();
  }
  currentGameData = gameData;
  ensureProgress(gameData);
  renderGame(gameData);
}

/* ================= ELDEN RING API LOADER ================= */

const ELDEN_API_CACHE_KEY = "soulsfon_elden_api_cache_v1";

async function loadEldenFromApi(){
  // 1) Пробуем кэш (чтобы не долбить API каждый запуск)
  try {
    const cached = JSON.parse(localStorage.getItem(ELDEN_API_CACHE_KEY) || "null");
    if (cached && cached.version === 1 && Array.isArray(cached.bosses) && cached.bosses.length) {
      return buildEldenGameDataFromBosses(cached.bosses);
    }
  } catch {}

  // 2) Тянем все страницы
  const all = [];
  const limit = 100;
  for (let page = 0; page < 20; page++) {
    const url = `https://eldenring.fanapis.com/api/bosses?limit=${limit}&page=${page}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Elden API HTTP ${res.status}`);
    const json = await res.json();
    const data = json?.data || [];
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    // если меньше лимита — это последняя страница
    if (data.length < limit) break;
  }

  // 3) Кладём в кэш
  try {
    localStorage.setItem(ELDEN_API_CACHE_KEY, JSON.stringify({ version: 1, bosses: all }));
  } catch {}

  return buildEldenGameDataFromBosses(all);
}

function buildEldenGameDataFromBosses(apiBosses, dlcBosses = []) {
  // НAlso: API даёт "region" и "location". Для наших секций удобнее группировать по region,
  // а location показывать внутри карточки босса.
  const bosses = (apiBosses || [])
    .filter(b => b && (b.id || b.name))
    .map(b => ({
      id: String(b.id || normalizeBossName(b.name)),
      name: String(b.name || "").trim(),
      icon: b.image || "images/boss_placeholder.svg",
      rank: "-",
      region: String(b.region || "Без региона").trim(),
      location: String(b.location || "").trim()
    }));

  // Группировка по региону (Limgrave, Caelid, ...). Внутри — сортировка по имени.
  const byRegion = new Map();
  bosses.forEach(b => {
    const key = b.region || "Без региона";
    if (!byRegion.has(key)) byRegion.set(key, []);
    byRegion.get(key).push(b);
  });

  const sections = Array.from(byRegion.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "ru"))
    .map(([title, list]) => ({
      title,
      bosses: list.sort((x, y) => x.name.localeCompare(y.name, "ru"))
    }));

  // DLC (Shadow of the Erdtree): отдельные секции в конце списка.
  // dlcBosses: [{ id, name, region, location, image }]
  const dlcByRegion = new Map();
  (dlcBosses || []).forEach(b => {
    const region = String(b.region || b.section || "Без региона").trim();
    if (!dlcByRegion.has(region)) dlcByRegion.set(region, []);
    dlcByRegion.get(region).push({
      id: `dlc_${b.id || normalizeBossName(b.name).replace(/\s+/g, "_")}`,
      name: String(b.name || "").trim(),
      icon: b.image || "images/boss_placeholder.svg",
      rank: "-",
      region,
      location: String(b.location || region).trim()
    });
  });

  const dlcSections = Array.from(dlcByRegion.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "ru"))
    .map(([title, list]) => ({
      title: `DLC: ${title}`,
      bosses: list.sort((x, y) => x.name.localeCompare(y.name, "ru"))
    }));

  return {
    id: "elden",
    title: "Elden Ring",
    sections: [...sections, ...dlcSections]
  };
}

// DLC-список живёт в data/elden_ring_dlc.json (удобно дополнять без правки кода)

/* ================= RENDER ================= */

function renderGame(gameData) {
  // ВАЖНО: не чистим весь <main id="content">, иначе мы удаляем
  // счётчики/прогресс/баннер из stats.html и они перестают отображаться.
  if (sectionsEl) sectionsEl.innerHTML = "";

  // Панель поиска/фильтров для Elden Ring
  if (gameData.id === "elden") {
    const tools = document.createElement("div");
    tools.className = "elden-tools";
    tools.id = "elden-tools";

    const search = document.createElement("input");
    search.type = "search";
    search.className = "elden-search";
    search.placeholder = "Поиск по боссам (Elden Ring + DLC)…";
    search.value = eldenQuery || "";
    search.oninput = () => {
      eldenQuery = search.value || "";
      renderGame(gameData);
    };

    const hint = document.createElement("div");
    hint.className = "elden-hint";
    hint.textContent = "Совет: можно искать по части имени. Секции сворачиваются.";

    // Кнопка карты — под поиском
    const mapWrap = document.createElement("div");
    mapWrap.className = "elden-mapwrap";
    mapWrap.innerHTML = `
      <a class="btn map-btn" href="https://mapgenie.io/elden-ring/maps/the-lands-between" target="_blank" rel="noopener">
        Показать интерактивную карту Elden Ring
      </a>
    `;

    tools.append(search, hint, mapWrap);
    (sectionsEl || content).appendChild(tools);
  }

  // Баннер текущей игры
  if (bannerImg) {
    bannerImg.src = `images/banners/${gameData.id}.jpg`;
    bannerImg.alt = gameData.title || gameData.id;
  }

  gameData.sections.forEach(section => {
    const sec = document.createElement(gameData.id === "elden" ? "details" : "section");
    sec.className = "boss-section";
    if (gameData.id === "elden") { sec.open = true; }

    const h2 = document.createElement(gameData.id === "elden" ? "summary" : "h2");
    h2.className = "section-title";
    h2.textContent = section.title || section.name || "";
    sec.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "boss-grid";
    sec.appendChild(grid);

    [...section.bosses]
      .sort((a, b) => RANK_ORDER[a.rank || "-"] - RANK_ORDER[b.rank || "-"])
      .forEach((boss, idx) => {

        const q = (gameData.id === "elden") ? (eldenQuery || "").trim().toLowerCase() : "";
        if (q && !String(boss.name||"").toLowerCase().includes(q)) return;

        const state = progress[gameData.id][boss.id];

        const row = document.createElement("div");
        row.className = "boss-card";

        // Open boss details (ignore clicks on interactive controls)
        row.addEventListener("click", (e) => {
          const t = e?.target;
          if (t && t.closest && t.closest("button, input, select, textarea, a, .stat-box")) return;
          try { window.SoulBossModal?.open?.({ boss, gameId: gameData.id, gameTitle: gameData.title }); } catch {}
        });
        if (state.killed) row.classList.add("killed");

        
/* ===== CHESS BOSS CARD ===== */
if ((idx % 2) === 1) row.classList.add("alt");

// Header: ранг + имя
const head = document.createElement("div");
head.className = "boss-head";

const nameBtn = document.createElement("button");
nameBtn.className = "boss-name-btn";
nameBtn.type = "button";
nameBtn.textContent = boss.name;
nameBtn.title = "Открыть описание босса";
nameBtn.onclick = (e) => {
  e?.stopPropagation?.();
  try { window.SoulBossModal?.open?.({ boss, gameId: gameData.id, gameTitle: gameData.title }); } catch {}
};

const achBtn = document.createElement("button");
achBtn.className = "boss-ach-btn";
achBtn.type = "button";
achBtn.textContent = "🏆";
achBtn.title = "Открыть связанные достижения";
achBtn.onclick = (e) => {
  e?.stopPropagation?.();
  try { window.SoulAchievements?.openForBoss?.(gameData.id, boss.id, boss.name); } catch {}
};

const rankBtn = document.createElement("button");
rankBtn.className = "boss-rank";
rankBtn.type = "button";

const RANKS = ["S","A","B","C","-"];
const getRank = () => (state.rank || boss.rank || "-");
const setRank = (r) => {
  state.rank = r;
  save();
};
const applyRankStyle = () => {
  const r = getRank();
  rankBtn.textContent = r;
  rankBtn.classList.remove("tier-S","tier-A","tier-B","tier-C","tier--");
  rankBtn.classList.add(`tier-${r}`);
  // Legendary frame for S-rank
  row.classList.toggle("legendary", r === "S");
  rankBtn.disabled = !window.SoulAuth?.isAdmin?.();
  rankBtn.title = window.SoulAuth?.isAdmin?.()
    ? "Клик: сменить тир-ранг"
    : "Тир-ранги может менять только администратор";
};

rankBtn.addEventListener("click", () => {
  if (!window.SoulAuth?.isAdmin?.()) return;
  const cur = getRank();
  const idx = Math.max(0, RANKS.indexOf(cur));
  const next = RANKS[(idx + 1) % RANKS.length];
  setRank(next);
  applyRankStyle();
});

applyRankStyle();

head.appendChild(rankBtn);
head.appendChild(nameBtn);
head.appendChild(achBtn);
row.appendChild(head);

// Image
const imgWrap = document.createElement("div");
imgWrap.className = "boss-imgWrap";
const img = document.createElement("img");
img.className = "boss-img";
img.src = boss.icon;
img.alt = boss.name;
img.loading = "lazy";
imgWrap.appendChild(img);
row.appendChild(imgWrap);

// Controls (TRY / DEATH)
const controls = document.createElement("div");
controls.className = "boss-controls";

const tryBox = statInput("TRY", state, "tries", gameData);
tryBox.classList.add("stat-box","try-box");

const deathBox = statInput("DEATH", state, "deaths", gameData);
deathBox.classList.add("stat-box","death-box");

controls.appendChild(tryBox);
controls.appendChild(deathBox);
row.appendChild(controls);

// Kill button
const kill = document.createElement("button");
kill.className = "boss-kill btn";
kill.type = "button";
kill.textContent = state.killed ? "УБИТ ✓" : "УБИТ";
kill.onclick = () => {
  if (!window.SoulAuth?.isAdmin?.()) return;
  state.killed = !state.killed;
  save();
  row.classList.toggle("killed", state.killed);
  kill.textContent = state.killed ? "УБИТ ✓" : "УБИТ";
  // Эффект YOU DIED — только когда ставим "УБИТ ✓".
  if (state.killed) {
    try { window.SoulUI?.youDiedEffect?.(); } catch {}
  }
  // achievements update + toast
  try { window.SoulAchievements?.recompute?.(progress); } catch {}
};
row.appendChild(kill);

        grid.appendChild(row);
      });

    (sectionsEl || content).appendChild(sec);
  });

  updateDeathCounters(gameData);
}


/* ================= STATS INPUT ================= */

function statInput(label, state, key, gameData) {
  const wrap = document.createElement("div");
  wrap.className = "stat-wrap";

  const l = document.createElement("div");
  l.className = "stat-label";
  l.textContent = label;

  const input = document.createElement("input");
  input.type = "number";
  input.value = state[key];
  input.className = "stat-input";
  // Режим зрителя: редактирование запрещено
  if (!window.SoulAuth?.isAdmin?.()) {
    input.disabled = true;
    input.classList.add("read-only");
  }
  input.addEventListener("focus", () => { input.dataset.prev = String(input.value || 0); });
  input.onchange = () => {
    const prev = Number(input.dataset.prev || state[key] || 0);
    state[key] = Math.max(0, +input.value);
    save();
    updateDeathCounters(gameData);
  };

  // В карточке: сначала подпись, затем число (центрировано CSS-ом).
  wrap.append(l, input);
  return wrap;
}

/* ================= DEATH COUNTERS & PROGRESS ================= */

function updateDeathCounters(gameData) {
  if (!gameData) return;

  const gameBossDeaths = calcGameDeaths(gameData.id);
  const allBossDeaths = calcAllBossDeaths();

  const manualThisGame = getGameExtra(gameData.id);
  const manualAll = sumGameExtra();

  // "Смерти в игре" — текущая игра: смерти по боссам + ручные смерти этой игры
  animateCounter(gameDeathsEl, gameBossDeaths + manualThisGame);

  // "Смерти марафона" — все смерти по боссам (во всех играх) + сумма ручных смертей по играм
  animateCounter(marathonDeathsEl, allBossDeaths + manualAll);

  updateProgressBars(gameData);

  // Пробуем авто-анлоки достижений (и тосты) если скрипт подключён
  try { window.SoulAchievements?.checkAndNotify?.(); } catch {}
}

function updateProgressBars(gameData) {
  const game = calcKillProgress(gameData.id);
  const marathon = calcKillProgress();

  const gamePct = Math.round(game * 100);
  const marathonPct = Math.round(marathon * 100);

  if (gameProgressEl) gameProgressEl.style.width = `${gamePct}%`;
  if (marathonProgressEl) marathonProgressEl.style.width = `${marathonPct}%`;

  const gameText = document.getElementById("game-progress-text");
  const marathonText = document.getElementById("marathon-progress-text");
  if (gameText) gameText.textContent = `${gamePct}%`;
  if (marathonText) marathonText.textContent = `${marathonPct}%`;

  // Completion card (for current game)
  const compPctEl = document.getElementById("completion-pct");
  const compDetailEl = document.getElementById("completion-detail");
  const stats = calcKillStats(gameData.id);
  if (compPctEl) compPctEl.textContent = `${Math.round(stats.pct * 100)}%`;
  if (compDetailEl) compDetailEl.textContent = `${stats.killed} / ${stats.total} bosses`;
}

// Доля убитых боссов: либо по одной игре (gameId), либо по всему марафону
function calcKillProgress(gameId) {
  let total = 0;
  let killed = 0;

  const gamesToScan = gameId ? { [gameId]: progress[gameId] } : progress;
  Object.values(gamesToScan).forEach(game => {
    if (!game) return;
    Object.values(game).forEach((boss, idx) => {
      total += 1;
      if (boss.killed) killed += 1;
    });
  });

  if (total === 0) return 0;
  return killed / total;
}

function calcKillStats(gameId) {
  let total = 0;
  let killed = 0;
  const gamesToScan = gameId ? { [gameId]: progress[gameId] } : progress;

  Object.entries(gamesToScan).forEach(([gid, game]) => {
    if (!game) return;
    Object.values(game).forEach(b => {
      total++;
      if (b.killed) killed++;
    });
  });

  return { total, killed, pct: total ? (killed / total) : 0 };
}


function adjustManualDeaths(delta){
  if (!currentGameData) return;
  const gid = currentGameData.id;
  const cur = getGameExtra(gid);
  let next = cur + delta;
  if (next < 0){
    // clamp so we never go below 0
    delta = -cur;
    next = 0;
  }
  setGameExtra(gid, next);
  updateDeathCounters(currentGameData);
  // По запросу: изменение счётчиков смертей НЕ запускает эффект YOU DIED.
}

if (marathonPlus) marathonPlus.onclick = () => adjustManualDeaths(1);
if (marathonMinus) marathonMinus.onclick = () => adjustManualDeaths(-1);
if (gamePlus) gamePlus.onclick = () => adjustManualDeaths(1);
if (gameMinus) gameMinus.onclick = () => adjustManualDeaths(-1);

/* ===== 💀 ANIMATION ===== */

function animateCounter(el, value) {
  if (!el) return;
  el.textContent = value;
  // По запросу: без "пульса"/эффектов при изменении счётчиков смертей.
}

/* ================= STORAGE ================= */

function ensureProgress(gameData) {
  if (!progress[gameData.id]) progress[gameData.id] = {};
  gameData.sections.forEach(s =>
    s.bosses.forEach(b => {
      if (!progress[gameData.id][b.id]) {
        progress[gameData.id][b.id] = { tries: 0, deaths: 0, killed: false };
      }
      if (!b.rank) b.rank = "-";
    })
  );
  save();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/* ================= YOU DIED ================= */

function showYouDied() {
  // Legacy wrapper; new эффект живёт в ui.js
  if (window.SoulUI?.youDiedEffect) return window.SoulUI.youDiedEffect();
  youDied?.classList?.remove("hidden");
  setTimeout(() => youDied?.classList?.add("hidden"), 1500);
}

/* ================= BACK ================= */

backBtn.onclick = () => {
  try { window.SoulUI?.navigateWithFade?.("index.html"); }
  catch { location.href = "index.html"; }
};

function calcGameDeaths(gameId) {
  let sum = 0;
  Object.values(progress[gameId]).forEach(b => {
    sum += Number(b.deaths) || 0;
  });
  return sum;
}

function calcAllBossDeaths() {
  let sum = 0;
  Object.values(progress).forEach(game => {
    Object.values(game).forEach((boss, idx) => {
      sum += Number(boss.deaths) || 0;
    });
  });
  return sum;
}
































































