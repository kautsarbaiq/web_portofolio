import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { experience } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import SplitReveal from './SplitReveal'
import './Experience.css'

export default function Experience() {
  const { t } = useLang()

  // floating work-preview that trails the cursor over the index rows
  const [src, setSrc] = useState(null)
  const [on, setOn] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 })

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX + 28)
      y.set(e.clientY - 110)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [x, y])

  const enter = (job) => {
    if (job.preview) {
      setSrc(job.preview)
      setOn(true)
    }
  }
  const leave = () => setOn(false)

  return (
    <section className="section experience" id="experience">
      <div className="container">
        <Reveal as="span" className="eyebrow">
          {t({ id: '02 — Pengalaman', en: '02 — Experience' })}
        </Reveal>
        <SplitReveal
          drift={44}
          as="h2"
          className="experience__heading"
          segments={[
            { text: t({ id: 'Jejak ', en: 'Where I’ve ' }) },
            { text: t({ id: 'karier', en: 'worked' }), className: 'serif gradient-text' },
          ]}
        />

        <div className="experience__list">
          {experience.map((job, i) => (
            <Reveal className="exp spot" key={i} delay={i * 0.05}>
              <div
                className="exp__hit"
                onMouseEnter={() => enter(job)}
                onMouseLeave={leave}
                data-cursor={job.preview ? 'View' : undefined}
              >
                <span className="exp__num" aria-hidden="true">0{i + 1}</span>
                <div className="exp__period">
                  <span className="exp__dot" />
                  {t(job.period)}
                </div>
                <div className="exp__main">
                  <div className="exp__top">
                    <h3 className="exp__role">{t(job.role)}</h3>
                    <span className="exp__company">{job.company}</span>
                  </div>
                  <span className="exp__loc">{t(job.location)}</span>
                  <ul className="exp__points">
                    {t(job.points).map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                  <div className="exp__stack">
                    {job.stack.map((s) => (
                      <span key={s} className="exp__chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* cursor-trailing preview card */}
      <motion.div
        className="exp-preview"
        style={{ x: sx, y: sy }}
        animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.92, rotate: on ? -2 : 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        {src && <img src={src} alt="" />}
      </motion.div>
    </section>
  )
}
