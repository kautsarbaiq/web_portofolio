import { useRef } from 'react'
import { motion } from 'framer-motion'

/* Wraps any element and makes it gently follow the cursor when hovered.
   Renders as <a> if `href` is supplied, otherwise <button>. */
export default function MagneticButton({
  children,
  href,
  className = '',
  strength = 0.35,
  onClick,
  cursor,
  ...rest
}) {
  const ref = useRef(null)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * strength
    const y = (e.clientY - (r.top + r.height / 2)) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }

  const handleLeave = () => {
    const el = ref.current
    if (el) el.style.transform = 'translate(0px, 0px)'
  }

  const Tag = href ? motion.a : motion.button
  const tagProps = href
    ? { href, target: rest.target, rel: rest.rel, download: rest.download }
    : { onClick }

  return (
    <Tag
      ref={ref}
      className={className}
      data-cursor={cursor}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' }}
      {...tagProps}
    >
      {children}
    </Tag>
  )
}
