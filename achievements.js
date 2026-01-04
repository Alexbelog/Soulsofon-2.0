// Soulsofon Achievements (RU, Steam/Souls vibe)
// Works on BOTH pages:
// - achievements.html: renders the grid + manual buttons + boss bindings
// - stats.html: provides auto-unlock checks + boss-bound quick chips

(() => {
  const ACH_DONE_STORE = "soulsofon_ach_done";
  const PROGRESS_STORE = "soulsofon_progress";
  const GAME_EXTRA_STORE = "soulsofon_game_extra_deaths";
  const BIND_STORE = "soulsofon_ach_bind";

  const GAMES = [
    { id: "ds1", title: "Dark Souls" },
    { id: "ds2", title: "Dark Souls II" },
    { id: "ds3", title: "Dark Souls III" },
    { id: "bloodborne", title: "Bloodborne" },
    { id: "sekiro", title: "Sekiro" },
    { id: "elden", title: "Elden Ring" },
  ];

  // --- helpers: storage ---
  function loadJSON(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function saveJSON(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }
  function loadDone(){ return loadJSON(ACH_DONE_STORE, {}); }
  function saveDone(done){ saveJSON(ACH_DONE_STORE, done); }

  function loadProgress(){ return loadJSON(PROGRESS_STORE, {}); }
  function loadExtra(){ return loadJSON(GAME_EXTRA_STORE, {}); }
  function loadBinds(){ return loadJSON(BIND_STORE, {}); }
  function saveBinds(b){ saveJSON(BIND_STORE, b); }

  function sumExtra(extra){
    return Object.values(extra || {}).reduce((s,v)=> s + (Number(v)||0), 0);
  }

  // --- progress totals ---
  function getTotals(progress, extra){
    let totalBossDeaths = 0;
    let killed = 0;
    let flawless = 0;
    let rankS = 0;

    const killedByGame = {};
    const deathsByGameBoss = {};
    const any = { oneGame100:false };

    Object.entries(progress || {}).forEach(([gid, game]) => {
      if (!game) return;
      let gameBossCount = 0;
      let gameKilled = 0;
      let gameDeaths = 0;

      Object.values(game).forEach(b => {
        totalBossDeaths += Number(b.deaths || 0);
        gameDeaths += Number(b.deaths || 0);
        gameBossCount++;
        if (b.killed) {
          killed++;
          gameKilled++;
          if (Number(b.deaths || 0) === 0) flawless++;
        }
        if ((b.rank || "-") === "S") rankS++;
      });

      killedByGame[gid] = gameKilled;
      deathsByGameBoss[gid] = gameDeaths;
      if (gameBossCount && gameKilled === gameBossCount) any.oneGame100 = true;
    });

    const manualAll = sumExtra(extra);
    const deaths = totalBossDeaths + manualAll;

    const deathsByGame = {};
    Object.values(GAMES).forEach(g => {
      const boss = deathsByGameBoss[g.id] || 0;
      const manual = Number(extra?.[g.id] || 0);
      deathsByGame[g.id] = boss + manual;
    });

    return { deaths, killed, flawless, rankS, oneGame100:any.oneGame100, killedByGame, deathsByGame };
  }

  function isBossKilled(progress, gameId, bossId){
    const b = progress?.[gameId]?.[bossId];
    return !!b?.killed;
  }
  function bossDeaths(progress, gameId, bossId){
    return Number(progress?.[gameId]?.[bossId]?.deaths || 0);
  }

  // --- Achievements list (RU, Souls/Steam tone) ---
  // icon can be emoji or single rune-ish char; kept simple for compatibility.
  const ACH = [
    // Marathon deaths
    { id:"die_10",   icon:"☠", name:"ПЕПЕЛ НА САПОГАХ", desc:"Умереть 10 раз за марафон.",  kind:"auto", check:({deaths})=>deaths>=10 },
    { id:"die_100",  icon:"☠", name:"ТЫ ПОГИБ x100",   desc:"Умереть 100 раз за марафон.", kind:"auto", check:({deaths})=>deaths>=100 },
    { id:"die_300",  icon:"☠", name:"ПЕПЕЛЬНЫЙ",       desc:"Умереть 300 раз за марафон.", kind:"auto", check:({deaths})=>deaths>=300 },
    { id:"die_666",  icon:"☠", name:"ПРОКЛЯТИЕ",       desc:"Умереть 666 раз. Даже не спрашивай.", kind:"auto", check:({deaths})=>deaths>=666 },

    // Kills / ranks
    { id:"first_boss", icon:"⚔", name:"ПЕРВАЯ КРОВЬ", desc:"Убить первого босса в марафоне.", kind:"auto", check:({killed})=>killed>=1 },
    { id:"ten_bosses", icon:"⚔", name:"ОХОТНИК НА БОССОВ", desc:"Убить 10 боссов за марафон.", kind:"auto", check:({killed})=>killed>=10 },
    { id:"fifty_bosses", icon:"⚔", name:"ПАЛАЧ", desc:"Убить 50 боссов за марафон.", kind:"auto", check:({killed})=>killed>=50 },
    { id:"clean_sweep", icon:"🏆", name:"ЗАЧИСТКА", desc:"Закрыть 100% боссов в одной игре.", kind:"auto", check:({oneGame100})=>!!oneGame100 },
    { id:"flawless_1", icon:"✦", name:"БЕЗ ЕДИНОЙ СМЕРТИ", desc:"Убить босса с 0 смертей на нём.", kind:"auto", check:({flawless})=>flawless>=1 },
    { id:"flawless_10", icon:"✦", name:"НЕПРИКАСАЕМЫЙ", desc:"Убить 10 боссов без смертей на них.", kind:"auto", check:({flawless})=>flawless>=10 },
    { id:"rank_s", icon:"S", name:"РАНГ «S»", desc:"Поставить хотя бы одному боссу ранг S.", kind:"auto", check:({rankS})=>rankS>=1 },

    // Manual - marathon flavor
    { id:"no_roll", icon:"🜂", name:"НИ ШАГУ В СТОРОНУ", desc:"Победить босса без перекатов.", kind:"manual" },
    { id:"blind_boss", icon:"👁", name:"СЛЕПАЯ ВЕРА", desc:"Убить босса «вслепую» (не зная мувсет).", kind:"manual" },
    { id:"no_heal", icon:"🩸", name:"БЕЗ ИСЦЕЛЕНИЯ", desc:"Победить босса без лечения.", kind:"manual" },
    { id:"parry_god", icon:"⟡", name:"БОГ ПАРИРОВАНИЯ", desc:"Завершить бой с боссом, парируя хотя бы 3 раза. (Отметь вручную)", kind:"manual" },
    { id:"clutch", icon:"✠", name:"НА ОДНОМ ДЫХАНИИ", desc:"Убить босса на последнем хп. (Отметь вручную)", kind:"manual" },

    // Manual, bindable to a specific boss (shows on boss row as a chip)
    { id:"no_roll_boss", icon:"🜂", name:"БЕЗ ПЕРЕКАТОВ (БОСС)", desc:"Убить конкретного босса без перекатов.", kind:"manual", bindable:true },
    { id:"no_hit_boss", icon:"✶", name:"NO-HIT (БОСС)", desc:"Убить конкретного босса без получения урона.", kind:"manual", bindable:true },
    { id:"fists_only", icon:"✦", name:"КУЛАКИ", desc:"Убить конкретного босса только кулаками/без оружия. (Если возможно)", kind:"manual", bindable:true },

    // Game-unique (auto by boss kills)
    { id:"ds1_bells", icon:"🔔", name:"КОЛОКОЛА ПРОБУЖДЕНИЯ", desc:"DS1: победить Гаргулий и Квиллаг.", kind:"auto", check:(_,p)=>isBossKilled(p,"ds1","bell_gargoyles") && isBossKilled(p,"ds1","chaos_witch_quelaag") },
    { id:"ds1_lords", icon:"👑", name:"ЛОРДЫ ПЕПЛА", desc:"DS1: победить Нито, Сит, Четырёх Королей и Изалит.", kind:"auto", check:(_,p)=>["gravelord_nito","seath_the_scaleless","four_kings","bed_of_chaos"].every(id=>isBossKilled(p,"ds1",id)) },
    { id:"ds1_legend", icon:"⚜", name:"ЛЕГЕНДА ЛОРАНА", desc:"DS1: победить Орнштейна и Смоуга.", kind:"auto", check:(_,p)=>isBossKilled(p,"ds1","ornstein_and_smough") },

    { id:"ds2_scholar", icon:"📜", name:"УЧЁНЫЙ СМЕРТИ", desc:"DS2: победить «Смотрителя и Защитника» и «Нашандру».", kind:"auto", check:(_,p)=>isBossKilled(p,"ds2","throne_watcher_and_defender") && isBossKilled(p,"ds2","nashandra") },
    { id:"ds2_sinner", icon:"⛓", name:"ПЕРВОРОДНЫЙ ГРЕХ", desc:"DS2: победить Погибельного Грешника.", kind:"auto", check:(_,p)=>isBossKilled(p,"ds2","lost_sinner") },

    { id:"ds3_cinders", icon:"🔥", name:"ПЕПЕЛ ПЕПЛА", desc:"DS3: победить Повелителей Пепла.", kind:"auto", check:(_,p)=>["abyss_watchers","aldrich_devourer_of_gods","yhorm_the_giant","lothric_younger_prince"].every(id=>isBossKilled(p,"ds3",id)) },
    { id:"ds3_dancer", icon:"🩰", name:"ТАНЕЦ КЛИНКОВ", desc:"DS3: победить Танцовщицу Холодной Долины.", kind:"auto", check:(_,p)=>isBossKilled(p,"ds3","dancer_of_the_boreal_valley") },

    { id:"bb_hunt", icon:"🩸", name:"НАЧАЛО ОХОТЫ", desc:"BB: победить Отца Гаскойна.", kind:"auto", check:(_,p)=>isBossKilled(p,"bloodborne","father_gascoigne") },
    { id:"bb_oldblood", icon:"🜁", name:"СТАРАЯ КРОВЬ", desc:"BB: победить Викара Амелию.", kind:"auto", check:(_,p)=>isBossKilled(p,"bloodborne","vicar_amelia") },

    { id:"sekiro_gourd", icon:"🍂", name:"УЧЕНИК ВОЛКА", desc:"Sekiro: победить Гэнитиро.", kind:"auto", check:(_,p)=>isBossKilled(p,"sekiro","genichiro_ashina") },
    { id:"sekiro_saint", icon:"⚔", name:"СВЯТОЙ МЕЧА", desc:"Sekiro: победить Иссина, Святого Меча.", kind:"auto", check:(_,p)=>isBossKilled(p,"sekiro","isshin_sword_saint") },

    { id:"elden_margit", icon:"🜃", name:"ПЕРВЫЙ ЗНАК", desc:"Elden Ring: победить Маргита.", kind:"auto", check:(_,p)=>isBossKilled(p,"elden","margit_the_fell_omen") },
    { id:"elden_malenia", icon:"🌸", name:"НЕЗНАЮЩАЯ ПОРАЖЕНИЙ", desc:"Elden Ring: победить Малению.", kind:"auto", check:(_,p)=>isBossKilled(p,"elden","malenia_blade_of_miquella") },

    // Funny / challenge autos
    { id:"deathless_ds1", icon:"✦", name:"ЧИСТЫЙ ПРОХОД", desc:"DS1: завершить игру с 0 смертей на боссах. (Очень условно)", kind:"auto",
      check:(t)=> (t.deathsByGame?.ds1 || 0) === 0 && (t.killedByGame?.ds1 || 0) > 0 },
  ];

  // Short label for chips
  const CHIP_SHORT = {
    no_roll_boss: "без перекатов",
    no_hit_boss: "no-hit",
    fists_only: "кулаки",
  };

  // --- unlocking / notify ---
  function markDone(id, silent=false){
    const done = loadDone();
    if (done[id]) return false;
    done[id] = true;
    saveDone(done);

    const a = ACH.find(x=>x.id===id);
    if (!silent && a){
      window.SoulUI?.toastUnlock?.(a.name, a.desc, a.icon || "✦");
    }
    return true;
  }

  function checkAndNotify(){
    const done = loadDone();
    const progress = loadProgress();
    const extra = loadExtra();
    const totals = getTotals(progress, extra);

    let changed = false;
    ACH.forEach(a => {
      if (a.kind !== "auto") return;
      if (done[a.id]) return;
      let ok = false;
      try { ok = !!a.check(totals, progress, extra); } catch { ok = false; }
      if (ok){
        done[a.id] = true;
        changed = true;
        window.SoulUI?.toastUnlock?.(a.name, a.desc, a.icon || "✦");
      }
    });

    if (changed) saveDone(done);

    // update achievements summary if present
    try {
      const el = document.getElementById("ach-summary-value");
      if (el) {
        const done2 = loadDone();
        const c = ACH.reduce((acc,a)=> acc + (done2[a.id] ? 1 : 0), 0);
        el.textContent = `${c} / ${ACH.length}`;
      }
    } catch {}
  }

  // --- bindings ---
  function setBind(achId, gameId, bossId){
    const b = loadBinds();
    b[achId] = { gameId, bossId };
    saveBinds(b);
  }
  function clearBind(achId){
    const b = loadBinds();
    delete b[achId];
    saveBinds(b);
  }
  function getBoundForBoss(gameId, bossId){
    const b = loadBinds();
    const done = loadDone();
    return ACH
      .filter(a => a.bindable)
      .filter(a => {
        const bb = b[a.id];
        return bb && bb.gameId === gameId && bb.bossId === bossId && !done[a.id];
      })
      .map(a => ({
        id: a.id,
        icon: a.icon || "✦",
        name: a.name,
        short: CHIP_SHORT[a.id] || "achievement",
      }));
  }

  // --- achievements page render ---
  async function loadGameBosses(gameId){
    // Try to fetch the canonical JSON from /data
    // (We use file names from the project structure)
    const map = {
      ds1: "data/ds1.json",
      ds2: "data/ds2.json",
      ds3: "data/ds3.json",
      bloodborne: "data/bloodborne.json",
      sekiro: "data/sekiro.json",
      elden: "data/elden_ring.json",
    };
    const file = map[gameId];
    if (!file) return [];
    const res = await fetch(file);
    const json = await res.json();
    const bosses = [];
    (json.sections || []).forEach(sec => (sec.bosses || []).forEach(b => bosses.push({ id:b.id, name:b.name })));
    return bosses;
  }

  function progressText(a, totals){
    // simple hints for auto achievements
    if (a.kind !== "auto") return "";
    if (a.id.startsWith("die_")){
      const need = Number(a.id.split("_")[1]);
      return `${Math.min(totals.deaths, need)} / ${need}`;
    }
    if (a.id === "first_boss") return `${Math.min(totals.killed,1)} / 1`;
    if (a.id === "ten_bosses") return `${Math.min(totals.killed,10)} / 10`;
    if (a.id === "fifty_bosses") return `${Math.min(totals.killed,50)} / 50`;
    return "Auto";
  }

  async function renderPage(){
    const grid = document.getElementById("ach-grid");
    if (!grid) return; // not on achievements page

    checkAndNotify();

    const progress = loadProgress();
    const extra = loadExtra();
    const totals = getTotals(progress, extra);

    const done = loadDone();
    const binds = loadBinds();

    grid.innerHTML = "";

    let completed = 0;

    // Preload bosses per game lazily for bindings
    const bossCache = {};
    async function ensureBosses(gameId){
      if (bossCache[gameId]) return bossCache[gameId];
      bossCache[gameId] = await loadGameBosses(gameId);
      return bossCache[gameId];
    }

    for (const a of ACH){
      const autoOk = a.kind === "auto" ? !!a.check(totals, progress, extra) : false;
      const isDone = !!done[a.id] || autoOk;

      const card = document.createElement("div");
      card.className = "ach-card" + (isDone ? " done" : "");

      const icon = document.createElement("div");
      icon.className = "ach-icon";
      icon.textContent = a.icon || "✦";

      const main = document.createElement("div");
      main.className = "ach-main";

      const top = document.createElement("div");
      top.className = "ach-top";

      const name = document.createElement("div");
      name.className = "ach-name";
      name.textContent = a.name;

      const tag = document.createElement("div");
      tag.className = "ach-tag";
      tag.textContent = (a.kind === "auto") ? "AUTO" : (a.bindable ? "MANUAL • BOSS" : "MANUAL");

      top.append(name, tag);

      const desc = document.createElement("div");
      desc.className = "ach-desc";
      desc.textContent = a.desc;

      const bar = document.createElement("div");
      bar.className = "ach-bar";
      bar.textContent = progressText(a, totals);

      main.append(top, desc, bar);

      const actions = document.createElement("div");
      actions.className = "ach-actions";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ach-btn";
      btn.textContent = isDone ? "ВЫПОЛНЕНО ✓" : "ОТМЕТИТЬ";
      btn.disabled = a.kind === "auto" ? true : false;

      if (a.kind === "manual"){
        btn.onclick = () => {
          if (done[a.id]) return;
          markDone(a.id, false);
          renderPage();
        };
      }

      actions.appendChild(btn);

      // Binding controls
      if (a.bindable){
        const bindWrap = document.createElement("div");
        bindWrap.className = "ach-bind";

        const gameSel = document.createElement("select");
        gameSel.className = "ach-select";
        gameSel.innerHTML = `<option value="">Выбрать игру…</option>` + GAMES.map(g => `<option value="${g.id}">${g.title}</option>`).join("");

        const bossSel = document.createElement("select");
        bossSel.className = "ach-select";
        bossSel.innerHTML = `<option value="">Выбрать босса…</option>`;

        const cur = binds[a.id];
        if (cur?.gameId) gameSel.value = cur.gameId;

        async function refreshBosses(){
          const gid = gameSel.value;
          if (!gid){
            bossSel.innerHTML = `<option value="">Выбрать босса…</option>`;
            return;
          }
          const bosses = await ensureBosses(gid);
          bossSel.innerHTML = `<option value="">Выбрать босса…</option>` + bosses.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
          if (cur?.gameId === gid && cur?.bossId) bossSel.value = cur.bossId;
        }

        gameSel.addEventListener("change", async () => {
          bossSel.value = "";
          await refreshBosses();
          if (!gameSel.value){
            clearBind(a.id);
          }
        });

        bossSel.addEventListener("change", () => {
          if (gameSel.value && bossSel.value){
            setBind(a.id, gameSel.value, bossSel.value);
            window.SoulUI?.playClick?.();
          }
        });

        await refreshBosses();

        bindWrap.append(gameSel, bossSel);
        actions.appendChild(bindWrap);
      }

      card.append(icon, main, actions);
      grid.appendChild(card);

      if (isDone) completed++;
    }

    const summary = document.getElementById("ach-summary-value");
    if (summary) summary.textContent = `${completed} / ${ACH.length}`;
  }

  // --- Export API for stats page ---
  window.SoulsofonAchievements = {
    list: () => ACH.slice(),
    checkAndNotify,
    markDone,
    getBoundForBoss,
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Auto check everywhere
    checkAndNotify();
    // Render only on achievements page
    renderPage();
  });
})();
