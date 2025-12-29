/* =========================
   CONFIG
========================= */

const GAMES = [
  { id: "ds1", file: "data/ds1.json" },
  { id: "ds2", file: "data/ds2.json" },
  { id: "ds3", file: "data/ds3.json" },
  { id: "sekiro", file: "data/sekiro.json" },
  { id: "elden", file: "data/elden_ring.json" }
];

const STORAGE_KEY = "soulsofon_progress";

/* =========================
   DOM
========================= */

const gameList = document.getElementById("game-list");
const content = document.getElementById("content");
const youDied = document.getElementById("you-died");
const gameProgressEl = document.getElementById("game-progress");
const marathonProgressEl = document.getElementById("marathon-progress");

/* =========================
   STATE
========================= */

let progress = loadProgress();
let currentGame = null;

/* =========================
   INIT
========================= */

init();

async function init() {
  renderGameButtons();
  await loadGame(GAMES[0]);
}

/* =========================
   GAME BUTTONS
========================= */

function renderGameButtons() {
  gameList.innerHTML = "";

  GAMES.forEach(game => {
    const btn = document.createElement("button");
    btn.textContent = game.id.toUpperCase();
    btn.className = "game-btn";
    btn.onclick = () => loadGame(game);
    gameList.appendChild(btn);
  });
}

/* =========================
   LOAD GAME
========================= */

async function loadGame(game) {
  currentGame = game;

  const res = await fetch(game.file);
  const gameData = await res.json();

  ensureGameProgress(gameData);
  renderGame(gameData);
}

/* =========================
   RENDER GAME
========================= */

function renderGame(gameData) {
  content.innerHTML = "";

  /* Banner */
  if (gameData.banner) {
    const banner = document.createElement("img");
    banner.src = gameData.banner;
    banner.className = "game-banner";
    content.appendChild(banner);
  }

  /* Stats */
  const stats = document.createElement("div");
  stats.id = "progress-bar";
  stats.innerHTML = `
    <div id="game-progress"></div>
    <div id="marathon-progress"></div>
  `;
  content.appendChild(stats);

  /* Sections */
  gameData.sections.forEach(section => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "boss-section";

    const title = document.createElement("h2");
    title.textContent = section.title;
    sectionEl.appendChild(title);

    section.bosses.forEach(boss => {
      const state = progress[gameData.id][boss.id];

      const row = document.createElement("div");
      row.className = "boss-row";
      if (state.killed) row.classList.add("killed");

      /* Icon */
      if (boss.icon) {
        const icon = document.createElement("img");
        icon.src = boss.icon;
        icon.className = "boss-icon";
        row.appendChild(icon);
      }

      /* Name */
      const name = document.createElement("span");
      name.textContent = boss.name;
      name.className = "boss-name";
      row.appendChild(name);

      /* Tries */
      const tries = document.createElement("input");
      tries.type = "number";
      tries.value = state.tries;
      tries.onchange = () => {
        state.tries = +tries.value;
        saveProgress();
        updateProgress(gameData);
      };
      row.appendChild(labelWrap("Try", tries));

      /* Deaths */
      const deaths = document.createElement("input");
      deaths.type = "number";
      deaths.value = state.deaths;
      deaths.onchange = () => {
        state.deaths = +deaths.value;
        saveProgress();
        updateProgress(gameData);
      };
      row.appendChild(labelWrap("Death", deaths));

      /* Kill button */
      const killBtn = document.createElement("button");
      killBtn.textContent = "Убит";
      killBtn.className = "kill-btn";
      killBtn.onclick = () => {
        state.killed = !state.killed;
        saveProgress();
        renderGame(gameData);
        if (state.killed) showYouDied();
      };
      row.appendChild(killBtn);

      sectionEl.appendChild(row);
    });

    content.appendChild(sectionEl);
  });

  updateProgress(gameData);
}

/* =========================
   HELPERS
========================= */

function labelWrap(label, input) {
  const wrap = document.createElement("div");
  wrap.className = "stat-wrap";

  const l = document.createElement("div");
  l.textContent = label;
  l.className = "stat-label";

  wrap.appendChild(input);
  wrap.appendChild(l);
  return wrap;
}

function showYouDied() {
  youDied.classList.remove("hidden");
  setTimeout(() => {
    youDied.classList.add("hidden");
  }, 1500);
}

/* =========================
   PROGRESS
========================= */

function updateProgress(gameData) {
  let gameTotal = 0;
  let gameKilled = 0;

  let marathonTotal = 0;
  let marathonKilled = 0;

  gameData.sections.forEach(section => {
    section.bosses.forEach(boss => {
      gameTotal++;
      if (progress[gameData.id][boss.id].killed) gameKilled++;
    });
  });

  Object.values(progress).forEach(game => {
    Object.values(game).forEach(boss => {
      marathonTotal++;
      if (boss.killed) marathonKilled++;
    });
  });

  const gp = Math.round((gameKilled / gameTotal) * 100);
  const mp = Math.round((marathonKilled / marathonTotal) * 100);

  document.getElementById("game-progress").textContent = `Игра: ${gp}%`;
  document.getElementById("marathon-progress").textContent = `Марафон: ${mp}%`;
}

/* =========================
   STORAGE
========================= */

function ensureGameProgress(gameData) {
  if (!progress[gameData.id]) progress[gameData.id] = {};

  gameData.sections.forEach(section => {
    section.bosses.forEach(boss => {
      if (!progress[gameData.id][boss.id]) {
        progress[gameData.id][boss.id] = {
          tries: 0,
          deaths: 0,
          killed: false
        };
      }
    });
  });

  saveProgress();
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadProgress() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}













































