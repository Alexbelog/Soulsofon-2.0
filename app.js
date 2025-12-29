const games = [
  { id: "ds1", file: "./data/ds1.json" },
  { id: "ds2", file: "./data/ds2.json" },
  { id: "ds3", file: "./data/ds3.json" },
  { id: "sekiro", file: "./data/sekiro.json" }
];

const tabs = document.getElementById("tabs");
const content = document.getElementById("content");

async function loadGames() {
  for (const g of games) {
    const res = await fetch(g.file);
    const data = await res.json();
    createTab(data);
    createGame(data);
  }

  const statBtn = document.createElement("button");
  statBtn.textContent = "📊 Статистика";
  statBtn.onclick = showStats;
  tabs.appendChild(statBtn);
}

function createTab(game) {
  const btn = document.createElement("button");
  btn.textContent = game.name;
  btn.onclick = () => openGame(game.id);
  tabs.appendChild(btn);
}

function openGame(id) {
  document.querySelectorAll(".game").forEach(g => g.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  document.getElementById("global-stats").classList.add("hidden");
}

function createGame(game) {
  const div = document.createElement("div");
  div.className = "game";
  div.id = game.id;

  div.innerHTML = `
    <div class="game-info">
      <img src="${game.poster}">
      <h2>${game.name}</h2>
      <p>${game.description}</p>

      <div class="game-stats">
        💀 Смертей в игре: <span class="game-deaths">0</span>
        <div class="progress">
          Прогресс: <span class="progress-text">0 / 0 (0%)</span>
        </div>
      </div>
    </div>

    <div class="bosses">
      <div class="filter-buttons">
        <button data-filter="all" class="active">Все</button>
        <button data-filter="alive">Живые</button>
        <button data-filter="killed">Убитые</button>
      </div>
    </div>
  `;

  const bossesDiv = div.querySelector(".bosses");
  setupFilters(div);

  let totalBosses = 0;

  for (const section in game.sections) {
    const sec = document.createElement("div");
    sec.className = "boss-section";
    sec.innerHTML = `
      <h3>${section}</h3>
      <div class="boss-grid-header">
        <span></span>
        <span>Босс</span>
        <span>Траи</span>
        <span>Смерти</span>
        <span>Статус</span>
      </div>
      <div class="boss-grid"></div>
    `;

    const grid = sec.querySelector(".boss-grid");
    game.sections[section].forEach(boss => {
      totalBosses++;
      grid.appendChild(createBossCard(game.id, boss));
    });

    bossesDiv.appendChild(sec);
  }

  div.dataset.totalBosses = totalBosses;
  content.appendChild(div);
}

function setupFilters(gameEl) {
  const buttons = gameEl.querySelectorAll(".filter-buttons button");

  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      gameEl.querySelectorAll(".boss-card").forEach(card => {
        if (filter === "all") card.style.display = "";
        if (filter === "alive") card.style.display = card.classList.contains("killed") ? "none" : "";
        if (filter === "killed") card.style.display = card.classList.contains("killed") ? "" : "none";
      });
    };
  });
}

function createBossCard(gameId, boss) {
  const key = `${gameId}_${boss.id}`;
  const saved = JSON.parse(localStorage.getItem(key)) || {
    tries: 0,
    deaths: 0,
    killed: false
  };

  const card = document.createElement("div");
  card.className = "boss-card";
  if (saved.killed) card.classList.add("killed");

  card.innerHTML = `
    <img src="./icons/${gameId}/${boss.id}.png"
         onerror="this.src='https://i.imgur.com/6X8QZQp.png'">
    <strong>${boss.name}</strong>
    <input type="number" value="${saved.tries}">
    <input type="number" value="${saved.deaths}">
    <button class="kill-btn ${saved.killed ? "active" : ""}">
      ${saved.killed ? "УБИТ" : "ЖИВ"}
    </button>
  `;

  const [tries, deaths] = card.querySelectorAll("input");
  const killBtn = card.querySelector(".kill-btn");

  function save(killedState = saved.killed) {
    const data = {
      tries: +tries.value,
      deaths: +deaths.value,
      killed: killedState
    };
    localStorage.setItem(key, JSON.stringify(data));
    card.classList.toggle("killed", data.killed);
    recalcStats();
  }

  tries.onchange = () => save();
  deaths.onchange = () => save();

  killBtn.onclick = () => {
    saved.killed = !saved.killed;
    killBtn.classList.toggle("active", saved.killed);
    killBtn.textContent = saved.killed ? "УБИТ" : "ЖИВ";
    save(saved.killed);
  };

  return card;
}

function showStats() {
  document.querySelectorAll(".game").forEach(g => g.classList.remove("active"));
  document.getElementById("global-stats").classList.remove("hidden");
  recalcStats();
}

function recalcStats() {
  let globalDeaths = 0;
  let globalKilled = 0;

  document.querySelectorAll(".game").forEach(gameEl => {
    let gameDeaths = 0;
    let killedInGame = 0;
    const gameId = gameEl.id;
    const total = +gameEl.dataset.totalBosses;

    Object.keys(localStorage).forEach(k => {
      if (!k.startsWith(gameId + "_")) return;
      try {
        const d = JSON.parse(localStorage.getItem(k));
        gameDeaths += d.deaths || 0;
        globalDeaths += d.deaths || 0;
        if (d.killed) {
          killedInGame++;
          globalKilled++;
        }
      } catch {}
    });

    const deathsEl = gameEl.querySelector(".game-deaths");
    const progressEl = gameEl.querySelector(".progress-text");

    if (deathsEl) deathsEl.textContent = gameDeaths;
    if (progressEl) {
      const percent = total ? Math.round((killedInGame / total) * 100) : 0;
      progressEl.textContent = `${killedInGame} / ${total} (${percent}%)`;
    }
  });

  document.getElementById("global-deaths").textContent = globalDeaths;
  document.getElementById("global-killed").textContent = globalKilled;
}

loadGames();
