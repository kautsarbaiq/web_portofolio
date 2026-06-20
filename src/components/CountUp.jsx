import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/* Counts a numeric value up from 0 when it scrolls into view.
   Non-numeric values (e.g. "Gold", "∞") are rendered as-is.
   Deps are primitives so the rAF loop runs once and isn't restarted
   every render (which previously pinned the display at 0). */
export default function CountUp({ value, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })

  const str = String(value)
  const match = /^(\d+)(.*)$/.exec(str)
  const isNum = !!match
  const target = match ? parseInt(match[1], 10) : 0
  const suffix = match ? match[2] : ''

  const [display, setDisplay] = useState(isNum ? `0${suffix}` : str)

  useEffect(() => {
    if (!isNum) {
      setDisplay(str)
      return
    }
    if (!inView) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setDisplay(`${target}${suffix}`)
      return
    }

    let raf
    const start = performance.now()
    const duration = 1400
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(`${Math.round(eased * target)}${suffix}`)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, isNum, target, suffix, str])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
