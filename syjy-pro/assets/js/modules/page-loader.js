/**
 * page-loader.js
 * Écran de chargement plein écran avec compteur de 0 à 100%,
 * qui se lève comme un rideau une fois les images de la page prêtes.
 *
 * Comportement :
 * - La progression suit un minimum de temps (DURATION) pour garder
 *   un effet de marque cohérent, mais ne dépasse jamais le chargement
 *   réel des images (pas de "100%" affiché avant que ce soit vrai).
 * - L'animation complète ne joue qu'une fois par session de navigation
 *   (sessionStorage) : en changeant de page, le visiteur revoit un
 *   passage très court plutôt que de subir l'animation à chaque clic.
 */
export function initPageLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  const countEl = document.getElementById("loader-count");
  const barFill = document.getElementById("loader-bar-fill");
  document.body.classList.add("is-loading");

  const alreadySeen = sessionStorage.getItem("syjy-loader-seen") === "true";
  const DURATION = alreadySeen ? 400 : 3200;

  const images = Array.from(document.images);
  const total = images.length || 1;
  let loaded = 0;

  const markLoaded = () => {
    loaded++;
  };
  images.forEach((img) => {
    if (img.complete) {
      markLoaded();
    } else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true }); // une image cassée ne doit pas bloquer le loader
    }
  });

  const start = performance.now();

  function tick(now) {
        // Filet de sécurité : jamais bloqué indéfiniment, même si une image ne charge jamais
    if (now - start > DURATION + 3000) {
      finish();
      return;
    }
    const elapsed = now - start;
    const timeProgress = Math.min(1, elapsed / DURATION);
    const assetProgress = loaded / total;
    // Avance avec le temps, mais jamais beaucoup plus vite que les assets réels
    const progress = Math.min(timeProgress, Math.max(timeProgress * 0.6, assetProgress));
    const percent = Math.round(progress * 100);

    if (countEl) countEl.textContent = percent;
    if (barFill) barFill.style.width = `${percent}%`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      finish();
    }
  }

  function finish() {
    sessionStorage.setItem("syjy-loader-seen", "true");
    loader.classList.add("page-loader--done");
    document.body.classList.remove("is-loading");
    loader.addEventListener("transitionend", () => loader.remove(), { once: true });
  }

  requestAnimationFrame(tick);
}
