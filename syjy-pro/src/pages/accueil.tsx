// SYJY · l'accueil.

import { Page, monter } from '../commun/Page'
import { Parallaxe, Revele, TitreDecoupe } from '../effets/effets'
import Lignes from '../effets/Lignes'
import Ouverture from '../sections/Ouverture'
import File from '../sections/File'
import './accueil.css'

const MATIERES = [
  { nom: 'Le jean', usage: 'Retravaillé en patchwork, effiloché, semé de paillettes.' },
  { nom: 'Le tweed', usage: 'Pour les vestes qui se portent du matin au soir.' },
  { nom: 'La crêpe', usage: 'Pour les revers, les pantalons, tout ce qui doit tomber.' },
]

const ENGAGEMENTS = [
  { titre: 'Coupé à vos mesures', texte: 'Chaque veste se coupe à partir de vos mesures, prises à l’atelier ou envoyées par message.' },
  { titre: 'Livré au Bénin et ailleurs', texte: 'Expédition partout au Bénin et à l’international, suivie jusqu’à votre porte.' },
  { titre: 'Payé comme vous voulez', texte: 'Mobile Money ou carte bancaire, au moment de la commande.' },
  { titre: 'Suivi par l’atelier', texte: 'Une question sur un tissu, une taille ou un délai : l’atelier répond sur WhatsApp.' },
]

function Accueil() {
  return (
    <Page ici="/" clair>
      <Ouverture />

      <section className="manifeste cadre">
        <Parallaxe vitesse={-0.06}>
        <Lignes
          className="manifeste-texte affiche"
          balise="p"
          textes={[
            'Une veste SYJY se coupe pour une personne, pas pour une taille. Le tissu est choisi à l’atelier de Cotonou, puis travaillé jusqu’au dernier bouton.',
          ]}
        />
        </Parallaxe>
        <Revele className="manifeste-pied" delai={300}>
          <p>Vestes homme et femme, prêt-à-porter et pièces uniques, depuis 2021.</p>
          <a className="lien-trace" href="/about.html">
            L’histoire de la maison
          </a>
        </Revele>
      </section>

      <File />

      <section className="matieres cadre">
        <div className="matieres-photo">
          <Parallaxe vitesse={-0.14} className="matieres-plan">
            <picture>
              <source srcSet="/img/collection-03.webp" type="image/webp" />
              <img src="/img/collection-03.jpg" alt="Bermuda en denim noir pailleté, porté dans un escalier" loading="lazy" />
            </picture>
          </Parallaxe>
        </div>
        <div className="matieres-texte">
          <Parallaxe vitesse={-0.07}>
            <TitreDecoupe className="affiche matieres-titre" texte="Jean, tweed, crêpe." accents={['crêpe.']} />
          </Parallaxe>
          <Lignes
            className="matieres-intro"
            textes={['Trois matières reviennent dans toutes les collections. Chacune a son geste à l’atelier.']}
          />
          <ol className="matieres-liste">
            {MATIERES.map((matiere, rang) => (
              <Revele balise="li" key={matiere.nom} delai={rang * 120} className="matieres-item">
                <span className="matieres-rang">0{rang + 1}</span>
                <span className="matieres-nom affiche">{matiere.nom}</span>
                <span className="matieres-usage">{matiere.usage}</span>
              </Revele>
            ))}
          </ol>
        </div>
      </section>

      <section className="engagements cadre">
        <Parallaxe vitesse={-0.08}>
          <TitreDecoupe
            balise="h2"
            className="affiche engagements-titre"
            texte="De la commande à la livraison."
          />
        </Parallaxe>
        <ul className="engagements-liste">
          {ENGAGEMENTS.map((engagement, rang) => (
            <Revele balise="li" key={engagement.titre} delai={rang * 110} className="engagement">
              <span className="engagement-rang">0{rang + 1}</span>
              <h3 className="engagement-titre">{engagement.titre}</h3>
              <p className="engagement-texte">{engagement.texte}</p>
            </Revele>
          ))}
        </ul>
      </section>
    </Page>
  )
}

monter(<Accueil />)
