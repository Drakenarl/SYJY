/**
 * theme.js — Bascule clair / sombre.
 *
 * Le thème est appliqué AVANT le rendu par un script inline dans <head>
 * (voir les fichiers HTML) : sans lui, la page flashe en sombre puis
 * repasse en clair. Ce module ne gère que le bouton et la persistance.
 */
const KEY = "syjy-theme";
const root = document.documentElement;

export function getTheme() {
  return root.getAttribute("data-theme") || "dark";
}

export function setTheme(theme, { animate = true } = {}) {
  if (animate) {
    // On n'active les transitions de couleur QUE pendant la bascule.
    // Sinon chaque hover du site traînerait pendant 400ms.
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 450);
  }
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch (_) {
    /* navigation privée : on ignore, le thème vaut pour la session */
  }
  document
    .querySelectorAll("[data-theme-toggle]")
    .forEach((btn) => btn.setAttribute("aria-pressed", String(theme === "light")));
}

export function initTheme() {
  const buttons = document.querySelectorAll("[data-theme-toggle]");
  if (!buttons.length) return;

  setTheme(getTheme(), { animate: false });

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    });
  });

  // Si l'utilisateur n'a jamais choisi, on suit le système en direct.
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", (e) => {
    let stored = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch (_) {}
    if (!stored) setTheme(e.matches ? "light" : "dark");
  });
}
