import { useRef } from 'react'
import { projects } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import './Projects.css'

function ProjectCard({ project, index, featured }) {
  const { t } = useLang()
  const ref = useRef(null)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - py) * 7}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 9}deg`)
  }
  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const num = String(index + 1).padStart(2, '0')

  return (
    <article
      ref={ref}
      className={`pcard ${featured ? 'pcard--featured' : ''}`}
      style={{ '--accent': project.accent }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      data-cursor="View"
    >
      <a className="pcard__link" href={project.links.live} target="_blank" rel="noreferrer" aria-label={project.title}>
        <div className="pcard__visual">
          <div className="pcard__cover">
            <span className="pcard__cover-num">{num}</span>
            <div className="pcard__rings" />
          </div>
          <span className="pcard__glow" />
        </div>

        <div className="pcard__body">
          <div className="pcard__row">
            <span className="pcard__index">{num} /</span>
            <span className="pcard__year">{project.year}</span>
          </div>
          <h3 className="pcard__title">{project.title}</h3>
          <p className="pcard__tagline">{t(project.tagline)}</p>
          {featured && <p className="pcard__desc">{t(project.description)}</p>}
          <div className="pcard__tech">
            {project.tech.map((tech) => (
              <span key={tech} className="pcard__tech-chip">
                {tech}
              </span>
            ))}
          </div>
          <span className="pcard__cta">
            {t({ id: 'Lihat proyek', en: 'View project' })}
            <span className="pcard__cta-arrow">↗</span>
          </span>
        </div>
      </a>
    </article>
  )
}

export default function Projects() {
  const { t } = useLang()
  const featured = projects.find((p) => p.featured)
  const rest = projects.filter((p) => p !== featured)

  return (
    <section className="section projects" id="work">
      <div className="container">
        <div className="projects__head">
          <Reveal as="span" className="eyebrow">
            {t({ id: '03 — Karya Pilihan', en: '03 — Selected Work' })}
          </Reveal>
          <Reveal as="h2" className="projects__heading" delay={0.05}>
            {t({ id: 'Hal yang saya ', en: 'Things I’ve ' })}
            <span className="serif gradient-text">{t({ id: 'bangun', en: 'built' })}</span>
          </Reveal>
        </div>

        <div className="projects__grid">
          {featured && (
            <Reveal className="projects__featured">
              <ProjectCard project={featured} index={projects.indexOf(featured)} featured />
            </Reveal>
          )}
          <div className="projects__rest">
            {rest.map((p) => (
              <Reveal key={p.title} delay={0.05}>
                <ProjectCard project={p} index={projects.indexOf(p)} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
