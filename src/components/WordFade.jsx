import { motion } from 'framer-motion'

/* Editorial word-cascade: each word fades from faint to full ink,
   staggered, as the block scrolls into view. */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.018 } },
}

const wordVariant = {
  hidden: { opacity: 0.14 },
  show: { opacity: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function WordFade({ text, className, as = 'p' }) {
  const MotionTag = motion[as] || motion.p
  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -18% 0px' }}
      aria-label={text}
    >
      {text.split(' ').map((word, i) => (
        <motion.span key={i} variants={wordVariant} aria-hidden="true">
          {word}
          {' '}
        </motion.span>
      ))}
    </MotionTag>
  )
}
