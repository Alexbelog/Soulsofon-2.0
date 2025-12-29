// ===== ADMIN MODE (НЕВИДИМЫЙ) =====
const isAdmin = new URLSearchParams(location.search).get("admin") === "1";

// ===== JSON FILES =====
const gameFiles = {
  ds1: "data/ds1.json",
  ds2: "data/ds2.json",
  ds3: "data/ds3.json",
  sekiro: "data/sekiro.json"
};

const content = document.getElementById("content");

// ===== TABS =====
document.querySelectorAll(".tabs button").forEach(btn => {
  btn.onclick = () => loadGame(btn.dataset.tab);
});

loadGame("ds1");

// ===== LOAD GAME =====
async function loadGame(gameId) {
  content.innerHTML = "Загрузка...";

  const res = await fetch(gameFiles[gameId]);
  const game = await res.json();

  content.innerHTML = "";

  const gameEl = document.createElement("div");
  gameEl.className = "game";
  gameEl.id = game.id;

  gameEl.innerHTML = `
    <h2>${game.title}</h2>

    <div class="boss-grid-header">
      <span>Босс</span>
      <span>Траи</span>
      <span>Смерти</span>
      <span>Статус</span>
    </div>

    <div class="boss-list"></div>

    <div class="game-stats">
      💀 Смертей в игре: <span class="game-deaths">0</span>
    </div>
  `;

  content.appendChild(gameEl);

  const list = gameEl.querySelector(".boss-list");

  game.bosses.forEach(boss => {
    list.appendChild(createBossRow(game.id, boss));
  });

  recalcStats();
}

// ===== BOSS ROW =====
function createBossRow(gameId, boss) {
  const key = `${gameId}_${boss.id}`;
  const saved = JSON.parse(localStorage.getItem(key) || "{}");

  const row = document.createElement("div");
  row.className = "boss-row";
  if (saved.killed) row.classList.add("killed");

  row.innerHTML = `
    <div class="boss-name">${boss.name}</div>
    <input type="number" min="0" value="${saved.tries || 0}">
    <input type="number" min="0" value="${saved.deaths || 0}">
    <button class="kill-btn ${saved.killed ? "active" : ""}">
      ${saved.killed ? "УБИТ" : "ЖИВ"}
    </button>
  `;

  const [tries, deaths] = row.querySelectorAll("input");
  const btn = row.querySelector("button");

  function save(killed = saved.killed) {
    if (!isAdmin) return;

    const data = {
      tries: +tries.value,
      deaths: +deaths.value,
      killed
    };

    localStorage.setItem(key, JSON.stringify(data));
    row.classList.toggle("killed", killed);
    recalcStats();
  }

  tries.onchange = () => save();
  deaths.onchange = () => save();

  btn.onclick = () => {
    saved.killed = !saved.killed;
    btn.textContent = saved.killed ? "УБИТ" : "ЖИВ";
    btn.classList.toggle("active", saved.killed);
    save(saved.killed);
  };

  if (!isAdmin) {
    row.querySelectorAll("input, button").forEach(el => {
      el.disabled = true;
      el.style.opacity = "0.6";
      el.style.cursor = "not-allowed";
    });
  }

  return row;
}

// ===== STATS =====
function recalcStats() {
  let globalDeaths = 0;
  let globalKilled = 0;

  document.querySelectorAll(".game").forEach(game => {
    let gameDeaths = 0;
    const id = game.id;

    Object.keys(localStorage).forEach(k => {
      if (!k.startsWith(id + "_")) return;
      const d = JSON.parse(localStorage.getItem(k));
      gameDeaths += d.deaths || 0;
      globalDeaths += d.deaths || 0;
      if (d.killed) globalKilled++;
    });

    game.querySelector(".game-deaths").textContent = gameDeaths;
  });

  document.getElementById("global-deaths").textContent = globalDeaths;
  document.getElementById("global-killed").textContent = globalKilled;
}
