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

function save(key,data){ localStorage.setItem(key,JSON.stringify(data)); }
function load(key,fallback){ return JSON.parse(localStorage.getItem(key))||fallback; }

Object.entries(games).forEach(([id,path])=>{
  const btn=document.createElement("button");
  btn.className="game-btn";
  btn.textContent=id.toUpperCase();
  btn.onclick=()=>loadGame(id,path,btn);
  gameList.appendChild(btn);
});

async function loadGame(id,path,btn){
  document.querySelectorAll(".game-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");

  const data=await (await fetch(path)).json();
  gameBanner.src=data.banner||"";
  regionSelect.style.display="none";

  if(id==="elden"){
    regionSelect.style.display="block";
    regionSelect.innerHTML="";

    Object.entries(data.regions).forEach(([k,r])=>{
      const o=document.createElement("option");
      o.value=k; o.textContent=r.name;
      regionSelect.appendChild(o);
    });

    const last=localStorage.getItem("elden_region")||Object.keys(data.regions)[0];
    regionSelect.value=last;
    regionSelect.onchange=()=>{
      localStorage.setItem("elden_region",regionSelect.value);
      renderBosses(id,data.regions[regionSelect.value].bosses);
    };

    renderBosses(id,data.regions[last].bosses);
    return;
  }

  renderBosses(id,data.bosses);
}

function renderBosses(gameId,bosses){
  bossList.innerHTML="";
  const state=load(gameId,{});
  let deaths=0;

  bosses.forEach(b=>{
    const s=state[b.id]||{tries:0,deaths:0,dead:false};
    deaths+=s.deaths;

    const row=document.createElement("div");
    row.className="boss"+(s.dead?" dead":"");
    row.innerHTML=`
      <div>${b.name}</div>
      <input type="number" value="${s.tries}" ${!admin?"disabled":""}>
      <input type="number" value="${s.deaths}" ${!admin?"disabled":""}>
      <button class="kill-btn">${s.dead?"DEAD":"KILL"}</button>
    `;

    if(admin){
      row.querySelectorAll("input").forEach((i,n)=>{
        i.onchange=()=>{
          s[n===0?"tries":"deaths"]=+i.value;
          state[b.id]=s; save(gameId,state);
        };
      });
      row.querySelector(".kill-btn").onclick=()=>{
        s.dead=!s.dead;
        state[b.id]=s; save(gameId,state);
        renderBosses(gameId,bosses);
      };
    }

    bossList.appendChild(row);
  });

  document.getElementById("game-deaths").textContent=deaths;
  document.getElementById("total-deaths").textContent=
    Object.values(games).reduce((sum,g)=>sum+
      Object.values(load(g,{})).reduce((a,b)=>a+b.deaths,0),0);
}

document.getElementById("back-btn").onclick=()=>{
  document.body.style.opacity=0;
  setTimeout(()=>location.href="index.html",400);
};




































