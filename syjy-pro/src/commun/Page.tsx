// SYJY · ce que toutes les pages partagent : le défilement lissé, l'en-tête,
// l'appel à commander et le pied.

import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { DefilementLisse, Parallaxe, Revele, TitreDecoupe } from '../effets/effets'
import { commander } from './donnees'
import Entete from './Entete'
import Pied from './Pied'
import '../styles/base.css'
import './appel.css'

type PageProps = {
  children: ReactNode
  ici: string
  clair?: boolean
  /** L'appel à commander, que la page Contact remplace par le sien. */
  appel?: boolean
}

export function Fleche() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

/** L'appel de fin de page : une photo qui flotte, une phrase, une action. */
function Appel() {
  return (
    <section className="appel">
      <div className="appel-photo">
        <Parallaxe vitesse={-0.12} className="appel-plan">
          <picture>
            <source srcSet="/img/collection-01.webp" type="image/webp" />
            <img src="/img/collection-01.jpg" alt="" loading="lazy" decoding="async" />
          </picture>
        </Parallaxe>
      </div>
      <div className="appel-texte">
        <TitreDecoupe
          className="affiche appel-titre"
          texte="Votre veste, coupée à vos mesures."
          accents={['mesures.']}
        />
        <Revele delai={200}>
          <p className="appel-phrase">
            Envoyez vos mesures et la pièce qui vous plaît sur WhatsApp. L'atelier vous répond avec le tissu, le
            délai et le prix.
          </p>
          <a className="bouton bouton--encre" href={commander()} target="_blank" rel="noopener">
            Commander sur WhatsApp
            <Fleche />
          </a>
        </Revele>
      </div>
    </section>
  )
}

export function Page({ children, ici, clair, appel = true }: PageProps) {
  return (
    <DefilementLisse>
      <Entete ici={ici} clair={clair} />
      <main>{children}</main>
      {appel && <Appel />}
      <Pied />
    </DefilementLisse>
  )
}

export function monter(page: ReactNode) {
  createRoot(document.getElementById('racine')!).render(<StrictMode>{page}</StrictMode>)
}
