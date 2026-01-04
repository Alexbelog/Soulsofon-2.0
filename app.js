const GAMES = [
  { id: "ds1", title: "Dark Souls", file: "data/ds1.json" },
  { id: "ds2", title: "Dark Souls II", file: "data/ds2.json" },
  { id: "ds3", title: "Dark Souls III", file: "data/ds3.json" },
  { id: "bloodborne", title: "Bloodborne", file: "data/bloodborne.json" },
  { id: "sekiro", title: "Sekiro", file: "data/sekiro.json" },
  { id: "elden", title: "Elden Ring", file: "data/elden_ring.json" }
];


const STORAGE_KEY = "soulsofon_progress";

/* ПОРЯДОК СЛОЖНОСТИ */
const RANK_ORDER = { "S": 0, "A": 1, "B": 2, "C": 3, "-": 4 };
const RANK_CYCLE = ["-", "C", "B", "A", "S"];

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

    const thumb = document.createElement("div");
    thumb.className = "thumb";
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
    sub.textContent = "Select game";
    meta.append(title, sub);

    btn.append(thumb, meta);
    gameList.appendChild(btn);
  });
}

/* ================= LOAD GAME ================= */

async function loadGame(game) {
  currentGame = game;
  const res = await fetch(game.file);
  const gameData = await res.json();
  currentGameData = gameData;
  ensureProgress(gameData);
  renderGame(gameData);
}

/* ================= RENDER ================= */

function renderGame(gameData) {
  // ВАЖНО: не чистим весь <main id="content">, иначе мы удаляем
  // счётчики/прогресс/баннер из stats.html и они перестают отображаться.
  if (sectionsEl) sectionsEl.innerHTML = "";

  // Баннер текущей игры
  if (bannerImg) {
    bannerImg.src = `images/banners/${gameData.id}.jpg`;
    bannerImg.alt = gameData.title || gameData.id;
  }

  gameData.sections.forEach(section => {
    const sec = document.createElement("section");
    sec.className = "boss-section";

    const h2 = document.createElement("h2");
    h2.className = "section-title";
    h2.textContent = section.title;
    sec.appendChild(h2);

    [...section.bosses]
      .sort((a, b) => RANK_ORDER[a.rank || "-"] - RANK_ORDER[b.rank || "-"])
      .forEach(boss => {

        const state = progress[gameData.id][boss.id];

        const row = document.createElement("div");
        row.className = "boss-row";
        if (state.killed) row.classList.add("killed");

        /* ===== RANK ===== */
        const rank = document.createElement("div");
        rank.className = `boss-rank rank-${boss.rank || "-"}`;
        rank.textContent = `[${boss.rank || "-"}]`;
        rank.onclick = () => {
          const i = RANK_CYCLE.indexOf(boss.rank || "-");
          boss.rank = RANK_CYCLE[(i + 1) % RANK_CYCLE.length];
          save();
          renderGame(gameData);
        };
        row.appendChild(rank);

        /* ICON */
        if (boss.icon) {
          const img = document.createElement("img");
          img.src = boss.icon;
          img.className = "boss-icon";
          row.appendChild(img);
        }

        /* NAME */
        const name = document.createElement("div");
        name.className = "boss-name";
        name.textContent = boss.name;
        row.appendChild(name);

        /* ACHIEVEMENTS BOUND TO THIS BOSS */
        try {
          const bound = window.SoulsofonAchievements?.getBoundForBoss?.(gameData.id, boss.id) || [];
          if (bound.length){
            const badgeWrap = document.createElement("div");
            badgeWrap.className = "boss-ach";
            bound.slice(0,3).forEach(a => {
              const b = document.createElement("button");
              b.type = "button";
              b.className = "ach-chip";
              b.textContent = a.icon ? `${a.icon} ${a.short}` : a.short;
              b.title = a.name;
              b.onclick = () => {
                window.SoulsofonAchievements?.markDone?.(a.id);
                // Перерисуем строку, чтобы чип пропал после выполнения
                renderGame(gameData);
              };
              badgeWrap.appendChild(b);
            });
            row.appendChild(badgeWrap);
          }
        } catch {}

        row.appendChild(statInput("Try", state, "tries", gameData));
        row.appendChild(statInput("Death", state, "deaths", gameData));

        /* KILL */
        const kill = document.createElement("button");
        kill.className = "kill-btn";
        kill.textContent = "Убит";
        kill.onclick = () => {
          state.killed = !state.killed;
          save();
          renderGame(gameData);
          // эффекты на убийство — через достижения/тосты (ниже)
        };
        row.appendChild(kill);

        sec.appendChild(row);
      });

    (sectionsEl || content).appendChild(sec);
  });

  updateDeathCounters(gameData);
}

/* ================= STATS INPUT ================= */

function statInput(label, state, key, gameData) {
  const wrap = document.createElement("div");
  wrap.className = "stat-wrap";

  const input = document.createElement("input");
  input.type = "number";
  input.value = state[key];
  input.addEventListener("focus", () => { input.dataset.prev = String(input.value || 0); });
  input.onchange = () => {
    const prev = Number(input.dataset.prev || state[key] || 0);
    state[key] = Math.max(0, +input.value);
    save();
    updateDeathCounters(gameData);

    if (key === "deaths" && Number(state[key]) > prev) {
      try { window.SoulUI?.youDiedEffect?.(); } catch {}
    }
  };

  const l = document.createElement("div");
  l.className = "stat-label";
  l.textContent = label;

  wrap.append(input, l);
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
  try { window.SoulsofonAchievements?.checkAndNotify?.(); } catch {}
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
    Object.values(game).forEach(boss => {
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
  if (delta > 0) {
    // визуальный и звуковой эффект смерти
    try { window.SoulUI?.youDiedEffect?.(); } catch {}
  }
}

if (marathonPlus) marathonPlus.onclick = () => adjustManualDeaths(1);
if (marathonMinus) marathonMinus.onclick = () => adjustManualDeaths(-1);
if (gamePlus) gamePlus.onclick = () => adjustManualDeaths(1);
if (gameMinus) gameMinus.onclick = () => adjustManualDeaths(-1);

/* ===== 💀 ANIMATION ===== */

function animateCounter(el, value) {
  if (!el) return;
  el.textContent = value;
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
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
  fadeOverlay.classList.add("active");
  setTimeout(() => (location.href = "index.html"), 600);
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
    Object.values(game).forEach(boss => {
      sum += Number(boss.deaths) || 0;
    });
  });
  return sum;
}
































































