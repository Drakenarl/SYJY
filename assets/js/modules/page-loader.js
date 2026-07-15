/**
 * page-loader.js
 *
 * Écran de chargement 0→100 %, uniquement sur l'accueil et une seule fois
 * par session (sessionStorage). Sur les autres pages : rien.
 *
 * Robustesse réseau : le loader NE PEUT PAS bloquer.
 *  - HARD_TIMEOUT : au bout de 6 s réelles, on lève le rideau quoi qu'il arrive.
 *  - MIN_DURATION : garde une animation lisible (1.8 s minimum) sur les
 *    connexions rapides pour l'effet de marque.
 *  - Progression : basée sur un décompte d'assets qui se COMPLÈTE à coup sûr
 *    (chaque image résout, en succès ou en erreur, ou est ignorée après 4 s).
 */
export function initPageLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return; // pas de loader dans le DOM = rien à faire

  // Ne joue que sur l'accueil, et une seule fois par session
  const isHome = loader.dataset.home === "true";
  const alreadySeen = sessionStorage.getItem("syjy-loader-seen") === "true";
  if (!isHome || alreadySeen) {
    loader.remove();
    return;
  }

  const countEl = document.getElementById("loader-count");
  const barFill = document.getElementById("loader-bar-fill");
  document.body.classList.add("is-loading");

  const MIN_DURATION = 1800;   // animation minimum, connexion rapide
  const HARD_TIMEOUT = 6000;   // rideau forcé au-delà — plus JAMAIS de blocage

  // --- Suivi des assets : chaque image résout à coup sûr en 4 s max
  const images = Array.from(document.images);
  const total = Math.max(images.length, 1);
  let loaded = 0;

  const bump = () => { loaded += 1; };

  images.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      bump();
      return;
    }
    let done = false;
    const settle = () => { if (!done) { done = true; bump(); } };
    img.addEventListener("load",  settle, { once: true });
    img.addEventListener("error", settle, { once: true });
    // Filet : si une image ne firera jamais son event (proxy, cache bizarre),
    // on la considère "faite" après 4 s. Sans ça, un asset lourd gèle tout.
    setTimeout(settle, 4000);
  });

  // --- Boucle d'affichage
  const start = performance.now();
  let finished = false;

  function tick(now) {
    if (finished) return;

    const elapsed = now - start;
    const timeRatio  = Math.min(1, elapsed / MIN_DURATION);
    const assetRatio = loaded / total;

    // La progression suit le plus lent des deux, MAIS ne colle jamais
    // sous 90 % du temps écoulé -> plus de gel à 60 %.
    const progress = Math.max(
      Math.min(timeRatio, assetRatio),
      timeRatio * 0.9
    );

    const percent = Math.round(Math.min(progress, 0.99) * 100);
    if (countEl) countEl.textContent = percent;
    if (barFill) barFill.style.width = `${percent}%`;

    // Fin normale : les deux conditions remplies
    if (timeRatio >= 1 && assetRatio >= 1) {
      finish(100);
    } else {
      requestAnimationFrame(tick);
    }
  }

  function finish(percent = 100) {
    if (finished) return;
    finished = true;
    if (countEl) countEl.textContent = percent;
    if (barFill) barFill.style.width = `${percent}%`;

    sessionStorage.setItem("syjy-loader-seen", "true");
    loader.classList.add("page-loader--done");
    document.body.classList.remove("is-loading");

    // Le rideau part avec sa transition CSS ; on retire du DOM après.
    // Filet : si la transitionend n'arrive jamais (préf. reduce-motion), on force.
    const cleanup = () => loader.remove();
    loader.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 1200);
  }

  // Rideau forcé : peu importe la connexion, on ne bloque JAMAIS l'utilisateur.
  setTimeout(() => finish(100), HARD_TIMEOUT);

  requestAnimationFrame(tick);
}
