// === ADMIN MODE ===
const isAdmin = new URLSearchParams(window.location.search).get("admin") === "1";

// === ADMIN BADGE ===
if (isAdmin) {
  const badge = document.getElementById("admin-badge");
  badge.textContent = "🛠 РЕЖИМ АДМИНА";
  badge.style.cssText = `
    background:#8b0000;
    color:#fff;
    padding:6px 10px;
    display:inline-block;
    margin-bottom:10px;
  `;
}

// === DATA ===
const games = {
  ds1: {
    title: "Dark Souls",
    bosses: ["Асмодей-демон", "Орнштейн и Смоуг"]
  },
  ds2: {
    title: "Dark Souls II",
    bosses: ["Последний гигант", "Преследователь"]
  },
  ds3: {
    title: "Dark Souls III",
    bosses: ["Иудекс Гундир", "Вордт"]
  },
  sekiro: {
    title: "Sekiro",
    bosses: ["Гэнитиро Асина", "Иссин, Меч Святого"]
  }
};

const content = document.getElementById("content");

// === TABS ===
document.querySelectorAll(".tabs button").forEach(btn => {
  btn.onclick = () => openGame(btn.dataset.tab);
});

openGame("ds1");

// === OPEN GAME ===
function openGame(id) {
  const game = games[id];
  content.innerHTML = "";

  const gameEl = document.createElement("div");
  gameEl.className = "game";
  gameEl.id = id;

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

  game.bosses.forEach(name => {
    list.appendChild(createBossRow(id, name));
  });

  recalcStats();
}

// === BOSS ROW ===
function createBossRow(gameId, name) {
  const key = `${gameId}_${name}`;
  const saved = JSON.parse(localStorage.getItem(key) || "{}");

  const row = document.createElement("div");
  row.className = "boss-row";
  if (saved.killed) row.classList.add("killed");

  row.innerHTML = `
    <div class="boss-name">${name}</div>
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

// === STATS ===
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
