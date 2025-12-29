const params = new URLSearchParams(window.location.search);
const game = params.get("game");

const bossContainer = document.getElementById("bossContainer");
const title = document.getElementById("gameTitle");
const eldenTabs = document.getElementById("eldenRegions");

const eldenRegions = [
  ["elden_limgrave.json", "Лимгрейв"],
  ["elden_caelid.json", "Калид"],
  ["elden_liurnia.json", "Лиурния"],
  ["elden_altus_gelmir.json", "Альтус / Гельмир"],
  ["elden_leyndell.json", "Лейнделл"],
  ["elden_mountaintops.json", "Вершины"],
  ["elden_haligtree.json", "Халигтри"],
  ["elden_farum_azula.json", "Фарум Азула"],
  ["elden_underground.json", "Подземелья"],
  ["elden_volcano_manor.json", "Вулканово поместье"],
  ["elden_consecrated_snowfield.json", "Священное поле"]
];

if (game === "elden") {
  eldenRegions.forEach(([file, name]) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => loadGame(`data/${file}`);
    eldenTabs.appendChild(btn);
  });
} else {
  loadGame(`data/${game}.json`);
}

function loadGame(path) {
  fetch(path)
    .then(res => res.json())
    .then(renderGame);
}

function renderGame(data) {
  title.textContent = data.title;
  bossContainer.innerHTML = "";

  data.sections.forEach(section => {
    const sec = document.createElement("div");
    sec.className = "section";
    sec.innerHTML = `<h2>${section.name}</h2>`;

    section.bosses.forEach(boss => {
      const key = `${data.title}_${boss.id}`;
      const saved = JSON.parse(localStorage.getItem(key)) || { tries: 0, deaths: 0 };

      const row = document.createElement("div");
      row.className = "boss";
      row.innerHTML = `
        <img src="${boss.icon}">
        <div>${boss.name}</div>
        <input type="number" value="${saved.tries}">
        <input type="number" value="${saved.deaths}">
      `;

      const [triesInput, deathsInput] = row.querySelectorAll("input");
      triesInput.oninput = deathsInput.oninput = () => {
        localStorage.setItem(
          key,
          JSON.stringify({
            tries: +triesInput.value,
            deaths: +deathsInput.value
          })
        );
      };

      sec.appendChild(row);
    });

    bossContainer.appendChild(sec);
  });
}








