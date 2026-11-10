// SYJY · le contact.

import { useEffect, useRef, useState } from 'react'
import { Page, Fleche, monter } from '../commun/Page'
import { EMAIL, RESEAUX, TELEPHONE, commander } from '../commun/donnees'
import { Revele, TitreDecoupe, econome } from '../effets/effets'
import './contact.css'

type Ligne = { intitule: string; valeur: string; lien?: string }

const COORDONNEES: Ligne[] = [
  { intitule: 'WhatsApp', valeur: TELEPHONE, lien: commander() },
  { intitule: 'E-mail', valeur: EMAIL, lien: `mailto:${EMAIL}` },
  { intitule: 'Atelier', valeur: 'Cotonou, Bénin' },
  ...RESEAUX.map((r) => ({ intitule: r.nom, valeur: r.compte, lien: r.lien })),
  { intitule: 'Livraison', valeur: 'Bénin et international' },
  { intitule: 'Paiement', valeur: 'Mobile Money, carte bancaire' },
  { intitule: 'Commandes', valeur: 'Sur mesure, prêt-à-porter' },
]

/* GOD2:contact · chaque ligne s'ouvre au passage du centre de l'écran : la
   moitié gauche part à gauche, la droite à droite, et un signe reste épinglé
   au milieu, qui change à chaque ligne franchie. Portée et amplitude de la
   pièce ; ses pictogrammes deviennent les quatre lettres du nom. */
const PORTEE = 260
const amplitude = () => (window.innerWidth < 720 ? 1.5 : 4.5)
const SIGNES = ['S', 'Y', 'J', 'Y']

function Coordonnees() {
  const cadreRef = useRef<HTMLDivElement>(null)
  const [signe, setSigne] = useState(0)

  useEffect(() => {
    const cadre = cadreRef.current
    if (!cadre || econome()) return
    const lignes = [...cadre.querySelectorAll<HTMLElement>('[data-ligne]')]
    let paires: { gauche: HTMLElement; droite: HTMLElement; centre: number; ecrit: number }[] = []
    let haut = 0

    function relever() {
      haut = cadre!.getBoundingClientRect().top + window.scrollY
      paires = lignes.map((ligne) => ({
        gauche: ligne.children[0] as HTMLElement,
        droite: ligne.children[1] as HTMLElement,
        centre: ligne.offsetTop + ligne.offsetHeight / 2,
        ecrit: Number.NaN,
      }))
    }

    let derniere = -1
    let demande = 0
    function replacer() {
      demande = 0
      const milieu = window.innerHeight / 2
      const hautCadre = haut - window.scrollY
      const a = amplitude()
      let proche = -1
      let plusCourte = Infinity
      paires.forEach((paire, rang) => {
        const distance = Math.abs(hautCadre + paire.centre - milieu)
        const ecart = Math.round(a * Math.max(0, 1 - distance / PORTEE) * 100) / 100
        if (ecart !== paire.ecrit) {
          paire.ecrit = ecart
          paire.gauche.style.transform = `translateX(${-ecart}rem)`
          paire.droite.style.transform = `translateX(${ecart}rem)`
        }
        if (distance < plusCourte && distance < 40) {
          plusCourte = distance
          proche = rang
        }
      })
      if (proche !== -1 && proche !== derniere) {
        derniere = proche
        setSigne((s) => (s + 1) % SIGNES.length)
      }
    }
    const planifier = () => {
      if (!demande) demande = requestAnimationFrame(replacer)
    }
    relever()
    replacer()
    const veille = new ResizeObserver(() => {
      relever()
      planifier()
    })
    veille.observe(document.body)
    window.addEventListener('scroll', planifier, { passive: true })
    return () => {
      cancelAnimationFrame(demande)
      veille.disconnect()
      window.removeEventListener('scroll', planifier)
    }
  }, [])

  return (
    <section className="coord" ref={cadreRef} aria-labelledby="coord-titre">
      <h2 id="coord-titre" className="sr-only">
        Coordonnées
      </h2>
      <div className="coord-signe" aria-hidden="true">
        <span key={signe} className="coord-lettre affiche">
          {SIGNES[signe]}
        </span>
      </div>
      <dl className="coord-liste">
        {COORDONNEES.map((ligne) => (
          <div key={ligne.intitule} data-ligne className="coord-ligne">
            <dt className="coord-intitule">{ligne.intitule}</dt>
            <dd className="coord-valeur">
              {ligne.lien ? (
                <a href={ligne.lien} className="lien-trace" target={ligne.lien.startsWith('http') ? '_blank' : undefined} rel="noopener">
                  {ligne.valeur}
                </a>
              ) : (
                ligne.valeur
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Contact() {
  return (
    <Page ici="/contact.html" appel={false}>
      <section className="contact-ouverture cadre">
        <TitreDecoupe
          balise="h1"
          className="affiche contact-titre"
          texte="Parlons de votre prochaine veste."
          accents={['veste.']}
          pas={70}
        />
        <Revele delai={450} className="contact-suite">
          <p className="contact-phrase">
            Une pièce de la collection, une veste sur mesure, une création unique : écrivez à l’atelier avec la pièce
            qui vous plaît et vos mesures, il vous répond avec le tissu, le délai et le prix.
          </p>
          <div className="contact-actions">
            <a className="bouton bouton--encre" href={commander()} target="_blank" rel="noopener">
              Écrire sur WhatsApp
              <Fleche />
            </a>
            <a className="bouton" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </div>
        </Revele>
      </section>
      <Coordonnees />
    </Page>
  )
}

monter(<Contact />)
