// Soulsfon 2.0 Achievements
// Names: EN (Steam/Souls vibe) | Descriptions: RU
(() => {
  const STORE_DONE = "soulsofon_ach_done";
  const STORE_PROGRESS = "soulsofon_progress";
  const STORE_EXTRA = "soulsofon_game_extra_deaths";

  const GAMES = [
    { id:"ds1", title:"Dark Souls", icon:"images/game_icons/ds1.png" },
    { id:"ds2", title:"Dark Souls II", icon:"images/game_icons/ds2.png" },
    { id:"ds3", title:"Dark Souls III", icon:"images/game_icons/ds3.png" },
    { id:"bloodborne", title:"Bloodborne", icon:"images/game_icons/bloodborne.png" },
    { id:"sekiro", title:"Sekiro", icon:"images/game_icons/sekiro.png" },
    { id:"elden", title:"Elden Ring", icon:"images/game_icons/elden.png" },
  ];

  const ACH = [
    // --- Marathon ---
    { id:"marathon_start",  img:"images/achievements/marathon_start.png",  name:"THE MARATHON", desc:"Начать марафон. Первый босс пал — пути назад нет.", kind:"auto",
      check:({kills}) => kills >= 1 },
    { id:"die_100",         img:"images/achievements/die_100.png",         name:"YOU DIED x100", desc:"Умереть 100 раз за весь марафон.", kind:"auto",
      check:({deaths}) => deaths >= 100 },
    { id:"die_300",         img:"images/achievements/die_300.png",         name:"ASHEN ONE", desc:"Умереть 300 раз за весь марафон.", kind:"auto",
      check:({deaths}) => deaths >= 300 },
    { id:"die_666",         img:"images/achievements/die_666.png",         name:"CURSED", desc:"Умереть 666 раз за весь марафон.", kind:"auto",
      check:({deaths}) => deaths >= 666 },
    { id:"die_1000",        img:"images/achievements/die_1000.png",        name:"ENDLESS", desc:"Умереть 1000 раз за весь марафон.", kind:"auto",
      check:({deaths}) => deaths >= 1000 },
    { id:"ten_bosses",      img:"images/achievements/ten_bosses.png",      name:"BOSS HUNTER", desc:"Убить 10 боссов в марафоне.", kind:"auto",
      check:({kills}) => kills >= 10 },
    { id:"kills_25",        img:"images/achievements/kills_25.png",        name:"BOSS SLAYER", desc:"Убить 25 боссов за весь марафон.", kind:"auto",
      check:({kills}) => kills >= 25 },
    { id:"kills_50",        img:"images/achievements/kills_50.png",        name:"BOSS REAPER", desc:"Убить 50 боссов за весь марафон.", kind:"auto",
      check:({kills}) => kills >= 50 },
    { id:"kills_100",       img:"images/achievements/kills_100.png",       name:"HUNDREDFOLD", desc:"Убить 100 боссов за весь марафон.", kind:"auto",
      check:({kills}) => kills >= 100 },
    { id:"kills_150",       img:"images/achievements/kills_150.png",       name:"RECKONER", desc:"Убить 150 боссов за весь марафон.", kind:"auto",
      check:({kills}) => kills >= 150 },
    { id:"kills_200",       img:"images/achievements/kills_200.png",       name:"LEGEND", desc:"Убить 200 боссов за весь марафон.", kind:"auto",
      check:({kills}) => kills >= 200 },
    { id:"kills_all",       img:"images/achievements/kills_all.png",       name:"ABSOLUTE", desc:"Убить всех боссов марафона (полная зачистка).", kind:"auto",
      check:({kills}) => kills >= 229 },
    { id:"first_try",      img:"images/achievements/first_try.png",      name:"FIRST TRY", desc:"Победить любого босса с первой попытки.", kind:"auto",
      check:({hasFirstTry}) => !!hasFirstTry },
    { id:"no_death_boss",  img:"images/achievements/no_death_boss.png",  name:"UNTOUCHED", desc:"Победить любого босса без смертей на нём (Deaths = 0).", kind:"auto",
      check:({hasNoDeathBoss}) => !!hasNoDeathBoss },
    { id:"marathon_finish", img:"images/achievements/marathon_finish.png", name:"THE END", desc:"Дойти до финала марафона. Последняя искра погасла.", kind:"manual" },

    // --- Challenges (manual) ---
    { id:"blind_faith",     img:"images/achievements/blind_faith.png",     name:"BLIND FAITH", desc:"Убить босса «вслепую» (без просмотра гайдов/инфы заранее).", kind:"manual" },
    { id:"no_roll",         img:"images/achievements/no_roll.png",         name:"NO ROLL", desc:"Убить босса без перекатов (в рамках одной попытки).", kind:"manual" },
    { id:"no_estus",        img:"images/achievements/no_estus.png",        name:"NO HEAL", desc:"Убить босса без лечения (эстус/фляги/хилы).", kind:"manual" },
    { id:"challenge_no_summon", img:"images/achievements/challenge_no_summon.png", name:"NO SUMMON", desc:"Убить босса без призывов (NPC/духи/кооп).", kind:"manual" },
    { id:"challenge_no_hit", img:"images/achievements/challenge_no_hit.png", name:"NO HIT", desc:"Убить босса без получения урона.", kind:"manual" },
    { id:"challenge_rl1",   img:"images/achievements/challenge_rl1.png",   name:"LEVEL ONE", desc:"Победить босса на минимальном уровне (RL1/SL1/BL4 — по игре).", kind:"manual" },

    // --- Dark Souls ---
    { id:"ds1_bells",       img:"images/achievements/ds1_bells.png",       name:"RING THE BELLS", desc:"Dark Souls: пробудить зов колоколов (два колокола).", kind:"manual" },
    { id:"ds1_solaire",     img:"images/achievements/ds1_solaire.png",     name:"PRAISE THE SUN", desc:"Dark Souls: ритуально воздать славу солнцу в честь победы.", kind:"manual" },
    { id:"ds1_all",         img:"images/achievements/ds1_all.png",         name:"LORDRAN CLEARED", desc:"Dark Souls: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.ds1||0) >= 26 },
    { id:"ds2_curse",       img:"images/achievements/ds2_curse.png",       name:"BEARER OF THE CURSE", desc:"Dark Souls II: продолжить путь, несмотря на проклятие.", kind:"manual" },
    { id:"ds2_adp",         img:"images/achievements/ds2_adp.png",         name:"ADP BELIEVER", desc:"Dark Souls II: победить сложного босса «без сейв-скама» и отговорок.", kind:"manual" },
    
    { id:"ds2_all",         img:"images/achievements/ds2_all.png",         name:"DRANGLEIC CLEARED", desc:"Dark Souls II: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.ds2||0) >= 41 },

    { id:"ds3_cinder",      img:"images/achievements/ds3_cinder.png",      name:"LORD OF CINDER", desc:"Dark Souls III: одолеть повелителей пепла и довести дело до конца.", kind:"manual" },
    { id:"ds3_dancer",      img:"images/achievements/ds3_dancer.png",      name:"DANCER DOWN", desc:"Dark Souls III: победить босса, который «ломает ритм».", kind:"manual" },
    
    { id:"ds3_all",         img:"images/achievements/ds3_all.png",         name:"LOTHRIC CLEARED", desc:"Dark Souls III: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.ds3||0) >= 25 },

    // --- Bloodborne ---
    { id:"bb_pale",         img:"images/achievements/bb_pale.png",         name:"PALEBLOOD HUNT", desc:"Bloodborne: начать охоту за бледной кровью.", kind:"manual" },
    { id:"bb_visceral",     img:"images/achievements/bb_visceral.png",     name:"VISCERAL", desc:"Bloodborne: добить босса висцеральной атакой.", kind:"manual" },
    { id:"bb_all",          img:"images/achievements/bb_all.png",          name:"THE HUNT ENDS", desc:"Bloodborne: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.bloodborne||0) >= 22 },

    // --- Sekiro ---
    { id:"sek_shinobi",     img:"images/achievements/sek_shinobi.png",     name:"SHINOBI", desc:"Sekiro: пройти бой, полагаясь на стойкость и клинки.", kind:"manual" },
    { id:"sek_parry",       img:"images/achievements/sek_parry.png",       name:"DEFLECT MASTER", desc:"Sekiro: победить босса, делая упор на отражения (дефлекты).", kind:"manual" },
    { id:"sek_all",         img:"images/achievements/sek_all.png",         name:"ASHINA CLEARED", desc:"Sekiro: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.sekiro||0) >= 44 },

    // --- Elden Ring ---
    { id:"er_tarnished",    img:"images/achievements/er_tarnished.png",    name:"TARNISHED", desc:"Elden Ring: стать Междуземцем и сделать первый шаг.", kind:"auto",
      check:({gameKills}) => (gameKills.elden||0) >= 1 },
    { id:"er_dragon",       img:"images/achievements/er_dragon.png",       name:"DRAGONSLAYER", desc:"Elden Ring: победить дракона.", kind:"manual" },
    { id:"er_runebear",     img:"images/achievements/er_runebear.png",     name:"RUNE BEAR", desc:"Elden Ring: выжить и победить рунического медведя (без паники).", kind:"manual" },
    { id:"er_malenia",      img:"images/achievements/er_malenia.png",      name:"BLADE OF MIQUELLA", desc:"Elden Ring: победить Малению.", kind:"manual" },

    { id:"er_all",          img:"images/achievements/er_all.png",          name:"THE LANDS BETWEEN", desc:"Elden Ring: убить всех боссов из списка на сайте (включая DLC). Считается по отметкам «УБИТ» в Elden Ring.", kind:"auto",
      check:({gameKills}) => (gameKills.elden||0) >= 71 },

    // --- DLC ---
    { id:"dlc_shadow",      img:"images/achievements/dlc_shadow.png",      name:"SHADOW REALM", desc:"DLC: сделать первые шаги в Землях Тени.", kind:"auto",
      check:({dlcKills}) => dlcKills >= 1 },
    { id:"dlc_messmer",     img:"images/achievements/dlc_messmer.png",     name:"THE IMPALER", desc:"DLC: победить Мессмера.", kind:"manual" },
    { id:"dlc_bayle",       img:"images/achievements/dlc_bayle.png",       name:"BAYLE", desc:"DLC: победить Бэйла Ужасающего.", kind:"manual" },
    { id:"dlc_putrescent",  img:"images/achievements/dlc_putrescent.png",  name:"PUTRESCENCE", desc:"DLC: победить Putrescent Knight.", kind:"manual" },
    { id:"dlc_all",         img:"images/achievements/dlc_all.png",         name:"SHADOW CLEARED", desc:"DLC: убить всех боссов Земель Тени из списка на сайте.", kind:"auto",
      check:({dlcKills}) => dlcKills >= 42 },
  ];

  function loadJSON(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function saveJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

  function loadDone(){ return loadJSON(STORE_DONE, {}); }
  function saveDone(done){ saveJSON(STORE_DONE, done); }

  function computeStats(){
    const progress = loadJSON(STORE_PROGRESS, {});
    const extra = loadJSON(STORE_EXTRA, {});
    let deaths = 0;
    let kills = 0;
    const gameKills = {};
    let dlcKills = 0;
    let hasFirstTry = false;
    let hasNoDeathBoss = false;

    for (const [gid, gdata] of Object.entries(progress || {})){
      let gk = 0;
      for (const [bid, st] of Object.entries(gdata || {})){
        const d = Number(st?.deaths || 0);
        deaths += d;
        if (st?.killed) { kills += 1; gk += 1; }
        if (st?.killed && Number(st?.tries || 0) <= 1) hasFirstTry = true;
        if (st?.killed && Number(st?.deaths || 0) === 0) hasNoDeathBoss = true;
        // crude DLC detection for ER: boss ids prefixed "dlc_" in our datasets
        if (gid === "elden" && String(bid).startsWith("dlc_") && st?.killed) dlcKills += 1;
      }
      gameKills[gid] = gk;
    }
    // manual +/- deaths are stored per-game in extra
    for (const v of Object.values(extra || {})) deaths += Number(v || 0);

    return { deaths, kills, gameKills, dlcKills, hasFirstTry, hasNoDeathBoss };
  }

  function markDone(id){
    const done = loadDone();
    if (done[id]) return false;
    done[id] = { at: Date.now() };
    saveDone(done);
    return true;
  }

  function checkAuto(){
    const done = loadDone();
    const ctx = computeStats();
    for (const a of ACH){
      if (a.kind !== "auto" || typeof a.check !== "function") continue;
      if (done[a.id]) continue;
      if (a.check(ctx)){
        if (markDone(a.id)){
          try { window.SoulUI?.toast?.("Achievement unlocked", a.name, a.img); } catch {}
        }
      }
    }
  }

  function render(){
    const host = document.getElementById("ach-list");
    if (!host) return;

    host.innerHTML = "";
    const done = loadDone();
    checkAuto(); // make sure UI is fresh

    const groups = [
      { title: "Марафон", ids: ACH.filter(a => a.id.startsWith("marathon_") || a.id.startsWith("die_") || a.id.startsWith("kills_") || a.id === "ten_bosses" || a.id === "first_try" || a.id === "no_death_boss").map(a=>a.id) },
      { title: "Испытания", ids: ACH.filter(a => a.id.startsWith("blind_") || a.id.startsWith("no_") || a.id.startsWith("challenge_")).map(a=>a.id) },
      { title: "Dark Souls", ids: ACH.filter(a => a.id.startsWith("ds1_") || a.id.startsWith("ds2_") || a.id.startsWith("ds3_")).map(a=>a.id) },
      { title: "Bloodborne", ids: ACH.filter(a => a.id.startsWith("bb_")).map(a=>a.id) },
      { title: "Sekiro", ids: ACH.filter(a => a.id.startsWith("sek_")).map(a=>a.id) },
      { title: "Elden Ring", ids: ACH.filter(a => a.id.startsWith("er_")).map(a=>a.id) },
      { title: "Shadow of the Erdtree", ids: ACH.filter(a => a.id.startsWith("dlc_")).map(a=>a.id) },
    ];

    const byId = Object.fromEntries(ACH.map(a => [a.id, a]));
    for (const g of groups){
      const sec = document.createElement("section");
      sec.className = "ach-section";
      const h = document.createElement("h2");
      h.className = "ach-section-title";
      h.textContent = g.title;
      sec.appendChild(h);

      const list = document.createElement("div");
      list.className = "ach-grid";

      for (const id of g.ids){
        const a = byId[id];
        if (!a) continue;
        const isDone = !!done[id];

        const card = document.createElement("div");
        card.className = "ach-card" + (isDone ? " done" : "");

        const img = document.createElement("img");
        img.className = "ach-icon";
        img.alt = "";
        img.src = a.img;

        const main = document.createElement("div");
        main.className = "ach-main";

        const name = document.createElement("div");
        name.className = "ach-name";
        name.textContent = a.name;

        const desc = document.createElement("div");
        desc.className = "ach-desc";
        desc.textContent = a.desc;

        main.append(name, desc);

        const actions = document.createElement("div");
        actions.className = "ach-actions";

        if (a.kind === "manual"){
          const btn = document.createElement("button");
          btn.className = "btn ach-btn";
          btn.type = "button";
          btn.textContent = isDone ? "Выполнено ✓" : "Выполнено";
          if (!window.SoulAuth?.isAdmin?.()) btn.disabled = true;
          btn.onclick = () => {
            if (!window.SoulAuth?.isAdmin?.()) return;
            if (markDone(a.id)){
              try { window.SoulUI?.toast?.("Achievement unlocked", a.name, a.img); } catch {}
              render();
            }
          };
          actions.appendChild(btn);
        } else {
          const badge = document.createElement("div");
          badge.className = "ach-badge";
          badge.textContent = isDone ? "Открыто" : "Скрыто";
          actions.appendChild(badge);
        }

        card.append(img, main, actions);
        list.appendChild(card);
      }

      sec.appendChild(list);
      host.appendChild(sec);
    }
  }

  window.SoulAchievements = {
    list: () => ACH.slice(),
    checkAuto,
    markDone,
    render,
  };

  document.addEventListener("DOMContentLoaded", () => {
    checkAuto();
    render();
  });
})();
