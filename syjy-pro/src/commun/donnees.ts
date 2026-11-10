// SYJY · ce que le site dit de la maison, à un seul endroit.
//
// Les coordonnées et les comptes sont ceux imprimés sur le sac SYJY ; le lien
// WhatsApp est celui du site d'origine.

export const WHATSAPP = 'https://wa.me/22967046036'
export const TELEPHONE = '+229 01 67 04 60 36'
export const EMAIL = 'contact@syjy.com'
export const DEVISE = 'Créé avec passion, porté avec fierté.'

export const RESEAUX = [
  { nom: 'Instagram', compte: '@syjy_off', lien: 'https://www.instagram.com/syjy_off/' },
  { nom: 'TikTok', compte: '@syjy_brand', lien: 'https://www.tiktok.com/@syjy_brand' },
]

export const PAGES = [
  { nom: 'Accueil', lien: '/' },
  { nom: 'Collection', lien: '/collection.html' },
  { nom: 'La maison', lien: '/about.html' },
  { nom: 'Contact', lien: '/contact.html' },
]

/** Un lien WhatsApp qui ouvre la conversation avec la pièce déjà nommée. */
export function commander(piece?: string) {
  const texte = piece
    ? `Bonjour SYJY, je voudrais commander la pièce « ${piece} ».`
    : 'Bonjour SYJY, je voudrais une pièce sur mesure.'
  return `${WHATSAPP}?text=${encodeURIComponent(texte)}`
}

export type Piece = {
  nom: string
  /** Le nom en un mot, pour les titres en très grand. */
  court: string
  /** Ce qu'on voit sur la photo : matière, coupe, détail. */
  detail: string
  ligne: string
  image: string
  /** Le cadrage de la photo quand elle est rognée. */
  cadrage: string
  alt: string
}

/** Les pièces, telles que les photos de la maison les montrent. */
export const PIECES: Piece[] = [
  {
    nom: 'Veste brodée à revers rouges',
    court: 'Brodée',
    detail: 'Lin écru brodé de feuillages, revers et pantalon en crêpe bordeaux.',
    ligne: 'Sur mesure',
    image: '/img/collection-01',
    cadrage: '50% 35%',
    alt: 'Veste courte en lin écru brodée de feuillages rouges et dorés, revers bordeaux, portée avec un pantalon bordeaux',
  },
  {
    nom: 'Ensemble wax et signes',
    court: 'Signes',
    detail: 'Chemise en coton brodée de signes, pantalon rouge à bandes de wax, bob assorti.',
    ligne: 'Pièce unique',
    image: '/img/collection-02',
    cadrage: '50% 40%',
    alt: 'Homme allongé sur un banc de bois, chemise blanche brodée de signes rouges, pantalon large rouge à bandes de wax',
  },
  {
    nom: 'Bermuda en denim pailleté',
    court: 'Denim',
    detail: 'Denim brut semé de paillettes, poches à bords francs, chemise à motifs.',
    ligne: 'Prêt-à-porter',
    image: '/img/collection-03',
    cadrage: '50% 50%',
    alt: 'Bermuda large en denim noir pailleté aux poches effilochées, porté dans un escalier',
  },
  {
    nom: 'Jean patchwork tissé',
    court: 'Patchwork',
    detail: 'Denim retravaillé en patchwork, franges de pagne tissé, ceintures cloutées.',
    ligne: 'Collection',
    image: '/img/about-portrait',
    cadrage: '50% 60%',
    alt: 'Trois personnes en débardeur blanc et jean patchwork orné de franges de pagne tissé',
  },
  {
    nom: 'Chemise blanche ample',
    court: 'Popeline',
    detail: 'Popeline blanche, coupe large, boutonnage nacré.',
    ligne: 'Prêt-à-porter',
    image: '/img/hero-home',
    cadrage: '50% 30%',
    alt: 'Femme en chemise blanche ample tenant deux sacs SYJY',
  },
]
