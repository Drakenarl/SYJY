/**
 * theme.js — Bascule clair / sombre.
 *
 * Le thème est appliqué AVANT le rendu par un script inline dans <head>
 * (voir les fichiers HTML) : sans lui, la page flashe en sombre puis
 * repasse en clair. Ce module ne gère que le bouton et la persistance.
 *
 * RÉVÉLATION EN DISQUE — le nouveau thème n'apparaît pas d'un bloc : un
 * disque naît sous le bouton cliqué et s'étend jusqu'à couvrir l'écran.
 * Porté par l'API View Transitions, qui photographie la page avant et
 * après et nous laisse animer la seconde image. Le CSS des pseudo-
 * éléments vit dans components/theme-reveal.css.
 *
 * Deux chemins, jamais trois : avec l'API on révèle au disque, sans elle
 * (ou en mouvement réduit) on garde l'ancien fondu de couleurs. Aucun
 * navigateur ne se retrouve sans bascule.
 */
const KEY = "syjy-theme";
const root = document.documentElement;

/* Assez long pour qu'on suive le bord du disque, assez court pour ne pas
   retarder la lecture. En dessous de ~400ms l'effet redevient un flash. */
const DUREE_REVELATION = 560;

export function getTheme() {
  return root.getAttribute("data-theme") || "light";
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

/**
 * Bascule avec le disque qui s'étend depuis le bouton cliqué.
 * On part du CENTRE DU BOUTON et non d'un coin fixe : le disque semble
 * alors sortir du doigt, et sur grand écran le bouton EST en haut à
 * droite, donc le rendu voulu est le même.
 */
function basculeEnDisque(btn, theme) {
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  /* Rayon final = distance jusqu'au coin le plus ÉLOIGNÉ. Prendre la
     diagonale du viewport ne suffirait pas : depuis un bouton collé au
     bord droit, c'est le coin gauche opposé qu'il faut atteindre, sinon
     un croissant de l'ancien thème survit dans l'angle. */
  const rayon = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  /* animate:false — le fondu global des couleurs ferait double emploi
     sous le masque : on verrait le nouveau thème transparaître partout
     en même temps que le disque avance. Sous le disque, le thème est
     déjà entièrement appliqué. */
  const transition = document.startViewTransition(() =>
    setTheme(theme, { animate: false })
  );

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${rayon}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: DUREE_REVELATION,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {
      /* Transition interrompue (double clic rapide, page masquée) : le
         thème est déjà posé par le callback, il n'y a rien à réparer. */
    });
}

export function initTheme() {
  const buttons = document.querySelectorAll("[data-theme-toggle]");
  if (!buttons.length) return;

  setTheme(getTheme(), { animate: false });

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const suivant = getTheme() === "dark" ? "light" : "dark";

      const mouvementReduit = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (typeof document.startViewTransition !== "function" || mouvementReduit) {
        setTheme(suivant); // fondu de couleurs, comportement historique
        return;
      }

      basculeEnDisque(btn, suivant);
    });
  });

  // Défaut = clair, on ne suit PAS la préférence système. Seul le choix
  // explicite de l'utilisateur (stocké en localStorage) prime et persiste.
}
