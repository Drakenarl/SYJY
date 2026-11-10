// GOD2 · Component Builder · ligneDeTemps
//
// De quoi jouer une animation d'entrée chronométrée sans GSAP : des pistes qui
// démarrent à un instant donné, durent un temps donné, et écrivent une valeur
// entre 0 et 1 adoucie par une courbe.
//
// Les heroes sont presque tous bâtis là-dessus : rien n'est accroché au
// défilement, tout se déroule en secondes depuis l'ouverture de la page.

/** Les courbes de GSAP, reprises telles quelles. */
export const COURBE = {
  lineaire: (avancee: number) => avancee,

  /** `expo.out` : part très vite, s'arrête en douceur. */
  expoSortie: (avancee: number) => (avancee === 1 ? 1 : 1 - Math.pow(2, -10 * avancee)),

  /**
   * `expo.inOut` : quasi immobile au départ, puis d'un coup.
   *
   * Volontairement non normalisée, comme chez eux : à l'instant zéro elle vaut
   * 0,0005 et non 0. C'est invisible, mais la recaler décalerait toute la
   * courbe et ferait démarrer le mouvement plus tôt.
   */
  expoEntreeSortie: (avancee: number) => {
    if (avancee === 0 || avancee === 1) return avancee
    const double = avancee * 2
    if (double < 1) return 0.5 * Math.pow(2, 10 * (double - 1))
    return 0.5 * (2 - Math.pow(2, -10 * (double - 1)))
  },

  /**
   * `expo.in` : quasi immobile, puis tout à la fin.
   *
   * Non normalisée comme la leur : à l'instant zéro elle vaut 0,001 et non 0.
   */
  expoEntree: (avancee: number) => (avancee === 0 ? 0 : Math.pow(2, 10 * (avancee - 1))),

  /** `power4.out` : quintique, malgré son nom. */
  quintSortie: (avancee: number) => 1 - Math.pow(1 - avancee, 5),

  /** `power3.out` : quartique. */
  quartSortie: (avancee: number) => 1 - Math.pow(1 - avancee, 4),

  /** `power2.inOut` : cubique des deux côtés. */
  cubeEntreeSortie: (avancee: number) => {
    if (avancee < 0.5) return 4 * avancee * avancee * avancee
    return 1 - Math.pow(-2 * avancee + 2, 3) / 2
  },

  /** `power3.inOut` : quartique des deux côtés. */
  quartEntreeSortie: (avancee: number) => {
    if (avancee < 0.5) return 8 * Math.pow(avancee, 4)
    return 1 - Math.pow(-2 * avancee + 2, 4) / 2
  },

  /** `power4.inOut` : quintique des deux côtés. */
  quintEntreeSortie: (avancee: number) => {
    if (avancee < 0.5) return 16 * Math.pow(avancee, 5)
    return 1 - Math.pow(-2 * avancee + 2, 5) / 2
  },

  /** `power2.in` : cubique, mais qui part de rien et accélère. */
  cubeEntree: (avancee: number) => avancee * avancee * avancee,

  /** `power2.out` : cubique. */
  cubeSortie: (avancee: number) => 1 - Math.pow(1 - avancee, 3),

  /** `power3.in` : quartique, la retournée de `quartSortie`. */
  quartEntree: (avancee: number) => Math.pow(avancee, 4),

  /** `power1.out` : carrée. C'est aussi la courbe par défaut de GSAP. */
  carreSortie: (avancee: number) => 1 - Math.pow(1 - avancee, 2),

  /** `power1.in` : la carrée retournée, qui part de rien et accélère. */
  carreEntree: (avancee: number) => avancee * avancee,

  /** `sine.out` : un quart de sinusoïde, la plus douce des sorties. */
  sinusSortie: (avancee: number) => Math.sin((avancee * Math.PI) / 2),

  /** `sine.in` : la même, retournée. Part de rien et accélère jusqu'au bout. */
  sinusEntree: (avancee: number) => 1 - Math.cos((avancee * Math.PI) / 2),

  /** `sine.inOut` : une demi-sinusoïde, qui part et arrive au même rythme. */
  sinusEntreeSortie: (avancee: number) => -(Math.cos(Math.PI * avancee) - 1) / 2,

  /** `power1.inOut` : carrée des deux côtés. */
  carreEntreeSortie: (avancee: number) => {
    if (avancee < 0.5) return 2 * avancee * avancee
    return 1 - Math.pow(-2 * avancee + 2, 2) / 2
  },
}

