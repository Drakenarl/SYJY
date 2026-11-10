// SYJY · la file des pièces, sur l'accueil.

import { useEffect, useRef } from 'react'
import { Parallaxe, TitreDecoupe, econome } from '../effets/effets'
import { PIECES } from '../commun/donnees'
import './file.css'

/* GOD2:glissee · une file de pièces qu'on tire au doigt ou à la souris, et dont
   la photo glisse dans son cadre en sens inverse du mouvement : chaque image
   est agrandie et décalée d'un quart de sa distance au centre de l'écran, la
   file paraît plus profonde qu'elle n'est. Le nom ne se montre au survol que
   si la file est arrêtée depuis deux dixièmes de seconde.

   Repris avec ses constantes. Une différence, et sa raison : dans la pièce, la
   file occupe tout l'écran et prend la molette verticale. Posée au milieu
   d'une page, elle la volerait au défilement ; elle ne prend donc que le
   défilement horizontal (pavé tactile, Maj + molette), le glissé et les
   flèches, et laisse passer le doigt qui monte ou descend. */
const LISSAGE = 0.075
const PLAFOND = 150
const DERIVE = -0.25
const ZOOM = 1.6
const COPIES = 6
const SEUIL_MOBILE = 1000
const PAS = 420
const PAS_MOBILE = 236

