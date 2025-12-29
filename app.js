// ===== ADMIN MODE =====
const params = new URLSearchParams(window.location.search);

if (params.get("admin") === "1") {
  localStorage.setItem("soul_admin", "true");
}

const isAdmin = localStorage.getItem("soul_admin") === "true";
const games = {
  ds1: "data/ds1.json",
  ds2: "data/ds2.json",
  ds3: "data/ds3.json",
  sekiro: "data/sekiro.json",
  elden: "data/elden_ring.json"
};

const admin = new URLSearchParams(location.search).get("admin") === "1";

const gameList = document.getElementById("game-list");
const bossList = document.getElementById("boss-list");
const gameBanner = document.getElementById("game-banner");
const regionSelect = document.getElementById("region-select");

let currentFilter = "all";
let lastGameId = null;
let lastBosses = [];

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; }
  catch { return {}; }
}

/* КНОПКИ ИГР */
Object.entries(games).forEach(([id, path]) => {
  const btn = document.createElement("button");
  btn.className = "game-btn";
  btn.textContent = id.toUpperCase();
  btn.onclick = () => loadGame(id, path, btn);
  gameList.appendChild(btn);
});

/* ФИЛЬТР */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    currentFilter = btn.dataset.filter;
    renderBosses(lastGameId, lastBosses);
  };
});

async function loadGame(id, path, btn) {
  document.querySelectorAll(".game-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const data = await (await fetch(path)).json();
  gameBanner.src = data.banner || "";
  regionSelect.style.display = "none";

  if (id === "elden") {
    regionSelect.style.display = "block";
    regionSelect.innerHTML = "";

    Object.entries(data.regions).forEach(([k, r]) => {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = r.name;
      regionSelect.appendChild(o);
    });

    const region = localStorage.getItem("elden_region") || Object.keys(data.regions)[0];
    regionSelect.value = region;

    regionSelect.onchange = () => {
      localStorage.setItem("elden_region", regionSelect.value);
      renderBosses(id, data.regions[regionSelect.value].bosses);
    };

    renderBosses(id, data.regions[region].bosses);
    return;
  }

  const bosses = [];
  Object.values(data.sections).forEach(s => s.bosses.forEach(b => bosses.push(b)));
  renderBosses(id, bosses);
}

function renderBosses(gameId, bosses) {
  lastGameId = gameId;
  lastBosses = bosses;
  bossList.innerHTML = "";

  const state = load(gameId);
  let deaths = 0;
  let killed = 0;

  bosses.forEach(b => {
    const s = state[b.id] || { tries:0, deaths:0, dead:false };
    deaths += s.deaths;
    if (s.dead) killed++;

    if (
      currentFilter === "dead" && !s.dead ||
      currentFilter === "alive" && s.dead
    ) return;

    const row = document.createElement("div");
    row.className = "boss" + (s.dead ? " dead":"");

    row.innerHTML = `
      <div class="boss-name">
        <img class="boss-icon" src="${b.icon || 'images/bosses/unknown.png'}">
        ${b.name}
      </div>
      <input type="number" value="${s.tries}" ${!admin?"disabled":""}>
      <input type="number" value="${s.deaths}" ${!admin?"disabled":""}>
      <button class="kill-btn">${s.dead?"DEAD":"KILL"}</button>
    `;

    if (admin) {
      const [t,d] = row.querySelectorAll("input");
      t.onchange=()=>{s.tries=+t.value;state[b.id]=s;save(gameId,state);};
      d.onchange=()=>{s.deaths=+d.value;state[b.id]=s;save(gameId,state);renderBosses(gameId,bosses);};
      row.querySelector(".kill-btn").onclick=()=>{
        s.dead=!s.dead;state[b.id]=s;save(gameId,state);renderBosses(gameId,bosses);
      };
    }

    bossList.appendChild(row);
  });

  document.getElementById("game-deaths").textContent = deaths;
  document.getElementById("total-deaths").textContent =
    Object.keys(games).reduce((sum,g)=>sum+
      Object.values(load(g)).reduce((a,b)=>a+(b.deaths||0),0),0);

  const percent = Math.round((killed / bosses.length) * 100);
  document.getElementById("game-progress").style.width = percent+"%";
  document.getElementById("game-progress-text").textContent = percent+"%";

  let totalBosses=0,totalKilled=0;
  Object.keys(games).forEach(g=>{
    const s=load(g);
    Object.values(s).forEach(b=>{
      totalBosses++;
      if(b.dead) totalKilled++;
    });
  });

  const totalPercent = totalBosses ? Math.round((totalKilled/totalBosses)*100) : 0;
  document.getElementById("total-progress").style.width = totalPercent+"%";
  document.getElementById("total-progress-text").textContent = totalPercent+"%";
}

document.getElementById("back-btn").onclick=()=>{
  document.body.style.opacity=0;
  setTimeout(()=>location.href="index.html",400);
};


































