import { lazy, Suspense, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '../content/data'
import { useLang } from '../context/LanguageContext'
import MagneticButton from './MagneticButton'
import './Hero.css'

// three.js is heavy — load it in its own chunk so the hero text paints first.
const Scene3D = lazy(() => import('./Scene3D'))

/* Turn a headline string into tokens, marking *emphasised* spans. */
function tokenize(text) {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((chunk) => {
    const em = chunk.startsWith('*') && chunk.endsWith('*')
    return { text: em ? chunk.slice(1, -1) : chunk, em }
  })
}

const lineVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
}
const wordVariants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
}

export default function Hero({ start }) {
  const { t } = useLang()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const tokens = tokenize(t(profile.headline))
  const animState = start ? 'show' : 'hidden'

  return (
    <section className="hero" id="top" ref={ref}>
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>

      <motion.div className="hero__content container" style={{ y, opacity }}>
        {/* top micro row */}
        <motion.div
          className="hero__meta"
          variants={fadeUp}
          initial="hidden"
          animate={animState}
          custom={0.1}
        >
          <span className="hero__avail">
            <span className="hero__avail-dot" />
            {t(profile.available)}
          </span>
          <span className="hero__coords">{t(profile.location)} — 2026</span>
        </motion.div>

        {/* headline */}
        <h1 className="hero__title">
          <motion.span variants={lineVariants} initial="hidden" animate={animState} className="hero__title-inner">
            {tokens.map((tok, i) => (
              <span className="hero__word-mask" key={i}>
                <motion.span
                  variants={wordVariants}
                  className={tok.em ? 'hero__word hero__word--em serif gradient-text' : 'hero__word'}
                >
                  {tok.text}
                </motion.span>
              </span>
            ))}
          </motion.span>
        </h1>

        <motion.p
          className="hero__tagline"
          variants={fadeUp}
          initial="hidden"
          animate={animState}
          custom={0.5}
        >
          {t(profile.tagline)}
        </motion.p>

        <motion.div
          className="hero__actions"
          variants={fadeUp}
          initial="hidden"
          animate={animState}
          custom={0.65}
        >
          <MagneticButton
            className="hero__cta hero__cta--primary"
            onClick={() =>
              window.__lenis
                ? window.__lenis.scrollTo('#work')
                : document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
            }
            cursor="Scroll"
          >
            <span>{t({ id: 'Lihat karya', en: 'View work' })}</span>
            <span className="hero__cta-arrow">↓</span>
          </MagneticButton>
          <MagneticButton
            className="hero__cta hero__cta--ghost"
            href={`mailto:${profile.email}`}
            cursor="Email"
          >
            {t({ id: 'Hubungi saya', en: 'Get in touch' })}
          </MagneticButton>
          <MagneticButton
            className="hero__cta hero__cta--ghost"
            href="/Kautsar-Baiquni-CV.pdf"
            target="_blank"
            rel="noopener"
            download
            cursor="PDF"
          >
            {t({ id: 'Unduh CV', en: 'Download CV' })}
            <span className="hero__cta-arrow">↓</span>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* side socials */}
      <motion.div
        className="hero__socials"
        variants={fadeUp}
        initial="hidden"
        animate={animState}
        custom={1}
      >
        {profile.socials.map((s) => (
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer" data-cursor="Open">
            {s.label}
          </a>
        ))}
        <span className="hero__socials-line" />
      </motion.div>

      {/* scroll cue */}
      <motion.div
        className="hero__scroll"
        variants={fadeUp}
        initial="hidden"
        animate={animState}
        custom={1.1}
      >
        <span>{t({ id: 'Gulir', en: 'Scroll' })}</span>
        <span className="hero__scroll-track">
          <span className="hero__scroll-thumb" />
        </span>
      </motion.div>
    </section>
  )
}
