// ================= CONFIG =================
const GAMES = {
  ds1: "ds1.json",
  ds2: "ds2.json",
  ds3: "ds3.json",
  sekiro: "sekiro.json"
  // Elden Ring будем добавлять отдельно по регионам
};

let currentGame = null;
let currentData = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".game-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const game = btn.dataset.game;
      if (game && GAMES[game]) {
        loadGame(game);
      }
    });
  });
});

// ================= LOAD GAME =================
async function loadGame(gameKey) {
  currentGame = gameKey;

  const response = await fetch(GAMES[gameKey]);
  const data = await response.json();
  currentData = data;

  document.getElementById("gameBanner").src = data.banner;
  renderBosses(data);
  updateStats();
}

// ================= RENDER BOSSES =================
function renderBosses(data) {
  const bossList = document.getElementById("bossList");
  bossList.innerHTML = "";

  data.sections.forEach(section => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "boss-section";

    const title = document.createElement("h3");
    title.textContent = section.title;
    sectionEl.appendChild(title);

    section.bosses.forEach(boss => {
      const row = document.createElement("div");
      row.className = "boss-row";

      const saved = loadBossState(boss.id);

      if (saved.killed) row.classList.add("killed");

      // ICON
      const icon = document.createElement("img");
      icon.src = boss.icon;
      icon.className = "boss-icon";

      // NAME
      const name = document.createElement("div");
      name.className = "boss-name";
      name.textContent = boss.name;

      // TRY
      const tryBox = createValueInput("Try", saved.try, value => {
        saved.try = value;
        saveBossState(boss.id, saved);
      });

      // DEATH
      const deathBox = createValueInput("Death", saved.death, value => {
        saved.death = value;
        saveBossState(boss.id, saved);
        updateStats();
      });

      // KILLED
      const killedBox = document.createElement("div");
      killedBox.className = "boss-killed";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = saved.killed;

      checkbox.addEventListener("change", () => {
        saved.killed = checkbox.checked;
        row.classList.toggle("killed", checkbox.checked);
        saveBossState(boss.id, saved);
      });

      killedBox.appendChild(checkbox);

      row.append(icon, name, tryBox, deathBox, killedBox);
      sectionEl.appendChild(row);
    });

    bossList.appendChild(sectionEl);
  });
}

// ================= INPUT CREATOR =================
function createValueInput(label, value, onChange) {
  const box = document.createElement("div");
  box.className = "boss-value";

  const input = document.createElement("input");
  input.type = "number";
  input.min = 0;
  input.value = value;

  input.addEventListener("input", () => {
    const v = parseInt(input.value) || 0;
    onChange(v);
  });

  const span = document.createElement("span");
  span.textContent = label;

  box.append(input, span);
  return box;
}

// ================= STORAGE =================
function storageKey(id) {
  return `soulsofon_${currentGame}_${id}`;
}

function loadBossState(id) {
  const raw = localStorage.getItem(storageKey(id));
  return raw
    ? JSON.parse(raw)
    : { try: 0, death: 0, killed: false };
}

function saveBossState(id, state) {
  localStorage.setItem(storageKey(id), JSON.stringify(state));
}

// ================= STATS =================
function updateStats() {
  let gameDeaths = 0;
  let totalDeaths = 0;

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("soulsofon_")) {
      const data = JSON.parse(localStorage.getItem(key));
      totalDeaths += data.death || 0;

      if (key.startsWith(`soulsofon_${currentGame}_`)) {
        gameDeaths += data.death || 0;
      }
    }
  });

  document.getElementById("gameDeaths").textContent = gameDeaths;
  document.getElementById("totalDeaths").textContent = totalDeaths;
}










