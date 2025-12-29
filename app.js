/* ================================
   SOULSOFON 2.0 — app.js (FINAL)
   ================================ */

/* ---------- РЕЕСТР ИГР ---------- */

const GAMES = [
  {
    id: "ds1",
    title: "Dark Souls",
    json: "data/ds1.json"
  },
  {
    id: "ds2",
    title: "Dark Souls II",
    json: "data/ds2.json"
  },
  {
    id: "ds3",
    title: "Dark Souls III",
    json: "data/ds3.json"
  },
  {
    id: "sekiro",
    title: "Sekiro: Shadows Die Twice",
    json: "data/sekiro.json"
  },
  {
    id: "elden",
    title: "Elden Ring",
    json: "data/elden_ring.json"
  }
];

let currentGame = null;
let gameData = null;

/* ---------- DOM ---------- */

const sidebar = document.querySelector(".sidebar");
const content = document.querySelector(".content");

/* ---------- INIT ---------- */

initSidebar();
loadGame(GAMES[0]); // по умолчанию первая игра

/* ---------- SIDEBAR ---------- */

function initSidebar() {
  sidebar.innerHTML = "";

  GAMES.forEach(game => {
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.textContent = game.title;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".game-btn")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      loadGame(game);
    });

    sidebar.appendChild(btn);
  });

  sidebar.querySelector(".game-btn")?.classList.add("active");
}

/* ---------- LOAD GAME ---------- */

async function loadGame(game) {
  currentGame = game;

  content.classList.add("fade-out");

  try {
    const response = await fetch(game.json);
    gameData = await response.json();

    setTimeout(() => {
      renderGame();
      content.classList.remove("fade-out");
    }, 300);

  } catch (err) {
    console.error("Ошибка загрузки JSON:", err);
  }
}

/* ---------- RENDER GAME ---------- */

function renderGame() {
  content.innerHTML = "";

  renderHeader();
  renderFilters();
  renderBosses();
}

/* ---------- HEADER ---------- */

function renderHeader() {
  const header = document.createElement("div");
  header.className = "game-header";

  header.innerHTML = `
    <h1>${gameData.title}</h1>
    ${gameData.description ? `<p>${gameData.description}</p>` : ""}
  `;

  content.appendChild(header);
}

/* ---------- FILTERS ---------- */

function renderFilters() {
  const filters = document.createElement("div");
  filters.className = "filters";

  filters.innerHTML = `
    <select id="filterStatus">
      <option value="all">Все боссы</option>
      <option value="alive">Живые</option>
      <option value="killed">Убитые</option>
    </select>

    <select id="filterSection">
      <option value="all">Все секции</option>
    </select>
  `;

  content.appendChild(filters);

  fillSectionsFilter();
  bindFilters();
}

function fillSectionsFilter() {
  const select = document.getElementById("filterSection");

  Object.keys(gameData.sections).forEach(section => {
    const opt = document.createElement("option");
    opt.value = section;
    opt.textContent = section;
    select.appendChild(opt);
  });
}

/* ---------- BOSSES ---------- */

function renderBosses() {
  const list = document.createElement("div");
  list.className = "boss-list";

  Object.entries(gameData.sections).forEach(([sectionName, bosses]) => {
    const section = document.createElement("div");
    section.className = "boss-section";
    section.dataset.section = sectionName;

    section.innerHTML = `<h2>${sectionName}</h2>`;

    bosses.forEach((boss, index) => {
      section.appendChild(renderBossRow(boss, sectionName, index));
    });

    list.appendChild(section);
  });

  content.appendChild(list);
}

/* ---------- BOSS ROW ---------- */

function renderBossRow(boss, section, index) {
  const row = document.createElement("div");
  row.className = "boss-row";
  row.dataset.status = boss.killed ? "killed" : "alive";

  row.innerHTML = `
    <div class="boss-name">${boss.name}</div>

    <input type="number" min="0" class="boss-input"
      value="${boss.tries}"
      data-field="tries"
      data-section="${section}"
      data-index="${index}">

    <input type="number" min="0" class="boss-input"
      value="${boss.deaths}"
      data-field="deaths"
      data-section="${section}"
      data-index="${index}">

    <button class="boss-toggle">
      ${boss.killed ? "☠" : "⚔"}
    </button>
  `;

  row.querySelector(".boss-toggle").addEventListener("click", () => {
    boss.killed = !boss.killed;
    row.dataset.status = boss.killed ? "killed" : "alive";
    row.querySelector(".boss-toggle").textContent = boss.killed ? "☠" : "⚔";
  });

  row.querySelectorAll(".boss-input").forEach(input => {
    input.addEventListener("change", updateBossValue);
  });

  return row;
}

/* ---------- UPDATE ---------- */

function updateBossValue(e) {
  const { section, index, field } = e.target.dataset;
  gameData.sections[section][index][field] = Number(e.target.value);
}

/* ---------- FILTER LOGIC ---------- */

function bindFilters() {
  document.getElementById("filterStatus")
    .addEventListener("change", applyFilters);

  document.getElementById("filterSection")
    .addEventListener("change", applyFilters);
}

function applyFilters() {
  const status = document.getElementById("filterStatus").value;
  const section = document.getElementById("filterSection").value;

  document.querySelectorAll(".boss-section").forEach(sec => {
    const showSection = section === "all" || sec.dataset.section === section;
    sec.style.display = showSection ? "" : "none";

    sec.querySelectorAll(".boss-row").forEach(row => {
      const showStatus =
        status === "all" || row.dataset.status === status;

      row.style.display = showStatus ? "" : "none";
    });
  });
}













