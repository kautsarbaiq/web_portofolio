import { useEffect, useRef } from 'react'
import './Background.css'

/* Global ambient layer: drifting aurora glows, a faint grid, vignette,
   an animated film-grain overlay, and a soft light that follows the
   cursor. Fixed behind all content. */
export default function Background() {
  const lightRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const el = lightRef.current
        if (!el) return
        el.style.setProperty('--bx', `${e.clientX}px`)
        el.style.setProperty('--by', `${e.clientY}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__grid" />
      <div className="bg__aurora bg__aurora--1" />
      <div className="bg__aurora bg__aurora--2" />
      <div className="bg__aurora bg__aurora--3" />
      <div className="bg__light" ref={lightRef} />
      <div className="bg__vignette" />
      <div className="bg__grain" />
    </div>
  )
}