/**
 * `back.out(depassement)` : arrive au-delà de sa cible, puis revient dessus.
 *
 * Le paramètre est celui que GSAP appelle « overshoot », et vaut 1,70158 par
 * défaut. Il se lit tel quel dans leur code : `back.out(1.2)` donne 1,2.
 */
export function retourSortie(depassement: number) {
  return (avancee: number) => {
    const reste = avancee - 1
    return reste * reste * ((depassement + 1) * reste + depassement) + 1
  }
}

/**
 * `elastic.out(amplitude, periode)` : dépasse sa cible, puis oscille dessus.
 *
 * Les deux paramètres sont ceux de leur greffon, dans le même ordre :
 * `elastic.out(1, 0.55)` donne une amplitude de un et une période de 0,55.
 * L'amplitude fixe la hauteur du premier dépassement, la période l'espacement
 * des oscillations, plus courte donc plus nerveuse.
 *
 * La courbe part exactement de zéro grâce au déphasage `decalage`, sans quoi
 * elle commencerait au-dessus de sa valeur de départ.
 */
export function elastiqueSortie(amplitude = 1, periode = 0.3) {
  const tour = Math.PI * 2
  const hauteur = amplitude >= 1 ? amplitude : 1
  const cycle = periode / (amplitude < 1 ? amplitude : 1)
  const decalage = (cycle / tour) * (Math.asin(1 / hauteur) || 0)

  return (avancee: number) => {
    if (avancee === 0 || avancee === 1) return avancee
    return hauteur * Math.pow(2, -10 * avancee) * Math.sin(((avancee - decalage) * tour) / cycle) + 1
  }
}

/**
 * `back.in(depassement)` : recule d'abord, puis part.
 *
 * La retournée de `retourSortie`. Deux démos s'en servent pour lancer un objet
 * hors de l'écran : le petit recul donne l'élan.
 */
export function retourEntree(depassement: number) {
  return (avancee: number) => avancee * avancee * ((depassement + 1) * avancee - depassement)
}

/**
 * Une bézier cubique de CSS, résolue numériquement.
 *
 * Plusieurs démos déclarent leur propre courbe par `CustomEase.create(...)`
 * plutôt que d'en prendre une du catalogue. Le point (x1, y1) et le point
 * (x2, y2) sont ceux qu'on lit dans leur code, dans le même ordre.
 *
 * On cherche le paramètre du tracé qui donne l'abscisse voulue, puis on lit
 * l'ordonnée à ce paramètre. Newton converge en trois ou quatre tours sur ces
 * courbes ; la bissection sert de filet quand la pente s'aplatit.
 */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const surAxe = (t: number, a: number, b: number) => {
    const inverse = 1 - t
    return 3 * inverse * inverse * t * a + 3 * inverse * t * t * b + t * t * t
  }
  const pente = (t: number, a: number, b: number) => {
    const inverse = 1 - t
    return 3 * inverse * inverse * a + 6 * inverse * t * (b - a) + 3 * t * t * (1 - b)
  }

  return (avancee: number) => {
    if (avancee <= 0) return 0
    if (avancee >= 1) return 1

    let t = avancee
    for (let essai = 0; essai < 5; essai += 1) {
      const ecart = surAxe(t, x1, x2) - avancee
      if (Math.abs(ecart) < 1e-5) return surAxe(t, y1, y2)
      const derivee = pente(t, x1, x2)
      if (Math.abs(derivee) < 1e-6) break
      t -= ecart / derivee
    }

    let bas = 0
    let haut = 1
    t = avancee
    while (haut - bas > 1e-5) {
      if (surAxe(t, x1, x2) < avancee) bas = t
      else haut = t
      t = (bas + haut) / 2
    }
    return surAxe(t, y1, y2)
  }
}

/**
 * Une courbe donnée par un chemin, comme les `CustomEase.create(nom, "M0,0 C…")`.
 *
 * Plusieurs démos dessinent leur courbe en deux morceaux plutôt que d'en
 * choisir une du catalogue. Chaque morceau est une bézier cubique entre deux
 * points de passage ; ramené à son propre carré, il redevient une bézier
 * unitaire, celle que `bezier()` sait déjà résoudre.
 *
 * S'écrit avec les points du chemin, dans l'ordre : le départ, puis trois
 * points par morceau (les deux contrôles et l'arrivée).
 */
