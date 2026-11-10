// SYJY · un texte dont les lignes remontent de sous leur masque.

import { createElement, useEffect, useRef } from 'react'
import { econome } from './effets'
import './lignes.css'

/* GOD2:lignes · chaque bloc remonte ligne par ligne en entrant dans l'écran.
   Durée d'une ligne, retard entre deux lignes, repère de départ et courbe
   (power4.out) sont ceux de la pièce. La cascade part quand le haut du bloc
   passe aux trois quarts de l'écran, puis se déroule en temps : on la confie
   donc à une transition CSS par ligne, sans boucle à faire tourner. */
const DUREE = 1
const DECALAGE = 0.1
const REPERE = 0.75

/**
 * Découpe un bloc en lignes, chacune dans son masque. Les lignes dépendent de
 * la largeur réelle de la colonne : on pose les mots, on laisse le navigateur
 * composer, on relève où il a coupé, et on regroupe.
 */
function decouper(bloc: HTMLElement, texte: string) {
  const mots: HTMLElement[] = []
  const fragment = document.createDocumentFragment()
  for (const morceau of texte.split(/(\s+)/)) {
    if (!morceau) continue
    if (!morceau.trim()) {
      fragment.append(document.createTextNode(morceau))
      continue
    }
    const mot = document.createElement('span')
    mot.textContent = morceau
    fragment.append(mot)
    mots.push(mot)
  }
  bloc.replaceChildren(fragment)

  const groupes: string[][] = []
  let sommet = Number.NaN
  for (const mot of mots) {
    if (Number.isNaN(sommet) || Math.abs(mot.offsetTop - sommet) > 2) {
      groupes.push([])
      sommet = mot.offsetTop
    }
    groupes[groupes.length - 1].push(mot.textContent ?? '')
  }

  const masques = groupes.map((groupe, rang) => {
    const masque = document.createElement('span')
    masque.className = 'lignes-masque'
    const ligne = document.createElement('span')
    ligne.className = 'lignes-ligne'
    // L'espace de fin garde les mots séparés au copier et à la lecture d'écran.
    ligne.textContent = groupe.join(' ') + (rang < groupes.length - 1 ? ' ' : '')
    masque.append(ligne)
    return masque
  })
  bloc.replaceChildren(...masques)
  return masques.map((m) => m.firstElementChild as HTMLElement)
}

type LignesProps = {
  textes: string[]
  balise?: 'p' | 'h2' | 'h3'
  className?: string
  /** Un retard avant la première ligne, en secondes. */
  delai?: number
}

export default function Lignes({ textes, balise = 'p', className = '', delai = 0 }: LignesProps) {
  const cadreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cadre = cadreRef.current
    if (!cadre || econome()) return
    const blocs = [...cadre.children] as HTMLElement[]
    let parti = false

    function preparer() {
      let rang = 0
      blocs.forEach((bloc, index) => {
        for (const ligne of decouper(bloc, textes[index])) {
          ligne.style.transitionDelay = `${(delai + rang * DECALAGE).toFixed(2)}s`
          ligne.style.transitionDuration = `${DUREE}s`
          rang += 1
        }
      })
      cadre!.classList.toggle('est-parti', parti)
    }

    preparer()
    cadre.classList.add('est-decoupe')
    // Le découpage dépend de la fonte réelle : relevé avant qu'elle arrive,
    // il compterait les lignes de la police de secours.
    document.fonts?.ready.then(preparer)

    const guetteur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return
        parti = true
        cadre.classList.add('est-parti')
        guetteur.disconnect()
      },
      { rootMargin: `0px 0px -${Math.round((1 - REPERE) * 100)}% 0px` },
    )
    guetteur.observe(cadre)

    let attente = 0
    const auRedimensionnement = () => {
      clearTimeout(attente)
      attente = window.setTimeout(preparer, 150)
    }
    window.addEventListener('resize', auRedimensionnement)
    return () => {
      guetteur.disconnect()
      clearTimeout(attente)
      window.removeEventListener('resize', auRedimensionnement)
      blocs.forEach((bloc, index) => bloc.replaceChildren(document.createTextNode(textes[index])))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={cadreRef} className={`lignes ${className}`}>
      {textes.map((texte) => createElement(balise, { key: texte.slice(0, 32) }, texte))}
    </div>
  )
}
