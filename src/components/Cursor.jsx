import { useEffect, useRef, useState } from 'react'
import './Cursor.css'

/* A two-part custom cursor: an instant dot and a lagging ring.
   The ring grows + a label appears over elements marked [data-cursor].
   Disabled entirely on touch / coarse-pointer devices. */
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [label, setLabel] = useState('')
  const [hovering, setHovering] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine) return

    document.body.classList.add('has-custom-cursor')

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: mouse.x, y: mouse.y }
    let raf

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      setHidden(false)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`
      }

      // Inspect what's under the pointer for cursor affordances.
      const el = e.target.closest('a, button, [data-cursor], input, textarea')
      if (el) {
        setHovering(true)
        setLabel(el.getAttribute('data-cursor') || '')
      } else {
        setHovering(false)
        setLabel('')
      }
    }

    const onLeave = () => setHidden(true)
    const onDown = () => ringRef.current?.classList.add('cursor__ring--down')
    const onUp = () => ringRef.current?.classList.remove('cursor__ring--down')

    const loop = () => {
      ring.x += (mouse.x - ring.x) * 0.18
      ring.y += (mouse.y - ring.y) * 0.18
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`
      }
      raf = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className={`cursor__dot ${hidden ? 'is-hidden' : ''}`} aria-hidden="true" />
      <div
        ref={ringRef}
        className={`cursor__ring ${hovering ? 'cursor__ring--active' : ''} ${
          label ? 'cursor__ring--labelled' : ''
        } ${hidden ? 'is-hidden' : ''}`}
        aria-hidden="true"
      >
        {label && <span className="cursor__label">{label}</span>}
      </div>
    </>
  )
}
