/**
 * topbar.js — Fermeture du bandeau d'annonce (mémorisée pour la session).
 */
export function initTopbar() {
  const bar = document.getElementById("topbar");
  const close = document.getElementById("topbar-close");
  if (!bar || !close) return;

  try {
    if (sessionStorage.getItem("syjy-topbar") === "closed") {
      bar.classList.add("is-closed");
    }
  } catch (_) {}

  close.addEventListener("click", () => {
    bar.classList.add("is-closed");
    try {
      sessionStorage.setItem("syjy-topbar", "closed");
    } catch (_) {}
  });
}
