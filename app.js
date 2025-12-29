// ===== ADMIN MODE =====
const params = new URLSearchParams(window.location.search);

if (params.get("admin") === "1") {
  localStorage.setItem("soul_admin", "true");
}

const isAdmin = localStorage.getItem("soul_admin") === "true";
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

Object.keys(games).forEach(id=>{
  const b=document.createElement("button");
  b.className="game-btn";
  b.textContent=games[id].name;
  b.onclick=()=>loadGame(id);
  list.appendChild(b);
});

loadGame("ds1");

function loadGame(id){
  fetch(games[id].file).then(r=>r.json()).then(data=>{
    currentGame=id;
    bannerImg.src=games[id].banner;

    eldenMapWrapper.classList.toggle("hidden",id!=="elden");
    resetMapBtn.classList.toggle("hidden",id!=="elden");

    if(id==="elden") initEldenMap(data);
    else renderBosses(flatten(data.sections));
  });
}

function flatten(sections){
  let arr=[];
  Object.values(sections).forEach(v=>Array.isArray(v)&&arr.push(...v));
  return arr;
}

function renderBosses(bosses){
  bossesEl.innerHTML="";
  let gameDeaths=0;

  bosses.forEach(b=>{
    const s=loadState(b.id);
    if(s.dead) gameDeaths+=s.deaths||0;

    const row=document.createElement("div");
    row.className="boss"+(s.dead?" dead":"");

    const deaths=s.deaths||0;
    let heat=0;
    if(deaths>=1)heat=1;
    if(deaths>=5)heat=2;
    if(deaths>=10)heat=3;
    if(deaths>=20)heat=4;
    row.dataset.heat=heat;

    row.innerHTML=`
      <img class="boss-icon" src="images/bosses/${currentGame}/${b.id}.png"
           onerror="this.src='images/bosses/placeholder.png'">
      <span class="boss-name">${b.name}</span>
      <div class="boss-stats">
        <input type="number" value="${deaths}">
        <button>УБИТ</button>
      </div>
    `;

    row.querySelector("button").onclick=()=>{
      s.dead=true;
      saveState(b.id,s);
      showYouDied();
      setTimeout(()=>loadGame(currentGame),900);
    };

    row.querySelector("input").onchange=e=>{
      s.deaths=+e.target.value;
      saveState(b.id,s);
      updateTotals();
    };

    bossesEl.appendChild(row);
  });

  gameDeathsEl.textContent=gameDeaths;
  updateTotals();
  updateProgress(bosses);
}

function updateTotals(){
  let total=0;
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith("boss_")){
      const d=JSON.parse(localStorage[k]);
      if(d.deaths) total+=d.deaths;
    }
  });
  totalDeathsEl.textContent=total;
  updateTotalProgress();
}

function updateProgress(bosses){
  let killed=0;
  bosses.forEach(b=>loadState(b.id).dead&&killed++);
  document.getElementById("game-progress").style.width=
    (bosses.length?Math.round(killed/bosses.length*100):0)+"%";
}

function updateTotalProgress(){
  let total=0,killed=0;
  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith("boss_")){
      total++;
      JSON.parse(localStorage[k]).dead&&killed++;
    }
  });
  document.getElementById("total-progress").style.width=
    (total?Math.round(killed/total*100):0)+"%";
}

function saveState(id,d){ localStorage.setItem("boss_"+id,JSON.stringify(d)); }
function loadState(id){ return JSON.parse(localStorage.getItem("boss_"+id)||"{}"); }

function showYouDied(){
  const o=document.getElementById("you-died-overlay");
  o.classList.add("show");
  setTimeout(()=>o.classList.remove("show"),900);
}

/* ===== ELDEN MAP ===== */

function initEldenMap(data){
  document.querySelectorAll(".region").forEach(r=>{
    r.onclick=()=>{
      document.querySelectorAll(".region").forEach(x=>x.classList.remove("active"));
      r.classList.add("active");
      renderBosses(data.regions[r.dataset.region].bosses);
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










































