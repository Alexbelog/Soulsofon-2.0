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
      desc:"Начать марафон. Первый босс пал — пути назад нет.", kind:"manual",
      check:({kills}) => kills >= 1 },

    { id:"marathon_three_realms", img:"images/achievements/tr.png", name:"TRIPLE REALM",
      desc:"Победить минимум по 5 боссов в трёх разных играх марафона.", kind:"manual",
      check:(ctx) => {
        const games = ["ds1","ds2","ds3","bb","sek","elden"];
        let n = 0;
        for (const g of games){ if ((ctx.gameKills?.[g] || 0) >= 5) n++; }
        return n >= 3;
      }},

    { id:"marathon_consistent", img:"images/achievements/consistent_runner.png", name:"CONSISTENT RUNNER",
      desc:"Победить минимум по 10 боссов в четырёх разных играх марафона.", kind:"manual",
      check:(ctx) => {
        const games = ["ds1","ds2","ds3","bb","sek","elden"];
        let n = 0;
        for (const g of games){ if ((ctx.gameKills?.[g] || 0) >= 10) n++; }
        return n >= 4;
      }},

    { id:"marathon_clip_archivist", img:"images/achievements/clip_archivist.png", name:"CLIP ARCHIVIST",
      desc:"Прикрепить Twitch-клип к 10 достижениям. Пусть останутся доказательства эпохи Soulsfon 2026.", kind:"manual",
      check:() => {
        const done = loadDone();
        let c = 0;
        for (const k in done){ if (done[k]?.clip) c++; }
        return c >= 10;
      }},


    { id:"marathon_tries_10",  img:"images/achievements/10try.png",  name:"TEN TRIES LATER", desc:"Потратить 10 попыток на одного босса.", kind:"manual",
      check:({maxTries}) => maxTries >= 10 },
    { id:"marathon_tries_30",  img:"images/achievements/30try.png",    name:"THIRTY TRIES OF WILL", desc:"Потратить 30 попыток на одного босса.", kind:"manual",
      check:({maxTries}) => maxTries >= 30 },
    { id:"marathon_tries_60",  img:"images/achievements/60try.png",    name:"SIXTY TIMES BROKEN", desc:"Потратить 60 попыток на одного босса.", kind:"manual",
      check:({maxTries}) => maxTries >= 60 },
    { id:"marathon_tries_100", img:"images/achievements/100try.png",     name:"HUNDREDFOLD SUFFERING", desc:"Потратить 100 попыток на одного босса.", kind:"manual",
      check:({maxTries}) => maxTries >= 100 },
    { id:"marathon_no_death_5",img:"images/achievements/nodeath_marathon.png", name:"MARATHON NO DEATH", desc:"Победить 5 боссов без смертей на них.", kind:"manual",
      check:({noDeathBossCount}) => noDeathBossCount >= 5 },
    { id:"marathon_blind_5",   img:"images/achievements/blind_executioner.png", name:"BLIND EXECUTIONER", desc:"Убить 5 боссов «вслепую».", kind:"manual" },
    
    { id:"die_100",         img:"images/achievements/die_100.png",         name:"YOU DIED x100", desc:"Умереть 100 раз за весь марафон.", kind:"manual",
      check:({deaths}) => deaths >= 100 },
    { id:"die_300",         img:"images/achievements/die_300.png",         name:"ASHEN ONE", desc:"Умереть 300 раз за весь марафон.", kind:"manual",
      check:({deaths}) => deaths >= 300 },
    { id:"die_666",         img:"images/achievements/die_666.png",         name:"CURSED", desc:"Умереть 666 раз за весь марафон.", kind:"manual",
      check:({deaths}) => deaths >= 666 },
    { id:"die_1000",        img:"images/achievements/die_1000.png",        name:"ENDLESS", desc:"Умереть 1000 раз за весь марафон.", kind:"manual",
      check:({deaths}) => deaths >= 1000 },
    { id:"ten_bosses",      img:"images/achievements/ten_bosses.png",      name:"BOSS HUNTER", desc:"Убить 10 боссов в марафоне.", kind:"manual",
      check:({kills}) => kills >= 10 },
    { id:"kills_25",        img:"images/achievements/kills_25.png",        name:"BOSS SLAYER", desc:"Убить 25 боссов за весь марафон.", kind:"manual",
      check:({kills}) => kills >= 25 },
    { id:"kills_50",        img:"images/achievements/kills_50.png",        name:"BOSS REAPER", desc:"Убить 50 боссов за весь марафон.", kind:"manual",
      check:({kills}) => kills >= 50 },
    { id:"kills_100",       img:"images/achievements/kills_100.png",       name:"HUNDREDFOLD", desc:"Убить 100 боссов за весь марафон.", kind:"manual",
      check:({kills}) => kills >= 100 },
    { id:"kills_150",       img:"images/achievements/kills_150.png",       name:"RECKONER", desc:"Убить 150 боссов за весь марафон.", kind:"manual",
      check:({kills}) => kills >= 150 },
    { id:"kills_200",       img:"images/achievements/kills_200.png",       name:"LEGEND", desc:"Убить 200 боссов за весь марафон.", kind:"manual",
      check:({kills}) => kills >= 200 },
    { id:"kills_all",       img:"images/achievements/kills_all.png",       name:"ABSOLUTE", desc:"Убить всех боссов марафона (полная зачистка).", kind:"manual",
      check:({kills}) => kills >= 229 },
    { id:"first_try",      img:"images/achievements/first_try.png",      name:"FIRST TRY", desc:"Победить любого босса с первой попытки.", kind:"manual",
      check:({hasFirstTry}) => !!hasFirstTry },
    { id:"no_death_boss",  img:"images/achievements/no_death_boss.png",  name:"NO DEATH", desc:"Победить любого босса без смертей на нём.", kind:"manual",
      check:({hasNoDeathBoss}) => !!hasNoDeathBoss },
    
    { id:"marathon_day_one", img:"images/achievements/day_one.png", name:"DAY ONE", desc:"Провести первый полноценный стрим/сессию Soulsfon 2026.", kind:"manual" },

    { id:"marathon_redemption", img:"images/achievements/redemption.png", name:"REDEMPTION", desc:"Вернуться к боссу, который когда-то забрал 30+ попыток, и победить его.", kind:"manual" },

