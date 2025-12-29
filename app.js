const GAMES = {
  ds1: "data/ds1.json",
  ds2: "data/ds2.json",
  ds3: "data/ds3.json",
  sekiro: "data/sekiro.json",
  elden: "data/elden_ring.json"
};

const gameList = document.getElementById("game-list");
const content = document.getElementById("content");

/* =============================
   SIDEBAR (СПИСОК ИГР)
============================= */
function renderGameList() {
  gameList.innerHTML = "";

  Object.keys(GAMES).forEach(game => {
    const btn = document.createElement("button");
    btn.textContent = game.toUpperCase();
    btn.className = "game-btn";
    btn.onclick = () => loadGame(game);
    gameList.appendChild(btn);
  });
}

/* =============================
   LOAD GAME
============================= */
async function loadGame(gameKey) {
  try {
    const res = await fetch(GAMES[gameKey]);
    const gameData = await res.json();
    renderGame(gameKey, gameData);
  } catch (e) {
    content.innerHTML = `<p style="color:red">Ошибка загрузки ${gameKey}</p>`;
    console.error(e);
  }
}

/* =============================
   RENDER GAME
============================= */
function renderGame(gameKey, gameData) {
  content.innerHTML = "";

  /* HEADER */
  const header = document.createElement("div");
  header.className = "game-header";
  header.innerHTML = `
    <h1>${gameData.title}</h1>
    <img src="${gameData.banner}" alt="${gameData.title}">
  `;
  content.appendChild(header);

  /* SECTIONS */
  gameData.sections.forEach(section => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "boss-section";

    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    sectionEl.appendChild(h2);

    const table = document.createElement("table");
    table.innerHTML = `
      <tr>
        <th>Босс</th>
        <th>Трай</th>
        <th>Смерти</th>
      </tr>
    `;

    section.bosses.forEach(boss => {
      const key = `${gameKey}_${boss.id}`;

      const data = loadBossData(key);

      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="boss-name">
          <img src="${boss.icon}" alt="">
          ${boss.name}
        </td>
        <td>
          <input type="number" min="0" value="${data.tries}">
        </td>
        <td>
          <input type="number" min="0" value="${data.deaths}">
        </td>
      `;

      const inputs = row.querySelectorAll("input");
      inputs[0].oninput = () => saveBossData(key, inputs[0].value, inputs[1].value);
      inputs[1].oninput = () => saveBossData(key, inputs[0].value, inputs[1].value);

      table.appendChild(row);
    });

    sectionEl.appendChild(table);
    content.appendChild(sectionEl);
  });
}

/* =============================
   LOCAL STORAGE
============================= */
function loadBossData(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return { tries: 0, deaths: 0 };
  return JSON.parse(saved);
}

function saveBossData(key, tries, deaths) {
  localStorage.setItem(
    key,
    JSON.stringify({
      tries: Number(tries),
      deaths: Number(deaths)
    })
  );
}

/* =============================
   INIT
============================= */
document.addEventListener("DOMContentLoaded", () => {
  renderGameList();
  loadGame("ds1"); // автозагрузка, НЕТ белого экрана
});





























