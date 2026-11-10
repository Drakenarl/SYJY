// SYJY · l'ouverture de la collection.

import { useEffect, useRef, useState } from 'react'
import { COURBE, LigneDeTemps, jouer } from '../moteur/ligneDeTemps'
import { econome } from '../effets/effets'
import { PIECES } from '../commun/donnees'
import './agrandi.css'

/* GOD2:agrandi · une vignette au centre, qu'un clic ouvre jusqu'au plein écran
   pendant que la pièce en place s'éloigne. Deux mouvements se croisent, le
   second rattrape le premier : on entre dans l'image au lieu de la
   remplacer. Durées, courbes et retards de la pièce ; ses vitrines
   deviennent les pièces de la collection, et le titre est leur nom court. */
const APERCU = { large: 250, haut: 350 }
const APERCU_MOBILE = { large: 170, haut: 238 }
const RESERVE = 200
const RESERVE_MOBILE = 140
const SORTIE = -175
const SEUIL_MOBILE = 640

const source = (image: string) => `${image}.webp`

function decoupe(avancee: number) {
  const petit = (50 - 50 * avancee).toFixed(2)
  const grand = (50 + 50 * avancee).toFixed(2)
  return `polygon(${petit}% ${petit}%, ${grand}% ${petit}%, ${grand}% ${grand}%, ${petit}% ${grand}%)`
}

