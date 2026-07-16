import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* Character-stagger heading reveal: every letter rises out of an overflow
   mask with a slight rotation, staggered left to right, when the heading
   scrolls into view.

   `segments` is an array of { text, className } chunks (so part of the
   heading can carry e.g. the serif gradient classes) or { br: true } for
   a line break. Screen readers get the plain text via aria-label.

   Optional `drift` (px): the whole heading glides horizontally with the
   scroll — entering from `drift` and leaving toward `-drift` — for a
   cinematic editorial slide. */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.026, delayChildren: 0.08 } },
}

const charVariant = {
  hidden: { y: '115%', rotate: 5 },
  show: { y: '0%', rotate: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function SplitReveal({ segments, as = 'h2', className, drift = 0 }) {
  const MotionTag = motion[as] || motion.h2
  const label = segments.map((s) => s.text || '').join('')

  // scroll-linked horizontal glide (separate node, so it never fights
  // the character variants)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], [drift, -drift])

  const heading = (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      aria-label={label}
    >
      {segments.map((seg, si) => {
        if (seg.br) return <br key={si} aria-hidden="true" />
        return (
          <span key={si} aria-hidden="true">
            {seg.text.split('').map((ch, i) =>
              ch === ' ' ? (
                ' '
              ) : (
                <span className="split__mask" key={i}>
                  <motion.span className={`split__char ${seg.className || ''}`} variants={charVariant}>
                    {ch}
                  </motion.span>
                </span>
              ),
            )}
          </span>
        )
      })}
    </MotionTag>
  )

  return (
    <motion.div ref={ref} style={drift ? { x } : undefined}>
      {heading}
    </motion.div>
  )
}
