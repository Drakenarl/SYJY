/**
 * card-glow.js
 * Fait suivre un halo doré la position de la souris sur les
 * cartes .feature-box (page d'accueil), via variables CSS.
 */
export function initCardGlow() {
  const cards = document.querySelectorAll(".feature-box");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    });
  });
}
