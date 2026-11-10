// SYJY · l'en-tête et le menu.

import { useEffect, useRef, useState } from 'react'
import { COURBE, LigneDeTemps, bezier } from '../moteur/ligneDeTemps'
import { econome, lenisCourant } from '../effets/effets'
import { EMAIL, PAGES, RESEAUX, TELEPHONE, commander } from './donnees'
import Marque from './Marque'
import './entete.css'

/* GOD2:battants · le menu s'ouvre en deux battants. Chaque moitié de l'écran
   découpe un panneau ivoire deux fois trop grand, posé à l'envers, qui se
   remet à plat autour de son bord intérieur ; les intitulés montent ensuite
   de sous leur masque. Fermer parcourt la même ligne de temps à l'envers.
   On en garde la courbe, les durées et les retards au chiffre près ; les
   rayons de la démo deviennent les pages de la maison et ses comptes. */
const BATTANT = bezier(0.85, 0, 0.15, 1)
const DUREE_BATTANT = 1
const DUREE_LIGNE = 0.75
const DEPART_LIGNES = 0.6
const RETARD_LIGNE = 0.08

type EnteteProps = {
  /** La page commence sur une photo sombre : l'en-tête part en clair. */
  clair?: boolean
  /** La page actuelle, pour la marquer dans la navigation. */
  ici: string
}

