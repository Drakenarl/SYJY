// SYJY · la maison.

import { Page, monter } from '../commun/Page'
import { Parallaxe, Revele, TitreDecoupe } from '../effets/effets'
import Lignes from '../effets/Lignes'
import './apropos.css'

const RECIT = [
  'Jaurès Sotohou fonde SYJY à Cotonou en 2021, avec une idée de la mode qui part de la rue et ne s’arrête pas à elle : du streetwear, du casual chic, et l’élégance d’une veste bien coupée.',
  'L’atelier coud des pièces sur mesure, des collections de prêt-à-porter et des créations uniques, chacune pensée pour la personne qui la portera.',
  'La veste est le cœur de la maison, pour homme comme pour femme. Le jean, le tweed et la crêpe y sont choisis pour leur tenue, puis retravaillés jusqu’à donner une pièce qu’on reconnaît.',
]

const SAVOIRS = [
  {
    titre: 'Sur mesure',
    texte: 'Une veste coupée à partir de vos mesures, avec le tissu que vous choisissez à l’atelier.',
  },
  {
    titre: 'Prêt-à-porter',
    texte: 'Des collections en tailles, prêtes à partir, pour porter SYJY sans attendre.',
  },
  {
    titre: 'Pièces uniques',
    texte: 'Des créations faites une seule fois : patchwork, broderies, pagne tissé.',
  },
]

function Apropos() {
  return (
    <Page ici="/about.html">
      <section className="maison-ouverture cadre">
        <div className="maison-titre-bloc">
          <TitreDecoupe
            balise="h1"
            className="affiche maison-titre"
            texte="Une maison de mode née à Cotonou."
            accents={['Cotonou.']}
            pas={70}
          />
          <Revele delai={500} className="maison-chapo">
            <p>Vestes, prêt-à-porter et pièces uniques, depuis 2021.</p>
          </Revele>
        </div>
        <div className="maison-portrait">
          <Parallaxe vitesse={-0.1} className="maison-plan">
            <picture>
              <source srcSet="/img/about-portrait.webp" type="image/webp" />
              <img
                src="/img/about-portrait.jpg"
                alt="Trois personnes en débardeur blanc et jean patchwork SYJY, devant une toile peinte"
                loading="eager"
              />
            </picture>
          </Parallaxe>
        </div>
      </section>

      <section className="maison-recit cadre">
        <div className="maison-recit-titre">
          <TitreDecoupe balise="h2" className="affiche" texte="Jaurès Sotohou, fondateur." />
        </div>
        <Lignes className="maison-recit-texte" textes={RECIT} />
      </section>

      <section className="maison-pleine">
        <Parallaxe vitesse={-0.18} className="maison-pleine-plan">
          <picture>
            <source srcSet="/img/collection-02.webp" type="image/webp" />
            <img
              src="/img/collection-02.jpg"
              alt="Homme allongé sur un banc de bois sous un fromager, en chemise brodée et pantalon de wax"
              loading="lazy"
            />
          </picture>
        </Parallaxe>
        <p className="maison-pleine-legende cadre">Ensemble wax et signes, pièce unique.</p>
      </section>

      <section className="maison-savoirs cadre">
        <TitreDecoupe balise="h2" className="affiche maison-savoirs-titre" texte="Trois façons de porter SYJY." />
        <ol className="maison-savoirs-liste">
          {SAVOIRS.map((savoir, rang) => (
            <Revele balise="li" key={savoir.titre} delai={rang * 140} className="savoir">
              <span className="savoir-rang">0{rang + 1}</span>
              <h3 className="savoir-titre affiche">{savoir.titre}</h3>
              <p className="savoir-texte">{savoir.texte}</p>
            </Revele>
          ))}
        </ol>
      </section>
    </Page>
  )
}

monter(<Apropos />)
