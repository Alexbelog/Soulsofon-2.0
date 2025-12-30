const GAMES = [
  { id: "ds1", file: "data/ds1.json" },
  { id: "ds2", file: "data/ds2.json" },
  { id: "ds3", file: "data/ds3.json" },
  { id: "sekiro", file: "data/sekiro.json" },
  { id: "elden", file: "data/elden_ring.json" }
];

const STORAGE_KEY = "soulsofon_progress";
const MARATHON_DEATHS_KEY = "soulsofon_marathon_deaths";
const GAME_DEATHS_KEY = "soulsofon_game_deaths";

const gameList = document.getElementById("game-list");
const content = document.getElementById("content");
const youDied = document.getElementById("you-died");
const backBtn = document.getElementById("back-btn");
const fadeOverlay = document.getElementById("fade-overlay");

const gameDeathsEl = document.getElementById("game-deaths");
const marathonDeathsEl = document.getElementById("marathon-deaths");

const gamePlus = document.getElementById("game-plus");
const gameMinus = document.getElementById("game-minus");
const marathonPlus = document.getElementById("marathon-plus");
const marathonMinus = document.getElementById("marathon-minus");

let progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let marathonDeaths = Number(localStorage.getItem(MARATHON_DEATHS_KEY)) || 0;
let manualGameDeaths = JSON.parse(localStorage.getItem(GAME_DEATHS_KEY)) || {};

let currentGame = null;

init();

/* ===== INIT ===== */

async function init() {
  renderGameButtons();
  bindDeathControls();
  await loadGame(GAMES[0]);
}

/* ===== GAME BUTTONS ===== */

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

/* ===== LOAD GAME ===== */

async function loadGame(game) {
  currentGame = game;
  const res = await fetch(game.file);
  const gameData = await res.json();
  ensureProgress(gameData);
  if (!manualGameDeaths[game.id]) manualGameDeaths[game.id] = 0;
  saveGameDeaths();
  renderGame(gameData);
}

/* ===== RENDER ===== */

function renderGame(gameData) {
  content.innerHTML = "";

  if (gameData.banner) {
    const banner = document.createElement("img");
    banner.src = gameData.banner;
    banner.className = "game-banner";
    content.appendChild(banner);
  }

  const progressBar = document.createElement("div");
  progressBar.id = "progress-bar";
  progressBar.innerHTML = `
    <div id="game-progress"></div>
    <div id="marathon-progress"></div>
  `;
  content.appendChild(progressBar);

  gameData.sections.forEach(section => {
    const sec = document.createElement("section");
    sec.className = "boss-section";

    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    sec.appendChild(h2);

    section.bosses.forEach(boss => {
      const state = progress[gameData.id][boss.id];

      const row = document.createElement("div");
      row.className = "boss-row";
      if (state.killed) row.classList.add("killed");

      if (boss.icon) {
        const img = document.createElement("img");
        img.src = boss.icon;
        img.className = "boss-icon";
        row.appendChild(img);
      }

      const name = document.createElement("div");
      name.className = "boss-name";
      name.textContent = boss.name;
      row.appendChild(name);

      row.appendChild(statInput("Try", state, "tries", gameData));
      row.appendChild(statInput("Death", state, "deaths", gameData));

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

  updateStats(gameData);
}

/* ===== INPUT ===== */

function statInput(label, state, key, gameData) {
  const wrap = document.createElement("div");
  wrap.className = "stat-wrap";

  const input = document.createElement("input");
  input.type = "number";
  input.value = state[key];
  input.onchange = () => {
    state[key] = Number(input.value);
    save();
    updateStats(gameData);
  };

  const l = document.createElement("div");
  l.className = "stat-label";
  l.textContent = label;

  wrap.append(input, l);
  return wrap;
}

/* ===== STATS ===== */

function updateStats(gameData) {
  let autoGameDeaths = 0;
  let gameTotal = 0;
  let gameKilled = 0;

  let marathonTotal = 0;
  let marathonKilled = 0;

  gameData.sections.forEach(s =>
    s.bosses.forEach(b => {
      const st = progress[gameData.id][b.id];
      gameTotal++;
      autoGameDeaths += st.deaths;
      if (st.killed) gameKilled++;
    })
  );

  Object.values(progress).forEach(game =>
    Object.values(game).forEach(b => {
      marathonTotal++;
      if (b.killed) marathonKilled++;
    })
  );

  const totalGameDeaths = autoGameDeaths + (manualGameDeaths[gameData.id] || 0);

  gameDeathsEl.textContent = totalGameDeaths;
  marathonDeathsEl.textContent = marathonDeaths;

  document.getElementById("game-progress").textContent =
    `Игра: ${Math.round((gameKilled / gameTotal) * 100)}%`;

  document.getElementById("marathon-progress").textContent =
    `Марафон: ${Math.round((marathonKilled / marathonTotal) * 100)}%`;
}

/* ===== DEATH CONTROLS ===== */

function bindDeathControls() {
  if (gamePlus && gameMinus) {
    gamePlus.onclick = () => {
      manualGameDeaths[currentGame.id]++;
      saveGameDeaths();
      updateStats(currentGameData());
    };

    gameMinus.onclick = () => {
      manualGameDeaths[currentGame.id] = Math.max(0, manualGameDeaths[currentGame.id] - 1);
      saveGameDeaths();
      updateStats(currentGameData());
    };
  }

  marathonPlus.onclick = () => {
    marathonDeaths++;
    saveMarathonDeaths();
  };

  marathonMinus.onclick = () => {
    marathonDeaths = Math.max(0, marathonDeaths - 1);
    saveMarathonDeaths();
  };
}

function currentGameData() {
  return JSON.parse(localStorage.getItem("currentGameCache"));
}

/* ===== STORAGE ===== */

function ensureProgress(gameData) {
  localStorage.setItem("currentGameCache", JSON.stringify(gameData));

  if (!progress[gameData.id]) progress[gameData.id] = {};
  gameData.sections.forEach(s =>
    s.bosses.forEach(b => {
      if (!progress[gameData.id][b.id]) {
        progress[gameData.id][b.id] = {
          tries: 0,
          deaths: 0,
          killed: false
        };
      }
    })
  );
  save();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function saveGameDeaths() {
  localStorage.setItem(GAME_DEATHS_KEY, JSON.stringify(manualGameDeaths));
}

function saveMarathonDeaths() {
  localStorage.setItem(MARATHON_DEATHS_KEY, marathonDeaths);
  marathonDeathsEl.textContent = marathonDeaths;
}

/* ===== EFFECTS ===== */

function showYouDied() {
  youDied.classList.remove("hidden");
  setTimeout(() => youDied.classList.add("hidden"), 1500);
}

/* ===== BACK + FADE ===== */

backBtn.onclick = () => {
  fadeOverlay.classList.remove("hidden");
  fadeOverlay.classList.add("active");
  setTimeout(() => (location.href = "index.html"), 600);
};






















































