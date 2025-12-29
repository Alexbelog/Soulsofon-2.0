document.addEventListener("DOMContentLoaded", () => {

  const games = [
    { id: "ds1", name: "Dark Souls", json: "data/ds1.json" },
    { id: "ds2", name: "Dark Souls II", json: "data/ds2.json" },
    { id: "ds3", name: "Dark Souls III", json: "data/ds3.json" },
    { id: "sekiro", name: "Sekiro", json: "data/sekiro.json" },
    { id: "elden", name: "Elden Ring", json: "data/elden_ring.json" }
  ];

  let currentGame = null;
  let currentRegion = null;
  let gameData = null;

  const sidebar = document.getElementById("game-list");
  const content = document.getElementById("content");

  if (!sidebar || !content) return;

  initSidebar();
  loadGame(games[0]);

  /* ---------------- SIDEBAR ---------------- */

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

  /* ---------------- STORAGE ---------------- */

  function storageKey(gameId, region = null) {
    return region
      ? `soulsofon_progress_${gameId}_${region}`
      : `soulsofon_progress_${gameId}`;
  }

  function saveProgress() {
    if (!currentGame || !gameData) return;
    const key = storageKey(currentGame.id, currentRegion);
    localStorage.setItem(key, JSON.stringify(gameData));
  }

  function loadProgress(game, region = null) {
    const key = storageKey(game.id, region);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }

  /* ---------------- LOAD GAME ---------------- */

  async function loadGame(game) {
    currentGame = game;
    currentRegion = null;
    content.innerHTML = "Загрузка...";

    const res = await fetch(game.json);
    const raw = await res.json();

    if (game.id === "elden") {
      renderRegionSelector(raw);
      return;
    }

    gameData = loadProgress(game) || raw;
    saveProgress();
    renderGame();
  }

  /* ---------------- ELDEN RING ---------------- */

  function renderRegionSelector(raw) {
    content.innerHTML = "";

    const header = document.createElement("div");
    header.className = "game-header";
    header.innerHTML = `
      <img class="game-poster" src="${raw.poster}">
      <h1>${raw.title}</h1>
    `;

    const select = document.createElement("select");
    select.className = "region-select";

    Object.entries(raw.regions).forEach(([key, r]) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = r.name;
      select.appendChild(opt);
    });

    select.onchange = () => loadRegion(raw, select.value);

    content.append(header, select);
    loadRegion(raw, select.value);
  }

  function loadRegion(raw, key) {
    currentRegion = key;
    const region = raw.regions[key];

    gameData = loadProgress(currentGame, key) || {
      title: `${raw.title} — ${region.name}`,
      poster: raw.poster,
      sections: region.sections
    };

    saveProgress();
    renderGame();
  }

  /* ---------------- RENDER ---------------- */

  function renderGame() {
    content.innerHTML = "";

    const header = document.createElement("div");
    header.className = "game-header";
    header.innerHTML = `
      <img class="game-poster" src="${gameData.poster}">
      <h1>${gameData.title}</h1>

      <div class="progress-wrap">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-text"></div>
      </div>
    `;
    content.appendChild(header);

    updateProgress();

    for (const section in gameData.sections) {
      renderSection(section, gameData.sections[section]);
    }
  }

  function renderSection(key, bosses) {
    const s = document.createElement("section");
    s.innerHTML = `<h2>${key}</h2>`;
    bosses.forEach((b, i) => s.appendChild(renderBoss(b, key, i)));
    content.appendChild(s);
  }

  /* ---------------- BOSSES ---------------- */

  function renderBoss(boss, section, index) {
    const row = document.createElement("div");
    row.className = "boss-row";
    row.dataset.status = boss.killed ? "killed" : "alive";

    row.innerHTML = `
      <span>${boss.name}</span>
      <button>${boss.killed ? "☠" : "⚔"}</button>
    `;

    row.querySelector("button").onclick = () => {
      boss.killed = !boss.killed;
      row.dataset.status = boss.killed ? "killed" : "alive";
      row.querySelector("button").textContent = boss.killed ? "☠" : "⚔";
      saveProgress();
      updateProgress();
    };

    return row;
  }

  /* ---------------- PROGRESS ---------------- */

  function updateProgress() {
    let total = 0;
    let killed = 0;

    for (const sec in gameData.sections) {
      gameData.sections[sec].forEach(b => {
        total++;
        if (b.killed) killed++;
      });
    }

    const percent = total ? Math.floor((killed / total) * 100) : 0;

    const fill = document.querySelector(".progress-fill");
    const text = document.querySelector(".progress-text");

    if (fill) fill.style.width = percent + "%";
    if (text) text.textContent = `${percent}% — ${killed} / ${total}`;
  }

});




















