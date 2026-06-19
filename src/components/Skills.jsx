import { skills, marquee, awards, certifications } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import './Skills.css'

export default function Skills() {
  const { t } = useLang()
  const row = [...marquee, ...marquee]

  return (
    <section className="section skills" id="skills">
      <div className="container">
        <Reveal as="span" className="eyebrow">
          {t({ id: '04 — Keahlian', en: '04 — Capabilities' })}
        </Reveal>
        <Reveal as="h2" className="skills__heading" delay={0.05}>
          {t({ id: 'Alat & ', en: 'Tools & ' })}
          <span className="serif gradient-text">{t({ id: 'teknologi', en: 'technologies' })}</span>
        </Reveal>
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
            <Reveal className="skillcat" key={i} delay={i * 0.08}>
              <h3 className="skillcat__title">
                <span className="skillcat__num">0{i + 1}</span>
                {t(cat.group)}
              </h3>
              <ul className="skillcat__list">
                {cat.items.map((item) => (
                  <li key={item} className="skillcat__item">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Awards & Certifications */}
        <div className="creds">
          <Reveal className="creds__col">
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

          <Reveal className="creds__col" delay={0.08}>
            <h3 className="creds__title">
              <span className="creds__icon">✓</span>
              {t({ id: 'Sertifikasi', en: 'Certifications' })}
            </h3>
            <ul className="creds__list">
              {certifications.map((c, i) => (
                <li key={i} className="creds__item">
                  <span className="creds__name">{c.title}</span>
                  <span className="creds__issuer">{c.issuer}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
