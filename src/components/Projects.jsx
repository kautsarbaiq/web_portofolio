import { useRef, useState } from 'react'
import { projects } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import './Projects.css'

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function ProjectCard({ project, index }) {
  const { t } = useLang()
  const ref = useRef(null)
  const [wide, setWide] = useState(false)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - py) * 5}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 7}deg`)
  }
  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const num = String(index + 1).padStart(2, '0')
  const { live, repo } = project.links
  const primary = live || repo
  const isApp = project.type === 'app'

  return (
    <article
      ref={ref}
      className="pcard"
      style={{ '--accent': project.accent }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <a className="pcard__media" href={primary} target="_blank" rel="noreferrer" data-cursor="View" aria-label={project.title}>
        {project.image ? (
          <div className={`frame ${isApp ? 'frame--app' : ''}`}>
            <div className="frame__bar">
              <span className="frame__dot" />
              <span className="frame__dot" />
              <span className="frame__dot" />
              <span className="frame__url">{isApp ? 'app' : hostOf(live)}</span>
            </div>
            <div className="frame__shot">
              <img
                src={project.image}
                alt={`${project.title} preview`}
                loading="lazy"
                className={wide ? 'is-wide' : ''}
                onLoad={(e) => setWide(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight > 1.6)}
              />
            </div>
          </div>
        ) : (
          <div className="pcard__cover">
            <span className="pcard__cover-num">{num}</span>
            <div className="pcard__rings" />
            <span className="pcard__badge">{isApp ? 'App' : 'Web'}</span>
          </div>
        )}
        <span className="pcard__glow" />
      </a>

      <div className="pcard__body">
        <div className="pcard__row">
          <span className="pcard__index">{num} /</span>
          <span className="pcard__year">{project.year}</span>
        </div>
        <h3 className="pcard__title">{project.title}</h3>
        <p className="pcard__tagline">{t(project.tagline)}</p>
        <div className="pcard__tech">
          {project.tech.map((tech) => (
            <span key={tech} className="pcard__tech-chip">
              {tech}
            </span>
          ))}
        </div>
        <div className="pcard__links">
          {live && (
            <a className="pcard__link pcard__link--primary" href={live} target="_blank" rel="noreferrer" data-cursor="Open">
              Live <span aria-hidden="true">↗</span>
            </a>
          )}
          {repo && (
            <a className="pcard__link" href={repo} target="_blank" rel="noreferrer" data-cursor="Code">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7 0-.7 0-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
              </svg>
              Code
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const { t } = useLang()

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
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.06}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
