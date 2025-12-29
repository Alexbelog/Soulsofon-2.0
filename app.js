document.addEventListener("DOMContentLoaded", () => {

  /* ============================
     НАСТРОЙКИ ИГР
  ============================ */

  const GAMES = [
    { id: "ds1", name: "Dark Souls", file: "data/ds1.json" },
    { id: "ds2", name: "Dark Souls II", file: "data/ds2.json" },
    { id: "ds3", name: "Dark Souls III", file: "data/ds3.json" },
    { id: "sekiro", name: "Sekiro", file: "data/sekiro.json" },
    { id: "elden", name: "Elden Ring", file: "data/elden_ring.json" }
  ];

  let currentGame = null;
  let gameData = null;

  const sidebar = document.getElementById("game-list");
  const content = document.getElementById("content");

  if (!sidebar || !content) {
    console.error("HTML layout error: sidebar or content not found");
    return;
  }

  initSidebar();
  loadGame(GAMES[0]);

  /* ============================
     SIDEBAR
  ============================ */

  function initSidebar() {
    sidebar.innerHTML = "";

    GAMES.forEach(game => {
      const btn = document.createElement("button");
      btn.className = "game-btn";
      btn.textContent = game.name;
      btn.onclick = () => loadGame(game);
      sidebar.appendChild(btn);
    });
  }

  /* ============================
     STORAGE
  ============================ */

  function storageKey(gameId) {
    return `soulsofon_progress_${gameId}`;
  }

  function saveProgress() {
    if (!currentGame || !gameData) return;
    localStorage.setItem(storageKey(currentGame.id), JSON.stringify(gameData));
  }

  function loadProgress(game, originalData) {
    const saved = localStorage.getItem(storageKey(game.id));
    return saved ? JSON.parse(saved) : structuredClone(originalData);
  }

  /* ============================
     LOAD GAME
  ============================ */

  async function loadGame(game) {
    currentGame = game;
    content.innerHTML = "<div class='loading'>Loading...</div>";

    try {
      const response = await fetch(game.file);
      const json = await response.json();

      gameData = loadProgress(game, json);
      normalizeBossData();
      saveProgress();
      renderGame();

    } catch (e) {
      console.error("Failed to load game:", e);
      content.innerHTML = "Ошибка загрузки данных.";
    }
  }

  /* ============================
     NORMALIZE
  ============================ */

  function normalizeBossData() {
    gameData.sections.forEach(section => {
      section.bosses.forEach(boss => {
        if (boss.tries === undefined) boss.tries = 0;
        if (boss.deaths === undefined) boss.deaths = 0;
        if (boss.killed === undefined) boss.killed = false;
      });
    });
  }

  /* ============================
     ITERATOR (КЛЮЧЕВОЙ)
  ============================ */

  function iterateBosses(callback) {
    gameData.sections.forEach(section => {
      if (!Array.isArray(section.bosses)) return;
      section.bosses.forEach(boss => callback(boss, section));
    });
  }

  /* ============================
     STATS
  ============================ */

  function countDeaths() {
    let total = 0;
    iterateBosses(boss => {
      total += Number(boss.deaths) || 0;
    });
    return total;
  }

  function countProgress() {
    let total = 0;
    let killed = 0;

    iterateBosses(boss => {
      total++;
      if (boss.killed) killed++;
    });

    return { total, killed };
  }

  /* ============================
     RENDER
  ============================ */

  function renderGame() {
    content.innerHTML = "";

    const header = document.createElement("div");
    header.className = "game-header";
    header.innerHTML = `
      <img class="game-banner" src="${gameData.banner}">
      <h1>${gameData.title}</h1>
      <div class="stats-line">
        <span>Смертей: <b>${countDeaths()}</b></span>
        <span class="progress-text"></span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    `;
    content.appendChild(header);

    updateProgressUI();

    gameData.sections.forEach(section => {
      renderSection(section);
    });
  }

  function renderSection(section) {
    const block = document.createElement("section");
    block.className = "boss-section";
    block.innerHTML = `<h2>${section.title}</h2>`;

    section.bosses.forEach(boss => {
      block.appendChild(renderBoss(boss));
    });

    content.appendChild(block);
  }

  function renderBoss(boss) {
    const row = document.createElement("div");
    row.className = "boss-row";
    row.dataset.killed = boss.killed ? "1" : "0";

    row.innerHTML = `
      <img src="${boss.icon}" class="boss-icon">
      <span class="boss-name">${boss.name}</span>

      <div class="boss-stats">
        <div>
          <input type="number" min="0" value="${boss.tries}">
          <small>Try</small>
        </div>
        <div>
          <input type="number" min="0" value="${boss.deaths}">
          <small>Death</small>
        </div>
        <button class="kill-btn">${boss.killed ? "☠" : "⚔"}</button>
      </div>
    `;

    const [triesInput, deathsInput] = row.querySelectorAll("input");
    const killBtn = row.querySelector(".kill-btn");

    triesInput.oninput = () => {
      boss.tries = +triesInput.value;
      saveProgress();
    };

    deathsInput.oninput = () => {
      boss.deaths = +deathsInput.value;
      saveProgress();
      updateHeaderStats();
    };

    killBtn.onclick = () => {
      boss.killed = !boss.killed;
      row.dataset.killed = boss.killed ? "1" : "0";
      killBtn.textContent = boss.killed ? "☠" : "⚔";
      saveProgress();
      updateProgressUI();
    };

    return row;
  }

  /* ============================
     UI UPDATES
  ============================ */

  function updateHeaderStats() {
    content.querySelector(".stats-line b").textContent = countDeaths();
  }

  function updateProgressUI() {
    const { total, killed } = countProgress();
    const percent = total ? Math.floor((killed / total) * 100) : 0;

    content.querySelector(".progress-fill").style.width = percent + "%";
    content.querySelector(".progress-text").textContent =
      `Прогресс: ${percent}% (${killed}/${total})`;

    updateHeaderStats();
  }

});























