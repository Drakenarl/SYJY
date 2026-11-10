// SYJY · la collection.

import { Page, Fleche, monter } from '../commun/Page'
import { PIECES, commander } from '../commun/donnees'
import { Revele, TitreDecoupe } from '../effets/effets'
import Lignes from '../effets/Lignes'
import Agrandi from '../sections/Agrandi'
import './collection.css'

function Collection() {
  return (
    <Page ici="/collection.html" clair>
      <Agrandi />

      <section className="catalogue cadre">
        <div className="catalogue-entete">
          <TitreDecoupe
            balise="h1"
            className="affiche catalogue-titre"
            texte="Chaque pièce se commande à vos mesures."
            accents={['mesures.']}
          />
          <Lignes
            className="catalogue-intro"
            textes={[
              'Choisissez une pièce, envoyez vos mesures sur WhatsApp : l’atelier vous propose le tissu, le délai et le prix avant de couper.',
            ]}
          />
        </div>

        <ul className="catalogue-grille">
          {PIECES.map((piece, rang) => (
            <Revele balise="li" key={piece.nom} delai={(rang % 2) * 140} className={`fiche fiche--${rang + 1}`}>
              <article id={`piece-${rang}`} className="fiche-corps">
                <a className="fiche-lien" href={commander(piece.nom)} target="_blank" rel="noopener">
                  <div className="fiche-vue">
                    <picture>
                      <source srcSet={`${piece.image}.webp`} type="image/webp" />
                      <img
                        src={`${piece.image}.jpg`}
                        alt={piece.alt}
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: piece.cadrage }}
                      />
                    </picture>
                    <span className="fiche-commander">
                      Commander cette pièce
                      <Fleche />
                    </span>
                  </div>
                  <div className="fiche-texte">
                    <span className="fiche-rang">{String(rang + 1).padStart(2, '0')}</span>
                    <h2 className="fiche-nom affiche">{piece.nom}</h2>
                    <span className="fiche-ligne">{piece.ligne}</span>
                  </div>
                  <p className="fiche-detail">{piece.detail}</p>
                </a>
              </article>
            </Revele>
          ))}
        </ul>
      </section>
    </Page>
  )
}

monter(<Collection />)
