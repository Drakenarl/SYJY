# SYJY, le site

Le site de SYJY, maison de mode fondée à Cotonou en 2021 par Jaurès Sotohou :
vestes sur mesure, prêt-à-porter et pièces uniques.

## Lancer

```
npm install
npm run dev      # http://localhost:5190
npm run build    # le site final dans dist/
```

Vite, React 18 et TypeScript, en quatre pages : `index.html`, `collection.html`,
`about.html` et `contact.html`. Chaque page est sa propre entrée et ne charge
que son code.

## Ce qu'il y a dedans

```
src/
  pages/       une page, son fichier et sa feuille de style
  sections/    les grands blocs : l'ouverture, la file des pièces, l'aperçu agrandi
  commun/      l'en-tête et son menu, le pied, l'appel à commander, les données
  effets/      défilement lissé, apparitions, titres découpés, parallaxe, lignes
  moteur/      la ligne de temps et le défilement qui animent tout le reste
  styles/      les jetons de couleur, les polices, les boutons, les transitions
public/
  img/         les photos de la maison, en JPEG et en WebP
  polices/     Bodoni Moda et Inter Tight, servies par le site, avec leur licence
```

Les textes de la maison (pièces, coordonnées, comptes) sont tous dans
`src/commun/donnees.ts`. Ajouter une pièce, c'est ajouter une entrée à `PIECES`
et ses deux photos dans `public/img/`.

## Regarder un instant précis

- `/?t=2.6` fige l'ouverture à 2,6 secondes.
- `?menu=1` ouvre le menu au chargement, sur n'importe quelle page.

## Les couleurs

| jeton | valeur | rôle |
|---|---|---|
| `--ivoire` | `#f2ede6` | le fond des pages, le papier du sac |
| `--surface` | `#e8e1d7` | les surfaces posées sur le fond |
| `--encre` | `#15110e` | le texte |
| `--nuit` | `#0f0c0a` | les sections sombres |
| `--gris` | `#6e655c` | le texte secondaire |
| `--rouge` | `#a3161d` | l'accent, le cadre du logo |
