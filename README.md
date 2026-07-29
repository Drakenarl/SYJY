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
se lève), reconstruit en vanilla JS/CSS avec la palette SYJY (anthracite, rouge de marque) :

- `assets/css/components/loader.css` — l'écran plein écran, le compteur, la barre de progression
- `assets/js/modules/page-loader.js` — logique de progression

**Comment ça marche :**
- Le compteur avance à la fois avec le temps *et* avec le chargement réel des images de la page
  (jamais de "100%" affiché avant que les images soient vraiment prêtes).
- **Deux régimes.** L'animation complète (compteur 0→100, ~1.8s minimum) ne joue qu'**une
  fois par session** (`sessionStorage`). Au rechargement ou au retour sur l'accueil, régime
  **bref** : pas de compteur, le rideau est tenu 620 ms puis levé. Il était auparavant retiré
  d'un coup, ce qui produisait un flash noir — le rideau était déjà peint quand le JS arrivait.
- Le décompte d'assets ignore les images `loading="lazy"` : le navigateur a justement décidé
  de ne pas les charger, les attendre allongeait le premier chargement d'une seconde entière.
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

---

# Refonte — logo, thèmes, navigation, mobile

## 1. Le logo est intégré

Le logo est **inline en SVG**, jamais en `<img>`. C'est obligatoire : une image
externe n'hérite pas de `currentColor` et ne pourrait donc pas changer de couleur
avec le thème.

| Emplacement | Élément | Fichier source |
|---|---|---|
| Navbar (desktop) | lockup horizontal | `assets/brand/` |
| Navbar (mobile)  | emblème seul | idem |
| Footer | wordmark entaillé | idem |
| Loader | emblème (pulsation) | idem |
| Favicon | `assets/brand/syjy-favicon.svg` + PNG 32/180 | idem |

La couleur vient d'une seule ligne : `.brand { color: var(--accent-2); }`
→ or en mode sombre, noir en mode clair.

## 2. Mode clair / mode sombre

**Architecture.** `base/variables.css` a désormais deux couches :

1. **Palette** — les couleurs brutes de la marque, qui ne changent jamais.
2. **Sémantique** — le *rôle* de chaque couleur : `--bg`, `--text`, `--line`,
   `--accent`, `--surface`… C'est cette couche seule qui bascule.

**Règle absolue :** plus aucune couleur en dur dans le CSS. Si tu écris
`rgba(255,255,255,.6)` quelque part, le mode clair casse à cet endroit précis.
Utilise `var(--text-3)`.

**Le mode clair n'est pas un inverse.** Le logo pose un fond blanc : le mode clair
est donc un blanc cassé `#fafafa`, encre anthracite `#2e2e2e` (celle des lettres du
logo, jamais du noir pur), et un rouge approfondi `#d01e16` — le rouge de marque
brut ne passe pas AA sur blanc en petit texte, il est approfondi côté clair et
remonté à `#f03a2e` côté sombre.

**Le rouge ne fait pas du texte.** Il plafonne à ~5:1 : filets, cadres, aplats de
CTA, un mot d'emphase dans un titre. Jamais un paragraphe.

**`--frame` est hors thème.** C'est le rouge exact du logo (`#e2231a`), identique
en clair et en sombre : c'est un objet de marque, pas une couleur d'interface.
Réservé au dispositif de cadre et à ce qui se pose sur une photo.

**Exception assumée :** le texte posé sur une photo (hero, cartes collection) reste
blanc dans les deux thèmes — tokens `--on-media*`. Une photo reste sombre : y mettre
du texte noir en mode clair serait illisible.

**Anti-flash.** Un script inline dans le `<head>` applique le thème *avant* le
premier rendu. Sans lui, la page flashe en sombre ~100 ms avant de repasser en clair.
Ne le déplace pas dans un fichier externe.

Persistance : `localStorage`. Sans choix explicite, le thème suit le système.

## 3. Nouvelle navigation

- **En haut de page** : barre transparente, pleine largeur.
- **Au scroll** : la barre se détache des bords et devient une **capsule flottante**
  floutée et centrée.
- **Pilule glissante** : un indicateur suit le lien survolé et revient se caler sous
  la page courante (`nav-pill.js`).
- **Mobile** : overlay plein écran, liens en Syncopate, apparition décalée. Avec
  verrouillage du scroll sans saut de page, fermeture à Échap, et piégeage du focus
  clavier.

## 4. Correctifs mobile

Le plus important d'abord :

- **Le hero bloquait le scroll.** Le canvas glissant occupait 100 % de la hauteur avec
  `touch-action: none` + capture du pointeur : glisser le doigt dessus déplaçait les
  images au lieu de faire défiler la page. Sur écran tactile, le drag est désormais
  désactivé et le canvas devient un décor.
- **Boutons** : `min-height: 44px` (norme WCAG 2.5.5). Sur mobile ils montent à 100 %
  mais **plafonnent à 380px** — ils ne s'étirent plus d'un bord à l'autre.
- **`100vh` → `100svh`** : `100vh` est faux sur mobile, la barre d'URL du navigateur
  le fausse et le hero débordait.
- **Typographie fluide** : `clamp()` partout. Le titre du hero passait de 82px à 44px
  d'un coup à 768px ; il est maintenant continu.
- **Padding fluide** : `--section-padding-x: clamp(20px, 7vw, 110px)`. À 7 % fixe,
  les marges tombaient à 26px sur un petit écran.
- **`env(safe-area-inset-*)`** : plus rien sous l'encoche ni sous la barre de gestes.
- **`@media (hover: none)`** : les effets de survol ne restent plus « collés » après
  un tap.
- **E-mails longs** : `word-break` sur la page contact, ils débordaient de l'écran.

## 5. Accessibilité

Lien d'évitement, focus clavier visible partout, `aria-expanded` / `aria-pressed`
corrects, cibles tactiles ≥ 44px, `prefers-reduced-motion` respecté.
