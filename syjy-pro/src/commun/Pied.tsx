// SYJY · le pied de page.

import { useEffect, useRef } from 'react'
import { COURBE_LENIS, Rattrapage, econome, entre, melanger, surDefilement } from '../moteur/defilement'
import { DEVISE, EMAIL, PAGES, RESEAUX, TELEPHONE, commander } from './donnees'
import './pied.css'

/* GOD2:pied-deplie · le pied ne fait qu'une partie de l'écran et rogne ce qui
   dépasse ; son contenu part remonté de trente-cinq pour cent et redescend à
   sa place au fil de son arrivée. Il avance moins vite que la page et se
   découvre plutôt qu'il n'apparaît. Lissage, retrait et courbe de la pièce. */
const LISSAGE = 1.2
const RETRAIT = -35

export default function Pied() {
  const piedRef = useRef<HTMLElement>(null)
  const boiteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pied = piedRef.current
    const boite = boiteRef.current
    if (!pied || !boite) return
    const doux = !econome()
    let debut = 0
    let course = 1

    function relever() {
      const vue = pied!.getBoundingClientRect()
      debut = vue.top + window.scrollY - window.innerHeight
      course = Math.max(1, pied!.offsetHeight)
    }
    relever()

    const lisse = new Rattrapage(window.scrollY, LISSAGE, COURBE_LENIS)
    function poser(position: number) {
      const avancee = entre(debut, debut + course, position)
      boite!.style.transform = `translateY(${melanger(RETRAIT, 0, avancee).toFixed(2)}%)`
    }
    const arreter = surDefilement((defilement, secondes) => {
      if (doux) lisse.vers(defilement)
      else lisse.poser(defilement)
      poser(lisse.avancer(secondes))
      return lisse.bouge
    })
    function reprendre() {
      relever()
      lisse.poser(window.scrollY)
      poser(window.scrollY)
    }
    // La page grandit encore après le montage (polices, images) : on relève
    // aussi quand le corps change de taille, sinon le départ est faux.
    const veille = new ResizeObserver(reprendre)
    veille.observe(document.body)
    return () => {
      arreter()
      veille.disconnect()
    }
  }, [])

  return (
    <footer ref={piedRef} className="pied">
      <div ref={boiteRef} className="pied-boite">
        <div className="pied-haut">
          <p className="pied-devise affiche">{DEVISE}</p>
          <div className="pied-colonnes">
            <nav className="pied-colonne" aria-label="Pages">
              <h2>Pages</h2>
              {PAGES.map((page) => (
                <a key={page.lien} href={page.lien} className="lien-trace">
                  {page.nom}
                </a>
              ))}
            </nav>
            <div className="pied-colonne">
              <h2>La maison</h2>
              <a href={commander()} target="_blank" rel="noopener" className="lien-trace">
                WhatsApp
              </a>
              {RESEAUX.map((reseau) => (
                <a key={reseau.nom} href={reseau.lien} target="_blank" rel="noopener" className="lien-trace">
                  {reseau.nom}
                </a>
              ))}
              <a href={`mailto:${EMAIL}`} className="lien-trace">
                {EMAIL}
              </a>
              <span>{TELEPHONE}</span>
            </div>
          </div>
        </div>

        <div className="pied-bas">
          <p className="pied-nom affiche" aria-hidden="true">
            SYJY
          </p>
          <div className="pied-mentions">
            <span>© 2026 SYJY</span>
            <span>Atelier à Cotonou, Bénin</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
