const isAdmin = new URLSearchParams(window.location.search).get("admin") === "1";
const games = {
  ds1:{name:"Dark Souls",file:"data/ds1.json",banner:"images/ds1.jpg"},
  ds2:{name:"Dark Souls II",file:"data/ds2.json",banner:"images/ds2.jpg"},
  ds3:{name:"Dark Souls III",file:"data/ds3.json",banner:"images/ds3.jpg"},
  sekiro:{name:"Sekiro",file:"data/sekiro.json",banner:"images/sekiro.jpg"},
  elden:{name:"Elden Ring",file:"data/elden_ring.json",banner:"images/elden.jpg"}
};

const list=document.getElementById("game-list");
const bossesEl=document.getElementById("bosses");
const bannerImg=document.getElementById("game-banner-img");
const gameDeathsEl=document.getElementById("game-deaths");
const totalDeathsEl=document.getElementById("total-deaths");
const eldenMapWrapper=document.getElementById("elden-map-wrapper");
const eldenMap=document.getElementById("elden-map");
const resetMapBtn=document.getElementById("reset-map");

let currentGame=null;
let currentBosses=[];

/* ---------- GAME LIST ---------- */

Object.keys(games).forEach(id=>{
  const b=document.createElement("button");
  b.className="game-btn";
  b.textContent=games[id].name;
  b.onclick=()=>loadGame(id);
  list.appendChild(b);
});

loadGame("ds1");

/* ---------- LOAD GAME ---------- */

function loadGame(id){
  fetch(games[id].file)
    .then(r=>r.json())
    .then(data=>{
      currentGame=id;
      bannerImg.src=games[id].banner;

      eldenMapWrapper.classList.toggle("hidden",id!=="elden");
      resetMapBtn.classList.toggle("hidden",id!=="elden");

      if(id==="elden"){
        initEldenMap(data);
      } else {
        currentBosses = flatten(data.sections);
        renderBosses(currentBosses);
      }
    });
}

/* ---------- HELPERS ---------- */

function flatten(sections){
  let arr=[];
  Object.values(sections).forEach(v=>{
    if(Array.isArray(v)) arr.push(...v);
  });
  return arr;
}

function saveState(id,d){
  localStorage.setItem("boss_"+id,JSON.stringify(d));
}
function loadState(id){
  return JSON.parse(localStorage.getItem("boss_"+id)||"{}");
}

/* ---------- RENDER BOSSES ---------- */

function renderBosses(bosses){
  bossesEl.innerHTML="";
  currentBosses=bosses;

  let gameDeaths=0;

  bosses.forEach(b=>{
    const state=loadState(b.id);
    const deaths=state.deaths||0;
    const dead=state.dead===true;

    if(dead) gameDeaths+=deaths;

    const row=document.createElement("div");
    row.className="boss"+(dead?" dead":"");

    /* heatmap */
    let heat=0;
    if(deaths>=1)heat=1;
    if(deaths>=5)heat=2;
    if(deaths>=10)heat=3;
    if(deaths>=20)heat=4;
    row.dataset.heat=heat;

    row.innerHTML=`
      <img class="boss-icon"
           src="images/bosses/${currentGame}/${b.id}.png"
           onerror="this.src='images/bosses/placeholder.png'">

      <span class="boss-name">${b.name}</span>

      <div class="boss-stats">
        <input type="number" min="0" value="${deaths}">
        <button class="kill-btn">
          ${dead ? "ВОСКРЕС" : "УБИТ"}
        </button>
      </div>
    `;

    /* deaths input */
    row.querySelector("input").onchange=e=>{
      state.deaths=Math.max(0, +e.target.value);
      saveState(b.id,state);
      updateAll();
    };

    /* KILL / REVIVE */
    row.querySelector(".kill-btn").onclick=()=>{
      state.dead=!state.dead;

      if(state.dead){
        showYouDied();
      }

      saveState(b.id,state);
      renderBosses(currentBosses);
    };

    bossesEl.appendChild(row);
  });

  gameDeathsEl.textContent=gameDeaths;
  updateAll();
}

/* ---------- TOTALS & PROGRESS ---------- */

function updateAll(){
  updateTotals();
  updateProgress();
}

function updateTotals(){
  let total=0;
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith("boss_")){
      const d=JSON.parse(localStorage[k]);
      if(d.dead && d.deaths) total+=d.deaths;
    }
  });
  totalDeathsEl.textContent=total;
}

function updateProgress(){
  let killed=0;
  currentBosses.forEach(b=>{
    if(loadState(b.id).dead) killed++;
  });

  const gamePercent=currentBosses.length
    ? Math.round(killed/currentBosses.length*100)
    : 0;

  document.getElementById("game-progress").style.width=gamePercent+"%";

  let total=0, totalKilled=0;
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith("boss_")){
      total++;
      if(JSON.parse(localStorage[k]).dead) totalKilled++;
    }
  });

  const totalPercent=total
    ? Math.round(totalKilled/total*100)
    : 0;

  document.getElementById("total-progress").style.width=totalPercent+"%";
}

/* ---------- YOU DIED ---------- */

function showYouDied(){
  const o=document.getElementById("you-died-overlay");
  o.classList.add("show");
  setTimeout(()=>o.classList.remove("show"),900);
}

/* ---------- ELDEN MAP ---------- */

function initEldenMap(data){
  document.querySelectorAll(".region").forEach(r=>{
    r.onclick=()=>{
      document.querySelectorAll(".region").forEach(x=>x.classList.remove("active"));
      r.classList.add("active");

      currentBosses=data.regions[r.dataset.region].bosses;
      renderBosses(currentBosses);

      zoomToRegion(r);
    };
  });
  document.querySelector(".region")?.click();
}

function zoomToRegion(regionEl){
  const mapRect=eldenMap.getBoundingClientRect();
  const rRect=regionEl.getBoundingClientRect();

  const offsetX=(rRect.left+rRect.width/2)-(mapRect.left+mapRect.width/2);
  const offsetY=(rRect.top+rRect.height/2)-(mapRect.top+mapRect.height/2);

  const scale=1.8;
  eldenMap.classList.add("zoomed");
  eldenMap.style.transform=
    `scale(${scale}) translate(${-offsetX/scale}px, ${-offsetY/scale}px)`;
}

resetMapBtn.onclick=()=>{
  eldenMap.classList.remove("zoomed");
  eldenMap.style.transform="scale(1)";
};













































