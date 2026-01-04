/* Soulsfon 2.0 — very simple admin gate for static hosting
   IMPORTANT: this is UI-only. Anyone with devtools can still change localStorage.
   Change ADMIN_PASSWORD to your own. */
(() => {
  const KEY = "soulsfon_admin";
  const ADMIN_PASSWORD = "1337";

  function isAdmin(){
    return localStorage.getItem(KEY) === "1";
  }

  async function login(){
    const pass = prompt("Админ-пароль Soulsfon 2.0:");
    if (pass === null) return false;
    if (pass === ADMIN_PASSWORD){
      localStorage.setItem(KEY, "1");
      location.reload();
      return true;
    }
    alert("Неверный пароль.");
    return false;
  }

  function logout(){
    localStorage.removeItem(KEY);
    location.reload();
  }

  window.SoulAuth = { isAdmin, login, logout };
})();
