// ================================
// SOULSFON 2.0 — app.js
// ================================

// ---- CONFIG ----
const games = [
  { id: "ds1", name: "Dark Souls", json: "data/ds1.json" },
  { id: "ds2", name: "Dark Souls II", json: "data/ds2.json" },
  { id: "ds3", name: "Dark Souls III", json: "data/ds3.json" },
  { id: "sekiro", name: "Sekiro", json: "data/sekiro.json" },
  { id: "elden", name: "Elden Ring", json: "data/elden_ring.json" }
];

// ---- STATE ----
let currentGame = null;
let gameData = null;

// ---- DOM ----
const sidebar = document.getElementById("game-list");
const content = document.getElementById("content");

// ---- INIT ----
initSidebar();
loadGame(games[0]);

// ================================
// SIDEBAR
// ================================

function initSidebar() {
  sidebar.innerHTML = "";

  games.forEach(game => {
    const btn = document.createElement("button");
    btn.textContent = game.name;
    btn.className = "game-btn";
    btn.onclick = () => loadGame(game);
    sidebar.appendChild(btn);
  });
}

// ================================
// LOCAL STORAGE
// ================================

function storageKey(gameId) {
  return `soulsofon_progress_${gameId}`;
}

function saveProgress() {
  if (!currentGame || !gameData) return;
  localStorage.setItem(storageKey(currentGame.id), JSON.stringify(gameData));
}

function loadProgress(game) {
  const saved = localStorage.getItem(storageKey(game.id));
  return saved ? JSON.parse(saved) : null;
}

// ================================
// LOAD GAME
// ================================

async function loadGame(game) {
  currentGame = game;
  content.innerHTML = "<p>Загрузка...</p>";

  const saved = loadProgress(game);
  if (saved) {
    gameData = saved;
    renderGame();
    return;
  }

  try {
    const res = await fetch(game.json);
    gameData = await res.json();
    saveProgress();
    renderGame();
  } catch (err) {
    console.error(err);
    content.innerHTML = "<p>Ошибка загрузки данных</p>";
  }
}

// ================================
// RENDER GAME
// ================================

function renderGame() {
  content.innerHTML = "";

  // HEADER
  const header = document.createElement("div");
  header.className = "game-header";
  header.innerHTML = `
    <img src="${gameData.poster}" class="game-poster">
    <h1>${gameData.title}</h1>
    <div class="death-counter">
      Смертей в игре: <strong>${countDeaths()}</strong>
    </div>
  `;
  content.appendChild(header);

  // SECTIONS
  for (const section in gameData.sections) {
    renderSection(section, gameData.sections[section]);
  }
}

// ================================
// RENDER SECTION
// ================================

function renderSection(sectionKey, bosses) {
  const section = document.createElement("section");
  section.className = "boss-section";

  section.innerHTML = `<h2>${sectionTitle(sectionKey)}</h2>`;

  bosses.forEach((boss, index) => {
    section.appendChild(renderBossRow(boss, sectionKey, index));
  });

  content.appendChild(section);
}

function sectionTitle(key) {
  return {
    main: "Основные боссы",
    optional: "Опциональные боссы",
    dlc: "Боссы DLC"
  }[key] || key;
}

// ================================
// BOSS ROW
// ================================

function renderBossRow(boss, section, index) {
  const row = document.createElement("div");
  row.className = "boss-row";
  row.dataset.status = boss.killed ? "killed" : "alive";

  row.innerHTML = `
    <div class="boss-left">
      <img src="${boss.icon || ""}" class="boss-icon">
      <div class="boss-name">${boss.name}</div>
    </div>

    <div class="boss-right">
      <div class="stat">
        <input type="number" min="0" value="${boss.tries || 0}"
          data-section="${section}" data-index="${index}" data-field="tries">
        <span>Try</span>
      </div>

      <div class="stat">
        <input type="number" min="0" value="${boss.deaths || 0}"
          data-section="${section}" data-index="${index}" data-field="deaths">
        <span>Death</span>
      </div>

      <button class="boss-toggle">${boss.killed ? "☠" : "⚔"}</button>
    </div>
  `;

  row.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", updateBossValue);
  });

  row.querySelector(".boss-toggle").onclick = () => {
    boss.killed = !boss.killed;
    row.dataset.status = boss.killed ? "killed" : "alive";
    row.querySelector(".boss-toggle").textContent = boss.killed ? "☠" : "⚔";
    saveProgress();
    updateDeathCounter();
  };

  return row;
}

// ================================
// UPDATE
// ================================

function updateBossValue(e) {
  const { section, index, field } = e.target.dataset;
  gameData.sections[section][index][field] = Number(e.target.value);
  saveProgress();
  updateDeathCounter();
}

function countDeaths() {
  let total = 0;
  for (const section in gameData.sections) {
    gameData.sections[section].forEach(b => {
      total += Number(b.deaths || 0);
    });
  }
  return total;
}

function updateDeathCounter() {
  const el = document.querySelector(".death-counter strong");
  if (el) el.textContent = countDeaths();
}
















