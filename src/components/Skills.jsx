import { skills, marquee } from '../content/data'
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
      </div>
    </section>
  )
}
