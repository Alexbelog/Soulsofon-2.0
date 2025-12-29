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
    if (!res.ok) {
      console.error("Ошибка загрузки:", g.file);
      continue;
    }
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
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
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
    </div>
    <div class="bosses"></div>
  `;

  const bossesDiv = div.querySelector(".bosses");

  for (const section in game.sections) {
    const sec = document.createElement("div");
    sec.className = "boss-section";
    sec.innerHTML = `<h3>${section}</h3><div class="boss-grid"></div>`;
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
    <img src="./icons/${gameId}/${boss.id}.png" onerror="this.src='https://i.imgur.com/6X8QZQp.png'">
    <strong>${boss.name}</strong>
    <input type="number" value="${saved.tries}">
    <input type="number" value="${saved.deaths}">
    <input type="checkbox" ${saved.killed ? "checked" : ""}>
  `;

  const [tries, deaths, checkbox] = card.querySelectorAll("input");

  function save() {
    const data = {
      tries: +tries.value,
      deaths: +deaths.value,
      killed: checkbox.checked
    };
    localStorage.setItem(key, JSON.stringify(data));
    card.classList.toggle("killed", data.killed);
    recalcStats();
  }

  tries.onchange = save;
  deaths.onchange = save;
  checkbox.onchange = save;

  return card;
}

function showStats() {
  document.querySelectorAll(".game").forEach(g => g.classList.remove("active"));
  document.getElementById("global-stats").classList.remove("hidden");
  recalcStats();
}

function recalcStats() {
  let deaths = 0;
  let killed = 0;

  Object.values(localStorage).forEach(v => {
    try {
      const d = JSON.parse(v);
      deaths += d.deaths || 0;
      if (d.killed) killed++;
    } catch {}
  });

  document.getElementById("global-deaths").textContent = deaths;
  document.getElementById("global-killed").textContent = killed;
}

loadGames();

