# syjy-pro — instructions projet

Site vitrine **SYJY**. Statique **HTML / CSS / JS** (aucun framework). Déployé sur GitHub
Pages (`drakenarl.github.io/SYJY`). Branche de déploiement : `deploy-stable`.

## Registre design
**Immersif / « voyage »** (cf. skill global `frontend-quality-bar`) : chaque page embarque
le visiteur — profondeur, atmosphère, mouvement — **tout en restant fluide (60fps) et
navigable**. L'immersion ne doit jamais casser la lisibilité ni l'orientation.
Effets déjà en place : marquee, reveal-on-scroll, drag-canvas, card-glow, header-scroll.

## Structure
- Pages à la racine : `index.html`, `about.html`, `collection.html`, `contact.html`.
- `assets/css/` : `base/` (reset, animations), `layout/` (header…), `components/`, `pages/`, `responsive/`.
- `assets/js/` : `main.js` + `modules/` (un module par effet).
- `assets/img/`, `assets/brand/`.

## Conventions
- Français : réponses, commentaires, noms de variables.
- **Un effet = un module** JS dans `assets/js/modules/` + son CSS dans le bon dossier `assets/css/`.
- **Tokens CSS** (variables) pour couleurs/espacements ; pas de valeurs en dur éparpillées.
- Animer `transform`/`opacity` ; respecter `prefers-reduced-motion`.
- Windows / PowerShell : vérifier la syntaxe des commandes.

## Intégrer un composant du ui-kit
Le ui-kit perso vit ailleurs (voir le `CLAUDE.md` global + skill `ui-kit-pull`). Ici, on
adapte en **HTML/CSS/JS vanilla** (le kit est souvent React/TSX) : CSS dans
`assets/css/components/`, JS dans `assets/js/modules/`. **Ne pas introduire de framework.**

## Skills
Les skills **globaux** (`frontend-quality-bar`, `visual-fidelity`, `motion-craft`,
`ui-states`, `color-theming`, `typography`, `layout-space`, `css-perf-craft`) s'appliquent
automatiquement. Le skill **projet** `frontend-design` (dans `.claude/skills/`) complète la
direction visuelle.
