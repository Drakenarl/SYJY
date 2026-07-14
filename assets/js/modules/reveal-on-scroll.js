/**
 * reveal-on-scroll.js
 * Ajoute la classe .visible aux éléments .reveal quand ils
 * entrent dans le viewport (IntersectionObserver).
 */
export function initRevealAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // une seule apparition, meilleure perf
        }
      });
    },
    { threshold: 0.1 }
  );

  reveals.forEach((el) => observer.observe(el));
}
