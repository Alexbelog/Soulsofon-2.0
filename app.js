const isAdmin = location.search.includes("~admin=1");

const GAMES = {
  ds1: {
    title: "Dark Souls",
    file: "data/ds1.json",
    logo: "img/ds1.jpg",
    group: "ds1"
  },
  ds2: {
    title: "Dark Souls II",
    file: "data/ds2.json",
    logo: "img/ds2.jpg",
    group: "ds2"
  },
  ds3: {
    title: "Dark Souls III",
    file: "data/ds3.json",
    logo: "img/ds3.jpg",
    group: "ds3"
  },
  sekiro: {
    title: "Sekiro",
    file: "data/sekiro.json",
    logo: "img/sekiro.jpg",
    group: "sekiro"
  },

  // ===== ELDEN RING =====
  elden_limgrave: {
    title: "Elden Ring — Лимгрейв",
    file: "data/elden_limgrave.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_liurnia: {
    title: "Elden Ring — Лиурния",
    file: "data/elden_liurnia.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_caelid: {
    title: "Elden Ring — Кэлид",
    file: "data/elden_caelid.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_altus_gelmir: {
    title: "Elden Ring — Альтус и Гельмир",
    file: "data/elden_altus_gelmir.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_volcano_manor: {
    title: "Elden Ring — Вулканово поместье",
    file: "data/elden_volcano_manor.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_leyndell: {
    title: "Elden Ring — Лейнделл",
    file: "data/elden_leyndell.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_mountaintops: {
    title: "Elden Ring — Вершины великанов",
    file: "data/elden_mountaintops.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_consecrated_snowfield: {
    title: "Elden Ring — Освящённое снежное поле",
    file: "data/elden_consecrated_snowfield.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_haligtree: {
    title: "Elden Ring — Халигтри",
    file: "data/elden_haligtree.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_underground: {
    title: "Elden Ring — Подземные регионы",
    file: "data/elden_underground.json",
    logo: "img/elden.jpg",
    group: "elden"
  },
  elden_farum_azula: {
    title: "Elden Ring — Фарум-Азула",
    file: "data/elden_farum_azula.json",
    logo: "img/elden.jpg",
    group: "elden"
  }
};

async function loadGame(key) {
  const game = GAMES[key];
  if (!game) return;

  const res = await fetch(game.file);
  const data = await res.json();

  document.getElementById("gameLogo").src = game.logo;

  const list = document.getElementById("bossList");
  list.innerHTML = "";

  let gameDeaths = 0;

  data.bosses.forEach(boss => {
    const saved = JSON.parse(localStorage.getItem(boss.id) || "{}");

    gameDeaths += saved.deaths || 0;

    const row = document.createElement("div");
    row.className = "boss";

    row.innerHTML = `
      <div class="boss-name">
        <img src="${boss.icon || "img/boss.png"}">
        ${boss.name}
      </div>
      <div class="boss-stats">
        <div>
          <input type="number" value="${saved.tries || 0}" ${!isAdmin ? "disabled" : ""}>
          <small>Try</small>
        </div>
        <div>
          <input type="number" value="${saved.deaths || 0}" ${!isAdmin ? "disabled" : ""}>
          <small>Death</small>
        </div>
      </div>
    `;

    if (isAdmin) {
      row.querySelectorAll("input").forEach(input => {
        input.addEventListener("change", () => {
          localStorage.setItem(
            boss.id,
            JSON.stringify({
              tries: +row.querySelectorAll("input")[0].value,
              deaths: +row.querySelectorAll("input")[1].value,
              group: game.group
            })
          );
          updateTotals(game.group);
        });
      });
    }

    list.appendChild(row);
  });

  updateTotals(game.group);
}

function updateTotals(group) {
  let gameDeaths = 0;
  let totalDeaths = 0;

  for (let k in localStorage) {
    try {
      const v = JSON.parse(localStorage[k]);
      totalDeaths += v.deaths || 0;
      if (v.group === group) gameDeaths += v.deaths || 0;
    } catch {}
  }

  document.getElementById("gameDeaths").textContent = gameDeaths;
  document.getElementById("totalDeaths").textContent = totalDeaths;
}

function toggleElden() {
  document.getElementById("eldenRegions").classList.toggle("hidden");
}





