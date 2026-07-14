/**
 * drag-canvas.js
 * Rend une "piste" d'images plus grande que son cadre visible
 * déplaçable à la souris/au doigt (Pointer Events, donc souris ET
 * tactile sans code séparé), avec un léger effet d'inertie au
 * relâchement — comme un vrai freeze/déplacement de canvas.
 *
 * Générique : réutilisable ailleurs qu'en page d'accueil, il suffit
 * du markup .drag-canvas-viewport > .drag-canvas-track > .drag-tile
 */
export function initDragCanvas() {
  const viewport = document.querySelector(".drag-canvas-viewport");
  const track = document.querySelector(".drag-canvas-track");
  if (!viewport || !track) return;

  const FRICTION = 0.92;
  const MIN_VELOCITY = 0.4;

  let boundsX = 0;
  let boundsY = 0;
  let posX = 0;
  let posY = 0;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startPosX = 0;
  let startPosY = 0;

  let lastMoveX = 0;
  let lastMoveY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let inertiaFrame = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function applyTransform() {
    track.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
  }

  function computeBounds({ recenter = false } = {}) {
    const viewportRect = viewport.getBoundingClientRect();
    boundsX = Math.max(0, track.offsetWidth - viewportRect.width);
    boundsY = Math.max(0, track.offsetHeight - viewportRect.height);

    if (recenter) {
      // Position de départ : légèrement décalée plutôt que collée en haut-à-gauche
      posX = -boundsX / 2;
      posY = -boundsY / 3;
    } else {
      // Recadre la position existante si les nouvelles limites sont plus petites (resize fenêtre)
      posX = clamp(posX, -boundsX, 0);
      posY = clamp(posY, -boundsY, 0);
    }
    applyTransform();
  }

  function onPointerDown(event) {
    isDragging = true;
    viewport.classList.add("is-dragging");
    startX = event.clientX;
    startY = event.clientY;
    startPosX = posX;
    startPosY = posY;
    lastMoveX = event.clientX;
    lastMoveY = event.clientY;
    velocityX = 0;
    velocityY = 0;
    cancelAnimationFrame(inertiaFrame);
    viewport.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!isDragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    posX = clamp(startPosX + dx, -boundsX, 0);
    posY = clamp(startPosY + dy, -boundsY, 0);
    applyTransform();

    velocityX = event.clientX - lastMoveX;
    velocityY = event.clientY - lastMoveY;
    lastMoveX = event.clientX;
    lastMoveY = event.clientY;
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove("is-dragging");
    runInertia();
  }

  function runInertia() {
    function step() {
      velocityX *= FRICTION;
      velocityY *= FRICTION;

      if (Math.abs(velocityX) < MIN_VELOCITY && Math.abs(velocityY) < MIN_VELOCITY) {
        return;
      }

      posX = clamp(posX + velocityX, -boundsX, 0);
      posY = clamp(posY + velocityY, -boundsY, 0);
      applyTransform();

      inertiaFrame = requestAnimationFrame(step);
    }
    inertiaFrame = requestAnimationFrame(step);
  }

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);
  viewport.addEventListener("pointerleave", () => {
    if (isDragging) onPointerUp();
  });
  window.addEventListener("resize", () => computeBounds());

  // On attend que les images de la piste soient chargées pour mesurer
  // ses vraies dimensions avant de calculer les limites de déplacement.
  const images = track.querySelectorAll("img");
  let toLoad = images.length;

  if (toLoad === 0) {
    computeBounds({ recenter: true });
  } else {
    images.forEach((img) => {
      const onOneLoaded = () => {
        toLoad--;
        if (toLoad === 0) computeBounds({ recenter: true });
      };
      if (img.complete) {
        onOneLoaded();
      } else {
        img.addEventListener("load", onOneLoaded, { once: true });
        img.addEventListener("error", onOneLoaded, { once: true });
      }
    });
  }
}
