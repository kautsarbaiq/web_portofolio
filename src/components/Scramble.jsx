import { useEffect, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#'

/* Decodes text with a scramble/glitch effect: random glyphs resolve into
   the real characters left-to-right. Skipped under reduced motion. */
export default function Scramble({ text, className, delay = 0 }) {
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      return
    }
    let raf
    let frame = 0
    const TOTAL = 26
    const tick = () => {
      frame++
      const progress = frame / TOTAL
      setDisplay(
        text
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' '
            if (i < progress * text.length) return ch
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join(''),
      )
      if (frame < TOTAL) raf = requestAnimationFrame(tick)
      else setDisplay(text)
    }
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick)
    }, delay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [text, delay])

  return <span className={className}>{display}</span>
}