{ id:"marathon_finish", img:"images/achievements/marathon_finish.png", name:"THE END", desc:"Дойти до финала марафона. Последняя искра погасла.", kind:"manual" },

    // --- Challenges (manual) ---
    { id:"blind_faith",     img:"images/achievements/blind_faith.png",     name:"BLIND FAITH", desc:"Убить босса «вслепую».", kind:"manual" },
    { id:"no_roll",         img:"images/achievements/no_roll.png",         name:"NO ROLL", desc:"Убить босса без перекатов.", kind:"manual" },
    { id:"no_estus",        img:"images/achievements/no_estus.png",        name:"NO HEAL", desc:"Убить босса без лечения (эстус/фляги/хилы).", kind:"manual" },
    { id:"challenge_no_summon", img:"images/achievements/challenge_no_summon.png", name:"NO SUMMON", desc:"Не использовать призывы (NPC/духи/кооп) в течении всего марафона.", kind:"manual" },

    { id:"challenge_no_shield_run", img:"images/achievements/no_shield.png", name:"NO SHIELD OATH",
      desc:"Отказаться от щитов на всём марафоне. Парирования и перекаты — всё, что есть.", kind:"manual" },

    { id:"challenge_no_magic_boss", img:"images/achievements/steal_only.png", name:"STEEL ONLY",
      desc:"Победить 50 боссов без магии/чудес/инкантаций и без баффов оружия.", kind:"manual" },

    { id:"challenge_naked_boss", img:"images/achievements/no_armored.png", name:"BARELY ARMORED",
      desc:"Победить любого босса в минимальной броне («голый» сет) — только храбрость.", kind:"manual" },

    { id:"challenge_rl1",   img:"images/achievements/challenge_rl1.png",   name:"LEVEL ONE", desc:"Победить босса на минимальном уровне (RL1/SL1/BL4 — по игре).", kind:"manual" },

    { id:"challenge_the_wall", img:"images/achievements/the_wall.png", name:"THE WALL",
      desc:"Застрять на одном боссе: 50+ смертей на единственной схватке. Стена проверяет веру.", kind:"manual",
      check:({maxDeathsOnBoss}) => maxDeathsOnBoss >= 40 },

    { id:"challenge_flawless_ten", img:"images/achievements/flawless.png", name:"FLAWLESS TEN",
      desc:"Победить 10 боссов без смертей на них. Не серия — коллекция чистых дуэлей.", kind:"manual",
      check:({noDeathBossCount}) => noDeathBossCount >= 10 },

    { id:"challenge_firsttry_ten", img:"images/achievements/one_shot.png", name:"ONE-SHOT ARTIST",
      desc:"Победить 30 боссов с первой попытки за весь марафон (без Elden Ring). No Death?", kind:"manual",
      check:(ctx) => {
        const v = ctx.gameFirstTryKills || {};
        let total = 0;
        for (const k in v) total += (v[k] || 0);
        return total >= 20;
      }},


    // --- Dark Souls ---
    
    { id:"ds1_bells",       img:"images/achievements/ds1_bells.png",       name:"RING THE BELLS", desc:"Dark Souls: пробудить зов колоколов (два колокола).", kind:"manual" },
    { id:"ds1_solaire",     img:"images/achievements/ds1_solaire.png",     name:"PRAISE THE SUN", desc:"Dark Souls: ритуально воздать славу солнцу в честь победы.", kind:"manual" },
    
    { id:"ds1_kills_10",   img:"images/achievements/piligrim_10.png",   name:"EMBERED PILGRIM", desc:"Dark Souls: победить 10 боссов.", kind:"manual",
      check:({gameKills}) => (gameKills.ds1||0) >= 10 },
    { id:"ds1_kills_20",   img:"images/achievements/piligrim_20.png", name:"LORDSOUL HUNTER", desc:"Dark Souls: победить 20 боссов.", kind:"manual",
      check:({gameKills}) => (gameKills.ds1||0) >= 20 },

    { id:"ds1_clean_hands", img:"images/achievements/clean_hands.png", name:"CLEAN HANDS", desc:"Dark Souls: победить 5 боссов без смертей на них.", kind:"manual",
      check:({gameNoDeathKills}) => (gameNoDeathKills.ds1||0) >= 5 },
    { id:"ds1_first_light", img:"images/achievements/first_light.png",   name:"FIRST LIGHT", desc:"Dark Souls: победить 3 боссов с первой попытки.", kind:"manual",
      check:({gameFirstTryKills}) => (gameFirstTryKills.ds1||0) >= 3 },
    { id:"ds1_hollowed",    img:"images/achievements/ds1_dead50.png",      name:"HOLLOWED BUT STANDING", desc:"Dark Souls: умереть 50 раз.", kind:"manual",
      check:({gameDeaths}) => (gameDeaths.ds1||0) >= 50 },
    

    { id:"ds1_lordvessel", img:"images/achievements/ds1_bearer.png", name:"LORDVESSEL BEARER",
      desc:"Dark Souls: получить Великую Чашу и открыть путь к великим душам.", kind:"manual" },

    { id:"ds1_smooth_sailing", img:"images/achievements/ds1_smooth.png", name:"SMOOTH SAILING",
      desc:"Dark Souls: победить 10 боссов, и при этом ни один не потребовал больше 10 попыток.", kind:"manual",
      check:(ctx) => (ctx.gameKills?.ds1 || 0) >= 10 && (ctx.gameMaxTries?.ds1 || 0) <= 10 },

