// Soulsfon 2.0 UI helpers: transitions, toasts, YOU DIED overlay (no sound)
(() => {
  function ensureOverlay() {
    let overlay = document.getElementById("fade-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "fade-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function youDiedEffect() {
    const overlay = ensureOverlay();
    overlay.classList.add("show");
    overlay.innerHTML = `
      <div class="you-died-wrap" aria-hidden="true">
        <div class="you-died-text">YOU DIED</div>
      </div>
    `;
    window.setTimeout(() => overlay.classList.remove("show"), 750);
    window.setTimeout(() => { overlay.innerHTML = ""; }, 900);
  }

  function toast(title, subtitle = "", iconUrl = "") {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      document.body.appendChild(host);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `
      ${iconUrl ? `<img class="toast-ic" alt="" src="${iconUrl}">` : `<div class="toast-ic rune">✦</div>`}
      <div class="toast-body">
        <div class="toast-title">${escapeHtml(title)}</div>
        ${subtitle ? `<div class="toast-sub">${escapeHtml(subtitle)}</div>` : ``}
      </div>
    `;
    host.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    window.setTimeout(() => {
      t.classList.remove("show");
      window.setTimeout(() => t.remove(), 350);
    }, 3200);
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  // Hover/active polish (no sound)
  document.addEventListener("pointerover", (e) => {
    const el = e.target.closest?.(".btn, .boss-card, .game-item, .ach-card");
    if (!el) return;
    el.classList.add("hovering");
    window.setTimeout(() => el.classList.remove("hovering"), 250);
  }, { passive: true });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.(".btn");
    if (!btn) return;
    btn.classList.add("pressed");
    window.setTimeout(() => btn.classList.remove("pressed"), 180);
  }, { passive: true });

  window.SoulUI = { youDiedEffect, toast };
})();
