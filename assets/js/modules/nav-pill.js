/**
 * nav-pill.js — La pilule qui glisse sous le lien pointé.
 *
 * Au repos elle se cale sous le lien de la page courante.
 * Au survol elle rejoint le lien pointé. À la sortie, elle revient.
 */
export function initNavPill() {
  const list = document.getElementById("nav-links");
  if (!list) return;

  const pill = list.querySelector(".nav-pill");
  const links = [...list.querySelectorAll("a")];
  if (!pill || !links.length) return;

  const home = list.querySelector("a.active") || links[0];

  const moveTo = (el) => {
    if (!el) return;
    // offsetLeft est relatif au <ul> (position: relative) : pas de reflow coûteux
    pill.style.left = `${el.offsetLeft}px`;
    pill.style.width = `${el.offsetWidth}px`;
  };

  const settle = () => moveTo(home);

  links.forEach((a) => a.addEventListener("mouseenter", () => moveTo(a)));
  list.addEventListener("mouseleave", settle);

  // Position initiale : après le calcul des polices, sinon la mesure est fausse
  const start = () => {
    settle();
    list.classList.add("pill-ready");
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    window.addEventListener("load", start, { once: true });
  }

  // La largeur des liens change avec la taille de l'écran
  let raf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(settle);
  });
}