{ id:"ds1_all",         img:"images/achievements/ds1_all.png",         name:"LORDRAN CLEARED", desc:"Dark Souls: убить всех боссов игры.", kind:"manual",
      check:({gameKills}) => (gameKills.ds1||0) >= 26 },
    
    { id:"ds2_curse",       img:"images/achievements/ds2_curse.png",       name:"BEARER OF THE CURSE", desc:"Dark Souls II: продолжить путь, несмотря на проклятие.", kind:"manual" },
    { id:"ds2_quiet_flame",       img:"images/achievements/quiet_flame.png",       name:"IN QUIET FLAME", desc:"Dark Souls II: провести 1 минуту у костра без действий.", kind:"manual" },
    { id:"ds2_rip",       img:"images/achievements/rip.png",       name:"REST IN PEACE", desc:"Dark Souls II: совершить жест (поклон/уважение) перед боссом и победить его", kind:"manual" },
    { id:"ds2_ballista",       img:"images/achievements/ballista.png",       name:"BALLISTA'S VERDICT", desc:"Dark Souls II: убить Последователя с помощью баллисты", kind:"manual" },
    { id:"ds2_unhorsed",       img:"images/achievements/unhorsed.png",       name:"UNHORSED", desc:"Dark Souls II: убить Драконьего всадника путем падения с арены", kind:"manual" },
    { id:"ds2_twin_thrones",       img:"images/achievements/twin_thrones.png",       name:"TWIN THRONES, ONE STROKE", desc:"Dark Souls II: убить защитника и смотрителя трона одним ударом", kind:"manual" },

    { id:"ds2_clean_hands", img:"images/achievements/excuses.png",   name:"NO EXCUSES", desc:"Dark Souls II: победить 10 боссов без смертей на них.", kind:"manual",
      check:({gameNoDeathKills}) => (gameNoDeathKills.ds2||0) >= 10 },
    
    { id:"ds2_kills_25",   img:"images/achievements/crown_sek.png",   name:"CROWN SEEKER", desc:"Dark Souls II: победить 30 боссов.", kind:"manual",
      check:({gameKills}) => (gameKills.ds2||0) >= 25 },


    { id:"ds2_broken_road", img:"images/achievements/broke_road.png",   name:"BROKEN ROAD", desc:"Dark Souls II: умереть 100 раз.", kind:"manual",
      check:({gameDeaths}) => (gameDeaths.ds2||0) >= 100 },
        
    { id:"ds2_champion", img:"images/achievements/ds2_champion.png", name:"CHAMPION",
      desc:"Dark Souls II: достичь ранга 3 (или максимального) в одном из ковенантов.", kind:"manual" },    
    
    { id:"ds2_primal_bonfires", img:"images/achievements/ds2_primal.png", name:"PRIMAL FLAME",
      desc:"Dark Souls II: зажечь все первородные костры (после великих душ).", kind:"manual" },

    { id:"ds2_king_ring", img:"images/achievements/king_mark.png", name:"KING'S MARK",
      desc:"Dark Souls II: получить Королевское кольцо.", kind:"manual" },

