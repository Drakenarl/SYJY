/**
 * header-scroll.js
 *
 * Passe la barre en mode "capsule" au scroll, avec HYSTÉRÉSIS :
 * on entre à 24 px, on ne ressort qu'à 8 px. Sans ça, un scroll
 * lent autour du seuil fait osciller la barre.
 *
 * Mêmes seuils sur toutes les tailles d'écran : la capsule se forme
 * partout. Seul le CONTENU de la barre change selon le breakpoint
 * (liens en desktop, burger en mobile) — ça, c'est du ressort du CSS.
 *
 * La lecture de scrollY se fait dans un requestAnimationFrame :
 * on ne touche au DOM qu'une fois par frame.
 */
export function initHeaderScroll() {
  const shell = document.getElementById("site-header");
  if (!shell) return;

  const ENTER = 24;   // au-delà -> capsule
  const EXIT  = 8;    // en-deçà -> plein
  let isScrolled = false;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    if (!isScrolled && y > ENTER) {
      isScrolled = true;
      shell.classList.add("is-scrolled");
    } else if (isScrolled && y < EXIT) {
      isScrolled = false;
      shell.classList.remove("is-scrolled");
    }
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

  update();
}
