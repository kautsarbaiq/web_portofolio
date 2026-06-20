import { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'

/* Counts a numeric value up from 0 when it scrolls into view.
   Non-numeric values (e.g. "Gold", "∞") are rendered as-is. */
export default function CountUp({ value, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const match = /^(\d+)(.*)$/.exec(String(value))
  const suffix = match ? match[2] : ''
  const [display, setDisplay] = useState(match ? `0${suffix}` : value)

  useEffect(() => {
    if (!match || !inView) return
    const target = parseInt(match[1], 10)
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(`${Math.round(v)}${suffix}`),
    })
    return () => controls.stop()
  }, [inView, match, suffix])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
