const GAMES = [
  { id: "ds1", file: "data/ds1.json" },
  { id: "ds2", file: "data/ds2.json" },
  { id: "ds3", file: "data/ds3.json" },
  { id: "bloodborne", file: "data/bloodborne.json" },
  { id: "sekiro", file: "data/sekiro.json" },
  { id: "elden", file: "data/elden_ring.json" }
];

const STORAGE_KEY = "soulsofon_progress";

/* ПОРЯДОК СЛОЖНОСТИ */
const RANK_ORDER = { "S": 0, "A": 1, "B": 2, "C": 3, "-": 4 };
const RANK_CYCLE = ["-", "C", "B", "A", "S"];

const gameList = document.getElementById("game-list");
const content = document.getElementById("content");
const youDied = document.getElementById("you-died");
const backBtn = document.getElementById("back-btn");
const fadeOverlay = document.getElementById("fade-overlay");

const gameDeathsEl = document.getElementById("game-deaths");
const marathonDeathsEl = document.getElementById("marathon-deaths");
const marathonPlus = document.getElementById("marathon-plus");
const marathonMinus = document.getElementById("marathon-minus");

let progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let marathonDeaths = Number(localStorage.getItem("marathonDeaths")) || 0;
let currentGame = null;

init();

/* ================= INIT ================= */

async function init() {
  renderGameButtons();
  await loadGame(GAMES[0]);
  updateMarathonDeaths();
}

/* ================= GAME LIST ================= */

function renderGameButtons() {
  gameList.innerHTML = "";
  GAMES.forEach(game => {
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.textContent = game.id.toUpperCase();
    btn.onclick = () => loadGame(game);
    gameList.appendChild(btn);
  });
}

/* ================= LOAD GAME ================= */

async function loadGame(game) {
  currentGame = game;
  const res = await fetch(game.file);
  const gameData = await res.json();
  ensureProgress(gameData);
  renderGame(gameData);
}

/* ================= RENDER ================= */

function renderGame(gameData) {
  content.innerHTML = "";

  /* ❌ БАННЕРЫ УБРАНЫ ПОЛНОСТЬЮ */

  gameData.sections.forEach(section => {
    const sec = document.createElement("section");
    sec.className = "boss-section";

    const h2 = document.createElement("h2");
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
          if (state.killed) showYouDied();
        };
        row.appendChild(kill);

        sec.appendChild(row);
      });

    content.appendChild(sec);
  });

  updateGameDeaths(gameData);
}

/* ================= STATS INPUT ================= */

function statInput(label, state, key, gameData) {
  const wrap = document.createElement("div");
  wrap.className = "stat-wrap";

  const input = document.createElement("input");
  input.type = "number";
  input.value = state[key];
  input.onchange = () => {
    state[key] = Math.max(0, +input.value);
    save();
    updateGameDeaths(gameData);
  };

  const l = document.createElement("div");
  l.className = "stat-label";
  l.textContent = label;

  wrap.append(input, l);
  return wrap;
}

/* ================= DEATH COUNTERS ================= */

function updateGameDeaths(gameData) {
  let gameDeaths = 0;
  Object.values(progress[gameData.id]).forEach(b => {
    gameDeaths += b.deaths;
  });
  animateCounter(gameDeathsEl, gameDeaths);
}

function updateMarathonDeaths() {
  animateCounter(marathonDeathsEl, marathonDeaths);
  localStorage.setItem("marathonDeaths", marathonDeaths);
}

marathonPlus.onclick = () => {
  marathonDeaths++;
  updateMarathonDeaths();
};

marathonMinus.onclick = () => {
  marathonDeaths = Math.max(0, marathonDeaths - 1);
  updateMarathonDeaths();
};

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
  youDied.classList.remove("hidden");
  setTimeout(() => youDied.classList.add("hidden"), 1500);
}

/* ================= BACK ================= */

backBtn.onclick = () => {
  fadeOverlay.classList.add("active");
  setTimeout(() => (location.href = "index.html"), 600);
};






























































