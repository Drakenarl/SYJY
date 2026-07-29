/**
 * page-loader.js
 *
 * Écran de chargement 0→100 %, uniquement sur l'accueil.
 * Sur les autres pages : rien.
 *
 * TROIS CAS, et c'est le cœur du fichier :
 *
 *  1. PREMIÈRE ARRIVÉE SUR LE SITE dans la session : compteur complet
 *     (1.8 s mini). « Sur le site », pas « sur l'accueil » : entrer par
 *     collection.html puis venir à l'accueil n'est pas une première visite.
 *     D'où le marqueur syjy-session, posé par TOUTES les pages.
 *
 *  2. RECHARGEMENT de l'accueil : régime BREF, un peu plus court. On ne
 *     retire PAS le rideau immédiatement — le retirer aussitôt produisait
 *     un flash noir de quelques dizaines de ms, le rideau étant déjà peint
 *     quand le JS arrivait. On le tient BRIEF_HOLD, sans compteur, puis on
 *     le lève avec la transition habituelle : l'œil lit un fondu.
 *
 *  3. NAVIGATION INTERNE vers l'accueil (depuis collection, contact…) :
 *     AUCUN rideau. Rejouer un écran de chargement à chaque retour sur
 *     l'accueil est une friction pure, l'utilisateur est déjà sur le site.
 *
 * Distinguer 2 de 3 demande l'API Navigation Timing : sessionStorage seul
 * ne sait pas si la page a été rechargée ou atteinte par un lien.
 *
 * Robustesse réseau : le loader NE PEUT PAS bloquer.
 *  - HARD_TIMEOUT : au bout de 6 s réelles, on lève le rideau quoi qu'il arrive.
 *  - MIN_DURATION : garde une animation lisible (1.8 s minimum) sur les
 *    connexions rapides pour l'effet de marque.
 *  - Progression : basée sur un décompte d'assets qui se COMPLÈTE à coup sûr
 *    (chaque image résout, en succès ou en erreur, ou est ignorée après 4 s).
 */
export function initPageLoader() {
  /* Marqueur de session, posé par TOUTES les pages et LU AVANT d'être
     écrit. C'est lui qui répond à « est-ce la première page du site que ce
     visiteur ouvre dans cette session ? ». Il doit donc être traité avant
     le return anticipé des pages sans loader, sinon une entrée par
     collection.html ne compterait pas comme une arrivée sur le site. */
  let premiereArrivee = true;
  try {
    premiereArrivee = sessionStorage.getItem("syjy-session") !== "true";
    sessionStorage.setItem("syjy-session", "true");
  } catch (e) {
    /* navigation privée / stockage refusé : on retombe sur « première
       arrivée », le pire cas étant de rejouer le rideau. */
  }

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
    // Départ de la cascade du titre du hero (home.css). Posée ICI et pas
    // au chargement : sinon l'animation se jouerait entière derrière le
    // rideau et le visiteur ne verrait qu'un titre déjà en place.
    document.body.classList.add("hero-ready");
    const cleanup = () => loader.remove();
    loader.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 1200);
  }

  /* Rechargement ou lien ? sessionStorage ne fait pas la différence, la
     Navigation Timing la donne. `reload` couvre F5, le bouton recharger et
     location.reload(). Sur un navigateur sans l'API on retombe sur l'ancien
     champ déprécié, et à défaut sur « pas un rechargement » — le cas le
     plus discret. */
  let rechargement = false;
  const navEntry = performance.getEntriesByType
    ? performance.getEntriesByType("navigation")[0]
    : null;
  if (navEntry) {
    rechargement = navEntry.type === "reload";
  } else if (performance.navigation) {
    rechargement = performance.navigation.type === 1; // TYPE_RELOAD
  }

  /* --- Cas 3 : navigation interne vers l'accueil. Aucun rideau.
     hero-ready est posée tout de suite, sinon la cascade du titre —
     qui n'attend que cette classe — ne partirait jamais. */
  if (!premiereArrivee && !rechargement) {
    loader.remove();
    document.body.classList.add("hero-ready");
    return;
  }

  /* --- Cas 2 : rechargement de l'accueil. Régime bref. */
  if (rechargement) {
    const BRIEF_HOLD = 620; // assez pour être lu comme une transition, pas comme un flash
    loader.classList.add("page-loader--brief");
    document.body.classList.add("is-loading");
    setTimeout(raiseCurtain, BRIEF_HOLD);
    return;
  }

  /* --- Cas 1 : première arrivée sur le site. Compteur complet. */

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

    /* Plus rien à mémoriser ici : c'est syjy-session, posé en tête de
       module par toutes les pages, qui porte désormais l'état de session.
       L'ancienne clé syjy-loader-seen ne servait qu'à ce fichier et
       confondait rechargement et navigation interne. */
    raiseCurtain();
  }

  // Rideau forcé : peu importe la connexion, on ne bloque JAMAIS l'utilisateur.
  // Mobile : 800 ms plafond dur pour libérer le TTI.
  const hardCap = isMobile ? MOBILE_HARD_TIMEOUT : HARD_TIMEOUT;
  setTimeout(() => finish(100), hardCap);

  requestAnimationFrame(tick);
}