export function chemin(...points: [number, number][]) {
  const morceaux: { x0: number; x1: number; y0: number; y1: number; courbe: (a: number) => number }[] = []

  for (let index = 1; index + 2 < points.length + 1; index += 3) {
    const [x0, y0] = points[index - 1]
    const [cx1, cy1] = points[index]
    const [cx2, cy2] = points[index + 1]
    const [x1, y1] = points[index + 2]
    const largeur = x1 - x0
    const hauteur = y1 - y0
    morceaux.push({
      x0,
      x1,
      y0,
      y1,
      courbe: bezier(
        (cx1 - x0) / largeur,
        (cy1 - y0) / hauteur,
        (cx2 - x0) / largeur,
        (cy2 - y0) / hauteur
      ),
    })
  }

  return (avancee: number) => {
    if (avancee <= 0) return 0
    if (avancee >= 1) return 1
    const morceau = morceaux.find((piece) => avancee <= piece.x1) ?? morceaux[morceaux.length - 1]
    const part = (avancee - morceau.x0) / (morceau.x1 - morceau.x0)
    return morceau.y0 + (morceau.y1 - morceau.y0) * morceau.courbe(part)
  }
}

export type Piste = {
  /** Instant de départ, en secondes depuis le début. */
  debut: number
  duree: number
  courbe?: (avancee: number) => number
  /**
   * Retard ajouté à chaque élément d'un groupe.
   *
   * Un nombre pour un retard régulier, `rang × decalage`. Une liste pour un
   * retard par élément : c'est ce que fait le `stagger` de GSAP quand il part
   * du centre ou des bords, où les retards ne se suivent pas dans l'ordre des
   * rangs. Voir `etaler()` dans le composant qui en a besoin.
   */
  decalage?: number | number[]
  /** Combien d'éléments le groupe compte, si `decalage` est posé. */
  nombre?: number
  /**
   * Écrit l'état.
   *
   * `poser(avancee)` pour une piste simple, `poser(avancee, rang)` pour un
   * groupe décalé : elle est alors appelée une fois par élément.
   */
  poser: (avancee: number, rang: number) => void
}

/**
 * Une suite de pistes jouée en temps réel.
 *
 * Chaque piste n'est écrite que si son avancée a bougé : une animation de six
 * secondes dont la moitié des pistes sont à l'arrêt ne coûte alors presque
 * rien.
 */
/** Le retard d'un élément, que la piste le donne au pas ou élément par élément. */
function retardDe(piste: Piste, rang: number) {
  if (Array.isArray(piste.decalage)) return piste.decalage[rang] ?? 0
  return (piste.decalage ?? 0) * rang
}

export class LigneDeTemps {
  private pistes: Piste[]
  private ecrits: number[][]
  private fin: number

  constructor(pistes: Piste[]) {
    this.pistes = pistes
    this.ecrits = pistes.map((piste) => new Array(piste.nombre ?? 1).fill(Number.NaN))
    this.fin = pistes.reduce((tard, piste) => {
      let dernier = 0
      for (let rang = 0; rang < (piste.nombre ?? 1); rang += 1) {
        dernier = Math.max(dernier, retardDe(piste, rang))
      }
      return Math.max(tard, piste.debut + piste.duree + dernier)
    }, 0)
  }

  /** Durée totale, en secondes. */
  get duree() {
    return this.fin
  }

