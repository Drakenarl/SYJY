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
 *
 * "FLOU AU REPOS" (téléphone uniquement) — voir bloc plus bas.
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

  /* ------------------------------------------------------------------
     "FLOU AU REPOS" — TÉLÉPHONE UNIQUEMENT (<= 600px)

     Le backdrop-filter d'une barre position:fixed est le motif de scroll
     le plus lourd en CSS : le navigateur re-floute la zone derrière la
     capsule À CHAQUE FRAME tant que le filtre est actif. Baisser le rayon
     n'a réduit que l'ampleur, pas le repaint par frame.

     Solution : pendant le scroll ACTIF, on pose .is-scrolling sur le shell.
     Le CSS (mobile.css, bloc @media max-width:600px) coupe alors le
     backdrop-filter et bascule sur un fond opaque -> plus aucun re-flou.
     À l'arrêt, on retire .is-scrolling -> le fond redevient translucide
     (transition douce) et le flou givré revient, là où l'œil le regarde.

     DOUBLE SÉCURITÉ mobile-only : la classe n'est posée que si le
     média-query téléphone est vrai (ci-dessous), ET la règle CSS vit
     elle-même dans @media (max-width:600px). Desktop/iPad ne voient rien.
     ------------------------------------------------------------------ */
  const phone = window.matchMedia("(max-width: 600px)");
  let isScrolling = false;
  let idleTimer = null;

  const endScrolling = () => {
    if (!isScrolling) return;
    isScrolling = false;
    shell.classList.remove("is-scrolling");
  };

  const markScrolling = () => {
    // Desktop / iPad : on ne touche JAMAIS à .is-scrolling (flou constant).
    if (!phone.matches) return;
    if (!isScrolling) {
      isScrolling = true;
      shell.classList.add("is-scrolling");
    }
    // Debounce : scroll considéré terminé après 150 ms sans nouvel event.
    // Fiable partout, y compris bas de gamme Android sans "scrollend".
    clearTimeout(idleTimer);
    idleTimer = setTimeout(endScrolling, 150);
  };

  window.addEventListener(
    "scroll",
    () => {
      markScrolling();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  // Amélioration : "scrollend" (là où il existe) coupe net dès l'arrêt réel
  // sans attendre le debounce. Inoffensif ailleurs (retrait d'une classe absente).
  window.addEventListener("scrollend", endScrolling, { passive: true });

  // Repasser au-dessus de 600 px pendant un scroll ne doit pas laisser
  // la classe collée : on nettoie l'état si le média-query devient faux.
  phone.addEventListener("change", (event) => {
    if (!event.matches) endScrolling();
  });

  update();
}
