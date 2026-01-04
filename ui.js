// Soulsfon 2.0 UI helpers: transitions, toasts, YOU DIED overlay (no sound)
(() => {
  function ensureFadeOverlay() {
    let overlay = document.getElementById("fade-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "fade-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function ensureYouDiedNodes() {
    let ydOverlay = document.getElementById("you-died-overlay");
    let ydText = document.getElementById("you-died");

    if (!ydOverlay) {
      ydOverlay = document.createElement("div");
      ydOverlay.id = "you-died-overlay";
      document.body.appendChild(ydOverlay);
    }
    if (!ydText) {
      ydText = document.createElement("div");
      ydText.id = "you-died";
      ydText.className = "you-died hidden";
      ydText.textContent = "YOU DIED";
      ydText.setAttribute("data-text","YOU DIED");
      document.body.appendChild(ydText);
    }
    try { ydText && ydText.setAttribute && ydText.setAttribute('data-text', ydText.textContent || 'YOU DIED'); } catch {}
    return { ydOverlay, ydText };
  }

  function youDiedEffect() {
    const { ydOverlay, ydText } = ensureYouDiedNodes();
    ydOverlay.classList.add("active");
    ydText.classList.remove("hidden");
    ydText.classList.add("you-died-show");

    window.setTimeout(() => ydOverlay.classList.remove("active"), 850);
    window.setTimeout(() => {
      ydText.classList.add("hidden");
      ydText.classList.remove("you-died-show");
    }, 1750);
  }

  function navigateWithFade(url) {
    const overlay = ensureFadeOverlay();
    overlay.classList.add("active");
    window.setTimeout(() => {
      window.location.href = url;
    }, 520);
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

  // Page fade-in on load (including browser back/forward)
  document.addEventListener("DOMContentLoaded", () => {
    const overlay = ensureFadeOverlay();
    // Start fully dark without anim, then fade out
    overlay.style.transition = "none";
    overlay.classList.add("active");
    // force reflow
    void overlay.offsetHeight;
    overlay.style.transition = "opacity .52s ease";
    requestAnimationFrame(() => overlay.classList.remove("active"));

    // Intercept local navigations for consistent fade
    document.addEventListener("click", (e) => {
      const a = e.target?.closest?.('a[data-transition="fade"], a.nav-link[data-transition="fade"], a.btn[data-transition="fade"], a.mini-link[data-transition="fade"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      // allow new tab / external
      if (a.target === "_blank" || href.startsWith("http") || href.startsWith("mailto:")) return;
      e.preventDefault();
      navigateWithFade(href);
    });
  });

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

  window.SoulUI = { youDiedEffect, toast, navigateWithFade };
})();
