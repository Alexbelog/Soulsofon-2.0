// ===== ADMIN MODE =====
const params = new URLSearchParams(window.location.search);

if (params.get("admin") === "1") {
  localStorage.setItem("soul_admin", "true");
}

const isAdmin = localStorage.getItem("soul_admin") === "true";
const games = {
  ds1: "data/ds1.json",
  ds2: "data/ds2.json",
  ds3: "data/ds3.json",
  sekiro: "data/sekiro.json",
  elden: "data/elden_ring.json"
};

const admin = new URLSearchParams(location.search).get("admin") === "1";

// ================== DOM ==================

const gameList = document.getElementById("game-list");
const bossList = document.getElementById("boss-list");
const gameBanner = document.getElementById("game-banner");
const regionSelect = document.getElementById("region-select");

const gameDeathsEl = document.getElementById("game-deaths");
const totalDeathsEl = document.getElementById("total-deaths");

// ================== STORAGE ==================

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function load(key, fallback = {}) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

// ================== GAME BUTTONS ==================

Object.entries(games).forEach(([id, path]) => {
  const btn = document.createElement("button");
  btn.className = "game-btn";
  btn.textContent = id.toUpperCase();
  btn.onclick = () => loadGame(id, path, btn);
  gameList.appendChild(btn);
});

// ================== LOAD GAME ==================

async function loadGame(id, path, btn) {
  document.querySelectorAll(".game-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const response = await fetch(path);
  const gameData = await response.json();

  gameBanner.src = gameData.banner || "";
  regionSelect.style.display = "none";
  bossList.innerHTML = "";

  // ===== ELDEN RING (REGIONS) =====
  if (id === "elden") {
    regionSelect.style.display = "block";
    regionSelect.innerHTML = "";

    Object.entries(gameData.regions).forEach(([key, region]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = region.name;
      regionSelect.appendChild(option);
    });

    const savedRegion =
      localStorage.getItem("elden_region") ||
      Object.keys(gameData.regions)[0];

    regionSelect.value = savedRegion;

    regionSelect.onchange = () => {
      localStorage.setItem("elden_region", regionSelect.value);
      renderBosses(id, gameData.regions[regionSelect.value].bosses);
    };

    renderBosses(id, gameData.regions[savedRegion].bosses);
    return;
  }

  // ===== ALL OTHER GAMES (SECTIONS) =====
  const allBosses = [];

  if (gameData.sections) {
    Object.values(gameData.sections).forEach(section => {
      if (Array.isArray(section.bosses)) {
        section.bosses.forEach(boss => allBosses.push(boss));
      }
    });
  }

  renderBosses(id, allBosses);
}

// ================== RENDER BOSSES ==================

function renderBosses(gameId, bosses) {
  bossList.innerHTML = "";

  const state = load(gameId);
  let gameDeaths = 0;

  bosses.forEach(boss => {
    const saved = state[boss.id] || { tries: 0, deaths: 0, dead: false };
    gameDeaths += saved.deaths;

    const row = document.createElement("div");
    row.className = "boss" + (saved.dead ? " dead" : "");

    row.innerHTML = `
      <div>${boss.name}</div>
      <input type="number" value="${saved.tries}" ${!admin ? "disabled" : ""}>
      <input type="number" value="${saved.deaths}" ${!admin ? "disabled" : ""}>
      <button class="kill-btn">${saved.dead ? "DEAD" : "KILL"}</button>
    `;

    if (admin) {
      const [triesInput, deathsInput] = row.querySelectorAll("input");

      triesInput.onchange = () => {
        saved.tries = +triesInput.value;
        state[boss.id] = saved;
        save(gameId, state);
      };

      deathsInput.onchange = () => {
        saved.deaths = +deathsInput.value;
        state[boss.id] = saved;
        save(gameId, state);
        renderBosses(gameId, bosses);
      };

      row.querySelector(".kill-btn").onclick = () => {
        saved.dead = !saved.dead;
        state[boss.id] = saved;
        save(gameId, state);
        renderBosses(gameId, bosses);
      };
    }

    bossList.appendChild(row);
  });

  // ===== UPDATE STATS =====
  gameDeathsEl.textContent = gameDeaths;
  totalDeathsEl.textContent = calculateTotalDeaths();
}

// ================== TOTAL DEATHS ==================

function calculateTotalDeaths() {
  let total = 0;

  Object.keys(games).forEach(gameId => {
    const data = load(gameId);
    Object.values(data).forEach(boss => {
      total += boss.deaths || 0;
    });
  });

  return total;
}

// ================== BACK BUTTON ==================

document.getElementById("back-btn").onclick = () => {
  document.body.style.opacity = 0;
  setTimeout(() => location.href = "index.html", 400);
};

































