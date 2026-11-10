// GOD2 · Component Builder · defilement
//
// De quoi accrocher une animation au défilement sans GSAP, sans ScrollTrigger
// et sans Lenis : situer une piste dans la page, lisser la valeur qui la
// pilote, et ne faire tourner la boucle que pendant que quelque chose bouge.
//
// Le pendant de `heroes/ligneDeTemps.ts`, qui joue en secondes. Ici rien ne se
// déroule tout seul : c'est la molette qui donne le temps.

import { COURBE } from './ligneDeTemps'

export { COURBE }

export function borner(valeur: number, bas = 0, haut = 1) {
  return Math.min(haut, Math.max(bas, valeur))
}

/**
 * L'avancée de `valeur` entre deux bornes, ramenée entre 0 et 1.
 *
 * C'est `gsap.utils.mapRange(depart, fin, 0, 1, valeur)` suivi d'un `clamp`,
 * la paire qu'on retrouve dans presque toutes les démos accrochées au
 * défilement.
 */
export function entre(depart: number, fin: number, valeur: number) {
  if (fin === depart) return 0
  return borner((valeur - depart) / (fin - depart))
}

export function melanger(depart: number, arrivee: number, avancee: number) {
  return depart + (arrivee - depart) * avancee
}

/**
 * `elastic.out(amplitude, periode)` de GSAP.
 *
 * Elle dépasse l'arrivée puis oscille en s'amortissant. Les deux constantes
 * sont celles de GSAP : `p1` retient l'amplitude, `p3` décale la sinusoïde
 * pour que la courbe parte bien de zéro. Sans ce décalage la carte sauterait
 * d'un quart de tour dès la première image.
 */
export function elastiqueSortie(amplitude = 1, periode = 0.3) {
  const hauteur = Math.max(amplitude, 1)
  const cycle = periode / Math.min(amplitude, 1)
  const decalage = (cycle / (Math.PI * 2)) * (Math.asin(1 / hauteur) || 0)
  const pulsation = (Math.PI * 2) / cycle

  return (avancee: number) => {
    if (avancee === 0 || avancee === 1) return avancee
    return hauteur * Math.pow(2, -10 * avancee) * Math.sin((avancee - decalage) * pulsation) + 1
  }
}

/**
 * La courbe par défaut de Lenis.
 *
 * C'est un `expo.out` à un millième près, et ce millième est chez eux : leur
 * courbe finit à 1,001 puis se fait plafonner. On la garde telle quelle, une
 * courbe qui arrive « en avance » ne se rattrape pas en la normalisant.
 */
export const COURBE_LENIS = (avancee: number) => Math.min(1, 1.001 - Math.pow(2, -10 * avancee))

/**
 * Une valeur qui court après une cible, comme le `scrub` de ScrollTrigger.
 *
 * ScrollTrigger ne pose pas l'avancée directement quand on lui donne
 * `scrub: 1` : il relance un tween d'une seconde en `expo.out` vers la
 * nouvelle valeur à chaque image de défilement. Lenis fait la même chose sur
 * la position de la page, avec 1,2 seconde et sa propre courbe. D'où la même
 * pièce pour les deux, à la durée et à la courbe près.
 *
 * Le tween repart du point où on en est, pas de la dernière cible : c'est ce
 * qui évite le à-coup quand on change de sens en plein rattrapage.
 */
export class Rattrapage {
  private depart: number
  private cible: number
  private temps: number

  constructor(
    valeur: number,
    private duree: number,
    private courbe: (avancee: number) => number = COURBE.expoSortie
  ) {
    this.depart = valeur
    this.cible = valeur
    this.temps = duree
  }

  /** Pose une nouvelle cible. Sans effet si c'est déjà celle qu'on vise. */
  vers(cible: number) {
    if (cible === this.cible) return
    this.depart = this.valeur
    this.cible = cible
    this.temps = 0
  }

  /** Avance l'horloge et rend la valeur du moment. */
  avancer(secondes: number) {
    this.temps = Math.min(this.duree, this.temps + secondes)
    return this.valeur
  }

  get valeur() {
    if (this.temps >= this.duree) return this.cible
    return melanger(this.depart, this.cible, this.courbe(this.temps / this.duree))
  }

  /** Vrai tant que le rattrapage n'est pas fini. */
  get bouge() {
    return this.temps < this.duree
  }

  /** Colle à la cible sur-le-champ, pour un redimensionnement ou un retour. */
  poser(valeur: number) {
    this.depart = valeur
    this.cible = valeur
    this.temps = this.duree
  }
}

/**
 * Fait tourner une fonction au défilement, et rien du tout au repos.
 *
 * `rendu` reçoit la position de la page et le temps écoulé depuis l'image
 * précédente. Elle rend `true` tant qu'il lui faut encore des images : un
 * rattrapage en cours, un tween qui finit. Sinon la boucle s'arrête, et
 * seul un défilement ou un redimensionnement la réveille.
 */
export function surDefilement(rendu: (defilement: number, secondes: number) => boolean | void) {
  let boucle = 0
  let horodatage = 0

  function tourner(maintenant: number) {
    boucle = 0
    // Même plafond que `jouer()` : après une très longue image on compte 33 ms
    // plutôt que le temps réel, sinon un rattrapage saute d'un coup à sa fin.
    const brut = horodatage ? (maintenant - horodatage) / 1000 : 0
    horodatage = maintenant
    const secondes = brut > 0.5 ? 0.033 : brut

    if (rendu(window.scrollY, secondes)) boucle = requestAnimationFrame(tourner)
  }

  function reveiller() {
    if (boucle) return
    horodatage = 0
    boucle = requestAnimationFrame(tourner)
  }

  // Le premier rendu compte comme les autres : s'il réclame une suite, la
  // boucle part sans attendre la molette. Sans cela une animation qui se
  // déroule en secondes plutôt qu'au défilement resterait sur sa première
  // image jusqu'au premier geste.
  if (rendu(window.scrollY, 0)) reveiller()

  window.addEventListener('scroll', reveiller, { passive: true })
  window.addEventListener('resize', reveiller)

  return () => {
    if (boucle) cancelAnimationFrame(boucle)
    window.removeEventListener('scroll', reveiller)
    window.removeEventListener('resize', reveiller)
  }
}

/** L'unité `svh` en pixels, celle que les démos emploient pour leurs pistes. */
export function hauteurEcran() {
  return window.innerHeight
}

/** Vrai si la personne a demandé moins d'animation. */
export function econome() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}