{ id:"ds2_all",         img:"images/achievements/ds2_all.png",         name:"DRANGLEIC CLEARED", desc:"Dark Souls II: убить всех боссов игры.", kind:"manual",
      check:({gameKills}) => (gameKills.ds2||0) >= 41 },

    { id:"ds3_blind",      img:"images/achievements/blind_gundir.png",      name:"BLIND JUDGEMENT", desc:"Dark Souls III: убить Гундира вслепую", kind:"manual" },
    { id:"ds3_waltz",      img:"images/achievements/waltz.png",      name:"EARLY WALTZ", desc:"Dark Souls III: убить Танцовщицу до убийства Гиганта Йорма (а лучше ещё раньше)", kind:"manual" },
    { id:"ds3_kills_20",   img:"images/achievements/unkindled.png",    name:"UNKINDLED CHAMPION", desc:"Dark Souls III: победить 20 боссов.", kind:"manual",
      check:({gameKills}) => (gameKills.ds3||0) >= 20 },

    { id:"ds3_clean_hands", img:"images/achievements/never_falter.png",    name:"NEVER FALTER", desc:"Dark Souls III: победить 5 боссов без смертей на них.", kind:"manual",
      check:({gameNoDeathKills}) => (gameNoDeathKills.ds3||0) >= 5 },
    { id:"ds3_under_control", img:"images/achievements/under_control.png", name:"UNDER CONTROL",
      desc:"Dark Souls III: победить 10 боссов, и ни один не потребовал больше 10 попыток.", kind:"manual",
      check:(ctx) => (ctx.gameKills?.ds3 || 0) >= 5 && (ctx.gameMaxTries?.ds3 || 0) <= 10 },
    { id:"ds3_ashen_deaths",img:"images/achievements/ds3misery.png",    name:"ASHEN MISERY", desc:"Dark Souls III: умереть 100 раз.", kind:"manual",
      check:({gameDeaths}) => (gameDeaths.ds3||0) >= 100 },
        
    { id:"ds3_champion", img:"images/achievements/ds3_clan.png", name:"ASHEN CLAN",
      desc:"Dark Souls III: достичь ранга 3 (или максимального) в одном из ковенантов.", kind:"manual" },
    { id:"ds3_giantfalls",      img:"images/achievements/giantfalls.png",      name:"A GIANT FALLS UNBOWED", desc:"Dark Souls III: победить Гиганта Йорма без использования Повелителя бурь (особого меча из арены).", kind:"manual" },
    

    { id:"ds3_cinder",      img:"images/achievements/ds3_cinder.png",      name:"LORD OF CINDER", desc:"Dark Souls III: одолеть повелителей пепла и довести дело до конца.", kind:"manual" },

    { id:"ds3_link_the_fire", img:"images/achievements/link_fire.png", name:"LINK THE FIRE",
      desc:"Dark Souls III: завершить игру и зажечь Первое Пламя (или любой другой финал).", kind:"manual" },

