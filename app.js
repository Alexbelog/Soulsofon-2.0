const GAMES = [
  { id: "ds1", file: "data/ds1.json" },
  { id: "ds2", file: "data/ds2.json" },
  { id: "ds3", file: "data/ds3.json" },
  { id: "sekiro", file: "data/sekiro.json" },
  { id: "elden", file: "data/elden_ring.json" }
];

const STORAGE_KEY = "soulsofon_progress";

const gameList = document.getElementById("game-list");
const content = document.getElementById("content");
const youDied = document.getElementById("you-died");
const backBtn = document.getElementById("back-btn");
const fadeOverlay = document.getElementById("fade-overlay");

const bannerImg = document.getElementById("banner-img");
const gameDeathsEl = document.getElementById("game-deaths");
const marathonDeathsEl = document.getElementById("marathon-deaths");
const marathonPlus = document.getElementById("marathon-plus");
const marathonMinus = document.getElementById("marathon-minus");
const sectionsEl = document.getElementById("sections");
const progressBar = document.getElementById("progress-bar");

let progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let currentGame = null;

init();

/* ================= INIT ================= */

async function init() {
  renderGameButtons();
  await loadGame(GAMES[0]);
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
  sectionsEl.innerHTML = "";
  progressBar.innerHTML = "";

  if (gameData.banner) {
    bannerImg.src = gameData.banner;
  }

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

      /* ICON */
      if (boss.icon) {
        const img = document.createElement("img");
        img.src = boss.icon;
        img.className = "boss-icon";
        row.appendChild(img);
      }

      /* NAME + RANK */
      const nameWrap = document.createElement("div");
      nameWrap.className = "boss-name-wrap";

      const name = document.createElement("span");
      name.className = "boss-name";
      name.textContent = boss.name;

      const rank = document.createElement("span");
      rank.className = `boss-rank rank-${state.rank || "c"}`;
      rank.textContent = `[${(state.rank || "C").toUpperCase()}]`;

      rank.onclick = () => {
        state.rank = nextRank(state.rank);
        save();
        renderGame(gameData);
      };

      nameWrap.append(name, rank);
      row.appendChild(nameWrap);

      /* TRIES */
      row.appendChild(statInput("Try", state, "tries", gameData));

      /* DEATHS */
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

    sectionsEl.appendChild(sec);
  });

  updateStats(gameData);
}

/* ================= INPUT ================= */

function statInput(label, state, key, gameData) {
  const wrap = document.createElement("div");
  wrap.className = "stat-wrap";

  const input = document.createElement("input");
  input.type = "number";
  input.value = state[key];
  input.onchange = () => {
    state[key] = +input.value;
    save();
    updateStats(gameData);
  };

  const l = document.createElement("div");
  l.className = "stat-label";
  l.textContent = label;

  wrap.append(input, l);
  return wrap;
}

/* ================= STATS ================= */

function updateStats(gameData) {
  let gameDeaths = 0;
  let marathonDeaths = progress.marathonDeaths || 0;

  gameData.sections.forEach(s =>
    s.bosses.forEach(b => {
      gameDeaths += progress[gameData.id][b.id].deaths;
    })
  );

  gameDeathsEl.textContent = gameDeaths;
  marathonDeathsEl.textContent = marathonDeaths;

  updateProgress(gameData);
}

/* ================= PROGRESS ================= */

function updateProgress(gameData) {
  let gTotal = 0, gKilled = 0;
  let mTotal = 0, mKilled = 0;

  gameData.sections.forEach(s =>
    s.bosses.forEach(b => {
      gTotal++;
      if (progress[gameData.id][b.id].killed) gKilled++;
    })
  );

  Object.values(progress).forEach(game => {
    if (typeof game !== "object") return;
    Object.values(game).forEach(b => {
      mTotal++;
      if (b.killed) mKilled++;
    });
  });

  progressBar.innerHTML = `
    <div>Игра: ${Math.round((gKilled / gTotal) * 100)}%</div>
    <div>Марафон: ${Math.round((mKilled / mTotal) * 100)}%</div>
  `;
}

/* ================= STORAGE ================= */

function ensureProgress(gameData) {
  if (!progress[gameData.id]) progress[gameData.id] = {};

  gameData.sections.forEach(s =>
    s.bosses.forEach(b => {
      if (!progress[gameData.id][b.id]) {
        progress[gameData.id][b.id] = {
          tries: 0,
          deaths: 0,
          killed: false,
          rank: "c"
        };
      }
    })
  );

  if (progress.marathonDeaths == null) {
    progress.marathonDeaths = 0;
  }

  save();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/* ================= RANK ================= */

function nextRank(rank = "c") {
  const order = ["c", "b", "a", "s"];
  return order[(order.indexOf(rank) + 1) % order.length];
}

/* ================= YOU DIED ================= */

function showYouDied() {
  youDied.classList.remove("hidden");
  setTimeout(() => youDied.classList.add("hidden"), 1500);
}

/* ================= MARATHON +/- ================= */

marathonPlus.onclick = () => {
  progress.marathonDeaths++;
  save();
  marathonDeathsEl.textContent = progress.marathonDeaths;
};

marathonMinus.onclick = () => {
  progress.marathonDeaths = Math.max(0, progress.marathonDeaths - 1);
  save();
  marathonDeathsEl.textContent = progress.marathonDeaths;
};

/* ================= BACK + FADE ================= */

backBtn.onclick = () => {
  fadeOverlay.classList.remove("hidden");
  fadeOverlay.classList.add("active");
  setTimeout(() => location.href = "index.html", 600);
};
















































