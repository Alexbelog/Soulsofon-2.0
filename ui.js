// Soulsofon UI: sounds, transitions, small helpers
(() => {
  const STORAGE_SOUND = "soulsofon_sound_enabled";
  const STORAGE_AMBIENT = "soulsofon_ambient_enabled";

  const isSoundEnabled = () => localStorage.getItem(STORAGE_SOUND) !== "0";
  const isAmbientEnabled = () => localStorage.getItem(STORAGE_AMBIENT) !== "0";

  const audio = {
    hover: new Audio("sounds/hover.wav"),
    click: new Audio("sounds/click.wav"),
    unlock: new Audio("sounds/unlock.wav"),
    ambient: new Audio("sounds/ambient.wav"),
    died: new Audio("sounds/died.wav"),
  };

  audio.ambient.loop = true;
  audio.ambient.volume = 0.35;

  function safePlay(aud) {
    if (!isSoundEnabled()) return;
    try {
      aud.currentTime = 0;
      aud.play().catch(() => {});
    } catch {}
  }

  function startAmbientIfAllowed() {
    if (!isAmbientEnabled()) return;
    if (!isSoundEnabled()) return;
    // Browsers require user gesture; we'll try and also retry on first click.
    audio.ambient.play().catch(() => {});
  }

  function ensureOverlay() {
    let overlay = document.getElementById("fade-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "fade-overlay";
      document.body.prepend(overlay);
    }
    return overlay;
  }

  function installTransitions() {
    const overlay = ensureOverlay();
    document.querySelectorAll('a[data-transition="fade"]').forEach(a => {
      a.addEventListener("click", (e) => {
        // Allow normal behavior for new tab / modifiers.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const href = a.getAttribute("href");
        if (!href || href.startsWith("#")) return;
        e.preventDefault();
        safePlay(audio.click);
        overlay.classList.add("active");
        setTimeout(() => { window.location.href = href; }, 520);
      });
    });

    // Fade-in on load
    requestAnimationFrame(() => {
      overlay.classList.add("ready");
      setTimeout(() => overlay.classList.remove("active"), 40);
    });
  }

  function installSounds() {
    // Hover / click for buttons & clickable items
    const hoverSel = [
      "button",
      ".btn",
      ".start-button",
      ".nav-link",
      ".game-btn",
      ".boss-card",
      ".ach-card",
      ".toggle-pill",
      ".ach-done"
    ].join(",");

    document.addEventListener("pointerenter", (e) => {
      const t = e.target.closest(hoverSel);
      if (!t) return;
      safePlay(audio.hover);
    }, { capture: true });

    document.addEventListener("click", (e) => {
      const t = e.target.closest(hoverSel);
      if (!t) return;
      safePlay(audio.click);
      // Ambient can start on first interaction
      if (audio.ambient.paused) startAmbientIfAllowed();
    }, { capture: true });
  }

  function installSoundToggle() {
    const mount = document.querySelector("[data-sound-toggle-mount]");
    if (!mount) return;

    const pill = document.createElement("button");
    pill.className = "toggle-pill";
    pill.type = "button";

    const render = () => {
      const s = isSoundEnabled();
      const a = isAmbientEnabled();
      pill.innerHTML = `
        <span class="dot ${s ? "on" : ""}"></span>
        <span class="label">${s ? "Sound" : "Sound Off"}</span>
        <span class="sep"></span>
        <span class="label">${a ? "Ambient" : "Ambient Off"}</span>
      `;
      pill.setAttribute("aria-pressed", String(s));
    };

    pill.addEventListener("click", () => {
      const s = isSoundEnabled();
      localStorage.setItem(STORAGE_SOUND, s ? "0" : "1");
      if (s) {
        try { audio.ambient.pause(); } catch {}
      } else {
        startAmbientIfAllowed();
      }
      render();
    });

    // Right click toggles ambient separately (nice hidden feature)
    pill.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const a = isAmbientEnabled();
      localStorage.setItem(STORAGE_AMBIENT, a ? "0" : "1");
      if (!isAmbientEnabled()) {
        try { audio.ambient.pause(); } catch {}
      } else {
        startAmbientIfAllowed();
      }
      render();
      safePlay(audio.click);
    });

    mount.appendChild(pill);
    render();
  }

  
  function installEmbers() {
    const host = document.querySelector("[data-embers]");
    if (!host) return;
    // generate embers once
    if (host.children.length) return;
    const count = 36;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("i");
      const left = Math.random() * 100;
      const delay = Math.random() * 6;
      const dur = 6 + Math.random() * 10;
      const size = 2 + Math.random() * 3;
      p.style.left = left + "vw";
      p.style.top = (-10 - Math.random()*40) + "vh";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = (-delay) + "s";
      host.appendChild(p);
    }
  }  function ensureToastHost(){
    let host = document.getElementById("toast-host");
    if (!host){
      host = document.createElement("div");
      host.id = "toast-host";
      document.body.appendChild(host);
    }
    return host;
  }

  function toast({ title, desc, icon="✦", tag="Достижение получено" }){
    const host = ensureToastHost();
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-main">
        <div class="toast-tag">${tag}</div>
        <div class="toast-title"></div>
        <div class="toast-desc"></div>
      </div>
    `;
    t.querySelector(".toast-title").textContent = title || "";
    t.querySelector(".toast-desc").textContent = desc || "";
    host.appendChild(t);

    // Force reflow for animation
    void t.offsetHeight;
    t.classList.add("show");

    setTimeout(() => t.classList.add("hide"), 4200);
    setTimeout(() => t.remove(), 5200);
  }

  function youDiedEffect(){
    const yd = document.getElementById("you-died");
    if (yd){
      yd.classList.remove("hidden");
      yd.classList.add("you-died-show");
      setTimeout(() => {
        yd.classList.remove("you-died-show");
        yd.classList.add("hidden");
      }, 1700);
    }
    const ov = document.getElementById("you-died-overlay");
    if (ov){
      ov.classList.add("active");
      setTimeout(() => ov.classList.remove("active"), 900);
    }
    safePlay(audio.died);
  }

  // Public helper for other scripts
  window.SoulUI = {
    playUnlock: () => safePlay(audio.unlock),
    playClick: () => safePlay(audio.click),
    playHover: () => safePlay(audio.hover),
    playDied: () => safePlay(audio.died),
    toast,
    toastUnlock: (title, desc, icon="✦") => {
      safePlay(audio.unlock);
      toast({ title, desc, icon, tag: "Достижение получено" });
    },
    youDiedEffect,
    startAmbient: () => startAmbientIfAllowed(),
  };

  document.addEventListener("DOMContentLoaded", () => {
    installEmbers();
    installTransitions();
    installSounds();
    installSoundToggle();
    // If user already interacted before (some browsers), try starting ambient
    startAmbientIfAllowed();
  });
})();
