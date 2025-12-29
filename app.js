// ======================
// НАСТРОЙКИ
// ======================
const ADMIN = location.search.includes("admin=1");
// ======================
// СПИСОК ИГР (ЖЁСТКО В КОДЕ)
// ======================
const GAMES = {
  ds1: {
    title: "Dark Souls",
    file: "data/ds1.json",
    group: "ds1"
  },
  ds2: {
    title: "Dark Souls II",
    file: "data/ds2.json",
    group: "ds2"
  },
  ds3: {
    title: "Dark Souls III",
    file: "data/ds3.json",
    group: "ds3"
  },
  sekiro: {
    title: "Sekiro",
    file: "data/sekiro.json",
    group: "sekiro"
  },

  // ===== ELDEN RING =====
  elden_limgrave: {
    title: "Лимгрейв",
    file: "data/elden_limgrave.json",
    group: "elden"
  },
  elden_liurnia: {
    title: "Лиурния",
    file: "data/elden_liurnia.json",
    group: "elden"
  },
  elden_caelid: {
    title: "Кэлид",
    file: "data/elden_caelid.json",
    group: "elden"
  },
  elden_altus_gelmir: {
    title: "Альтус и Гельмир",
    file: "data/elden_altus_gelmir.json",
    group: "elden"
  },
  elden_volcano_manor: {
    title: "Вулканово поместье",
    file: "data/elden_volcano_manor.json",
    group: "elden"
  },
  elden_leyndell: {
    title: "Лейнделл",
    file: "data/elden_leyndell.json",
    group: "elden"
  },
  elden_mountaintops: {
    title: "Вершины великанов",
    file: "data/elden_mountaintops.json",
    group: "elden"
  },
  elden_consecrated_snowfield: {
    title: "Освящённое снежное поле",
    file: "data/elden_consecrated_snowfield.json",
    group: "elden"
  },
  elden_haligtree: {
    title: "Халигтри",
    file: "data/elden_haligtree.json",
    group: "elden"
  },
  elden_underground: {
    title: "Подземные регионы",
    file: "data/elden_underground.json",
    group: "elden"
  },
  elden_farum_azula: {
    title: "Фарум-Азула",
    file: "data/elden_farum_azula.json",
    group: "elden"
  }
};

// ======================
// DOM
// ======================
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const globalEl = document.getElementById("global");

// ======================
// INIT
// ======================
initSidebar();
recalcGlobal();

// ======================
// SIDEBAR
// ======================
function initSidebar() {
  sidebar.innerHTML = "";

  GAMES.forEach((game, index) => {
    const btn = document.createElement("div");
    btn.className = "game-btn";
    btn.textContent = game.title;
    btn.onclick = () => loadGame(game.file);
    sidebar.appendChild(btn);

    if (index === 0) loadGame(game.file);
  });
}

// ======================
// LOAD GAME JSON
// ======================
function loadGame(file) {
  fetch(file)
    .then(checkResponse)
    .then(r => r.json())
    .then(renderGame)
    .catch(err => {
      console.error(err);
      content.innerHTML = "<p style='color:red;'>Ошибка загрузки данных игры</p>";
    });
}

// ======================
// RENDER GAME
// ======================
function renderGame(data) {
  content.innerHTML = "";
  let deathsInGame = 0;

  const header = document.createElement("div");
  header.className = "game-header";
  header.innerHTML = `
    <img src="${data.logo}">
    <div class="deaths-big" id="gameDeaths">0</div>
    <div>Смертей в игре</div>
  `;
  content.appendChild(header);

  data.sections.forEach(section => {
    const block = document.createElement("div");
    block.className = "section";
    block.innerHTML = `<h2>${section.name}</h2>`;

    section.bosses.forEach(boss => {
      const key = `boss_${boss.id}`;
      const saved = safeParse(localStorage.getItem(key));

      deathsInGame += saved.deaths || 0;

      const row = document.createElement("div");
      row.className = "boss";
      if (saved.killed) row.classList.add("killed");

      row.innerHTML = `
        <img src="${boss.icon}">
        <div>${boss.name}</div>
        <input type="number" min="0" value="${saved.tries || 0}">
        <input type="number" min="0" value="${saved.deaths || 0}">
        <div class="status">${saved.killed ? "УБИТ" : "ЖИВ"}</div>
      `;

      const [triesInput, deathsInput] = row.querySelectorAll("input");
      const statusEl = row.querySelector(".status");

      if (!ADMIN) {
        triesInput.disabled = true;
        deathsInput.disabled = true;
      }

      function save(killedState = saved.killed) {
        if (!ADMIN) return;

        localStorage.setItem(
          key,
          JSON.stringify({
            tries: +triesInput.value || 0,
            deaths: +deathsInput.value || 0,
            killed: killedState
          })
        );

        row.classList.toggle("killed", killedState);
        statusEl.textContent = killedState ? "УБИТ" : "ЖИВ";

        recalcGlobal();
        updateGameDeaths();
      }

      triesInput.onchange = () => save();
      deathsInput.onchange = () => save();

      row.onclick = () => {
        if (!ADMIN) return;
        saved.killed = !saved.killed;
        save(saved.killed);
      };

      block.appendChild(row);
    });

    content.appendChild(block);
  });

  function updateGameDeaths() {
    let sum = 0;
    data.sections.forEach(section => {
      section.bosses.forEach(boss => {
        const d = safeParse(localStorage.getItem(`boss_${boss.id}`));
        sum += d.deaths || 0;
      });
    });
    document.getElementById("gameDeaths").textContent = sum;
  }

  updateGameDeaths();
}

// ======================
// GLOBAL STATS
// ======================
function recalcGlobal() {
  let sum = 0;
  Object.keys(localStorage).forEach(key => {
    if (!key.startsWith("boss_")) return;
    const d = safeParse(localStorage.getItem(key));
    sum += d.deaths || 0;
  });
  globalEl.textContent = sum;
}

// ======================
// HELPERS
// ======================
function safeParse(str) {
  try {
    return str ? JSON.parse(str) : {};
  } catch {
    return {};
  }
}

function checkResponse(r) {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r;
}