export default function Agrandi() {
  const racineRef = useRef<HTMLDivElement>(null)
  const [actif, setActif] = useState(0)

  useEffect(() => {
    const racine = racineRef.current
    if (!racine) return
    const fond = racine.querySelector<HTMLImageElement>('.agr-fond img')!
    const boite = racine.querySelector<HTMLElement>('.agr-cadre')!
    const apercu = racine.querySelector<HTMLImageElement>('.agr-cadre img')!
    const enveloppeActive = racine.querySelector<HTMLElement>('.agr-actif')!
    const enveloppeSuivante = racine.querySelector<HTMLElement>('.agr-suivant')!
    const titreActif = enveloppeActive.querySelector<HTMLElement>('h2')!
    const titreSuivant = enveloppeSuivante.querySelector<HTMLElement>('h2')!

    const sobre = econome()
    let courant = 0
    let suivant = 1
    let occupe = false
    let defaire: (() => void) | null = null

    const mobile = () => racine.clientWidth <= SEUIL_MOBILE
    const petitCadre = () => (mobile() ? APERCU_MOBILE : APERCU)
    const reserve = () => (mobile() ? RESERVE_MOBILE : RESERVE)

    function ecrireTitre(noeud: HTMLElement, texte: string) {
      noeud.textContent = ''
      return Array.from(texte).map((signe) => {
        const lettre = document.createElement('span')
        lettre.textContent = signe
        noeud.appendChild(lettre)
        return lettre
      })
    }
    let lettresActives = ecrireTitre(titreActif, PIECES[courant].court)
    let lettresSuivantes = ecrireTitre(titreSuivant, PIECES[suivant].court)

    const monter = (noeud: HTMLElement, y: number) => {
      noeud.style.transform = `translateY(${y.toFixed(2)}px)`
    }
    function poserApercu(avancee: number, large: number, haut: number) {
      boite.style.clipPath = decoupe(avancee)
      boite.style.width = `${large.toFixed(1)}px`
      boite.style.height = `${haut.toFixed(1)}px`
    }

    function reposer() {
      const petit = petitCadre()
      fond.src = source(PIECES[courant].image)
      fond.alt = PIECES[courant].alt
      fond.style.objectPosition = PIECES[courant].cadrage
      fond.style.transform = 'scale(1)'
      apercu.src = source(PIECES[suivant].image)
      apercu.alt = ''
      apercu.style.objectPosition = PIECES[suivant].cadrage
      poserApercu(0, petit.large, petit.haut)
      lettresActives = ecrireTitre(titreActif, PIECES[courant].court)
      lettresSuivantes = ecrireTitre(titreSuivant, PIECES[suivant].court)
      monter(enveloppeActive, 0)
      monter(enveloppeSuivante, 0)
      setActif(courant)
    }

    function decouvrirApercu() {
      const petit = petitCadre()
      if (sobre) return poserApercu(1, petit.large, petit.haut)
      defaire?.()
      defaire = jouer(
        new LigneDeTemps([
          { debut: 0, duree: 0.7, courbe: COURBE.quartSortie, poser: (a) => poserApercu(a, petit.large, petit.haut) },
        ]),
        undefined,
        false,
      )
    }

    function avancer() {
      if (occupe) return
      occupe = true
      const petit = petitCadre()
      const haute = reserve()
      const pleineLargeur = racine!.clientWidth
      const pleineHauteur = racine!.clientHeight
      const sortantes = lettresActives
      const entrantes = lettresSuivantes

      function conclure() {
        courant = suivant
        suivant = (suivant + 1) % PIECES.length
        reposer()
        occupe = false
        decouvrirApercu()
      }
      if (sobre) {
        defaire?.()
        defaire = null
        return conclure()
      }

      const ligne = new LigneDeTemps([
        { debut: 0, duree: 1.5, courbe: COURBE.quartSortie, poser: (a) => (fond.style.transform = `scale(${(1 + 0.8 * a).toFixed(4)})`) },
        {
          debut: 0,
          duree: 0.38,
          courbe: COURBE.quartSortie,
          decalage: 0.04,
          nombre: sortantes.length,
          poser: (a, i) => monter(sortantes[i], SORTIE * a),
        },
        { debut: 0.16, duree: 0.2, courbe: COURBE.quartSortie, poser: (a) => monter(enveloppeActive, SORTIE * a) },
        { debut: 0, duree: 0.85, courbe: COURBE.quartSortie, poser: (a) => monter(enveloppeSuivante, -haute * a) },
        {
          debut: 0.22,
          duree: 0.4,
          courbe: COURBE.quartSortie,
          decalage: 0.04,
          nombre: entrantes.length,
          poser: (a, i) => monter(entrantes[i], haute * (1 - a)),
        },
        { debut: 0.18, duree: 0.7, courbe: COURBE.quartSortie, poser: (a) => (boite.style.clipPath = decoupe(a)) },
        {
          debut: 0.18,
          duree: 1.6,
          courbe: COURBE.quartSortie,
          poser: (a) => {
            boite.style.width = `${(petit.large + (pleineLargeur - petit.large) * a).toFixed(1)}px`
            boite.style.height = `${(petit.haut + (pleineHauteur - petit.haut) * a).toFixed(1)}px`
          },
        },
      ])
      defaire?.()
      defaire = jouer(ligne, conclure, false)
    }

    const auClic = (e: MouseEvent) => {
      if ((e.target as Element).closest('a')) return
      avancer()
    }
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        if ((e.target as Element).closest('a')) return
        e.preventDefault()
        avancer()
      }
    }

    reposer()
    decouvrirApercu()
    racine.addEventListener('click', auClic)
    racine.addEventListener('keydown', auClavier)
    return () => {
      racine.removeEventListener('click', auClic)
      racine.removeEventListener('keydown', auClavier)
      defaire?.()
    }
  }, [])

  const piece = PIECES[actif]
  return (
    <section
      className="agr"
      ref={racineRef}
      tabIndex={0}
      aria-roledescription="carrousel"
      aria-label="Les pièces SYJY : cliquer ou appuyer sur Entrée pour la suivante"
    >
      <div className="agr-fond">
        <img alt="" decoding="async" />
      </div>
      <div className="agr-apercu">
        <div className="agr-cadre">
          <img alt="" decoding="async" />
        </div>
      </div>

      <div className="agr-infos">
        <p className="agr-compte" aria-live="polite">
          {String(actif + 1).padStart(2, '0')} / {String(PIECES.length).padStart(2, '0')}
        </p>
        <p className="agr-nom">{piece.nom}</p>
        <p className="agr-detail">{piece.detail}</p>
        <a className="agr-voir lien-trace" href={`#piece-${actif}`}>
          Voir la pièce
        </a>
      </div>
      <p className="agr-aide" aria-hidden="true">
        Cliquez pour la pièce suivante
      </p>

      <div className="agr-legendes" aria-hidden="true">
        <div className="agr-actif">
          <h2 className="affiche" />
        </div>
        <div className="agr-suivant">
          <h2 className="affiche" />
        </div>
      </div>
    </section>
  )
}
