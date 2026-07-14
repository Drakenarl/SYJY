/**
 * main.js — Point d'entrée unique, chargé sur chaque page.
 * Chaque module se désactive tout seul (return anticipé) si les
 * éléments dont il a besoin ne sont pas présents sur la page :
 * ce fichier reste donc identique partout, aucune duplication.
 */
import { initPageLoader } from "./modules/page-loader.js";
import { initHeaderScroll } from "./modules/header-scroll.js";
import { initMobileMenu } from "./modules/mobile-menu.js";
import { initRevealAnimations } from "./modules/reveal-on-scroll.js";
import { initCardGlow } from "./modules/card-glow.js";
import { initDragCanvas } from "./modules/drag-canvas.js";

document.addEventListener("DOMContentLoaded", () => {
  initPageLoader();
  initHeaderScroll();
  initMobileMenu();
  initRevealAnimations();
  initCardGlow();
  initDragCanvas();
});
