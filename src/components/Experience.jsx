import { experience } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import SplitReveal from './SplitReveal'
import './Experience.css'

export default function Experience() {
  const { t } = useLang()

  return (
    <section className="section experience" id="experience">
      <div className="container">
        <Reveal as="span" className="eyebrow">
          {t({ id: '02 — Pengalaman', en: '02 — Experience' })}
        </Reveal>
        <SplitReveal
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
