/**
 * main.js — Point d'entrée unique, chargé sur chaque page.
 * Chaque module se désactive tout seul (return anticipé) si les éléments
 * dont il a besoin sont absents : ce fichier reste identique partout.
 */
import { initTheme } from "./modules/theme.js";
import { initTopbar } from "./modules/topbar.js";
import { initPageLoader } from "./modules/page-loader.js";
import { initHeaderScroll } from "./modules/header-scroll.js";
import { initNavPill } from "./modules/nav-pill.js";
import { initMobileMenu } from "./modules/mobile-menu.js";
import { initRevealAnimations } from "./modules/reveal-on-scroll.js";
import { initCardGlow } from "./modules/card-glow.js";
import { initDragCanvas } from "./modules/drag-canvas.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();          // en premier : le reste hérite des bonnes couleurs
  initTopbar();
  initPageLoader();
  initHeaderScroll();
  initNavPill();
  initMobileMenu();
  initRevealAnimations();
  initCardGlow();
  initDragCanvas();
});
