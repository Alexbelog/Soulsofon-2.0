// ================================
// SOULSFON 2.0 — app.js
// ================================

document.addEventListener("DOMContentLoaded", () => {

  const games = [
    { id: "ds1", name: "Dark Souls", json: "data/ds1.json" },
    { id: "ds2", name: "Dark Souls II", json: "data/ds2.json" },
    { id: "ds3", name: "Dark Souls III", json: "data/ds3.json" },
    { id: "sekiro", name: "Sekiro", json: "data/sekiro.json" },
    { id: "elden", name: "Elden Ring", json: "data/elden_ring.json" }
  ];

  let currentGame = null;
  let gameData = null;

  const sidebar = document.getElementById("game-list");
  const content = document.getElementById("content");

  if (!sidebar || !content) {
    console.error("❌ Не найдены #game-list или #content");
    return;
  }

  initSidebar();
  loadGame(games[0]);

  function initSidebar() {
    sidebar.innerHTML = "";
    games.forEach(game => {
      const btn = document.createElement("button");
      btn.textContent = game.name;
      btn.className = "game-btn";
      btn.onclick = () => loadGame(game);
      sidebar.appendChild(btn);
    });
  }

  function storageKey(id) {
    return `soulsofon_progress_${id}`;
  }

  function saveProgress() {
    if (currentGame && gameData) {
      localStorage.setItem(storageKey(currentGame.id), JSON.stringify(gameData));
    }
  }

  function loadProgress(game) {
    const saved = localStorage.getItem(storageKey(game.id));
    return saved ? JSON.parse(saved) : null;
  }

  async function loadGame(game) {
    currentGame = game;
    content.innerHTML = "<p>Загрузка...</p>";

    const saved = loadProgress(game);
    if (saved) {
      gameData = saved;
      renderGame();
      return;
    }

    try {
      const res = await fetch(game.json);
      gameData = await res.json();
      saveProgress();
      renderGame();
    } catch (e) {
      console.error(e);
      content.innerHTML = "<p>Ошибка загрузки данных</p>";
    }
  }

  function renderGame() {
    content.innerHTML = "";

    const header = document.createElement("div");
    header.className = "game-header";
    header.innerHTML = `
      <img src="${gameData.poster}" class="game-poster">
      <h1>${gameData.title}</h1>
      <div class="death-counter">
        Смертей в игре: <strong>${countDeaths()}</strong>
      </div>
    `;
    content.appendChild(header);

    for (const section in gameData.sections) {
      renderSection(section, gameData.sections[section]);
    }
  }

  function renderSection(key, bosses) {
    const section = document.createElement("section");
    section.className = "boss-section";
    section.innerHTML = `<h2>${sectionTitle(key)}</h2>`;

    bosses.forEach((boss, i) => {
      section.appendChild(renderBossRow(boss, key, i));
    });

    content.appendChild(section);
  }

  function sectionTitle(k) {
    return {
      main: "Основные боссы",
      optional: "Опциональные боссы",
      dlc: "Боссы DLC"
    }[k] || k;
  }

  function renderBossRow(boss, section, index) {
    const row = document.createElement("div");
    row.className = "boss-row";
    row.dataset.status = boss.killed ? "killed" : "alive";

    row.innerHTML = `
      <div class="boss-left">
        <img src="${boss.icon || ""}" class="boss-icon">
        <div class="boss-name">${boss.name}</div>
      </div>

      <div class="boss-right">
        <div class="stat">
          <input type="number" min="0" value="${boss.tries || 0}"
            data-section="${section}" data-index="${index}" data-field="tries">
          <span>Try</span>
        </div>

        <div class="stat">
          <input type="number" min="0" value="${boss.deaths || 0}"
            data-section="${section}" data-index="${index}" data-field="deaths">
          <span>Death</span>
        </div>

        <button class="boss-toggle">${boss.killed ? "☠" : "⚔"}</button>
      </div>
    `;

    row.querySelectorAll("input").forEach(i => {
      i.addEventListener("input", updateBossValue);
    });

    row.querySelector(".boss-toggle").onclick = () => {
      boss.killed = !boss.killed;
      row.dataset.status = boss.killed ? "killed" : "alive";
      row.querySelector(".boss-toggle").textContent = boss.killed ? "☠" : "⚔";
      saveProgress();
      updateDeathCounter();
    };

    return row;
  }

  function updateBossValue(e) {
    const { section, index, field } = e.target.dataset;
    gameData.sections[section][index][field] = Number(e.target.value);
    saveProgress();
    updateDeathCounter();
  }

  function countDeaths() {
    let total = 0;
    for (const s in gameData.sections) {
      gameData.sections[s].forEach(b => {
        total += Number(b.deaths || 0);
      });
    }
    return total;
  }

  function updateDeathCounter() {
    const el = document.querySelector(".death-counter strong");
    if (el) el.textContent = countDeaths();
  }

});


















