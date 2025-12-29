// ===================================
// SOULSFON 2.0 — app.js (FINAL)
// ===================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------- CONFIG ----------
  const games = [
    { id: "ds1", name: "Dark Souls", json: "data/ds1.json" },
    { id: "ds2", name: "Dark Souls II", json: "data/ds2.json" },
    { id: "ds3", name: "Dark Souls III", json: "data/ds3.json" },
    { id: "sekiro", name: "Sekiro", json: "data/sekiro.json" },
    { id: "elden", name: "Elden Ring", json: "data/elden_ring.json" }
  ];

  // ---------- STATE ----------
  let currentGame = null;
  let currentRegion = null;
  let gameData = null;

  // ---------- DOM ----------
  const sidebar = document.getElementById("game-list");
  const content = document.getElementById("content");

  if (!sidebar || !content) {
    console.error("❌ Не найдены #game-list или #content");
    return;
  }

  initSidebar();
  loadGame(games[0]);

  // ===================================
  // SIDEBAR
  // ===================================

  function initSidebar() {
    sidebar.innerHTML = "";
    games.forEach(game => {
      const btn = document.createElement("button");
      btn.className = "game-btn";
      btn.textContent = game.name;
      btn.onclick = () => loadGame(game);
      sidebar.appendChild(btn);
    });
  }

  // ===================================
  // STORAGE
  // ===================================

  function storageKey(gameId, region = null) {
    return region
      ? `soulsofon_progress_${gameId}_${region}`
      : `soulsofon_progress_${gameId}`;
  }

  function saveProgress() {
    if (!currentGame || !gameData) return;

    const key = storageKey(
      currentGame.id,
      currentGame.id === "elden" ? currentRegion : null
    );

    localStorage.setItem(key, JSON.stringify(gameData));
  }

  function loadProgress(game, region = null) {
    const key = storageKey(game.id, region);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }

  // ===================================
  // LOAD GAME
  // ===================================

  async function loadGame(game) {
    currentGame = game;
    currentRegion = null;
    content.innerHTML = "<p>Загрузка...</p>";

    try {
      const res = await fetch(game.json);
      const rawData = await res.json();

      // Elden Ring → регионы
      if (game.id === "elden") {
        renderRegionSelector(rawData);
        return;
      }

      // Обычные игры
      const saved = loadProgress(game);
      gameData = saved || rawData;

      if (!saved) saveProgress();
      renderGame();

    } catch (e) {
      console.error(e);
      content.innerHTML = "<p>Ошибка загрузки данных</p>";
    }
  }

  // ===================================
  // ELDEN RING — REGIONS
  // ===================================

  function renderRegionSelector(rawData) {
    content.innerHTML = "";

    const header = document.createElement("div");
    header.className = "game-header";
    header.innerHTML = `
      <img src="${rawData.poster}" class="game-poster">
      <h1>${rawData.title}</h1>
    `;

    const select = document.createElement("select");
    select.className = "region-select";

    Object.entries(rawData.regions).forEach(([key, region]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = region.name;
      select.appendChild(option);
    });

    select.onchange = () => loadRegion(rawData, select.value);

    content.appendChild(header);
    content.appendChild(select);

    // автозагрузка первого региона
    loadRegion(rawData, select.value);
  }

  function loadRegion(rawData, regionKey) {
    currentRegion = regionKey;

    const region = rawData.regions[regionKey];
    const saved = loadProgress(currentGame, regionKey);

    gameData = saved || {
      title: `${rawData.title} — ${region.name}`,
      poster: rawData.poster,
      sections: region.sections
    };

    if (!saved) saveProgress();
    renderGame();
  }

  // ===================================
  // RENDER GAME
  // ===================================

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

    bosses.forEach((boss, index) => {
      section.appendChild(renderBossRow(boss, key, index));
    });

    content.appendChild(section);
  }

  function sectionTitle(key) {
    return {
      main: "Основные боссы",
      optional: "Опциональные боссы",
      dlc: "Боссы DLC"
    }[key] || key;
  }

  // ===================================
  // BOSS ROW
  // ===================================

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

    row.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", updateBossValue);
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

  // ===================================
  // UPDATE / STATS
  // ===================================

  function updateBossValue(e) {
    const { section, index, field } = e.target.dataset;
    gameData.sections[section][index][field] = Number(e.target.value);
    saveProgress();
    updateDeathCounter();
  }

  function countDeaths() {
    let total = 0;
    for (const section in gameData.sections) {
      gameData.sections[section].forEach(b => {
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



















