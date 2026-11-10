// SYJY · les quatre pièces de mouvement du site démo GOD2, reprises telles
// quelles. Le projet n'a pas Tailwind : seul le véhicule des styles change
// (des classes de `base.css` au lieu des utilitaires), jamais les valeurs ni
// la logique.

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import Lenis from 'lenis'

export const econome = () => matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null

/** Le défilement lissé, lui seul pour toute la page. */
export function lenisCourant() {
  return lenis
}

// GOD2:SmoothScroll · défilement lissé par Lenis, jamais natif seul. Coupé en
// « moins d'animation » : le défilement natif reste alors, sans dégradation.
export function DefilementLisse({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (econome()) return
    lenis = new Lenis({ lerp: 0.09 })
    let image = 0
    const tourner = (temps: number) => {
      lenis?.raf(temps)
      image = requestAnimationFrame(tourner)
    }
    image = requestAnimationFrame(tourner)
    return () => {
      cancelAnimationFrame(image)
      lenis?.destroy()
      lenis = null
    }
  }, [])
  return <>{children}</>
}

/** Observe un élément et lui pose `est-vu` à sa première entrée dans l'écran. */
function useVu<T extends HTMLElement>(seuil: number) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (econome()) {
      element.classList.add('est-vu')
      return
    }
    const guetteur = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          element.classList.add('est-vu')
          guetteur.disconnect()
        }
      },
      { threshold: seuil },
    )
    guetteur.observe(element)
    return () => guetteur.disconnect()
  }, [seuil])
  return ref
}

type ReveleProps = {
  children: ReactNode
  /** Décalage avant apparition, en ms, pour cascader plusieurs blocs. */
  delai?: number
  className?: string
  balise?: 'div' | 'section' | 'li' | 'article' | 'figure'
}

// GOD2:Reveal · apparition au défilement par IntersectionObserver, qui se
// dénoue après la première apparition.
export function Revele({ children, delai = 0, className = '', balise = 'div' }: ReveleProps) {
  const ref = useVu<HTMLDivElement>(0.15)
  return createElement(
    balise,
    { ref, className: `revele ${className}`, style: { transitionDelay: `${delai}ms` } },
    children,
  )
}

type TitreProps = {
  texte: string
  /** Les mots à passer au rouge, l'accent du cadre. */
  accents?: string[]
  balise?: 'h1' | 'h2' | 'h3' | 'p'
  /** Écart entre deux mots, en ms. */
  pas?: number
  className?: string
  style?: CSSProperties
}

// GOD2:SplitText · titre découpé en mots, chacun monte de sous son masque.
// Le texte entier reste lisible par les lecteurs d'écran (aria-label), les
// fragments sont masqués.
export function TitreDecoupe({ texte, accents = [], balise = 'h2', pas = 60, className = '', style }: TitreProps) {
  const ref = useVu<HTMLHeadingElement>(0.3)
  const mots = texte.split(' ')
  return createElement(
    balise,
    { ref, className, style, 'aria-label': texte },
    mots.map((mot, rang) => {
      const nu = mot.replace(/[.,:;!?]$/, '')
      const contenu = accents.includes(nu) ? <em>{mot}</em> : mot
      return (
        <span key={`${mot}-${rang}`} aria-hidden="true">
          <span className="decoupe-mot">
            <span style={{ transitionDelay: `${rang * pas}ms` }}>{contenu}</span>
          </span>
          {rang < mots.length - 1 ? ' ' : ''}
        </span>
      )
    }),
  )
}

type ParallaxeProps = {
  children: ReactNode
  /** Vitesse relative au défilement : négative remonte, positive descend. */
  vitesse?: number
  className?: string
}

// GOD2:ParallaxLayer · un plan qui flotte au défilement. Le décalage est
// compté depuis le centre de l'écran plutôt que depuis le haut de la page :
// un plan posé loin dans la page ne part donc pas déjà déporté.
export function Parallaxe({ children, vitesse = 0.15, className = '' }: ParallaxeProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const plan = ref.current
    if (!plan || econome()) return
    let demande = 0
    const poser = () => {
      demande = 0
      const boite = plan.parentElement!.getBoundingClientRect()
      const ecart = boite.top + boite.height / 2 - window.innerHeight / 2
      plan.style.transform = `translate3d(0, ${(ecart * vitesse).toFixed(1)}px, 0)`
    }
    const planifier = () => {
      if (!demande) demande = requestAnimationFrame(poser)
    }
    poser()
    window.addEventListener('scroll', planifier, { passive: true })
    window.addEventListener('resize', planifier)
    return () => {
      cancelAnimationFrame(demande)
      window.removeEventListener('scroll', planifier)
      window.removeEventListener('resize', planifier)
    }
  }, [vitesse])
  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
