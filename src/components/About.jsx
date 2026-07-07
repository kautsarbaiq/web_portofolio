import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { about, profile } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import CountUp from './CountUp'
import WordFade from './WordFade'
import './About.css'

export default function About() {
  const { t } = useLang()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const markY = useTransform(scrollYProgress, [0, 1], [60, -60])

  const paragraphs = t(about.paragraphs)

  return (
    <section className="section about" id="about" ref={ref}>
      <div className="container about__grid">
        <div className="about__aside">
          <Reveal as="span" className="eyebrow">
            {t({ id: '01 — Tentang', en: '01 — About' })}
          </Reveal>
          <motion.div className="about__mark" style={{ y: markY }} aria-hidden="true">
            <span>{profile.initials}</span>
          </motion.div>
        </div>

        <div className="about__body">
          {paragraphs.map((p, i) =>
            i === 0 ? (
              <WordFade key={i} text={p} className="about__para" />
            ) : (
              <Reveal as="p" key={i} delay={i * 0.08} className="about__para">
                {p}
              </Reveal>
            ),
          )}

          <div className="about__stats">
            {about.stats.map((s, i) => (
              <Reveal className="about__stat spot" key={i} delay={0.1 + i * 0.07}>
                <CountUp className="about__stat-value gradient-text" value={s.value} />
                <span className="about__stat-label">{t(s.label)}</span>
              </Reveal>
            ))}
          </div>

          <Reveal className="about__sign" delay={0.2}>
            <span className="serif">{profile.name}</span>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
