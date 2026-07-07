import { useState } from 'react'
import { skills, marquee, awards, certifications } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import SplitReveal from './SplitReveal'
import './Skills.css'

const CERT_PREVIEW = 5

export default function Skills() {
  const { t } = useLang()
  const [showAll, setShowAll] = useState(false)
  const [ghost, setGhost] = useState('')
  const row = [...marquee, ...marquee]
  const visibleCerts = showAll ? certifications : certifications.slice(0, CERT_PREVIEW)
  const hiddenCount = certifications.length - CERT_PREVIEW

  return (
    <section className="section skills" id="skills">
      {/* giant outlined echo of the hovered skill */}
      <div className={`skills__ghost ${ghost ? 'is-on' : ''}`} aria-hidden="true">
        {ghost}
      </div>
      <div className="container">
        <Reveal as="span" className="eyebrow">
          {t({ id: '04 — Keahlian', en: '04 — Capabilities' })}
        </Reveal>
        <SplitReveal
          as="h2"
          className="skills__heading"
          segments={[
            { text: t({ id: 'Alat & ', en: 'Tools & ' }) },
            { text: t({ id: 'teknologi', en: 'technologies' }), className: 'serif gradient-text' },
          ]}
        />
      </div>

      {/* infinite marquee */}
      <div className="skills__marquee" aria-hidden="true">
        <div className="skills__track">
          {row.map((m, i) => (
            <span key={i} className="skills__tag">
              {m}
              <span className="skills__star">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="skills__grid">
          {skills.map((cat, i) => (
            <Reveal className="skillcat spot" key={i} delay={i * 0.08}>
              <h3 className="skillcat__title">
                <span className="skillcat__num">0{i + 1}</span>
                {t(cat.group)}
              </h3>
              <ul className="skillcat__list">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="skillcat__item"
                    onMouseEnter={() => setGhost(item)}
                    onMouseLeave={() => setGhost('')}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Awards & Certifications */}
        <div className="creds">
          <Reveal className="creds__col spot">
            <h3 className="creds__title">
              <span className="creds__icon">★</span>
              {t({ id: 'Penghargaan', en: 'Awards' })}
            </h3>
            <ul className="creds__list">
              {awards.map((a, i) => (
                <li key={i} className="creds__item creds__item--award">
                  <span className="creds__name gradient-text">{t(a.title)}</span>
                  <span className="creds__issuer">{a.issuer}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="creds__col spot" delay={0.08}>
            <h3 className="creds__title">
              <span className="creds__icon">✓</span>
              {t({ id: 'Sertifikasi', en: 'Certifications' })}
              <span className="creds__count">{certifications.length}</span>
            </h3>
            <ul className="creds__list">
              {visibleCerts.map((c, i) => (
                <li key={i} className="creds__item">
                  <span className="creds__name">{c.title}</span>
                  <span className="creds__issuer">
                    {c.issuer}
                    {c.year ? ` · ${c.year}` : ''}
                  </span>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <button className="creds__more" onClick={() => setShowAll((v) => !v)} data-cursor={showAll ? 'Less' : 'More'}>
                {showAll
                  ? t({ id: 'Tampilkan lebih sedikit', en: 'Show less' })
                  : t({ id: `Lihat semua (${certifications.length})`, en: `Show all (${certifications.length})` })}
                <span className={`creds__more-arrow ${showAll ? 'is-open' : ''}`}>↓</span>
              </button>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
