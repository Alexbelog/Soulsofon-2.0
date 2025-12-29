const ADMIN = location.search.includes("admin=1");

const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const globalStats = document.getElementById("global");

fetch("data/games.json")
  .then(r => r.json())
  .then(games => {
    games.forEach(game => {
      const btn = document.createElement("div");
      btn.className = "game-btn";
      btn.textContent = game.title;
      btn.onclick = () => loadGame(game);
      sidebar.appendChild(btn);
    });

    loadGame(games[0]);
    recalcGlobal();
  });

function loadGame(game) {
  fetch(game.file)
    .then(r => r.json())
    .then(data => renderGame(data));
}

function renderGame(data) {
  content.innerHTML = `
    <div class="game-header">
      <img src="${data.logo}">
      <div class="deaths-big" id="gameDeaths">0</div>
      <div>Смертей в игре</div>
    </div>
  `;

  let gameDeaths = 0;

  data.sections.forEach(section => {
    const block = document.createElement("div");
    block.className = "section";
    block.innerHTML = `<h2>${section.name}</h2>`;

    section.bosses.forEach(boss => {
      const key = boss.id;
      const saved = JSON.parse(localStorage.getItem(key) || "{}");

      gameDeaths += saved.deaths || 0;

      const row = document.createElement("div");
      row.className = "boss";
      if (saved.killed) row.classList.add("killed");

      row.innerHTML = `
        <img src="${boss.icon}">
        <div>${boss.name}</div>
        <input type="number" value="${saved.tries || 0}">
        <input type="number" value="${saved.deaths || 0}">
        <div class="status">${saved.killed ? "УБИТ" : "ЖИВ"}</div>
      `;

      const [tries, deaths] = row.querySelectorAll("input");

      if (!ADMIN) {
        tries.disabled = true;
        deaths.disabled = true;
      }

      function save(killed = saved.killed) {
        if (!ADMIN) return;
        localStorage.setItem(key, JSON.stringify({
          tries:+tries.value,
          deaths:+deaths.value,
          killed
        }));
        recalcGlobal();
      }

      tries.onchange = save;
      deaths.onchange = save;

      row.onclick = () => {
        if (!ADMIN) return;
        saved.killed = !saved.killed;
        save(saved.killed);
        renderGame(data);
      };

      block.appendChild(row);
    });

    content.appendChild(block);
  });

  document.getElementById("gameDeaths").textContent = gameDeaths;
}

function recalcGlobal() {
  let sum = 0;
  Object.values(localStorage).forEach(v => {
    try {
      const d = JSON.parse(v);
      if (d.deaths) sum += d.deaths;
    } catch {}
  });
  globalStats.textContent = sum;
}