{ id:"ds3_all",         img:"images/achievements/ds3_all.png",         name:"LOTHRIC CLEARED", desc:"Dark Souls III: убить всех боссов игры.", kind:"manual",
      check:({gameKills}) => (gameKills.ds3||0) >= 25 },

    // --- Bloodborne ---

    { id:"bb_pale",         img:"images/achievements/bb_pale.png",         name:"PALEBLOOD HUNT", desc:"Bloodborne: начать охоту за бледной кровью.", kind:"manual" },
    { id:"bb_workshop",         img:"images/achievements/bb_workshop.png",         name:"WHISPER TO THE WORKSHOP", desc:"Bloodborne: впервые улучшить оружие и сразу после сделать жест “поклон/уважение” у верстака.", kind:"manual" },

    { id:"bb_kills_15",   img:"images/achievements/bb_kills_15.png",      name:"NIGHTMARE WARDEN", desc:"Bloodborne: победить 15 боссов.", kind:"manual",
      check:({gameKills}) => (gameKills.bloodborne||0) >= 15 },

    { id:"bb_clean_hands",  img:"images/achievements/bb_clean_hands.png",      name:"CLEANSE THE NIGHT", desc:"Bloodborne: победить 5 боссов без смертей на них.", kind:"manual",
      check:({gameNoDeathKills}) => (gameNoDeathKills.bloodborne||0) >= 5 },

    { id:"bb_nightmare_fed",img:"images/achievements/bb_nightmare_fed.png",      name:"NIGHTMARE-FED", desc:"Bloodborne: умереть 60 раз.", kind:"manual",
      check:({gameDeaths}) => (gameDeaths.bloodborne||0) >= 60 },
    
    { id:"bb_max_insight",  img:"images/achievements/bb_max_insight.png", name:"EYES WIDE OPEN", desc:"Bloodborne: получить максимальное озарение (99 единиц).", kind:"manual" },
    { id:"bb_visceral",     img:"images/achievements/bb_visceral.png",     name:"VISCERAL", desc:"Bloodborne: добить босса висцеральной атакой.", kind:"manual" },
    
    
    { id:"bb_transcend", img:"images/achievements/bb_transcend.png", name:"TRANSCENDENCE",
      desc:"Bloodborne: дойти до одного из финалов (любой).", kind:"manual" },

