import { lazy, Suspense, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '../content/data'
import { useLang } from '../context/LanguageContext'
import MagneticButton from './MagneticButton'
import Scramble from './Scramble'
import './Hero.css'

// three.js is heavy — load it in its own chunk so the hero text paints first.
const Scene3D = lazy(() => import('./Scene3D'))

const lineVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
}
const wordVariants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
}

export default function Hero({ start }) {
  const { t } = useLang()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const yMeta = useTransform(scrollYProgress, [0, 1], [0, 60])
  const yLockup = useTransform(scrollYProgress, [0, 1], [0, 170])

  const animState = start ? 'show' : 'hidden'

  return (
    <section className="hero" id="top" ref={ref} data-cursor="Drag">
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>

      <motion.div className="hero__content container" style={{ opacity }}>
        {/* top micro row — tiny corner meta, like an architectural index */}
        <motion.div style={{ y: yMeta }}>
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
            <Scramble className="hero__coords" text={`${t(profile.location)} — 2026`} delay={2400} />
          </motion.div>
        </motion.div>

        {/* bottom-left name lockup */}
        <motion.div className="hero__lockup" style={{ y: yLockup }}>
          <h1 className="hero__name" aria-label="Kautsar Baiquni">
            <motion.span variants={lineVariants} initial="hidden" animate={animState} aria-hidden="true">
              <span className="hero__name-mask">
                <motion.span className="hero__name-line" variants={wordVariants}>
                  Kautsar
                </motion.span>
              </span>
              <span className="hero__name-mask">
                <motion.span className="hero__name-line serif hero__name-line--accent" variants={wordVariants}>
                  Baiquni
                </motion.span>
              </span>
            </motion.span>
          </h1>

          <motion.p
            className="hero__role"
            variants={fadeUp}
            initial="hidden"
            animate={animState}
            custom={0.55}
          >
            {t(profile.role)} — Next.js · React · TypeScript · Flutter
          </motion.p>

          <motion.div
            className="hero__links"
            variants={fadeUp}
            initial="hidden"
            animate={animState}
            custom={0.7}
          >
            <MagneticButton
              className="hero__link"
              strength={0.2}
              onClick={() =>
                window.__lenis
                  ? window.__lenis.scrollTo('#work')
                  : document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
              }
              cursor="Scroll"
            >
              {t({ id: 'Lihat karya', en: 'View work' })} ↓
            </MagneticButton>
            <MagneticButton className="hero__link" strength={0.2} href={`mailto:${profile.email}`} cursor="Email">
              {t({ id: 'Hubungi saya', en: 'Get in touch' })} ↗
            </MagneticButton>
            <MagneticButton
              className="hero__link"
              strength={0.2}
              href="/Kautsar-Baiquni-CV.pdf"
              target="_blank"
              rel="noopener"
              download
              cursor="PDF"
            >
              {t({ id: 'Unduh CV', en: 'Download CV' })} ↓
            </MagneticButton>
          </motion.div>
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
