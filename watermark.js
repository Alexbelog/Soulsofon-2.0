(() => {
  const add = () => {
    if (document.getElementById("alexbelog-watermark")) return;
    const wm = document.createElement("div");
    wm.id = "alexbelog-watermark";
    wm.className = "watermark";
    wm.textContent = "created by Alexbelog";
    document.body.appendChild(wm);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", add);
  } else add();
})();
