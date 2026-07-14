# SYJY — Site vitrine (v2, architecture modulaire)

## Arborescence

```
syjy-pro/
├── index.html
├── collection.html
├── about.html
├── contact.html
└── assets/
    ├── css/
    │   ├── base/            → variables, reset, typographie, animations globales
    │   ├── layout/           → header, footer (communs à toutes les pages)
    │   ├── components/       → boutons, marquee, cartes (feature/collection), split-section
    │   ├── pages/             → styles propres à une seule page (home, collection, contact)
    │   └── responsive/       → media queries (tablet.css, mobile.css)
    ├── js/
    │   ├── main.js            → point d'entrée unique, identique sur toutes les pages
    │   └── modules/          → un fichier = une fonctionnalité (header-scroll, mobile-menu, reveal-on-scroll, card-glow)
    └── img/                   → images optimisées (JPEG compressé + WebP)
```

## Règle appliquée

**Un fichier CSS = une responsabilité. Un fichier JS = une fonctionnalité.**
Chaque module JS s'auto-désactive (`if (!element) return;`) s'il ne trouve pas
ce dont il a besoin sur la page — `main.js` peut donc être identique partout,
sans aucune duplication ni erreur en console.

## Ajout : hero-canvas à faire glisser (page d'accueil)

Inspiré du "drag to pan" vu sur [oshanehoward.com](https://www.oshanehoward.com/), reconstruit en
vanilla JS (Pointer Events, donc souris + tactile sans code séparé), avec inertie au relâchement :

- `assets/css/components/drag-canvas.css` — mécanique générique du canvas (réutilisable ailleurs)
- `assets/js/modules/drag-canvas.js` — logique de drag + inertie + recalcul au resize
- `assets/css/pages/home.css` — placement des 10 tuiles (positions propres à cette page)

Les 5 photos du projet sont réutilisées à des tailles/rotations différentes pour remplir un canvas
de `190vw x 150vh` (donc bien plus grand que l'écran) déplaçable par l'utilisateur. Le texte du hero
(titre, CTA) reste fixe en overlay au-dessus, avec un voile dégradé pour la lisibilité — les boutons
restent cliquables (`pointer-events` géré séparément du reste du bloc).

**Différence assumée avec la référence :** pas de liens par image ni de pages projet dédiées (SYJY
n'a pas ce besoin) — c'est un fond panoramique purement immersif, les vrais CTA restent
"Découvrir"/"Explorer".

## Ajout : écran de chargement (loader)

Inspiré du preloader vu sur [oshanehoward.com](https://www.oshanehoward.com/) (compteur % + rideau qui
se lève), reconstruit en vanilla JS/CSS avec la palette SYJY (noir, doré) :

- `assets/css/components/loader.css` — l'écran plein écran, le compteur, la barre de progression
- `assets/js/modules/page-loader.js` — logique de progression

**Comment ça marche :**
- Le compteur avance à la fois avec le temps *et* avec le chargement réel des images de la page
  (jamais de "100%" affiché avant que les images soient vraiment prêtes).
- L'animation complète (~1.8s) ne joue qu'**une fois par session de navigation**
  (`sessionStorage`) : en changeant de page, le visiteur revoit une version courte (~0.4s)
  plutôt que de subir l'animation à chaque clic de navigation.
- Respecte `prefers-reduced-motion`.

## Ce qui a été corrigé par rapport à la version reçue

1. **Navigation cassée** : les 4 pages ne pointaient pas les unes vers les
   autres correctement (`index.html` vs `index (3).html`, `about.html` vs
   `A propos.html`, `apropos.html`...). Tout est maintenant unifié :
   `index.html`, `collection.html`, `about.html`, `contact.html`.
2. **Images cassées sur serveur Linux** (Vercel/Netlify) : le code référençait
   `1852.jpg` en minuscule alors que le fichier réel était `1852.JPG` (majuscule).
   Windows ignore la casse, Linux non → ça aurait cassé une fois déployé.
   Toutes les images ont été renommées avec des noms clairs et cohérents.
3. **Poids des images divisé par 3 à 4** : les photos faisaient jusqu'à
   2560px de large pour un affichage à 540px max. Redimensionnées + compressées
   + versions WebP ajoutées (chargées en priorité via `<picture>`).
4. **CSS dans un seul fichier de 870 lignes** → éclaté en 17 fichiers ciblés.
5. **JS dupliqué en inline dans chaque page** → centralisé en 4 modules + 1 point d'entrée.
6. **Styles inline (`style="padding-top:160px"`, `style="color:..."`)** → remplacés
   par des classes CSS dédiées (`.contact-info`, `.about--tall`, etc.).
7. Ajout d'attributs d'accessibilité de base (`aria-current`, `aria-expanded`,
   `alt` descriptifs, `loading="lazy"` sur les images non critiques).

## Fichier de brouillon ignoré

`acceille.html` (version antérieure du fichier accueil, incomplète et mal
formée — encapsulée par erreur dans des balises Markdown ```html```) n'a pas
été repris : son contenu est dépassé par `index.html`.

Deux images du zip d'origine (`111.jpeg`, `034.JPG`) n'étaient référencées
dans aucune page — elles n'ont pas été reprises. À réintégrer si elles ont un usage prévu.
