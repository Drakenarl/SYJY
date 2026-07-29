/**
 * page-loader.js
 *
 * Écran de chargement 0→100 %, uniquement sur l'accueil.
 * Sur les autres pages : rien.
 *
 * DEUX RÉGIMES, et c'est le cœur du fichier :
 *  - PREMIÈRE VISITE de la session : le compteur complet (1.8 s mini).
 *  - RETOUR / RECHARGEMENT de l'accueil : régime BREF. On ne retire PAS le
 *    rideau immédiatement. Le retirer aussitôt produisait un flash noir de
 *    quelques dizaines de ms — le rideau était déjà peint quand le JS
 *    arrivait, et il disparaissait d'un coup. On le tient volontairement
 *    BRIEF_HOLD, sans compteur, puis on le lève avec la même transition
 *    que d'habitude : l'œil lit un fondu, plus un clignotement.
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

  // Ne joue que sur l'accueil
  const isHome = loader.dataset.home === "true";
  if (!isHome) {
    loader.remove();
    return;
  }

  // Le rideau part avec sa transition CSS ; on retire du DOM après.
  // Filet : si la transitionend n'arrive jamais (préf. reduce-motion), on force.
  function raiseCurtain() {
    loader.classList.add("page-loader--done");
    document.body.classList.remove("is-loading");
    const cleanup = () => loader.remove();
    loader.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 1200);
  }

  // --- Régime BREF : rechargement / retour sur l'accueil dans la même session
  const alreadySeen = sessionStorage.getItem("syjy-loader-seen") === "true";
  if (alreadySeen) {
    const BRIEF_HOLD = 620; // assez pour être lu comme une transition, pas comme un flash
    loader.classList.add("page-loader--brief");
    document.body.classList.add("is-loading");
    setTimeout(raiseCurtain, BRIEF_HOLD);
    return;
  }

  const countEl = document.getElementById("loader-count");
  const barFill = document.getElementById("loader-bar-fill");
  document.body.classList.add("is-loading");

  // Sur mobile, on écourte tout : l'utilisateur veut le contenu vite,
  // l'effet de marque compte moins que le TTI (Time To Interactive).
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const MIN_DURATION = 1800;   // animation minimum, connexion rapide (desktop)
  const HARD_TIMEOUT = 6000;   // rideau forcé au-delà — plus JAMAIS de blocage
  const MOBILE_HARD_TIMEOUT = 800; // sur mobile, on lève le rideau vite

  // --- Suivi des assets : chaque image résout à coup sûr en 4 s max
  //
  // On ne compte QUE les images non-lazy. Une image `loading="lazy"` hors
  // écran ne se charge jamais tant qu'on ne scrolle pas : elle tombait donc
  // systématiquement dans le filet des 4 s, et le premier chargement durait
  // ~5 s au lieu des 1.8 s prévues. Attendre un asset que le navigateur a
  // justement décidé de ne pas charger n'a aucun sens.
  const images = Array.from(document.images).filter(
    (img) => img.loading !== "lazy"
  );
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
    raiseCurtain();
  }

  // Rideau forcé : peu importe la connexion, on ne bloque JAMAIS l'utilisateur.
  // Mobile : 800 ms plafond dur pour libérer le TTI.
  const hardCap = isMobile ? MOBILE_HARD_TIMEOUT : HARD_TIMEOUT;
  setTimeout(() => finish(100), hardCap);

  requestAnimationFrame(tick);
}
