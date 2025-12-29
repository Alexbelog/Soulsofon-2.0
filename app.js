const content = document.querySelector('.content');
const sidebar = document.querySelector('.sidebar');

const filterStatus = document.getElementById('filterStatus');
const filterSection = document.getElementById('filterSection');

let currentGame = null;
let allBossRows = [];

/* =========================
   LOAD GAME JSON
========================= */
async function loadGame(jsonPath) {
  const res = await fetch(jsonPath);
  const game = await res.json();
  currentGame = game;
  renderGame(game);
}

/* =========================
   RENDER GAME
========================= */
function renderGame(game) {
  content.innerHTML = '';

  // Banner
  if (game.banner) {
    const banner = document.createElement('img');
    banner.src = game.banner;
    banner.className = 'game-banner';
    content.appendChild(banner);
  }

  // Stats
  const stats = document.createElement('div');
  stats.className = 'game-stats';
  stats.innerHTML = `
    <div class="stat">Смерти в игре:
      <span class="stat-value" id="gameDeaths">0</span>
    </div>
    <div class="stat">Прогресс:
      <span class="stat-value" id="gameProgress">0%</span>
    </div>
  `;
  content.appendChild(stats);

  // Progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.innerHTML = `<div class="progress-fill" id="progressFill"></div>`;
  content.appendChild(progressBar);

  // Boss list
  const list = document.createElement('div');
  list.className = 'boss-list';
  content.appendChild(list);

  allBossRows = [];

  game.regions?.forEach(region => {
    region.sections.forEach(section => {
      const sectionTitle = document.createElement('div');
      sectionTitle.className = 'boss-section-title';
      sectionTitle.textContent = `${region.title} — ${section.title}`;
      list.appendChild(sectionTitle);

      section.bosses.forEach(boss => {
        const row = createBossRow(game.id, boss, section.title);
        list.appendChild(row);
        allBossRows.push(row);
      });
    });
  });

  updateStats();
}

/* =========================
   CREATE BOSS ROW
========================= */
function createBossRow(gameId, boss, section) {
  const saved = loadBossData(gameId, boss.id);

  boss.tries = saved?.tries ?? 0;
  boss.deaths = saved?.deaths ?? 0;
  boss.killed = saved?.killed ?? false;

  const row = document.createElement('div');
  row.className = 'boss-row';
  row.dataset.section = section;

  if (boss.killed) row.classList.add('killed');

  row.innerHTML = `
    <img class="boss-icon" src="${boss.icon || ''}">
    <div class="boss-name">${boss.name}</div>

    <div class="boss-input-wrapper">
      <input type="number" class="boss-input try" value="${boss.tries}">
      <div>Try</div>
    </div>

    <div class="boss-input-wrapper">
      <input type="number" class="boss-input death" value="${boss.deaths}">
      <div>Death</div>
    </div>

    <input type="checkbox" class="boss-killed" ${boss.killed ? 'checked' : ''}>
  `;

  const tryInput = row.querySelector('.try');
  const deathInput = row.querySelector('.death');
  const killedCheckbox = row.querySelector('.boss-killed');

  tryInput.oninput = () => save();
  deathInput.oninput = () => save();
  killedCheckbox.onchange = () => {
    row.classList.toggle('killed', killedCheckbox.checked);
    save();
  };

  function save() {
    boss.tries = +tryInput.value;
    boss.deaths = +deathInput.value;
    boss.killed = killedCheckbox.checked;
    saveBossData(gameId, boss);
    updateStats();
  }

  return row;
}

/* =========================
   STATS
========================= */
function updateStats() {
  let totalDeaths = 0;
  let totalBosses = 0;
  let killedBosses = 0;

  currentGame.regions.forEach(region => {
    region.sections.forEach(section => {
      section.bosses.forEach(boss => {
        totalBosses++;
        totalDeaths += boss.deaths;
        if (boss.killed) killedBosses++;
      });
    });
  });

  document.getElementById('gameDeaths').textContent = totalDeaths;
  document.getElementById('gameProgress').textContent =
    Math.round((killedBosses / totalBosses) * 100) + '%';

  document.getElementById('progressFill').style.width =
    (killedBosses / totalBosses) * 100 + '%';
}

/* =========================
   FILTERS
========================= */
function applyFilters() {
  const status = filterStatus?.value || 'all';
  const section = filterSection?.value || 'all';

  allBossRows.forEach(row => {
    const killed = row.classList.contains('killed');
    const rowSection = row.dataset.section;

    let visible = true;

    if (status === 'killed' && !killed) visible = false;
    if (status === 'alive' && killed) visible = false;
    if (section !== 'all' && !rowSection.includes(section)) visible = false;

    row.style.display = visible ? 'grid' : 'none';
  });
}

filterStatus?.addEventListener('change', applyFilters);
filterSection?.addEventListener('change', applyFilters);

/* =========================
   LOCAL STORAGE
========================= */
function saveBossData(gameId, boss) {
  localStorage.setItem(
    `boss_${gameId}_${boss.id}`,
    JSON.stringify(boss)
  );
}

function loadBossData(gameId, bossId) {
  const data = localStorage.getItem(`boss_${gameId}_${bossId}`);
  return data ? JSON.parse(data) : null;
}

/* =========================
   SIDEBAR BUTTONS
========================= */
document.querySelectorAll('[data-game]').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadGame(btn.dataset.game);
  };
});












