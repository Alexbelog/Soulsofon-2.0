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
      </div>
    </div>
    <div class="bosses"></div>
  `;

  const bossesDiv = div.querySelector(".bosses");

  for (const section in game.sections) {
    const sec = document.createElement("div");
    sec.className = "boss-section";
    sec.innerHTML = `
      <h3>${section}</h3>
      <div class="boss-grid-header">
        <span></span>
        <span class="name">Босс</span>
        <span>Траи</span>
        <span>Смерти</span>
        <span>Статус</span>
      </div>
      <div class="boss-grid"></div>
    `;

    const grid = sec.querySelector(".boss-grid");
    game.sections[section].forEach(boss => {
      grid.appendChild(createBossCard(game.id, boss));
    });

    bossesDiv.appendChild(sec);
  }

  content.appendChild(div);
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
    const gameId = gameEl.id;

    Object.keys(localStorage).forEach(k => {
      if (!k.startsWith(gameId + "_")) return;
      try {
        const d = JSON.parse(localStorage.getItem(k));
        gameDeaths += d.deaths || 0;
        globalDeaths += d.deaths || 0;
        if (d.killed) globalKilled++;
      } catch {}
    });

    const counter = gameEl.querySelector(".game-deaths");
    if (counter) counter.textContent = gameDeaths;
  });

  document.getElementById("global-deaths").textContent = globalDeaths;
  document.getElementById("global-killed").textContent = globalKilled;
}

loadGames();
