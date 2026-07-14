/**
 * header-scroll.js
 * Ajoute la classe .scrolled au header dès que la page défile,
 * pour déclencher l'animation CSS de rétrécissement de la navbar.
 */
export function initHeaderScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const SCROLL_THRESHOLD = 30;

  const handleScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // état correct même si la page est rechargée en position scrollée
}
