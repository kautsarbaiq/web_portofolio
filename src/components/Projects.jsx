import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { projects } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import SplitReveal from './SplitReveal'
import ProjectModal from './ProjectModal'
import './Projects.css'

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function ProjectCard({ project, index, onOpen }) {
  const { t } = useLang()
  const ref = useRef(null)
  // gentle parallax of the screenshot inside its frame while scrolling
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  const num = String(index + 1).padStart(2, '0')
  const { live, repo } = project.links
  const isApp = project.type === 'app'

  return (
    <article ref={ref} className="pcard">
      <button className="pcard__media" onClick={onOpen} data-cursor="View" aria-label={project.title}>
        {project.image ? (
          <div className={`frame ${isApp ? 'frame--app' : ''}`}>
            <div className="frame__bar">
              <span className="frame__dot" />
              <span className="frame__dot" />
              <span className="frame__dot" />
              <span className="frame__url">{isApp ? 'app' : hostOf(live)}</span>
            </div>
            <motion.div
              className="frame__shot"
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.img
                src={project.image}
                alt={`${project.title} preview`}
                loading="lazy"
                decoding="async"
                style={{ y: imgY, scale: 1.12 }}
              />
            </motion.div>
          </div>
        ) : (
          <div className="pcard__cover">
            <span className="pcard__cover-num">{num}</span>
            <div className="pcard__rings" />
            <span className="pcard__badge">{isApp ? 'App' : 'Web'}</span>
          </div>
        )}
      </button>

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

const FILTERS = [
  { id: 'all', label: { id: 'Semua', en: 'All' } },
  { id: 'web', label: { id: 'Web', en: 'Web' } },
  { id: 'app', label: { id: 'Aplikasi', en: 'Apps' } },
]

export default function Projects() {
  const { t } = useLang()
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null) // index into `projects`, or null
  const list = filter === 'all' ? projects : projects.filter((p) => p.type === filter)
  const countOf = (f) => (f === 'all' ? projects.length : projects.filter((p) => p.type === f).length)

  return (
    <section className="section projects" id="work">
      <div className="container">
        <div className="projects__head">
          <Reveal as="span" className="eyebrow">
            {t({ id: '03 — Karya Pilihan', en: '03 — Selected Work' })}
          </Reveal>
          <SplitReveal
            drift={44}
            as="h2"
            className="projects__heading"
            segments={[
              { text: t({ id: 'Hal yang saya ', en: 'Things I’ve ' }) },
              { text: t({ id: 'bangun', en: 'built' }), className: 'serif gradient-text' },
            ]}
          />

          <Reveal className="projects__filters" delay={0.1}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`projects__filter ${filter === f.id ? 'is-active' : ''}`}
                onClick={() => setFilter(f.id)}
                data-cursor="Filter"
              >
                {t(f.label)} <sup>{countOf(f.id)}</sup>
              </button>
            ))}
          </Reveal>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            className="projects__grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {list.map((p) => (
              <Reveal key={p.title} delay={0.04}>
                <ProjectCard
                  project={p}
                  index={projects.indexOf(p)}
                  onOpen={() => setActive(projects.indexOf(p))}
                />
              </Reveal>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <ProjectModal index={active} onClose={() => setActive(null)} onNav={setActive} />
    </section>
  )
}
