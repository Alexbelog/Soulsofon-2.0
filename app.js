// ===== ADMIN MODE =====
const params = new URLSearchParams(window.location.search);

if (params.get("admin") === "1") {
  localStorage.setItem("soul_admin", "true");
}

const isAdmin = localStorage.getItem("soul_admin") === "true";
const games = {
  ds1: { name:"Dark Souls", file:"data/ds1.json", banner:"images/ds1.jpg" },
  ds2: { name:"Dark Souls II", file:"data/ds2.json", banner:"images/ds2.jpg" },
  ds3: { name:"Dark Souls III", file:"data/ds3.json", banner:"images/ds3.jpg" },
  sekiro:{ name:"Sekiro", file:"data/sekiro.json", banner:"images/sekiro.jpg" },
  elden:{ name:"Elden Ring", file:"data/elden_ring.json", banner:"images/elden.jpg" }
};

const list = document.getElementById("game-list");
const bossesEl = document.getElementById("bosses");
const bannerImg = document.getElementById("game-banner-img");
const gameDeathsEl = document.getElementById("game-deaths");
const totalDeathsEl = document.getElementById("total-deaths");
const eldenMap = document.getElementById("elden-map-wrapper");

let currentGame = null;
let gameData = null;

Object.keys(games).forEach(id=>{
  const btn = document.createElement("button");
  btn.className = "game-btn";
  btn.textContent = games[id].name;
  btn.onclick = ()=>loadGame(id);
  list.appendChild(btn);
});

loadGame("ds1");

function loadGame(id){
  fetch(games[id].file)
    .then(r=>r.json())
    .then(data=>{
      currentGame = id;
      gameData = data;

      bannerImg.src = games[id].banner;
      eldenMap.classList.toggle("hidden", id!=="elden");

      if(id==="elden"){
        initEldenMap(data);
      } else {
        renderBosses(flatten(data.sections));
      }
    });
}

function flatten(sections){
  let arr=[];
  Object.values(sections).forEach(v=>{
    if(Array.isArray(v)) arr.push(...v);
  });
  return arr;
}

function renderBosses(bosses){
  bossesEl.innerHTML="";
  let gameDeaths=0;

  bosses.forEach(b=>{
    const state = loadState(b.id);
    if(state.dead) gameDeaths += state.deaths || 0;

    const row = document.createElement("div");
    row.className = "boss" + (state.dead ? " dead" : "");

    const iconPath = `images/bosses/${currentGame}/${b.id}.png`;

    row.innerHTML = `
      <img class="boss-icon"
           src="${iconPath}"
           onerror="this.src='images/bosses/placeholder.png'">

      <span class="boss-name">${b.name}</span>

      <div class="boss-stats">
        <input type="number" value="${state.deaths || 0}">
        <button>УБИТ</button>
      </div>
    `;

    row.querySelector("button").onclick = ()=>{
      state.dead = true;
      saveState(b.id, state);
      loadGame(currentGame);
    };

    row.querySelector("input").onchange = e=>{
      state.deaths = +e.target.value;
      saveState(b.id, state);
      updateTotals();
    };

    bossesEl.appendChild(row);
  });

  gameDeathsEl.textContent = gameDeaths;
  updateTotals();
}

function updateTotals(){
  let total = 0;
  Object.keys(localStorage).forEach(k=>{
    if(!k.startsWith("boss_")) return;
    const d = JSON.parse(localStorage[k]);
    if(d.deaths) total += d.deaths;
  });
  totalDeathsEl.textContent = total;
}

function saveState(id,data){
  localStorage.setItem("boss_"+id, JSON.stringify(data));
}

function loadState(id){
  return JSON.parse(localStorage.getItem("boss_"+id) || "{}");
}

/* ELDEN RING — РЕГИОНЫ */
function initEldenMap(data){
  document.querySelectorAll(".region").forEach(r=>{
    r.onclick = ()=>{
      document.querySelectorAll(".region").forEach(x=>x.classList.remove("active"));
      r.classList.add("active");
      renderBosses(data.regions[r.dataset.region].bosses);
    };
  });
  document.querySelector(".region")?.click();
}






