export default function Entete({ clair = false, ici }: EnteteProps) {
  const [ouvert, setOuvert] = useState(false)
  const [colle, setColle] = useState(false)
  const racineRef = useRef<HTMLDivElement>(null)
  const ouvertRef = useRef(false)
  const relancerRef = useRef<(() => void) | null>(null)

  // L'en-tête prend un fond une fois la première hauteur d'écran passée :
  // avant, il se pose sur la photo et n'a besoin de rien.
  useEffect(() => {
    let demande = 0
    const relever = () => {
      demande = 0
      setColle(window.scrollY > window.innerHeight * 0.6)
    }
    const planifier = () => {
      if (!demande) demande = requestAnimationFrame(relever)
    }
    relever()
    window.addEventListener('scroll', planifier, { passive: true })
    return () => window.removeEventListener('scroll', planifier)
  }, [])

  useEffect(() => {
    const racine = racineRef.current
    if (!racine) return
    const battants = racine.querySelectorAll<HTMLElement>('.battants-panneau')
    const lignes = racine.querySelectorAll<HTMLElement>('.battants-ligne')

    const ligneDeTemps = new LigneDeTemps([
      {
        debut: 0,
        duree: DUREE_BATTANT,
        courbe: BATTANT,
        nombre: battants.length,
        poser(avancee, rang) {
          const sens = rang === 0 ? 1 : -1
          battants[rang].style.transform = `rotate(${sens * 180 * (1 - avancee)}deg) scale(2)`
        },
      },
      {
        debut: DEPART_LIGNES,
        duree: DUREE_LIGNE,
        courbe: COURBE.quartSortie,
        decalage: RETARD_LIGNE,
        nombre: lignes.length,
        poser(avancee, rang) {
          lignes[rang].style.transform = `translateY(${110 * (1 - avancee)}%)`
        },
      },
    ])

    const sobre = econome()
    let temps = 0
    let horodatage = 0
    let boucle = 0

    function tourner(maintenant: number) {
      const brut = horodatage ? (maintenant - horodatage) / 1000 : 0
      horodatage = maintenant
      const pas = brut > 0.5 ? 0.033 : brut
      temps += ouvertRef.current ? pas : -pas
      const butee = ouvertRef.current ? ligneDeTemps.duree : 0
      const arrive = ouvertRef.current ? temps >= butee : temps <= butee
      if (arrive) temps = butee
      ligneDeTemps.poser(temps)
      if (arrive) {
        boucle = 0
        horodatage = 0
        if (!ouvertRef.current) racine!.classList.remove('est-deploye')
        return
      }
      boucle = requestAnimationFrame(tourner)
    }

    relancerRef.current = () => {
      racine.classList.add('est-deploye')
      if (sobre) {
        temps = ouvertRef.current ? ligneDeTemps.duree : 0
        ligneDeTemps.poser(temps)
        if (!ouvertRef.current) racine.classList.remove('est-deploye')
        return
      }
      if (boucle) return
      horodatage = performance.now()
      boucle = requestAnimationFrame(tourner)
    }

    return () => {
      relancerRef.current = null
      if (boucle) cancelAnimationFrame(boucle)
    }
  }, [])

  function basculer(suite = !ouvertRef.current) {
    if (suite === ouvertRef.current) return
    ouvertRef.current = suite
    setOuvert(suite)
    // Le menu ouvert tient la page : on ne défile pas sous les battants.
    if (suite) lenisCourant()?.stop()
    else lenisCourant()?.start()
    document.documentElement.classList.toggle('menu-ouvert', suite)
    relancerRef.current?.()
  }

  // `?menu=1` ouvre le menu au chargement, pour le regarder.
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('menu')) return
    ouvertRef.current = false
    basculer(true)
  }, [])

  useEffect(() => {
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') basculer(false)
    }
    addEventListener('keydown', auClavier)
    return () => removeEventListener('keydown', auClavier)
  }, [])

  const classes = ['entete', clair && !colle ? 'entete--clair' : '', colle ? 'est-colle' : '', ouvert ? 'est-ouvert' : '']
  return (
    <div className="battants" ref={racineRef}>
      <header className={classes.join(' ')}>
        <a href="/" className="entete-marque" aria-label="SYJY, accueil">
          <Marque />
        </a>

        <nav className="entete-nav" aria-label="Pages">
          {PAGES.slice(1).map((page) => (
            <a
              key={page.lien}
              href={page.lien}
              className="lien-trace"
              aria-current={ici === page.lien ? 'page' : undefined}
            >
              {page.nom}
            </a>
          ))}
        </nav>

        <div className="entete-actions">
          <a className="entete-commander lien-trace" href={commander()} target="_blank" rel="noopener">
            Commander sur mesure
          </a>
          <button
            type="button"
            className="entete-menu"
            onClick={() => basculer()}
            aria-expanded={ouvert}
            aria-controls="menu-battants"
          >
            <span className="entete-menu-mots">
              <span>Menu</span>
              <span aria-hidden="true">Fermer</span>
            </span>
          </button>
        </div>
      </header>

      <div className={`battants-menu${ouvert ? ' est-ouvert' : ''}`} id="menu-battants" aria-hidden={!ouvert}>
        <div className="battants-fond" aria-hidden="true">
          <div className="battants-moitie battants-moitie--gauche">
            <div className="battants-panneau battants-panneau--gauche" />
          </div>
          <div className="battants-moitie battants-moitie--droite">
            <div className="battants-panneau battants-panneau--droite" />
          </div>
        </div>

        <div className="battants-contenu">
          <nav className="battants-colonne battants-colonne--pages" aria-label="Menu">
            {PAGES.map((page, rang) => (
              <a
                className="battants-lien"
                href={page.lien}
                key={page.lien}
                tabIndex={ouvert ? 0 : -1}
                aria-current={ici === page.lien ? 'page' : undefined}
              >
                <span className="battants-masque">
                  <span className="battants-ligne">
                    <span className="battants-rang">0{rang + 1}</span>
                    {page.nom}
                  </span>
                </span>
              </a>
            ))}
          </nav>

          <div className="battants-colonne battants-colonne--maison">
            <span className="battants-masque battants-photo" aria-hidden="true">
              <span className="battants-ligne">
                <picture>
                  <source srcSet="/img/collection-01.webp" type="image/webp" />
                  <img src="/img/collection-01.jpg" alt="" loading="lazy" decoding="async" />
                </picture>
              </span>
            </span>
            <a className="battants-lien battants-lien--petit" href={commander()} target="_blank" rel="noopener" tabIndex={ouvert ? 0 : -1}>
              <span className="battants-masque">
                <span className="battants-ligne">Commander sur WhatsApp</span>
              </span>
            </a>
            {RESEAUX.map((reseau) => (
              <a
                className="battants-lien battants-lien--petit"
                href={reseau.lien}
                key={reseau.nom}
                target="_blank"
                rel="noopener"
                tabIndex={ouvert ? 0 : -1}
              >
                <span className="battants-masque">
                  <span className="battants-ligne">
                    {reseau.nom} <span className="battants-compte">{reseau.compte}</span>
                  </span>
                </span>
              </a>
            ))}
            <a className="battants-lien battants-lien--petit" href={`mailto:${EMAIL}`} tabIndex={ouvert ? 0 : -1}>
              <span className="battants-masque">
                <span className="battants-ligne">{EMAIL}</span>
              </span>
            </a>
            <span className="battants-lien battants-lien--petit">
              <span className="battants-masque">
                <span className="battants-ligne">{TELEPHONE}</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
