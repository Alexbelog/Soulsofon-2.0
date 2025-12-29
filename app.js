// ===== ADMIN MODE =====
const params = new URLSearchParams(window.location.search);

if (params.get("admin") === "1") {
  localStorage.setItem("soul_admin", "true");
}

const isAdmin = localStorage.getItem("soul_admin") === "true";
const games = [
  { id: "ds1", title: "Dark Souls", file: "data/ds1.json" },
  { id: "ds2", title: "Dark Souls II", file: "data/ds2.json" },
  { id: "ds3", title: "Dark Souls III", file: "data/ds3.json" },
  { id: "sekiro", title: "Sekiro", file: "data/sekiro.json" },
  { id: "elden", title: "Elden Ring", file: "data/elden_ring.json" }
];

const gameList = document.getElementById("game-list");
const content = document.getElementById("content");

if (!gameList || !content) {
  console.error("❌ layout не найден");
}

/* =======================
   INIT
======================= */
init();

function init() {
  renderGameButtons();
  loadGame(games[0]);
}

/* =======================
   SIDEBAR
======================= */
function renderGameButtons() {
  gameList.innerHTML = "";

  games.forEach(game => {
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.textContent = game.title;

    btn.onclick = () => loadGame(game);
    gameList.appendChild(btn);
  });
}

/* =======================
   LOAD GAME
======================= */
async function loadGame(game) {
  try {
    const response = await fetch(game.file);
    if (!response.ok) throw new Error("JSON не найден");

    const gameData = await response.json();
    renderGame(gameData, game.id);
  } catch (e) {
    console.error("❌ Ошибка загрузки", e);
    content.innerHTML = "<p>Ошибка загрузки данных</p>";
  }
}

/* =======================
   RENDER GAME
======================= */
function renderGame(gameData, gameId) {
  content.innerHTML = "";

  // Banner
  if (gameData.banner) {
    const banner = document.createElement("img");
    banner.src = gameData.banner;
    banner.className = "game-banner";
    content.appendChild(banner);
  }

  // Title
  const title = document.createElement("h1");
  title.textContent = gameData.title;
  content.appendChild(title);

  // Sections
  gameData.sections.forEach(section => {
    const sectionBlock = document.createElement("section");
    sectionBlock.className = "boss-section";

    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    sectionBlock.appendChild(h2);

    section.bosses.forEach(boss => {
      sectionBlock.appendChild(renderBoss(boss, gameId));
    });

    content.appendChild(sectionBlock);
  });

  updateTotalDeaths(gameData, gameId);
}

/* =======================
   BOSS ROW
======================= */
function renderBoss(boss, gameId) {
  const key = `${gameId}_${boss.id}`;

  const saved = JSON.parse(localStorage.getItem(key)) || {
    tries: 0,
    deaths: 0,
    killed: false
  };

  const row = document.createElement("div");
  row.className = "boss-row";

  row.innerHTML = `
    <img src="${boss.icon}" class="boss-icon">
    <span class="boss-name">${boss.name}</span>

    <div class="stat">
      <input type="number" value="${saved.tries}" min="0" ${isAdmin ? "" : "disabled"}>
      <small>Try</small>
    </div>

    <div class="stat">
      <input type="number" value="${saved.deaths}" min="0" ${isAdmin ? "" : "disabled"}>
      <small>Death</small>
    </div>

    <label class="killed">
      <input type="checkbox" ${saved.killed ? "checked" : ""} ${isAdmin ? "" : "disabled"}>
      Убит
    </label>
  `;

  const inputs = row.querySelectorAll("input");

  inputs.forEach(() => {
    row.oninput = () => {
      const updated = {
        tries: +inputs[0].value,
        deaths: +inputs[1].value,
        killed: inputs[2].checked
      };
      localStorage.setItem(key, JSON.stringify(updated));
      updateTotalDeaths();
    };
  });

  return row;
}

/* =======================
   TOTAL DEATHS
======================= */
function updateTotalDeaths() {
  let total = 0;

  Object.keys(localStorage).forEach(k => {
    try {
      const data = JSON.parse(localStorage.getItem(k));
      if (data?.deaths) total += data.deaths;
    } catch {}
  });

  let counter = document.getElementById("total-deaths");
  if (!counter) {
    counter = document.createElement("div");
    counter.id = "total-deaths";
    counter.className = "total-deaths";
    content.prepend(counter);
  }

  counter.textContent = `Всего смертей: ${total}`;
}


































