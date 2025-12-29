// ================================
// CONFIG
// ================================
const GAMES = {
  ds1: "data/ds1.json",
  ds2: "data/ds2.json",
  ds3: "data/ds3.json",
  sekiro: "data/sekiro.json",
  elden_ring: "data/elden_ring.json"
};

let gameData = null;
let currentGame = null;

// ================================
// DOM READY
// ================================
document.addEventListener("DOMContentLoaded", () => {
  initGameButtons();
});

// ================================
// INIT
// ================================
function initGameButtons() {
  document.querySelectorAll("[data-game]").forEach(btn => {
    btn.addEventListener("click", () => {
      const game = btn.dataset.game;
      loadGame(game);
    });
  });
}

// ================================
// LOAD GAME
// ================================
async function loadGame(game) {
  currentGame = game;

  try {
    const response = await fetch(GAMES[game]);
    const text = await response.text();
    gameData = JSON.parse(text);
  } catch (e) {
    console.error("Ошибка загрузки JSON:", e);
    return;
  }

  restoreProgress();
  renderGame();
}

// ================================
// RENDER
// ================================
function renderGame() {
  const container = document.getElementById("content");
  if (!container) return;

  container.innerHTML = "";

  gameData.sections.forEach((section, sectionIndex) => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "section";

    const title = document.createElement("h2");
    title.textContent = section.title;
    sectionEl.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "boss-grid";

    section.bosses.forEach(boss => {
      const bossEl = document.createElement("div");
      bossEl.className = "boss";

      const img = document.createElement("img");
      img.src = boss.icon;
      img.alt = boss.name;

      const name = document.createElement("div");
      name.textContent = boss.name;

      const counter = document.createElement("input");
      counter.type = "number";
      counter.min = 0;
      counter.value = boss.deaths || 0;
      counter.addEventListener("change", () => {
        boss.deaths = parseInt(counter.value) || 0;
        saveProgress();
        updateStats();
      });

      bossEl.append(img, name, counter);
      grid.appendChild(bossEl);
    });

    sectionEl.appendChild(grid);
    container.appendChild(sectionEl);
  });

  updateStats();
}

// ================================
// STATS
// ================================
function countDeaths() {
  let total = 0;

  gameData.sections.forEach(section => {
    section.bosses.forEach(boss => {
      total += boss.deaths || 0;
    });
  });

  return total;
}

function updateStats() {
  const el = document.getElementById("total-deaths");
  if (el) el.textContent = countDeaths();
}

// ================================
// LOCAL STORAGE
// ================================
function saveProgress() {
  if (!currentGame || !gameData) return;
  localStorage.setItem(
    `souls-progress-${currentGame}`,
    JSON.stringify(gameData)
  );
}

function restoreProgress() {
  const saved = localStorage.getItem(`souls-progress-${currentGame}`);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    gameData.sections.forEach((section, sIndex) => {
      section.bosses.forEach((boss, bIndex) => {
        boss.deaths =
          parsed.sections?.[sIndex]?.bosses?.[bIndex]?.deaths || 0;
      });
    });
  } catch (e) {
    console.warn("Ошибка восстановления прогресса");
  }
}

