{ id:"bb_all",          img:"images/achievements/bb_all.png",          name:"THE HUNT ENDS", desc:"Bloodborne: убить всех боссов игры.", kind:"manual",
      check:({gameKills}) => (gameKills.bloodborne||0) >= 22 },

    // --- Sekiro ---

    { id:"sek_shinobi",     img:"images/achievements/sek_shinobi.png",     name:"SHINOBI", desc:"Sekiro: убить босса, полагаясь на стойкость и клинки.", kind:"manual" },
    { id:"sek_shinobi2",     img:"images/achievements/sek_shinobi2.png",     name:"A SHINOBI'S STILLNESS", desc:"Sekiro: простоять 60 секунд в скрытности (в кустах/тени), не двигаясь и не открывая меню.", kind:"manual" },
    { id:"sek_shinobi3",     img:"images/achievements/sek_shinobi3.png",     name:"HEEL ON THE SPEAR", desc:"Sekiro: выполнить 5 микири в одном бою и победить", kind:"manual" },
    { id:"sek_kills_25",  img:"images/achievements/sek_kills_25.png", name:"IRON RESOLVE", desc:"Sekiro: победить 25 боссов.", kind:"manual",
      check:({gameKills}) => (gameKills.sekiro||0) >= 25 },

    { id:"sek_clean_hands", img:"images/achievements/sek_clean_hands.png",      name:"BLADE UNSULLIED", desc:"Sekiro: победить 8 боссов без смертей на них.", kind:"manual",
      check:({gameNoDeathKills}) => (gameNoDeathKills.sekiro||0) >= 8 },
    { id:"sek_fallen",      img:"images/achievements/sek_fallen.png",      name:"FALLEN SHINOBI", desc:"Sekiro: умереть 100 раз.", kind:"manual",
      check:({gameDeaths}) => (gameDeaths.sekiro||0) >= 100 },
    
    { id:"sek_mortal_blade", img:"images/achievements/sek_mortal_blade.png", name:"MORTAL BLADE",
      desc:"Sekiro: получить Клинок бессмертных.", kind:"manual" },

    { id:"sek_severed_silence", img:"images/achievements/sek_silence.png", name:"SEVERED SILENCE",
      desc:"Sekiro: убить всех Безголовых на одном прохождении (5 штук)", kind:"manual" },
    
    { id:"sek_arm_blade", img:"images/achievements/sek_arm_blade.png", name:"ONE ARM, ONE BLADE",
      desc:"Sekiro: пройти игру до финальных титров, ни разу не используя боевые инструменты протеза.", kind:"manual" },
    
    { id:"sek_ending", img:"images/achievements/sek_ending.png", name:"SHINOBI'S FATE",
      desc:"Sekiro: получить любой финал.", kind:"manual" },

