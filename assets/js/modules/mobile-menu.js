/**
 * mobile-menu.js
 *
 * Panneau latéral droit + voile cliquable.
 *
 * Fonctionnalités :
 *  - Ouverture/fermeture via burger, X, voile, ou touche Échap
 *  - Verrouillage du scroll du body sans faire sauter la page
 *  - Piégeage du focus clavier dans le panneau ouvert
 *  - Fermeture par swipe horizontal (droite = ferme, geste naturel)
 *  - Fermeture automatique si on repasse en desktop
 */
export function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const overlay = document.getElementById("nav-overlay");
  const scrim = document.getElementById("nav-scrim");
  const closeBtn = document.getElementById("nav-overlay-close");

  if (!btn || !overlay || !scrim) return;

  let scrollY = 0;

  const focusables = () =>
    [...overlay.querySelectorAll('a[href], button:not([disabled])')].filter(
      (el) => el.offsetParent !== null
    );

  const open = () => {
    scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add("nav-open");

    overlay.classList.add("is-open");
    scrim.classList.add("is-open");
    btn.classList.add("is-active");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Fermer le menu");

    const first = focusables()[0];
    if (first) window.setTimeout(() => first.focus(), 320);
  };

  const close = () => {
    overlay.classList.remove("is-open");
    scrim.classList.remove("is-open");
    btn.classList.remove("is-active");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Ouvrir le menu");

    document.body.classList.remove("nav-open");
    document.body.style.top = "";
    window.scrollTo(0, scrollY);
    btn.focus();
  };

  const isOpen = () => overlay.classList.contains("is-open");

  // --- Déclencheurs ---
  btn.addEventListener("click", () => (isOpen() ? close() : open()));
  scrim.addEventListener("click", close);
  if (closeBtn) closeBtn.addEventListener("click", close);

  overlay.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      if (isOpen()) close();
    })
  );

  // --- Clavier : Échap ferme, Tab reste piégé dans le panneau ---
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      close();
      return;
    }

    if (e.key === "Tab") {
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- Swipe vers la droite pour fermer ---
  // Seuil : 60 px de déplacement horizontal, plus que vertical
  let touchStartX = 0;
  let touchStartY = 0;
  let touchTracking = false;

  overlay.addEventListener(
    "touchstart",
    (e) => {
      if (!isOpen() || e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchTracking = true;
    },
    { passive: true }
  );

  overlay.addEventListener(
    "touchend",
    (e) => {
      if (!touchTracking) return;
      touchTracking = false;

      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = Math.abs(t.clientY - touchStartY);

      // Swipe horizontal net (dx > 60 vers la droite) et pas un scroll vertical
      if (dx > 60 && dy < 40) {
        close();
      }
    },
    { passive: true }
  );

  // --- Bascule vers desktop pendant que le menu est ouvert ---
  window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => {
    if (e.matches && isOpen()) close();
  });
}
