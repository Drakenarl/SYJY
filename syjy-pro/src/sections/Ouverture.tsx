// SYJY · l'ouverture de la page d'accueil.

import { useEffect, useRef } from 'react'
import { COURBE, LigneDeTemps, jouer, type Piste } from '../moteur/ligneDeTemps'
import { lenisCourant } from '../effets/effets'
import { Fleche } from '../commun/Page'
import { commander } from '../commun/donnees'
import './ouverture.css'

/* GOD2:ouidah · le chargement. Le nom monte lettre par lettre, se fend en son
   milieu, SY d'un côté et JY de l'autre ; une photo grandit entre les deux
   moitiés, trois pièces de la maison s'y succèdent en coupe franche, puis la
   dernière, le sac SYJY, envahit l'écran et devient l'ouverture. Instants,
   durées et courbes de la pièce, au chiffre près. Il remplace le compteur de
   0 à 100 de la première version.

   Pour regarder un instant précis : `?t=2.6` fige l'ouverture à 2,6 secondes. */
const DUREE_LETTRES = 1.25
const DECALAGE_LETTRES = 0.025
const DEBUT_OUVERTURE = 1.25
const DUREE_OUVERTURE = 1.25
const DEBUT_CALQUES = 2.45
const DUREE_CALQUE = 0.05
const DECALAGE_CALQUES = 0.5
const DEBUT_ENVAHIT = 3.7
const DUREE_ENVAHIT = 2
const DEBUT_TITRE = 4.9
const DUREE_TITRE = 1.25
const DECALAGE_LIENS = 0.1
const ECART_MOITIES = 0.05

/* Revenir à l'accueil dans la même visite ne rejoue pas tout : la ligne de
   temps passe à la vitesse double, l'ouverture garde son geste. */
const CLE_VUE = 'syjy-ouverture-vue'

const MOT_DEBUT = 'SY'
const MOT_FIN = 'JY'

const CALQUES = [
  { image: '/img/collection-01', alt: 'Veste brodée à revers rouges' },
  { image: '/img/collection-02', alt: 'Ensemble wax et signes' },
  { image: '/img/about-portrait', alt: 'Jean patchwork tissé' },
]
const FOND = { image: '/img/hero-home', alt: 'Femme en chemise blanche tenant deux sacs SYJY' }

function Photo({ image, alt, className }: { image: string; alt: string; className: string }) {
  return (
    <picture>
      <source srcSet={`${image}.webp`} type="image/webp" />
      <img className={className} src={`${image}.jpg`} alt={alt} loading="eager" decoding="async" />
    </picture>
  )
}

