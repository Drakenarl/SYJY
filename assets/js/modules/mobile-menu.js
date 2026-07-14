/**
 * mobile-menu.js — Overlay plein écran.
 *
 * Gère aussi ce que l'ancienne version oubliait :
 *  - verrouillage du scroll du corps sans faire sauter la page
 *  - fermeture à la touche Échap
 *  - piégeage du focus clavier dans le menu ouvert
 *  - fermeture automatique si on repasse en desktop
 */
export function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const overlay = document.getElementById("nav-overlay");
  if (!btn || !overlay) return;

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
    btn.classList.add("is-active");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Fermer le menu");

    const first = focusables()[0];
    if (first) window.setTimeout(() => first.focus(), 260);
  };

  const close = () => {
    overlay.classList.remove("is-open");
    btn.classList.remove("is-active");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Ouvrir le menu");

    document.body.classList.remove("nav-open");
    document.body.style.top = "";
    // On restaure la position exacte : sinon la page saute en haut
    window.scrollTo(0, scrollY);
    btn.focus();
  };

  const isOpen = () => overlay.classList.contains("is-open");

  btn.addEventListener("click", () => (isOpen() ? close() : open()));

  overlay.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      if (isOpen()) close();
    })
  );

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      close();
      return;
    }

    // Le focus ne doit pas s'échapper derrière l'overlay
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

  // Rotation du téléphone / redimensionnement vers le desktop
  window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => {
    if (e.matches && isOpen()) close();
  });
}