export default function File() {
  const racineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const racine = racineRef.current
    if (!racine) return
    const file = racine.querySelector<HTMLElement>('.file-rang')!
    const images = [...racine.querySelectorAll<HTMLImageElement>('.file-vue img')]

    const sobre = econome()
    let pas = PAS
    let position = 0
    let cible = 0
    let boucle = 0
    let tire = false
    let departX = 0
    let departY = 0
    let departCible = 0
    let sens: 'x' | 'y' | null = null
    let parcouru = 0
    let dernierGeste = 0
    let enMouvement = false

    const mesurer = () => {
      pas = racine.clientWidth < SEUIL_MOBILE ? PAS_MOBILE : PAS
    }
    function replier() {
      const suite = pas * PIECES.length
      if (position > -suite) {
        position -= suite
        cible -= suite
      } else if (position < -suite * 4) {
        position += suite
        cible += suite
      }
    }
    function poserDerive() {
      const milieu = racine!.clientWidth / 2
      const marge = racine!.clientWidth + 500
      for (let rang = 0; rang < images.length; rang += 1) {
        const centre = position + rang * pas + pas / 2
        if (centre < -500 || centre > marge) continue
        images[rang].style.transform = `translateX(${((centre - milieu) * DERIVE).toFixed(1)}px) scale(${ZOOM})`
      }
    }
    function poserMouvement(vitesse: number) {
      const bouge = tire || vitesse >= 0.1 || Date.now() - dernierGeste < 200
      if (bouge === enMouvement) return
      enMouvement = bouge
      racine!.style.setProperty('--file-bouge', bouge ? '1' : '0')
    }
    function poser() {
      replier()
      file.style.transform = `translate3d(${position.toFixed(2)}px, 0, 0)`
      poserDerive()
    }
    function tourner() {
      const avant = position
      position += (cible - position) * LISSAGE
      poserMouvement(Math.abs(position - avant))
      if (Math.abs(cible - position) < 0.1 && !enMouvement) {
        position = cible
        boucle = 0
        poser()
        return
      }
      poser()
      boucle = requestAnimationFrame(tourner)
    }
    const relancer = () => {
      if (!boucle) boucle = requestAnimationFrame(tourner)
    }
    function pousser(delta: number) {
      cible += delta
      dernierGeste = Date.now()
      if (sobre) {
        position = cible
        poser()
        return
      }
      relancer()
    }

    function surMolette(e: WheelEvent) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      const brut = e.deltaX * 1.75
      pousser(-Math.max(Math.min(brut, PLAFOND), -PLAFOND))
    }
    function surPresse(e: PointerEvent) {
      if (e.button !== 0) return
      tire = true
      sens = e.pointerType === 'mouse' ? 'x' : null
      departX = e.clientX
      departY = e.clientY
      departCible = cible
      parcouru = 0
      dernierGeste = Date.now()
    }
    function surBouge(e: PointerEvent) {
      if (!tire) return
      const dx = e.clientX - departX
      const dy = e.clientY - departY
      // Au doigt, le premier mouvement franc décide : vertical, la page défile.
      if (!sens) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
        sens = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
      if (sens === 'y') return
      cible = departCible + dx * 1.5
      parcouru = Math.abs(dx)
      if (parcouru > 5) racine!.classList.add('est-tiree')
      dernierGeste = Date.now()
      relancer()
    }
    function surLache() {
      if (!tire) return
      tire = false
      sens = null
      window.setTimeout(() => racine!.classList.remove('est-tiree'), 100)
    }
    function surClic(e: MouseEvent) {
      if (parcouru >= 10) e.preventDefault()
    }
    function auClavier(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') pousser(-pas)
      else if (e.key === 'ArrowLeft') pousser(pas)
    }

    mesurer()
    position = -(PIECES.length * pas * 2)
    cible = position
    poser()

    const veille = new ResizeObserver(() => {
      const avant = pas
      mesurer()
      if (avant !== pas) {
        position = -(PIECES.length * pas * 2)
        cible = position
      }
      poser()
    })
    veille.observe(racine)

    racine.addEventListener('wheel', surMolette, { passive: false })
    racine.addEventListener('pointerdown', surPresse)
    racine.addEventListener('click', surClic, true)
    racine.addEventListener('keydown', auClavier)
    racine.addEventListener('dragstart', (e) => e.preventDefault())
    window.addEventListener('pointermove', surBouge)
    window.addEventListener('pointerup', surLache)
    window.addEventListener('pointercancel', surLache)

    return () => {
      veille.disconnect()
      racine.removeEventListener('wheel', surMolette)
      racine.removeEventListener('pointerdown', surPresse)
      racine.removeEventListener('click', surClic, true)
      racine.removeEventListener('keydown', auClavier)
      window.removeEventListener('pointermove', surBouge)
      window.removeEventListener('pointerup', surLache)
      window.removeEventListener('pointercancel', surLache)
      if (boucle) cancelAnimationFrame(boucle)
    }
  }, [])

  const rangs = Array.from({ length: PIECES.length * COPIES }, (_, rang) => rang)

  return (
    <section className="file">
      <div className="file-entete cadre">
        <Parallaxe vitesse={-0.08}>
          <TitreDecoupe balise="h2" className="affiche file-titre" texte="Les pièces de la saison" accents={['saison']} />
        </Parallaxe>
        <p className="file-aide">Faites glisser la file, ou ouvrez une pièce pour la commander.</p>
      </div>
      <div
        className="file-piste"
        ref={racineRef}
        tabIndex={0}
        aria-label="File des pièces : glisser, ou flèches gauche et droite pour parcourir"
      >
        <div className="file-rang">
          {rangs.map((rang) => {
            const piece = PIECES[rang % PIECES.length]
            const copie = rang >= PIECES.length * 2 && rang < PIECES.length * 3
            return (
              <a
                className="file-piece"
                href={`/collection.html#piece-${rang % PIECES.length}`}
                key={rang}
                tabIndex={copie ? 0 : -1}
                aria-hidden={!copie}
              >
                <div className="file-vue">
                  <picture>
                    <source srcSet={`${piece.image}.webp`} type="image/webp" />
                    <img
                      src={`${piece.image}.jpg`}
                      alt={piece.alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      style={{ objectPosition: piece.cadrage }}
                    />
                  </picture>
                </div>
                <div className="file-legende">
                  <span className="file-nom">{piece.nom}</span>
                  <span className="file-ligne">{piece.ligne}</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