export default function Ouverture() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const racine = document.documentElement
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.classList.add('est-econome')
      return
    }

    const mot = hero.querySelector<HTMLElement>('.ouv-mot')!
    const boite = hero.querySelector<HTMLElement>('.ouv-boite')!
    const image = hero.querySelector<HTMLElement>('.ouv-image')!
    const boiteInterne = hero.querySelector<HTMLElement>('.ouv-boite-interne')!
    const debut = hero.querySelector<HTMLElement>('.ouv-debut')!
    const fin = hero.querySelector<HTMLElement>('.ouv-fin')!
    const lettres = [...hero.querySelectorAll<HTMLElement>('.ouv-lettre')]
    const calques = [...hero.querySelectorAll<HTMLElement>('.ouv-calque--1, .ouv-calque--2, .ouv-calque--3')]
    const lettresClaires = [...hero.querySelectorAll<HTMLElement>('.ouv-lettre-claire')]
    const liens = [...hero.querySelectorAll<HTMLElement>('.ouv-monte')]

    let mesures = { em: 0, hauteurBoite: 0, largeur: 0, hauteur: 0 }
    function relever() {
      mesures = {
        em: parseFloat(getComputedStyle(mot).fontSize),
        hauteurBoite: boiteInterne.getBoundingClientRect().height,
        largeur: window.innerWidth,
        hauteur: window.innerHeight,
      }
    }
    relever()

    // La page ne défile pas tant que l'ouverture n'a pas rendu la main, et
    // l'en-tête attend le titre pour descendre.
    racine.classList.add('ouverture')
    let rendu = false
    function rendreLaMain() {
      if (rendu) return
      rendu = true
      racine.classList.remove('ouverture')
      lenisCourant()?.start()
      try {
        sessionStorage.setItem(CLE_VUE, '1')
      } catch {
        /* navigation privée */
      }
    }
    const tenir = requestAnimationFrame(() => {
      if (!rendu) lenisCourant()?.stop()
    })

    const pistes: Piste[] = [
      {
        debut: 0,
        duree: DUREE_LETTRES,
        courbe: COURBE.expoEntreeSortie,
        decalage: DECALAGE_LETTRES,
        nombre: lettres.length,
        poser: (avancee, rang) => {
          lettres[rang].style.transform = `translateY(${((1 - avancee) * 100).toFixed(2)}%)`
        },
      },
      {
        debut: DEBUT_OUVERTURE,
        duree: DUREE_OUVERTURE,
        courbe: COURBE.expoEntreeSortie,
        poser: (avancee) => {
          boite.style.width = `${(avancee * mesures.em).toFixed(1)}px`
          image.style.width = `${(avancee * mesures.em).toFixed(1)}px`
          const recul = avancee * ECART_MOITIES * mesures.em
          debut.style.transform = `translateX(${(-recul).toFixed(2)}px)`
          fin.style.transform = `translateX(${recul.toFixed(2)}px)`
        },
      },
      // Les calques s'éteignent l'un après l'autre : une coupe franche, pas un fondu.
      {
        debut: DEBUT_CALQUES,
        duree: DUREE_CALQUE,
        decalage: DECALAGE_CALQUES,
        nombre: calques.length,
        poser: (avancee, rang) => {
          calques[rang].style.opacity = (1 - avancee).toFixed(3)
        },
      },
      // La photo prend tout l'écran, la boîte la suit et déborde. La garde à
      // zéro empêche d'écraser l'ouverture pendant qu'elle joue encore.
      {
        debut: DEBUT_ENVAHIT,
        duree: DUREE_ENVAHIT,
        courbe: COURBE.expoEntreeSortie,
        poser: (avancee) => {
          if (avancee === 0) return
          const largeur = mesures.em + avancee * (mesures.largeur - mesures.em)
          const hauteur = mesures.hauteurBoite + avancee * (mesures.hauteur - mesures.hauteurBoite)
          image.style.width = `${largeur.toFixed(1)}px`
          image.style.height = `${hauteur.toFixed(1)}px`
          boite.style.width = `${(mesures.em + avancee * (1.1 * mesures.largeur - mesures.em)).toFixed(1)}px`
        },
      },
      {
        debut: DEBUT_TITRE,
        duree: DUREE_TITRE,
        courbe: COURBE.expoSortie,
        decalage: DECALAGE_LETTRES,
        nombre: lettresClaires.length,
        poser: (avancee, rang) => {
          lettresClaires[rang].style.transform = `translateY(${((1 - avancee) * 110).toFixed(2)}%)`
        },
      },
      {
        debut: DEBUT_TITRE,
        duree: DUREE_TITRE,
        courbe: COURBE.expoSortie,
        decalage: DECALAGE_LIENS,
        nombre: liens.length,
        poser: (avancee, rang) => {
          liens[rang].style.transform = `translateY(${((1 - avancee) * 110).toFixed(2)}%)`
          if (rang === 0 && avancee > 0) rendreLaMain()
        },
      },
    ]

    const deja = (() => {
      try {
        return sessionStorage.getItem(CLE_VUE) === '1'
      } catch {
        return false
      }
    })()
    if (deja) {
      for (const piste of pistes) {
        piste.debut /= 2
        piste.duree /= 2
        if (typeof piste.decalage === 'number') piste.decalage /= 2
      }
    }

    const ligne = new LigneDeTemps(pistes)

    // `?t=` fige l'ouverture à l'instant demandé, pour la regarder.
    const fige = new URLSearchParams(location.search).get('t')
    let arreter = () => {}
    if (fige !== null) {
      ligne.poser(Number(fige))
      if (Number(fige) >= DEBUT_TITRE) rendreLaMain()
    } else {
      arreter = jouer(ligne, rendreLaMain)
    }

    let attente = 0
    function auRedimensionnement() {
      clearTimeout(attente)
      attente = window.setTimeout(() => {
        relever()
        ligne.oublier()
        if (fige !== null) ligne.poser(Number(fige))
        else if (rendu) ligne.poser(ligne.duree)
      }, 150)
    }
    window.addEventListener('resize', auRedimensionnement)

    // GOD2:ParallaxLayer · une fois l'ouverture posée, la photo s'éloigne plus
    // lentement que la page et le titre plus vite : l'écran garde sa
    // profondeur en partant.
    const cadrePhoto = hero.querySelector<HTMLElement>('.ouv-image-cadre')!
    const contenu = hero.querySelector<HTMLElement>('.ouv-contenu')!
    let demande = 0
    function auDefilement() {
      demande = 0
      if (!rendu) return
      const y = Math.min(window.scrollY, window.innerHeight)
      cadrePhoto.style.transform = `translate3d(0, ${(y * 0.4).toFixed(1)}px, 0) scale(${(1 + y / window.innerHeight / 10).toFixed(4)})`
      contenu.style.transform = `translate3d(0, ${(y * -0.12).toFixed(1)}px, 0)`
    }
    const planifier = () => {
      if (!demande) demande = requestAnimationFrame(auDefilement)
    }
    window.addEventListener('scroll', planifier, { passive: true })

    return () => {
      arreter()
      cancelAnimationFrame(demande)
      window.removeEventListener('scroll', planifier)
      cancelAnimationFrame(tenir)
      clearTimeout(attente)
      window.removeEventListener('resize', auRedimensionnement)
      racine.classList.remove('ouverture')
    }
  }, [])

  return (
    <section ref={heroRef} className="ouv">
      <Photo image={FOND.image} alt={FOND.alt} className="ouv-fond-econome" />

      <div className="ouv-chargement" aria-hidden="true">
        <div className="ouv-mot affiche">
          <div className="ouv-debut">
            {Array.from(MOT_DEBUT).map((c, rang) => (
              <span key={rang} className="ouv-lettre">
                {c}
              </span>
            ))}
          </div>
          <div className="ouv-boite">
            <div className="ouv-boite-interne">
              <div className="ouv-image">
                <div className="ouv-image-cadre">
                  {CALQUES.map((calque, rang) => (
                    <Photo key={calque.image} {...calque} className={`ouv-calque ouv-calque--${rang + 1}`} />
                  ))}
                  <Photo {...FOND} className="ouv-calque ouv-calque--fond" />
                </div>
              </div>
            </div>
          </div>
          <div className="ouv-fin">
            {Array.from(MOT_FIN).map((c, rang) => (
              <span key={rang} className="ouv-lettre">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="ouv-contenu">
        <div className="ouv-bas">
          <h1 className="ouv-titre affiche" aria-label="SYJY, vestes sur mesure et prêt-à-porter coupés à Cotonou">
            {Array.from('SYJY').map((c, rang) => (
              <span key={rang} className="ouv-lettre-claire" aria-hidden="true">
                {c}
              </span>
            ))}
          </h1>
          <div className="ouv-cote">
            <span className="ouv-rogne">
              <p className="ouv-monte ouv-accroche">
                Vestes sur mesure et prêt-à-porter,
                <br />
                coupés à Cotonou depuis 2021.
              </p>
            </span>
            <div className="ouv-actions">
              <span className="ouv-rogne">
                <a className="ouv-monte bouton bouton--plein" href="/collection.html">
                  Voir la collection
                  <Fleche />
                </a>
              </span>
              <span className="ouv-rogne">
                <a className="ouv-monte bouton ouv-bouton-trait" href={commander()} target="_blank" rel="noopener">
                  Commander sur mesure
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
