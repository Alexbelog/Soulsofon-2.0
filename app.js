const games = [
  { id: "ds1", file: "data/ds1.json" }
  { id: "ds2", file: "data/ds2.json" }
  { id: "ds3", file: "data/ds3.json" }
  { id: "sekiro", file: "data/sekiro.json" }
];

const content = document.getElementById("content");
const tabs = document.getElementById("tabs");

async function loadGames() {
  for (const g of games) {
    const data = await fetch(g.file).then(r => r.json());
    createTab(data);
    createGame(data);
  }

  const statsBtn = document.createElement("button");
  statsBtn.textContent = "📊 Статистика";
  statsBtn.onclick = showGlobalStats;
  tabs.appendChild(statsBtn);
}

function createTab(game) {
  const btn = document.createElement("button");
  btn.textContent = game.name;
  btn.onclick = () => openGame(game.id);
  tabs.appendChild(btn);
}

function openGame(id) {
  document.querySelectorAll(".game").forEach(g => g.classList.remove("active"));
  document.getElementById(id).classList.add("active");
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
  const data = JSON.parse(localStorage.getItem(key)) || { tries:0, deaths:0, killed:false };

  const card = document.createElement("div");
  card.className = "boss-card";
  if (data.killed) card.classList.add("killed");

  card.innerHTML = `
    <img src="icons/${gameId}/${boss.id}.png" onerror="this.src='https://i.imgur.com/6X8QZQp.png'">
    <strong>${boss.name}</strong>
    <input type="number" value="${data.tries}">
    <input type="number" value="${data.deaths}">
    <input type="checkbox" ${data.killed ? "checked" : ""}>
  `;

  const [tries, deaths, killed] = card.querySelectorAll("input");

  function save() {
    const newData = {
      tries: +tries.value,
      deaths: +deaths.value,
      killed: killed.checked
    };
    localStorage.setItem(key, JSON.stringify(newData));
    card.classList.toggle("killed", killed.checked);
    recalcGlobal();
  }

  tries.onchange = deaths.onchange = killed.onchange = save;
  return card;
}

function showGlobalStats() {
  document.querySelectorAll(".game").forEach(g => g.classList.remove("active"));
  document.getElementById("global-stats").classList.remove("hidden");
  recalcGlobal();
}

function recalcGlobal() {
  let deaths = 0;
  let killed = 0;

  Object.keys(localStorage).forEach(k => {
    const d = JSON.parse(localStorage.getItem(k));
    if (d?.deaths) deaths += d.deaths;
    if (d?.killed) killed++;
  });

  document.getElementById("global-deaths").textContent = deaths;
  document.getElementById("global-killed").textContent = killed;
}

loadGames();
