// SOULSFON 2026 Achievements
// Names: EN (Steam/Souls vibe) | Descriptions: RU
(() => {
  const STORE_DONE = "soulsofon_ach_done";
  const STORE_PROGRESS = "soulsfon_progress";
  const STORE_EXTRA = "soulsofon_game_extra_deaths";

  const CLOUD_TOKEN_KEY = "soulsfon_progress_cloud_token";
  function getCloudApiBase(){
    return (window.SOUL_CLOUD && window.SOUL_CLOUD.apiBase) ? String(window.SOUL_CLOUD.apiBase).trim() : "";
  }
  function getCloudEndpoint(){
    const base = getCloudApiBase();
    if (!base || base.includes("REPLACE_WITH")) return "";
    return base.replace(/\/$/,"") + "/api/progress";
  }
  async function cloudGetProgress(){
    const url = getCloudEndpoint();
    if (!url) return null;
    try {
      const r = await fetch(url, { method:"GET", cache:"no-store" });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }

  async function cloudPutProgress(payload){
    const endpoint = getCloudEndpoint();
    if (!endpoint) return false;
    const token = (localStorage.getItem(CLOUD_TOKEN_KEY) || "").trim();
    if (!token) return false;
    try{
      const r = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });
      return r.ok;
    }catch{ return false; }
  }

  function buildCloudPayloadFromLocal(){
    const progress = loadJSON(STORE_PROGRESS, {});
    const extraDeaths = loadJSON(STORE_EXTRA, null);
    const achDone = loadJSON(STORE_DONE, {});
    return { v: 1, progress, extraDeaths, achDone };
  }

  let _clipPushTimer = null;
  function scheduleClipCloudPush(){
    if (_clipPushTimer) clearTimeout(_clipPushTimer);
    _clipPushTimer = setTimeout(async () => {
      if (!window.SoulAuth?.isAdmin?.()) return;
      await cloudPutProgress(buildCloudPayloadFromLocal());
    }, 1200);
  }


  function parseCloudPayload(data){
    if (data && typeof data === "object" && data.progress) return data;
    return { v: 0, progress: (data || {}), extraDeaths: null, achDone: null };
  }


  const PUBLIC_PROGRESS_URL = "public_progress.json";
  async function loadPublicProgress(){
    try{
      const r = await fetch(PUBLIC_PROGRESS_URL, { cache: "no-store" });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }

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

    { id:"marathon_start", img:"images/achievements/marathon_start.png", name:"THE MARATHON",
      desc:"Начать марафон. Первый босс пал — пути назад нет.", kind:"auto",
      check:({kills}) => kills >= 1 },

    { id:"marathon_three_realms", img:"images/achievements/marathon_start.png", name:"TRIPLE REALM",
      desc:"Победить минимум по 5 боссов в трёх разных играх марафона.", kind:"auto",
      check:(ctx) => {
        const games = ["ds1","ds2","ds3","bb","sek","er"];
        let n = 0;
        for (const g of games){ if ((ctx.gameKills?.[g] || 0) >= 5) n++; }
        return n >= 3;
      }},

    { id:"marathon_consistent", img:"images/achievements/marathon_finish.png", name:"CONSISTENT RUNNER",
      desc:"Победить минимум по 10 боссов в четырёх разных играх марафона.", kind:"auto",
      check:(ctx) => {
        const games = ["ds1","ds2","ds3","bb","sek","er"];
        let n = 0;
        for (const g of games){ if ((ctx.gameKills?.[g] || 0) >= 10) n++; }
        return n >= 4;
      }},

    { id:"marathon_comeback", img:"images/achievements/die_300.png", name:"COMEBACK KID",
      desc:"Умереть 50+ раз за марафон и всё равно добить 60+ боссов. Это и есть сила воли.", kind:"auto",
      check:({deaths, kills}) => deaths >= 50 && kills >= 60 },

    { id:"marathon_clip_archivist", img:"images/achievements/first_try.png", name:"CLIP ARCHIVIST",
      desc:"Прикрепить Twitch-клип к 10 достижениям. Пусть останутся доказательства эпохи Soulsfon 2026.", kind:"auto",
      check:() => {
        const done = loadDone();
        let c = 0;
        for (const k in done){ if (done[k]?.clip) c++; }
        return c >= 10;
      }},


    { id:"marathon_tries_10",  img:"images/achievements/ten_bosses.png",  name:"TEN TRIES LATER", desc:"Потратить 10 попыток на одного босса.", kind:"auto",
      check:({maxTries}) => maxTries >= 10 },
    { id:"marathon_tries_30",  img:"images/achievements/kills_25.png",    name:"THIRTY TRIES OF WILL", desc:"Потратить 30 попыток на одного босса.", kind:"auto",
      check:({maxTries}) => maxTries >= 30 },
    { id:"marathon_tries_60",  img:"images/achievements/kills_50.png",    name:"SIXTY TIMES BROKEN", desc:"Потратить 60 попыток на одного босса.", kind:"auto",
      check:({maxTries}) => maxTries >= 60 },
    { id:"marathon_tries_100", img:"images/achievements/die_100.png",     name:"HUNDREDFOLD SUFFERING", desc:"Потратить 100 попыток на одного босса.", kind:"auto",
      check:({maxTries}) => maxTries >= 100 },
    { id:"marathon_no_death_5",img:"images/achievements/no_death_boss.png", name:"MARATHON NO DEATH", desc:"Победить 5 боссов без смертей на них.", kind:"auto",
      check:({noDeathBossCount}) => noDeathBossCount >= 5 },
    { id:"marathon_blind_5",   img:"images/achievements/blind_faith.png", name:"BLIND EXECUTIONER", desc:"Убить 5 боссов «вслепую».", kind:"manual" },
    
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
    { id:"no_death_boss",  img:"images/achievements/no_death_boss.png",  name:"NO DEATH", desc:"Победить любого босса без смертей на нём.", kind:"auto",
      check:({hasNoDeathBoss}) => !!hasNoDeathBoss },
    
    { id:"marathon_day_one", img:"images/achievements/marathon_start.png", name:"DAY ONE",
      desc:"Марафон: провести первый полноценный стрим/сессию Soulsfon 2026. Отметь вручную.", kind:"manual" },

    { id:"marathon_hot_streak", img:"images/achievements/first_try.png", name:"HOT STREAK",
      desc:"Марафон: победить 3 боссов подряд без смертей между ними (серия). Отметь вручную.", kind:"manual" },

    { id:"marathon_redemption", img:"images/achievements/die_300.png", name:"REDEMPTION",
      desc:"Марафон: вернуться к боссу, который когда-то забрал 30+ попыток, и победить его. Отметь вручную.", kind:"manual" },

{ id:"marathon_finish", img:"images/achievements/marathon_finish.png", name:"THE END", desc:"Дойти до финала марафона. Последняя искра погасла.", kind:"manual" },

    // --- Challenges (manual) ---
    { id:"blind_faith",     img:"images/achievements/blind_faith.png",     name:"BLIND FAITH", desc:"Убить босса «вслепую».", kind:"manual" },
    { id:"no_roll",         img:"images/achievements/no_roll.png",         name:"NO ROLL", desc:"Убить босса без перекатов.", kind:"manual" },
    { id:"no_estus",        img:"images/achievements/no_estus.png",        name:"NO HEAL", desc:"Убить босса без лечения (эстус/фляги/хилы).", kind:"manual" },
    { id:"challenge_no_summon", img:"images/achievements/challenge_no_summon.png", name:"NO SUMMON", desc:"Не использовать призывы (NPC/духи/кооп) в течении всего марафона.", kind:"manual" },
    
    { id:"challenge_no_summons_run", img:"images/achievements/no_summons.png", name:"LONE WOLF",
      desc:"Испытания: пройти весь марафон без призывов (NPC/игроки). Отмечай вручную — честность обязательна.", kind:"manual" },

    { id:"challenge_no_shield_run", img:"images/achievements/no_shields.png", name:"NO SHIELD OATH",
      desc:"Испытания: отказаться от щитов на всём марафоне. Парирования и перекаты — всё, что есть.", kind:"manual" },

    { id:"challenge_no_heal_boss", img:"images/achievements/no_estus.png", name:"DRY FIGHT",
      desc:"Испытания: победить любого босса без лечения во время боя (фляги/травы/леч. предметы).", kind:"manual" },

    { id:"challenge_no_magic_boss", img:"images/achievements/challenge_rl1.png", name:"STEEL ONLY",
      desc:"Испытания: победить любого босса без магии/чудес/инкантаций и без баффов оружия.", kind:"manual" },

    { id:"challenge_naked_boss", img:"images/achievements/challenge_no_hit.png", name:"BARELY ARMORED",
      desc:"Испытания: победить любого босса в минимальной броне ("голый" сет) — только храбрость.", kind:"manual" },

    { id:"challenge_stream_proof", img:"images/achievements/challenge_no_hit.png", name:"RECEIPTS",
      desc:"Испытания: прикрепить Twitch-клип к 5 выполненным испытаниям. Доказательства > слова.", kind:"auto",
      check:() => {
        const done = loadDone();
        let c = 0;
        for (const k in done){
          if (k.startsWith("challenge_") && done[k]?.done && done[k]?.clip) c++;
        }
        return c >= 5;
      }},

{ id:"challenge_no_hit", img:"images/achievements/challenge_no_hit.png", name:"NO HIT", desc:"Убить босса без получения урона.", kind:"manual" },
    { id:"challenge_rl1",   img:"images/achievements/challenge_rl1.png",   name:"LEVEL ONE", desc:"Победить босса на минимальном уровне (RL1/SL1/BL4 — по игре).", kind:"manual" },

    { id:"challenge_the_wall", img:"images/achievements/challenge_no_hit.png", name:"THE WALL",
      desc:"Застрять на одном боссе: 20+ смертей на единственной схватке. Стена проверяет веру.", kind:"auto",
      check:({maxDeathsOnBoss}) => maxDeathsOnBoss >= 20 },

    { id:"challenge_flawless_ten", img:"images/achievements/no_death_boss.png", name:"FLAWLESS TEN",
      desc:"Победить 10 боссов без смертей на них. Не серия — коллекция чистых дуэлей.", kind:"auto",
      check:({noDeathBossCount}) => noDeathBossCount >= 10 },

    { id:"challenge_firsttry_ten", img:"images/achievements/one_shot.png", name:"ONE-SHOT ARTIST",
      desc:"Победить 10 боссов с первой попытки за весь марафон.", kind:"auto",
      check:(ctx) => {
        const v = ctx.gameFirstTryKills || {};
        let total = 0;
        for (const k in v) total += (v[k] || 0);
        return total >= 10;
      }},


    // --- Dark Souls ---

    { id:"ds1_kills_10",   img:"images/achievements/ds1_bells.png",   name:"EMBERED PILGRIM", desc:"Dark Souls: победить 10 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.ds1||0) >= 10 },
    { id:"ds1_kills_20",   img:"images/achievements/ds1_solaire.png", name:"LORDSOUL HUNTER", desc:"Dark Souls: победить 20 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.ds1||0) >= 20 },

    { id:"ds1_clean_hands", img:"images/achievements/ds1_solaire.png", name:"CLEAN HANDS", desc:"Dark Souls: победить 5 боссов без смертей на них.", kind:"auto",
      check:({gameNoDeathKills}) => (gameNoDeathKills.ds1||0) >= 5 },
    { id:"ds1_first_light", img:"images/achievements/ds1_bells.png",   name:"FIRST LIGHT", desc:"Dark Souls: победить 3 боссов с первой попытки.", kind:"auto",
      check:({gameFirstTryKills}) => (gameFirstTryKills.ds1||0) >= 3 },
    { id:"ds1_hollowed",    img:"images/achievements/die_100.png",      name:"HOLLOWED BUT STANDING", desc:"Dark Souls: умереть 50 раз.", kind:"auto",
      check:({gameDeaths}) => (gameDeaths.ds1||0) >= 50 },
    { id:"ds1_iron_patience",img:"images/achievements/kills_25.png",    name:"IRON PATIENCE", desc:"Dark Souls: потратить 30 попыток на одного босса.", kind:"auto",
      check:({gameMaxTries}) => (gameMaxTries.ds1||0) >= 30 },
    { id:"ds1_bells",       img:"images/achievements/ds1_bells.png",       name:"RING THE BELLS", desc:"Dark Souls: пробудить зов колоколов (два колокола).", kind:"manual" },
    { id:"ds1_solaire",     img:"images/achievements/ds1_solaire.png",     name:"PRAISE THE SUN", desc:"Dark Souls: ритуально воздать славу солнцу в честь победы.", kind:"manual" },
    
    
    { id:"ds1_ring_the_bells", img:"images/achievements/ds1_bells.png", name:"BELL RINGER",
      desc:"Dark Souls: прозвонить оба Колокола Пробуждения. Отметь вручную.", kind:"manual" },

    { id:"ds1_lordvessel", img:"images/achievements/ds1_bells.png", name:"LORDVESSEL BEARER",
      desc:"Dark Souls: получить Сосуд Лорда и открыть путь к великим душам. Отметь вручную.", kind:"manual" },

{ id:"ds1_one_and_done", img:"images/achievements/first_try.png", name:"ONE AND DONE",
      desc:"Dark Souls: победить 3 боссов с первой попытки.", kind:"auto",
      check:(ctx) => (ctx.gameFirstTryKills?.ds1 || 0) >= 3 },

    { id:"ds1_smooth_sailing", img:"images/achievements/ds1_bells.png", name:"SMOOTH SAILING",
      desc:"Dark Souls: победить 15 боссов, и при этом ни один не потребовал больше 10 попыток.", kind:"auto",
      check:(ctx) => (ctx.gameKills?.ds1 || 0) >= 15 && (ctx.gameMaxTries?.ds1 || 0) <= 10 },

{ id:"ds1_all",         img:"images/achievements/ds1_all.png",         name:"LORDRAN CLEARED", desc:"Dark Souls: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.ds1||0) >= 26 },
    { id:"ds2_curse",       img:"images/achievements/ds2_curse.png",       name:"BEARER OF THE CURSE", desc:"Dark Souls II: продолжить путь, несмотря на проклятие.", kind:"manual" },

    { id:"ds2_kills_10",   img:"images/achievements/ds2_curse.png", name:"DRANGLEIC WAYFARER", desc:"Dark Souls II: победить 10 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.ds2||0) >= 10 },
    { id:"ds2_kills_25",   img:"images/achievements/ds2_all.png",   name:"CROWN SEEKER", desc:"Dark Souls II: победить 25 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.ds2||0) >= 25 },
    { id:"ds2_kills_35",   img:"images/achievements/ds2_all.png",   name:"GIANT'S BANE", desc:"Dark Souls II: победить 35 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.ds2||0) >= 35 },

    { id:"ds2_clean_hands", img:"images/achievements/ds2_all.png",   name:"NO EXCUSES", desc:"Dark Souls II: победить 5 боссов без смертей на них.", kind:"auto",
      check:({gameNoDeathKills}) => (gameNoDeathKills.ds2||0) >= 5 },
    { id:"ds2_first_breath",img:"images/achievements/ds2_curse.png", name:"FIRST BREATH", desc:"Dark Souls II: победить 3 боссов с первой попытки.", kind:"auto",
      check:({gameFirstTryKills}) => (gameFirstTryKills.ds2||0) >= 3 },
    { id:"ds2_broken_road", img:"images/achievements/die_300.png",   name:"BROKEN ROAD", desc:"Dark Souls II: умереть 75 раз.", kind:"auto",
      check:({gameDeaths}) => (gameDeaths.ds2||0) >= 75 },
    { id:"ds2_stubborn",    img:"images/achievements/kills_50.png",  name:"STUBBORN HEART", desc:"Dark Souls II: потратить 50 попыток на одного босса.", kind:"auto",
      check:({gameMaxTries}) => (gameMaxTries.ds2||0) >= 50 },
        
    
    
    { id:"ds2_primal_bonfires", img:"images/achievements/ds2_curse.png", name:"PRIMAL FLAME",
      desc:"Dark Souls II: зажечь все первородные костры (после великих душ). Отметь вручную.", kind:"manual" },

    { id:"ds2_king_ring", img:"images/achievements/ds2_curse.png", name:"KING'S MARK",
      desc:"Dark Souls II: получить Кольцо короля. Отметь вручную.", kind:"manual" },

{ id:"ds2_steady_steps", img:"images/achievements/ds2_curse.png", name:"STEADY STEPS",
      desc:"Dark Souls II: победить 20 боссов, удерживая смерти по игре на уровне 40 или ниже.", kind:"auto",
      check:(ctx) => (ctx.gameKills?.ds2 || 0) >= 20 && (ctx.gameDeaths?.ds2 || 0) <= 40 },

    { id:"ds2_first_try_pair", img:"images/achievements/first_try.png", name:"FIRST-TRY PAIR",
      desc:"Dark Souls II: победить 2 боссов с первой попытки.", kind:"auto",
      check:(ctx) => (ctx.gameFirstTryKills?.ds2 || 0) >= 2 },

{ id:"ds2_all",         img:"images/achievements/ds2_all.png",         name:"DRANGLEIC CLEARED", desc:"Dark Souls II: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.ds2||0) >= 41 },

    { id:"ds3_cinder",      img:"images/achievements/ds3_cinder.png",      name:"LORD OF CINDER", desc:"Dark Souls III: одолеть повелителей пепла и довести дело до конца.", kind:"manual" },

    { id:"ds3_kills_10",   img:"images/achievements/ds3_cinder.png", name:"ASHEN PATH", desc:"Dark Souls III: победить 10 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.ds3||0) >= 10 },
    { id:"ds3_kills_20",   img:"images/achievements/ds3_all.png",    name:"UNKINDLED CHAMPION", desc:"Dark Souls III: победить 20 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.ds3||0) >= 20 },

    { id:"ds3_clean_hands", img:"images/achievements/ds3_all.png",    name:"NEVER FALTER", desc:"Dark Souls III: победить 5 боссов без смертей на них.", kind:"auto",
      check:({gameNoDeathKills}) => (gameNoDeathKills.ds3||0) >= 5 },
    { id:"ds3_first_ember", img:"images/achievements/ds3_cinder.png", name:"FIRST EMBER", desc:"Dark Souls III: победить 3 боссов с первой попытки.", kind:"auto",
      check:({gameFirstTryKills}) => (gameFirstTryKills.ds3||0) >= 3 },
    { id:"ds3_ashen_deaths",img:"images/achievements/die_100.png",    name:"ASHEN MISERY", desc:"Dark Souls III: умереть 50 раз.", kind:"auto",
      check:({gameDeaths}) => (gameDeaths.ds3||0) >= 50 },
    { id:"ds3_unbroken",    img:"images/achievements/kills_50.png",   name:"UNBROKEN ASH", desc:"Dark Souls III: потратить 40 попыток на одного босса.", kind:"auto",
      check:({gameMaxTries}) => (gameMaxTries.ds3||0) >= 40 },
        
    
    
    { id:"ds3_lords_of_cinder", img:"images/achievements/ds3_cinder.png", name:"CINDER HUNTER",
      desc:"Dark Souls III: вернуть на троны всех Повелителей Пепла. Отметь вручную.", kind:"manual" },

    { id:"ds3_link_the_fire", img:"images/achievements/ds3_cinder.png", name:"LINK THE FIRE",
      desc:"Dark Souls III: завершить игру и зажечь Первое Пламя (или любой финал — отметь тот, что сделал).", kind:"manual" },

{ id:"ds3_clean_five", img:"images/achievements/no_death_boss.png", name:"CLEAN FIVE",
      desc:"Dark Souls III: победить 5 боссов без смертей на них.", kind:"auto",
      check:(ctx) => (ctx.gameNoDeathKills?.ds3 || 0) >= 5 },

    { id:"ds3_under_control", img:"images/achievements/ds3_cinder.png", name:"UNDER CONTROL",
      desc:"Dark Souls III: победить 20 боссов, и ни один не потребовал больше 15 попыток.", kind:"auto",
      check:(ctx) => (ctx.gameKills?.ds3 || 0) >= 20 && (ctx.gameMaxTries?.ds3 || 0) <= 15 },

{ id:"ds3_all",         img:"images/achievements/ds3_all.png",         name:"LOTHRIC CLEARED", desc:"Dark Souls III: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.ds3||0) >= 25 },

    // --- Bloodborne ---

    { id:"bb_max_insight",  img:"images/achievements/bb_pale.png", name:"EYES WIDE OPEN", desc:"Bloodborne: получить максимальное озарение (99 единиц).", kind:"manual" },

    { id:"bb_kills_10",   img:"images/achievements/bb_visceral.png", name:"BLOOD-DRUNK", desc:"Bloodborne: победить 10 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.bloodborne||0) >= 10 },
    { id:"bb_kills_15",   img:"images/achievements/bb_all.png",      name:"NIGHTMARE WARDEN", desc:"Bloodborne: победить 15 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.bloodborne||0) >= 15 },

    { id:"bb_clean_hands",  img:"images/achievements/bb_all.png",      name:"CLEANSE THE NIGHT", desc:"Bloodborne: победить 5 боссов без смертей на них.", kind:"auto",
      check:({gameNoDeathKills}) => (gameNoDeathKills.bloodborne||0) >= 5 },
    { id:"bb_first_blood",  img:"images/achievements/bb_visceral.png", name:"FIRST BLOOD", desc:"Bloodborne: победить 2 боссов с первой попытки.", kind:"auto",
      check:({gameFirstTryKills}) => (gameFirstTryKills.bloodborne||0) >= 2 },
    { id:"bb_nightmare_fed",img:"images/achievements/die_300.png",      name:"NIGHTMARE-FED", desc:"Bloodborne: умереть 60 раз.", kind:"auto",
      check:({gameDeaths}) => (gameDeaths.bloodborne||0) >= 60 },
    { id:"bb_beast_patience",img:"images/achievements/kills_50.png",    name:"BEAST PATIENCE", desc:"Bloodborne: потратить 40 попыток на одного босса.", kind:"auto",
      check:({gameMaxTries}) => (gameMaxTries.bloodborne||0) >= 40 },
    { id:"bb_pale",         img:"images/achievements/bb_pale.png",         name:"PALEBLOOD HUNT", desc:"Bloodborne: начать охоту за бледной кровью.", kind:"manual" },
    { id:"bb_visceral",     img:"images/achievements/bb_visceral.png",     name:"VISCERAL", desc:"Bloodborne: добить босса висцеральной атакой.", kind:"manual" },
    
    
    { id:"bb_transcend", img:"images/achievements/bb_insight_99.png", name:"TRANSCENDENCE",
      desc:"Bloodborne: дойти до одного из финалов (любой). Отметь вручную.", kind:"manual" },

    { id:"bb_hunter's_dream", img:"images/achievements/bb_visceral.png", name:"DREAMWALKER",
      desc:"Bloodborne: открыть все ключевые зоны сна Охотника (мастерская/надгробия). Отметь вручную.", kind:"manual" },

{ id:"bb_firsttry_trio", img:"images/achievements/first_try.png", name:"FIRST-TRY TRIO",
      desc:"Bloodborne: победить 3 боссов с первой попытки.", kind:"auto",
      check:(ctx) => (ctx.gameFirstTryKills?.bb || 0) >= 3 },

    { id:"bb_night_clean", img:"images/achievements/bb_visceral.png", name:"NIGHT CLEANER",
      desc:"Bloodborne: победить 12 боссов и умереть по игре не больше 25 раз.", kind:"auto",
      check:(ctx) => (ctx.gameKills?.bb || 0) >= 12 && (ctx.gameDeaths?.bb || 0) <= 25 },

{ id:"bb_all",          img:"images/achievements/bb_all.png",          name:"THE HUNT ENDS", desc:"Bloodborne: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.bloodborne||0) >= 22 },

    // --- Sekiro ---

    { id:"sek_kills_10",  img:"images/achievements/sek_shinobi.png", name:"SHINOBI IN TRAINING", desc:"Sekiro: победить 10 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.sekiro||0) >= 10 },
    { id:"sek_kills_25",  img:"images/achievements/sek_shinobi.png", name:"IRON RESOLVE", desc:"Sekiro: победить 25 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.sekiro||0) >= 25 },
    { id:"sek_kills_35",  img:"images/achievements/sek_all.png",     name:"EDGE OF DEATH", desc:"Sekiro: победить 35 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.sekiro||0) >= 35 },

    { id:"sek_clean_hands", img:"images/achievements/sek_all.png",      name:"BLADE UNSULLIED", desc:"Sekiro: победить 8 боссов без смертей на них.", kind:"auto",
      check:({gameNoDeathKills}) => (gameNoDeathKills.sekiro||0) >= 8 },
    { id:"sek_first_cut",   img:"images/achievements/sek_shinobi.png",  name:"FIRST CUT", desc:"Sekiro: победить 5 боссов с первой попытки.", kind:"auto",
      check:({gameFirstTryKills}) => (gameFirstTryKills.sekiro||0) >= 5 },
    { id:"sek_fallen",      img:"images/achievements/die_666.png",      name:"FALLEN SHINOBI", desc:"Sekiro: умереть 80 раз.", kind:"auto",
      check:({gameDeaths}) => (gameDeaths.sekiro||0) >= 80 },
    { id:"sek_tenacity",    img:"images/achievements/kills_100.png",    name:"TENACITY OF STEEL", desc:"Sekiro: потратить 60 попыток на одного босса.", kind:"auto",
      check:({gameMaxTries}) => (gameMaxTries.sekiro||0) >= 60 },
    { id:"sek_shinobi",     img:"images/achievements/sek_shinobi.png",     name:"SHINOBI", desc:"Sekiro: убить босса, полагаясь на стойкость и клинки.", kind:"manual" },
        
    
    { id:"sek_mortal_blade", img:"images/achievements/sek_shinobi.png", name:"MORTAL BLADE",
      desc:"Sekiro: получить Смертельный Клинок. Отметь вручную.", kind:"manual" },

    { id:"sek_ending", img:"images/achievements/sek_shinobi.png", name:"SHINOBI'S FATE",
      desc:"Sekiro: получить любой финал. Отметь вручную.", kind:"manual" },

{ id:"sek_calm_blade", img:"images/achievements/sek_shinobi.png", name:"CALM BLADE",
      desc:"Sekiro: победить 15 боссов и удержать смерти по игре на уровне 30 или ниже.", kind:"auto",
      check:(ctx) => (ctx.gameKills?.sek || 0) >= 15 && (ctx.gameDeaths?.sek || 0) <= 30 },

    { id:"sek_firsttry_duo", img:"images/achievements/first_try.png", name:"FIRST-TRY DUO",
      desc:"Sekiro: победить 2 боссов с первой попытки.", kind:"auto",
      check:(ctx) => (ctx.gameFirstTryKills?.sek || 0) >= 2 },

{ id:"sek_all",         img:"images/achievements/sek_all.png",         name:"ASHINA CLEARED", desc:"Sekiro: убить всех боссов игры.", kind:"auto",
      check:({gameKills}) => (gameKills.sekiro||0) >= 44 },

    // --- Elden Ring ---

    { id:"er_kills_20",   img:"images/achievements/er_tarnished.png", name:"GRACE-GUIDED", desc:"Elden Ring: победить 20 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.elden||0) >= 20 },
    { id:"er_kills_40",   img:"images/achievements/er_dragon.png",    name:"RUNEBOUND", desc:"Elden Ring: победить 40 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.elden||0) >= 40 },
    { id:"er_kills_60",   img:"images/achievements/er_all.png",       name:"ELDEN VETERAN", desc:"Elden Ring: победить 60 боссов.", kind:"auto",
      check:({gameKills}) => (gameKills.elden||0) >= 60 },

    { id:"er_clean_hands",  img:"images/achievements/er_all.png",       name:"CLEANSE THE GRACE", desc:"Elden Ring: победить 10 боссов без смертей на них.", kind:"auto",
      check:({gameNoDeathKills}) => (gameNoDeathKills.elden||0) >= 10 },
    { id:"er_first_grace",  img:"images/achievements/er_tarnished.png", name:"FIRST GRACE", desc:"Elden Ring: победить 3 боссов с первой попытки.", kind:"auto",
      check:({gameFirstTryKills}) => (gameFirstTryKills.elden||0) >= 3 },
    { id:"er_rune_hungry",  img:"images/achievements/die_1000.png",     name:"RUNE-HUNGRY", desc:"Elden Ring: умереть 100 раз.", kind:"auto",
      check:({gameDeaths}) => (gameDeaths.elden||0) >= 100 },
    { id:"er_endless_tries",img:"images/achievements/kills_all.png",    name:"ENDLESS TRIES", desc:"Elden Ring: потратить 80 попыток на одного босса.", kind:"auto",
      check:({gameMaxTries}) => (gameMaxTries.elden||0) >= 80 },
    { id:"er_tarnished",    img:"images/achievements/er_tarnished.png",    name:"TARNISHED", desc:"Elden Ring: стать Междуземцем и сделать первый шаг.", kind:"auto",
      check:({gameKills}) => (gameKills.elden||0) >= 1 },
    { id:"er_dragon",       img:"images/achievements/er_dragon.png",       name:"DRAGONSLAYER", desc:"Elden Ring: победить дракона.", kind:"manual" },
    { id:"er_runebear",     img:"images/achievements/er_runebear.png",     name:"RUNE BEAR", desc:"Elden Ring: выжить и победить рунического медведя (без паники).", kind:"manual" },
    { id:"er_malenia",      img:"images/achievements/er_malenia.png",      name:"BLADE OF MIQUELLA", desc:"Elden Ring: победить Малению.", kind:"manual" },

    
    
    { id:"er_two_great_runes", img:"images/achievements/er_tarnished.png", name:"GREAT RUNES",
      desc:"Elden Ring: собрать две Великие Руны и получить доступ в столицу. Отметь вручную.", kind:"manual" },

    { id:"er_become_lord", img:"images/achievements/er_tarnished.png", name:"ELDEN LORD",
      desc:"Elden Ring: завершить игру любым финалом. Отметь вручную.", kind:"manual" },

{ id:"er_clean_ten", img:"images/achievements/no_death_boss.png", name:"CLEAN TEN",
      desc:"Elden Ring: победить 10 боссов без смертей на них.", kind:"auto",
      check:(ctx) => (ctx.gameNoDeathKills?.er || 0) >= 10 },

    { id:"er_no_big_wall", img:"images/achievements/er_tarnished.png", name:"NO BIG WALL",
      desc:"Elden Ring: победить 30 боссов, и при этом ни один не потребовал больше 20 попыток.", kind:"auto",
      check:(ctx) => (ctx.gameKills?.er || 0) >= 30 && (ctx.gameMaxTries?.er || 0) <= 20 },

{ id:"er_all",          img:"images/achievements/er_all.png",          name:"THE LANDS BETWEEN", desc:"Elden Ring: убить всех боссов базовой игры из списка. Считается по отметкам «УБИТ» в Elden Ring.", kind:"auto",
      check:({gameKills}) => (gameKills.elden||0) >= 71 },                      ];

  function loadJSON(key, fallback){
    try {
      if (key === STORE_PROGRESS && window.__SOUL_PUBLIC_PROGRESS && !(window.SoulAuth?.isAdmin?.())) return window.__SOUL_PUBLIC_PROGRESS;
      if (key === STORE_EXTRA && window.__SOUL_PUBLIC_EXTRA && !(window.SoulAuth?.isAdmin?.())) return window.__SOUL_PUBLIC_EXTRA;
      if (key === STORE_DONE && window.__SOUL_PUBLIC_DONE && !(window.SoulAuth?.isAdmin?.())) return window.__SOUL_PUBLIC_DONE;
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch { return fallback; }
  }
  function saveJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

  function loadDone(){ return loadJSON(STORE_DONE, {}); }
  function saveDone(done){ saveJSON(STORE_DONE, done); }

  function fmtDateTime(ts){
    try{
      const d = new Date(ts);
      return d.toLocaleString("ru-RU", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    } catch {
      return "";
    }
  }


  function computeStats(){
    const progress = loadJSON(STORE_PROGRESS, {});
    const extra = loadJSON(STORE_EXTRA, {});
    let deaths = 0;
    let kills = 0;

    const gameKills = {};
    const gameDeaths = {};
    const gameNoDeathKills = {};
    const gameFirstTryKills = {};
    const gameMaxTries = {};

    let hasFirstTry = false;
    let hasNoDeathBoss = false;

    let maxTries = 0;
    let maxDeathsOnBoss = 0;
    let noDeathBossCount = 0;

    for (const [gid, gdata] of Object.entries(progress || {})){
      let gk = 0;
      let gd = 0;
      let gNoDeath = 0;
      let gFirstTry = 0;
      let gMaxT = 0;

      for (const [bid, st] of Object.entries(gdata || {})){
        const d = Number(st?.deaths || 0);
        const t = Number(st?.tries || 0);
        const isEldenDlc = (gid === "elden" && String(bid).startsWith("dlc_"));

        deaths += d;
        gd += d;

        maxTries = Math.max(maxTries, t);
        gMaxT = Math.max(gMaxT, t);

        maxDeathsOnBoss = Math.max(maxDeathsOnBoss, d);

        if (st?.killed){
          kills += 1;
          if (!isEldenDlc) { gk += 1; }

          if (t <= 1){
            hasFirstTry = true;
            gFirstTry += 1;
          }

          if (d === 0){
            hasNoDeathBoss = true;
            noDeathBossCount += 1;
            gNoDeath += 1;
          }
        }
      }

      gameKills[gid] = gk;
      gameDeaths[gid] = gd;
      gameNoDeathKills[gid] = gNoDeath;
      gameFirstTryKills[gid] = gFirstTry;
      gameMaxTries[gid] = gMaxT;
    }

    // manual +/- deaths are stored per-game in extra
    for (const v of Object.values(extra || {})) deaths += Number(v || 0);

    return {
      deaths, kills,
      gameKills, gameDeaths, gameNoDeathKills, gameFirstTryKills, gameMaxTries,
      hasFirstTry, hasNoDeathBoss,
      maxTries, maxDeathsOnBoss, noDeathBossCount
    };
  }

  function markDone(id){
    const done = loadDone();
    if (done[id]) return false;
    done[id] = { at: Date.now() };
    saveDone(done);
    return true;
  }


  function toggleManual(id){
    const done = loadDone();
    if (done[id]){ delete done[id]; saveDone(done); return false; }
    done[id] = { at: Date.now() };
    saveDone(done);
    return true;
  }

  function setClip(id, url){
    const done = loadDone();
    done[id] = done[id] || { at: Date.now() };
    done[id].clip = url;
    saveDone(done);
    try{ scheduleClipCloudPush(); }catch{}
  }

  function checkAuto(){
    const done = loadDone();
    const ctx = computeStats();
    for (const a of ACH){
      if (a.kind !== "auto" || typeof a.check !== "function") continue;
      if (done[a.id]) continue;
      if (a.check(ctx)){
        if (markDone(a.id)){
          try { window.SoulUI?.toast?.(a.name, a.desc || "", a.img); } catch {}
        }
      }
    }
  }

  function updateCount(){
    const done = loadDone();
    const total = ACH.length;
    const completed = ACH.filter(a => !!done[a.id]).length;
    const el = document.getElementById("ach-summary-value") || document.getElementById("ach-count");
    if (el) el.textContent = `${completed} / ${total}`;
  }

  function render(){
    const host = document.getElementById("ach-list");
    if (!host) return;

    host.innerHTML = "";
    const done = loadDone();
    checkAuto();
    updateCount(); // make sure UI is fresh

    const groups = [
      { title: "Марафон", ids: ACH.filter(a => (
          a.id.startsWith("marathon_") ||
          a.id.startsWith("die_") ||
          a.id.startsWith("kills_") ||
          a.id === "ten_bosses" ||
          a.id === "marathon_finish"
        ) && !["marathon_no_death_5","marathon_blind_5","first_try"].includes(a.id)
      ).map(a => a.id) },

      { title: "Испытания", ids: ACH.filter(a => (
          a.id.startsWith("no_") ||
          a.id.startsWith("challenge_") ||
          ["blind_faith","marathon_no_death_5","marathon_blind_5","first_try"].includes(a.id)
        )).map(a => a.id) },

      { title: "Dark Souls", ids: ACH.filter(a => a.id.startsWith("ds1_") || a.id.startsWith("ds2_") || a.id.startsWith("ds3_")).map(a => a.id) },
      { title: "Bloodborne", ids: ACH.filter(a => a.id.startsWith("bb_")).map(a => a.id) },
      { title: "Sekiro", ids: ACH.filter(a => a.id.startsWith("sek_")).map(a => a.id) },
      { title: "Elden Ring", ids: ACH.filter(a => a.id.startsWith("er_")).map(a => a.id) },
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
        card.className = "ach-card" + (isDone ? " done" : " locked");

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

        // Action area: manual toggle (if allowed) + clip proof (for any achievement)
        if (a.kind === "manual"){
          const btn = document.createElement("button");
          btn.className = "btn ach-btn";
          btn.type = "button";
          btn.textContent = isDone ? "Выполнено ✓" : "Выполнено";
          if (!window.SoulAuth?.isAdmin?.()) btn.disabled = true;
          btn.onclick = () => {
            if (!window.SoulAuth?.isAdmin?.()) return;
            const nowDone = toggleManual(a.id); // can toggle on/off
            if (nowDone){
              try { window.SoulUI?.toast?.(a.name, a.desc || "", a.img); } catch {}
            }
            render();
          };
          actions.appendChild(btn);
        } else {
          const badge = document.createElement("div");
          badge.className = "ach-badge";
          badge.textContent = isDone ? "Открыто" : "Скрыто";
          actions.appendChild(badge);
        }


        // Done time (show on button click)
        const timeBox = document.createElement("div");
        timeBox.className = "ach-done-time";
        timeBox.style.display = "none";

        const timeBtn = document.createElement("button");
        timeBtn.className = "btn mini-date";
        timeBtn.type = "button";
        timeBtn.textContent = "Дата";
        timeBtn.onclick = () => {
          if (!done[a.id]?.at){
            try { window.SoulUI?.toast?.("Ещё не выполнено", a.name, a.img); } catch {}
            return;
          }
          const txt = "Выполнено: " + fmtDateTime(done[a.id].at);
          timeBox.textContent = txt;
          timeBox.style.display = (timeBox.style.display === "none") ? "block" : "none";
        };
        actions.insertBefore(timeBtn, actions.firstChild);
        card.appendChild(timeBox);

        // Clip proof input (admin only). Works for both auto and manual achievements.
        const clip = document.createElement('div');
        clip.className = 'ach-clip';
        const input = document.createElement('input');
        input.type = 'url';
        input.placeholder = 'Ссылка на Twitch-клип (доказательство)';
        input.value = (done[a.id]?.clip) || '';
        input.disabled = !window.SoulAuth?.isAdmin?.();
        input.addEventListener('change', () => {
          if (!window.SoulAuth?.isAdmin?.()) return;
          setClip(a.id, input.value.trim());
        });
        const link = document.createElement('a');
        link.className = 'btn mini-link';
        link.textContent = 'Открыть';
        link.target = '_blank';
        link.rel = 'noopener';
        const updateLink = () => {
          const v = input.value.trim();
          if (v){ link.href = v; link.style.display='inline-flex'; }
          else { link.removeAttribute('href'); link.style.display='none'; }
        };
        updateLink();
        input.addEventListener('input', updateLink);
        clip.append(input, link);
        actions.appendChild(clip);

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

  document.addEventListener("DOMContentLoaded", async () => {
    let _achHasCloud = false;
    // Sync from Cloud for viewers so achievements match shared progress
    if (!(window.SoulAuth?.isAdmin?.())){
      const cloud = await cloudGetProgress();
      if (cloud){
        const payload = parseCloudPayload(cloud);
        window.__SOUL_PUBLIC_PROGRESS = payload.progress || {};
        if (payload.extraDeaths) window.__SOUL_PUBLIC_EXTRA = payload.extraDeaths;
        if (payload.achDone) window.__SOUL_PUBLIC_DONE = payload.achDone;
        _achHasCloud = true;
      }
    }


    // Viewer sync: load public progress (shared across devices) from server file
    if (!_achHasCloud && !(window.SoulAuth?.isAdmin?.())){
      const pub = await loadPublicProgress();
      if (pub) window.__SOUL_PUBLIC_PROGRESS = pub;
    }


    checkAuto();
    updateCount();
    render();
  });
})();
