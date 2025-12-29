document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("startBtn");
  const overlay = document.getElementById("fade-overlay");

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    overlay.classList.add("active");

    setTimeout(() => {
      window.location.href = btn.getAttribute("href");
    }, 800);
  });
});
