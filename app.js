// ==========================
// CONFIG
// ==========================

const GAMES = [
  { id: "ds1", title: "Dark Souls", file: "data/ds1.json" },
  { id: "ds2", title: "Dark Souls II", file: "data/ds2.json" },
  { id: "ds3", title: "Dark Souls III", file: "data/ds3.json" },
  { id: "sekiro", title: "Sekiro", file: "data/sekiro.json" },
  { id: "elden", title: "Elden Ring", file: "data/elden_ring.json" }
];

const STORAGE_KEY = "soulsofon_progress_v1";

// ==========================
// STATE
// ==========================

let currentGame = null;
let progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

// ==========================
// DOM
// ==========================

const gameList = document.getElementById("game-list");
const content = document.getElementById("content");

// ==========================
// INIT
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  renderGameButtons();
  loadGame(GAMES[0]);
});

// ==========================
// GAME LIST
// ==========================

function renderGameButtons() {
  gameList.innerHTML = "";

  GAMES.forEach(game => {
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.textContent = game.title;
    btn.onclick = () => loadGame(game);
    gameList.appendChild(btn);
  });
}

// ==========================
// LOAD GAME
// ==========================

async function loadGame(game) {
  const res = await fetch(game.file);
  const data = await res.json();

  currentGame = data;
  initProgress(data);
  renderGame(data);
}

// ==========================
// PROGRESS
// ==========================

function initProgress(gameData) {
  if (!progress[gameData.id]) {
    progress[gameData.id] = {};
    gameData.sections.forEach(section => {
      section.bosses.forEach(boss => {
        progress[gameData.id][boss.id] = {
          deaths: 0,
          tries: 0,
          killed: false
        };
      });
    });
    saveProgress();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ==========================
// RENDER GAME
// ==========================

function renderGame(gameData) {
  content.innerHTML = "";

  // Banner
  const banner = document.createElement("img");
  banner.src = gameData.banner;
  banner.className = "game-banner";
  content.appendChild(banner);

  // Sections
  gameData.sections.forEach(section => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "boss-section";

    const title = document.createElement("h2");
    title.textContent = section.title;
    sectionEl.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "boss-grid";

    section.bosses.forEach(boss => {
      grid.appendChild(renderBoss(gameData.id, boss));
    });

    sectionEl.appendChild(grid);
    content.appendChild(sectionEl);
  });
}

// ==========================
// RENDER BOSS
// ==========================

function renderBoss(gameId, boss) {
  const state = progress[gameId][boss.id];

  const card = document.createElement("div");
  card.className = "boss-card";
  if (state.killed) card.classList.add("killed");

  const icon = document.createElement("img");
  icon.src = boss.icon;
  icon.className = "boss-icon";

  const name = document.createElement("div");
  name.className = "boss-name";
  name.textContent = boss.name;

  const stats = document.createElement("div");
  stats.className = "boss-stats";

  const tries = document.createElement("span");
  tries.textContent = `Try: ${state.tries}`;

  const deaths = document.createElement("span");
  deaths.textContent = `Death: ${state.deaths}`;

  stats.append(tries, deaths);

  const controls = document.createElement("div");
  controls.className = "boss-controls";

  const addTry = button("+Try", () => {
    state.tries++;
    saveProgress();
    renderGame(currentGame);
  });

  const addDeath = button("+Death", () => {
    state.deaths++;
    saveProgress();
    renderGame(currentGame);
  });

  const kill = button("Убит", () => {
    state.killed = !state.killed;
    saveProgress();
    renderGame(currentGame);
  });

  controls.append(addTry, addDeath, kill);

  card.append(icon, name, stats, controls);
  return card;
}

// ==========================
// UI HELPERS
// ==========================

function button(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}











































