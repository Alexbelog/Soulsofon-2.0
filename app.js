document.addEventListener("DOMContentLoaded", () => {

  const games = [
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

  if (!sidebar || !content) return;

  initSidebar();
  loadGame(games[0]);

  /* ---------- SIDEBAR ---------- */

  function initSidebar() {
    sidebar.innerHTML = "";
    games.forEach(g => {
      const btn = document.createElement("button");
      btn.className = "game-btn";
      btn.textContent = g.name;
      btn.onclick = () => loadGame(g);
      sidebar.appendChild(btn);
    });
  }

  /* ---------- STORAGE ---------- */

  function storageKey(gameId) {
    return `soulsofon_${gameId}`;
  }

  function saveProgress() {
    if (!currentGame || !gameData) return;
    localStorage.setItem(storageKey(currentGame.id), JSON.stringify(gameData));
  }

  function loadProgress(game, original) {
    const saved = localStorage.getItem(storageKey(game.id));
    return saved ? JSON.parse(saved) : structuredClone(original);
  }

  /* ---------- LOAD GAME ---------- */

  async function loadGame(game) {
    currentGame = game;
    content.innerHTML = "Загрузка...";

    const res = await fetch(game.file);
    const json = await res.json();

    gameData = loadProgress(game, json);
    saveProgress();
    renderGame();
  }

  /* ---------- RENDER ---------- */

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

    for (const key in gameData.sections) {
      renderSection(gameData.sections[key]);
    }
  }

  function renderSection(section) {
    const block = document.createElement("section");
    block.innerHTML = `<h2>${section.name}</h2>`;

    section.bosses.forEach(boss => {
      block.appendChild(renderBoss(boss));
    });

    content.appendChild(block);
  }

  /* ---------- BOSS ---------- */

  function renderBoss(boss) {
    const row = document.createElement("div");
    row.className = "boss-row";
    row.dataset.status = boss.killed ? "killed" : "alive";

    row.innerHTML = `
      <span>${boss.name}</span>

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
      updateProgress();
    };

    killBtn.onclick = () => {
      boss.killed = !boss.killed;
      row.dataset.status = boss.killed ? "killed" : "alive";
      killBtn.textContent = boss.killed ? "☠" : "⚔";
      saveProgress();
      updateProgress();
    };

    return row;
  }

  /* ---------- PROGRESS ---------- */

  function updateProgress() {
    let total = 0;
    let killed = 0;

    for (const key in gameData.sections) {
      gameData.sections[key].bosses.forEach(b => {
        total++;
        if (b.killed) killed++;
      });
    }

    const percent = total ? Math.floor((killed / total) * 100) : 0;

    document.querySelector(".progress-fill").style.width = percent + "%";
    document.querySelector(".progress-text").textContent =
      `${percent}% — ${killed}/${total}`;
  }

});





