  /** Pose l'état à un instant donné. Renvoie `true` si quelque chose a bougé. */
  poser(temps: number) {
    let bouge = false

    for (let index = 0; index < this.pistes.length; index += 1) {
      const piste = this.pistes[index]
      const memoire = this.ecrits[index]
      const nombre = piste.nombre ?? 1
      const courbe = piste.courbe ?? COURBE.lineaire

      for (let rang = 0; rang < nombre; rang += 1) {
        const brute = (temps - piste.debut - retardDe(piste, rang)) / piste.duree

        // Une piste qui n'a pas commencé n'écrit rien du tout, pas même sa
        // valeur de départ. Sans cela, une piste tardive pose son état initial
        // dès la première image et écrase celle qui joue encore, ou déclenche
        // trop tôt ce qu'elle avait à faire une seule fois. L'état de départ
        // appartient à la feuille de style, pas à l'ordonnanceur.
        if (brute < 0) {
          // Une piste jamais écrite n'écrit toujours rien. Mais une piste déjà
          // jouée et repassée sous son départ, ce qui n'arrive qu'en marche
          // arrière, revient sur son état de début : leur greffon fait de même,
          // un tween au repos rendant son premier état plutôt que rien du tout.
          if (Number.isNaN(memoire[rang])) continue
          const depart = courbe(0)
          const trace = Math.round(depart * 1000) / 1000
          if (trace === memoire[rang]) continue
          memoire[rang] = trace
          piste.poser(depart, rang)
          bouge = true
          continue
        }

        const fini = brute >= 1
        const avancee = courbe(fini ? 1 : brute)

        // Au millième : en deçà, aucune écriture ne change un pixel à l'écran.
        //
        // La toute dernière écriture fait exception et se reconnaît à sa
        // marque : elle doit tomber sur l'avancée exacte, sinon l'arrondi la
        // confond avec l'image précédente et la saute. Une piste finirait
        // alors à 0,9996 au lieu de 1, et ce qui ne se joue qu'à l'arrivée ne
        // se jouerait jamais.
        const marque = fini ? Number.POSITIVE_INFINITY : Math.round(avancee * 1000) / 1000
        if (marque === memoire[rang]) continue
        memoire[rang] = marque
        piste.poser(avancee, rang)
        bouge = true
      }
    }

    return bouge
  }

  /** Oublie ce qui a été écrit, pour rejouer depuis le début. */
  oublier() {
    for (const memoire of this.ecrits) memoire.fill(Number.NaN)
  }
}

/**
 * Fait tourner une ligne de temps, et s'arrête quand elle est finie.
 *
 * Renvoie de quoi tout défaire. La boucle se met en veille avec l'onglet, et
 * ne redémarre pas une animation déjà jouée.
 *
 * `rattraper` vaut vrai pour une animation qui part au chargement, quand
 * l'horloge de GSAP tourne déjà et lui vole une image d'avance. Le poser à
 * faux pour une animation déclenchée par un clic sur une page où rien ne
 * bouge : là, l'horloge de GSAP dort et repart de zéro, comme la nôtre.
 */
export function jouer(ligne: LigneDeTemps, surFin?: () => void, rattraper = true) {
  let temps = 0
  let horodatage = 0
  let boucle = 0
  let rattrapage = rattraper

  function tourner(maintenant: number) {
    // Le temps réel, sauf après une très longue image : GSAP fait de même et
    // compte alors 33 ms (son `lagSmoothing(500, 33)`). Plafonner plus bas,
    // à un dixième de seconde, faisait prendre du retard à toute la ligne dès
    // que quelques images dépassaient 100 ms.
    const brut = horodatage ? (maintenant - horodatage) / 1000 : 0
    const secondes = brut > 0.5 ? 0.033 : brut
    horodatage = maintenant
    temps += secondes

    // GSAP date une animation de la dernière image écoulée, pas de l'instant
    // où on l'a créée : à sa première image, sa ligne de temps a déjà avancé
    // d'une image entière. On reprend cette image dès qu'on en connaît la
    // durée, c'est-à-dire à la deuxième. Sans cela toute la ligne traîne d'une
    // image, et chaque élément d'un groupe décalé part une image trop tard.
    if (rattrapage && secondes > 0) {
      rattrapage = false
      temps += secondes
    }

    ligne.poser(temps)

    if (temps < ligne.duree) {
      boucle = requestAnimationFrame(tourner)
    } else {
      boucle = 0
      surFin?.()
    }
  }

  function reprendre() {
    if (!boucle && temps < ligne.duree && !document.hidden) {
      horodatage = 0
      boucle = requestAnimationFrame(tourner)
    }
  }

  ligne.poser(0)
  boucle = requestAnimationFrame(tourner)
  document.addEventListener('visibilitychange', reprendre)

  return () => {
    if (boucle) cancelAnimationFrame(boucle)
    document.removeEventListener('visibilitychange', reprendre)
  }
}
