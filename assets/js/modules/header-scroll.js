/**
 * header-scroll.js
 * Passe la barre en mode "capsule" dès que la page défile.
 * Le calcul est repoussé dans un requestAnimationFrame : on ne
 * touche au DOM qu'une fois par frame, pas à chaque événement scroll.
 */
export function initHeaderScroll() {
  const shell = document.getElementById("site-header");
  if (!shell) return;

  const THRESHOLD = 24;
  let ticking = false;

  const update = () => {
    shell.classList.toggle("is-scrolled", window.scrollY > THRESHOLD);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  update(); // état correct si la page est rechargée en position scrollée
}