{ id:"sek_all",         img:"images/achievements/sek_all.png",         name:"ASHINA CLEARED", desc:"Sekiro: убить всех боссов игры.", kind:"manual",
      check:({gameKills}) => (gameKills.sekiro||0) >= 44 },

    // --- Elden Ring ---

    { id:"er_tarnished",    img:"images/achievements/er_tarnished.png",    name:"TARNISHED", desc:"Elden Ring: стать Междуземцем и сделать первый шаг.", kind:"manual",
      check:({gameKills}) => (gameKills.elden||0) >= 1 },
    { id:"er_grace",      img:"images/achievements/er_malenia.png",      name:"GUIDED BY GRACE", desc:"Elden Ring: активировать 30 мест благодати.", kind:"manual" },
    { id:"er_map",      img:"images/achievements/er_malenia.png",      name:"MAPMAKER'S OATH", desc:"Elden Ring: собрать фрагменты карты для 5 регионов.", kind:"manual" },
    { id:"er_read",      img:"images/achievements/er_malenia.png",      name:"READ THE STONE", desc:"Elden Ring: найти 10 лор-описаний (предметы/записки) и прочитать их подряд у благодати.", kind:"manual" },
    { id:"er_kills_40",   img:"images/achievements/er_dragon.png",    name:"RUNEBOUND", desc:"Elden Ring: победить 60 боссов.", kind:"manual",
      check:({gameKills}) => (gameKills.elden||0) >= 60 },
    { id:"er_kills_60",   img:"images/achievements/er_all.png",       name:"ELDEN VETERAN", desc:"Elden Ring: победить 120 боссов.", kind:"manual",
      check:({gameKills}) => (gameKills.elden||0) >= 120 },

    { id:"er_clean_hands",  img:"images/achievements/er_all.png",       name:"CLEANSE THE GRACE", desc:"Elden Ring: победить 20 боссов без смертей на них.", kind:"manual",
      check:({gameNoDeathKills}) => (gameNoDeathKills.elden||0) >= 10 },
       
    { id:"er_no_big_wall", img:"images/achievements/er_tarnished.png", name:"NO BIG WALL",
      desc:"Elden Ring: победить 30 боссов, и при этом ни один не потребовал больше 20 попыток.", kind:"manual",
      check:(ctx) => (ctx.gameKills?.elden || 0) >= 30 && (ctx.gameMaxTries?.elden || 0) <= 20 },
    
    { id:"er_rune_hungry",  img:"images/achievements/die_1000.png",     name:"RUNE-HUNGRY", desc:"Elden Ring: умереть 300 раз.", kind:"manual",
      check:({gameDeaths}) => (gameDeaths.elden||0) >= 300 },
    { id:"er_endless_tries",img:"images/achievements/kills_all.png",    name:"ENDLESS TRIES", desc:"Elden Ring: потратить 80 попыток на одного босса.", kind:"manual",
      check:({gameMaxTries}) => (gameMaxTries.elden||0) >= 80 },
    { id:"er_radahn_down", img:"images/achievements/er_tarnished.png", name:"STARSCOURGE TOPPLED",
      desc:"Elden Ring: победить Радана, Бича Звёзд.", kind:"auto",
      check:() => {
        const p = loadJSON(STORE_PROGRESS, {});
        const g = (p && (p["elden"] || p.elden)) || {};
        return !!(g?.radahn?.killed || g?.starscourge_radahn?.killed);
      }},

    { id:"er_lord_of_blood", img:"images/achievements/er_tarnished.png", name:"LORD OF BLOOD",
      desc:"Elden Ring: победить Мога, Повелителя Крови.", kind:"manual" },

    { id:"er_black_blade", img:"images/achievements/er_tarnished.png", name:"BLACK BLADE FALLEN",
      desc:"Elden Ring: победить Маликета, Чёрный клинок.", kind:"manual" },
    { id:"er_malenia",      img:"images/achievements/er_malenia.png",      name:"BLADE OF MIQUELLA", desc:"Elden Ring: победить Малению.", kind:"manual" },
    { id:"er_sanya",      img:"images/achievements/er_sanya.png",      name:"SANYA DREAM", desc:"Помочь Александру, Железному кулаку испольнить его мечту!", kind:"manual" },
    { id:"er_spirit_ashes",      img:"images/achievements/er_spirit_ashes.png",      name:"NO SPIRIT ASHES", desc:"Пройти игру полностью неиспользуя прах!", kind:"manual" },
    
    { id:"er_two_great_runes", img:"images/achievements/er_tarnished.png", name:"GREAT RUNES",
      desc:"Cобрать две Великие Руны и получить доступ в столицу.", kind:"manual" },

    { id:"er_become_lord", img:"images/achievements/er_tarnished.png", name:"ELDEN LORD",
      desc:"Elden Ring: завершить игру любым финалом.", kind:"manual" },

{ id:"er_all",          img:"images/achievements/er_all.png",          name:"THE LANDS BETWEEN", desc:"Elden Ring: убить всех боссов базовой игры и DLC Shadow of the Erdtree", kind:"manual",
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
    const gameDlcKills = {};

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
      let gDlc = 0;

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
          if (!isEldenDlc) { gk += 1; } else { gDlc += 1; }

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
      gameDlcKills[gid] = gDlc;
    }

    // manual +/- deaths are stored per-game in extra
    for (const v of Object.values(extra || {})) deaths += Number(v || 0);

    return {
      deaths, kills,
      gameKills, gameDeaths, gameNoDeathKills, gameFirstTryKills, gameMaxTries, gameDlcKills,
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
